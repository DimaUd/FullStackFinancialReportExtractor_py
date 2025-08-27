from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import base64
import io
import json
import csv
import google.generativeai as genai
from google.oauth2 import service_account
import fitz  # PyMuPDF
from typing import List, Dict, Any
import os
from datetime import datetime
import logging
from pydantic import BaseModel
import re
from PIL import Image
import asyncio

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="מחלץ נתונים מדוחות כספיים",
    description="API לחילוץ טבלאות מדוחות כספיים PDF באמצעות Google Gemini",
    version="1.0.0"
)

# Load allowed origins from environment variable
allowed_origins_str = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000")
ALLOWED_ORIGINS = [origin.strip() for origin in allowed_origins_str.split(',')]
logger.info(f"Configuring CORS for origins: {ALLOWED_ORIGINS}")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure Google Cloud and Gemini AI
def setup_gemini_credentials():
    """Setup Gemini AI with GCP Service Account credentials"""
    
    # Method 1: Using service account key file
    service_account_key_path = os.getenv("GCP_SERVICE_ACCOUNT_KEY_PATH")
    if service_account_key_path and os.path.exists(service_account_key_path):
        logger.info("Using service account key file for authentication")
        credentials = service_account.Credentials.from_service_account_file(
            service_account_key_path,
            scopes=['https://www.googleapis.com/auth/generative-language']
        )
        genai.configure(credentials=credentials)
        return
    
    # Method 2: Using service account key JSON string
    service_account_key_json = os.getenv("GCP_SERVICE_ACCOUNT_KEY_JSON")
    if service_account_key_json:
        logger.info("Using service account key JSON for authentication")
        try:
            key_data = json.loads(service_account_key_json)
            credentials = service_account.Credentials.from_service_account_info(
                key_data,
                scopes=['https://www.googleapis.com/auth/generative-language']
            )
            genai.configure(credentials=credentials)
            return
        except json.JSONDecodeError as e:
            logger.error(f"Invalid JSON in GCP_SERVICE_ACCOUNT_KEY_JSON: {e}")
    
    # Method 3: Fallback to direct API key (backward compatibility)
    gemini_api_key = os.getenv("GEMINI_API_KEY")
    if gemini_api_key:
        logger.info("Using direct API key for authentication (fallback)")
        genai.configure(api_key=gemini_api_key)
        return
    
    raise ValueError(
        "No valid Google Cloud authentication found. Please provide one of:\n"
        "- GCP_SERVICE_ACCOUNT_KEY_PATH (path to JSON key file)\n"
        "- GCP_SERVICE_ACCOUNT_KEY_JSON (JSON key as string)\n"
        "- GEMINI_API_KEY (direct API key - fallback)"
    )

# Initialize Gemini credentials
setup_gemini_credentials()

# Model configuration - can be changed via environment variable
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.0-flash-preview-image-generation")
logger.info(f"Using Gemini model: {GEMINI_MODEL}")

# Safety settings
safety_settings = [
    {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
    {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"},
    {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE"},
    {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"},
]

# Pydantic models
class HtmlResult(BaseModel):
    pageNumber: int
    html: str

class TableData(BaseModel):
    title: str
    html: str
    rawData: List[List[str]]
    columns: List[str]
    confidence: float
    errors: List[str]
    csv: str
    pageNumber: int

class DocumentMetadata(BaseModel):
    currency: str
    reportingPeriod: str
    sourceType: str
    processingTimestamp: str

class ExtractionResult(BaseModel):
    documentName: str
    totalPages: int
    tables: List[TableData]
    metadata: DocumentMetadata

class StructureRequest(BaseModel):
    htmlResults: List[HtmlResult]
    documentName: str

def pdf_to_images(pdf_bytes: bytes) -> List[tuple]:
    """Convert PDF to images and return list of (page_num, base64_image)"""
    images = []
    try:
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        
        for page_num in range(len(doc)):
            page = doc.load_page(page_num)
            # Convert page to image with good resolution
            mat = fitz.Matrix(1.5, 1.5)  # 1.5x zoom for better quality
            pix = page.get_pixmap(matrix=mat)
            
            # Convert to PIL Image
            img_data = pix.tobytes("png")  # Use PNG for lossless quality
            base64_image = base64.b64encode(img_data).decode('ascii')
            
            images.append((page_num + 1, base64_image))
        
        doc.close()
        return images
        
    except Exception as e:
        logger.error(f"Error converting PDF to images: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing PDF: {str(e)}")

def array_to_csv(headers: List[str], data: List[List[str]]) -> str:
    """Convert array data to CSV format"""
    output = io.StringIO()
    writer = csv.writer(output, quoting=csv.QUOTE_ALL)
    
    # Write headers
    writer.writerow(headers)
    
    # Write data rows
    writer.writerows(data)
    
    return output.getvalue()

async def extract_tables_from_image(page_num: int, base64_image: str) -> List[HtmlResult]:
    """Extract tables from a single page image"""
    try:
        model = genai.GenerativeModel(GEMINI_MODEL)
        
        # Create image part
        image_part = {
            "mime_type": "image/png",
            "data": base64_image
        }
        
        prompt = """From the provided image of a document page, extract ALL tables into clean, semantic HTML `<table>` elements. 
        Preserve the original text and structure, including headers and rows. 
        Use proper Hebrew text direction and formatting.
        If no tables are found on the page, return an empty string.
        Only return the HTML table elements, no additional text or explanations."""
        
        response = await asyncio.to_thread(
            model.generate_content,
            [prompt, image_part],
            generation_config=genai.types.GenerationConfig(
                temperature=0.1,
                max_output_tokens=8192,
            ),
            safety_settings=safety_settings
        )
        
        html_content = response.text.strip()
        results = []
        
        if html_content:
            # Find all table tags
            tables = re.findall(r'<table[\s\S]*?</table>', html_content, re.IGNORECASE)
            for table_html in tables:
                results.append(HtmlResult(pageNumber=page_num, html=table_html))
        
        return results
        
    except Exception as e:
        logger.error(f"Error extracting tables from page {page_num}: {str(e)}")
        return []

@app.post("/api/extract-html", response_model=List[HtmlResult])
async def extract_html_from_pdf(file: UploadFile = File(...)):
    """Step 1: Extract HTML tables from PDF"""
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    
    try:
        # Read file
        pdf_bytes = await file.read()
        logger.info(f"Processing PDF: {file.filename}, size: {len(pdf_bytes)} bytes")
        
        # Convert to images
        images = pdf_to_images(pdf_bytes)
        logger.info(f"Converted PDF to {len(images)} images")
        
        # Process all pages concurrently
        tasks = []
        for page_num, base64_image in images:
            task = extract_tables_from_image(page_num, base64_image)
            tasks.append(task)
        
        # Wait for all tasks to complete
        results = await asyncio.gather(*tasks)
        
        # Flatten results
        all_html_results = []
        for page_results in results:
            all_html_results.extend(page_results)
        
        logger.info(f"Extracted {len(all_html_results)} tables from {len(images)} pages")
        
        if not all_html_results:
            raise HTTPException(status_code=404, detail="לא נמצאו טבלאות במסמך")
        
        return all_html_results
        
    except HTTPException:
        # Re-raise HTTPException to preserve status code and detail
        raise
    except Exception as e:
        logger.error(f"An unexpected error occurred during PDF processing: {e}", exc_info=True)
        # Return a generic error message to the client
        raise HTTPException(status_code=500, detail="An internal server error occurred while processing the PDF.")

@app.post("/api/structure-data", response_model=ExtractionResult)
async def structure_data_from_html(request: StructureRequest):
    """Step 2: Structure HTML tables into JSON format"""
    try:
        # Prepare HTML input
        html_input = '\n\n'.join([
            f"<!-- Page {r.pageNumber} -->\n{r.html}" 
            for r in request.htmlResults
        ])
        
        # Define structured response schema
        structured_schema = {
            "type": "object",
            "properties": {
                "tables": {
                    "type": "array",
                    "description": "List of all tables parsed from the provided HTML.",
                    "items": {
                        "type": "object",
                        "properties": {
                            "title": {"type": "string", "description": "The title or a brief summary of the table's content."},
                            "columns": {"type": "array", "items": {"type": "string"}, "description": "The column headers of the table."},
                            "rawData": {"type": "array", "items": {"type": "array", "items": {"type": "string"}}, "description": "The table data as a 2D array of strings, row by row."},
                            "pageNumber": {"type": "number", "description": "The original page number this table was extracted from."},
                        },
                        "required": ["title", "columns", "rawData", "pageNumber"]
                    }
                },
                "metadata": {
                    "type": "object",
                    "properties": {
                        "currency": {"type": "string", "description": "The main currency mentioned in the tables (e.g., 'NIS', 'USD', 'אלפי ש\"ח'). Default to 'לא צוין' if not found."},
                        "reportingPeriod": {"type": "string", "description": "The main reporting period of the document (e.g., 'ליום 31 בדצמבר 2022'). Default to 'לא צוין' if not found."}
                    },
                    "required": ["currency", "reportingPeriod"]
                }
            },
            "required": ["tables", "metadata"]
        }
        
        prompt = f"""Please analyze the following HTML tables extracted from a multi-page financial document. 
        Structure the information into a single JSON object according to the provided schema. 
        Infer the overall document metadata (currency, reporting period) from the content. 
        It is critical that the 'pageNumber' for each table in the output corresponds to the source page number indicated in the HTML comments (e.g., <!-- Page 4 -->).
        
        IMPORTANT: Return ONLY valid JSON without any additional text, markdown formatting, or explanation.
        The JSON should follow this structure:
        {{
          "tables": [
            {{
              "title": "Table title",
              "columns": ["Column1", "Column2", ...],
              "rawData": [["Row1Col1", "Row1Col2"], ["Row2Col1", "Row2Col2"], ...],
              "pageNumber": 1
            }}
          ],
          "metadata": {{
            "currency": "Currency",
            "reportingPeriod": "Period"
          }}
        }}
        
        Here are the HTML tables to analyze:
        
        {html_input}"""
        
        model = genai.GenerativeModel(GEMINI_MODEL)
        
        response = await asyncio.to_thread(
            model.generate_content,
            prompt,
            generation_config=genai.types.GenerationConfig(
                temperature=0.1,
                # response_mime_type and response_schema removed as they're not supported in the new model
            ),
            safety_settings=safety_settings
        )
        
        # Ensure response is valid JSON
        try:
            # First try to parse directly
            parsed_json = json.loads(response.text)
        except json.JSONDecodeError:
            # If that fails, try to extract JSON from the text
            logger.info("Response is not valid JSON, trying to extract JSON from text")
            
            # Look for JSON-like structure in the text
            text = response.text
            
            # Try to find JSON within markdown code blocks
            json_match = re.search(r'```(?:json)?\s*([\s\S]*?)\s*```', text)
            if json_match:
                try:
                    parsed_json = json.loads(json_match.group(1))
                    logger.info("Successfully extracted JSON from markdown code block")
                except json.JSONDecodeError:
                    # If still not valid JSON, create a simple structure
                    logger.error(f"Failed to parse JSON from extracted text: {json_match.group(1)}")
                    parsed_json = {"tables": [], "metadata": {"currency": "לא צוין", "reportingPeriod": "לא צוין"}}
            else:
                # If no JSON found, create a simple structure
                logger.error("No JSON structure found in response")
                parsed_json = {"tables": [], "metadata": {"currency": "לא צוין", "reportingPeriod": "לא צוין"}}
        
        # Process tables
        tables = []
        for table_data in parsed_json.get('tables', []):
            # Find original HTML for this page
            original_html = next(
                (hr.html for hr in request.htmlResults if hr.pageNumber == table_data['pageNumber']), 
                '<table>...</table>'
            )
            
            table = TableData(
                title=table_data['title'],
                html=original_html,
                rawData=table_data['rawData'],
                columns=table_data['columns'],
                confidence=0.95, # Placeholder confidence, consider making this dynamic if model supports it
                errors=[],
                csv=array_to_csv(table_data['columns'], table_data['rawData']),
                pageNumber=table_data['pageNumber']
            )
            tables.append(table)
        
        # Process metadata
        metadata = DocumentMetadata(
            currency=parsed_json.get('metadata', {}).get('currency', 'לא צוין'),
            reportingPeriod=parsed_json.get('metadata', {}).get('reportingPeriod', 'לא צוין'),
            sourceType='mixed',
            processingTimestamp=datetime.now().isoformat()
        )
        
        result = ExtractionResult(
            documentName=request.documentName,
            totalPages=max([r.pageNumber for r in request.htmlResults]) if request.htmlResults else 0,
            tables=tables,
            metadata=metadata
        )
        
        logger.info(f"Successfully structured {len(tables)} tables from {request.documentName}")
        return result
        
    except Exception as e:
        logger.error(f"An unexpected error occurred during data structuring: {e}", exc_info=True)
        # Return a generic error message to the client
        raise HTTPException(status_code=500, detail="An internal server error occurred while structuring the data.")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy", 
        "timestamp": datetime.now().isoformat(),
        "gemini_model": GEMINI_MODEL
    }

@app.get("/api/models")
async def list_available_models():
    """List available Gemini models"""
    try:
        models = genai.list_models()
        available_models = [
            {
                "name": model.name,
                "display_name": model.display_name,
                "description": model.description,
                "input_token_limit": model.input_token_limit,
                "output_token_limit": model.output_token_limit,
                "supported_generation_methods": model.supported_generation_methods
            }
            for model in models
            if 'generateContent' in model.supported_generation_methods
        ]
        return {"models": available_models, "current_model": GEMINI_MODEL}
    except Exception as e:
        logger.error(f"Error listing models: {str(e)}")
        return {"error": str(e), "current_model": GEMINI_MODEL}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)