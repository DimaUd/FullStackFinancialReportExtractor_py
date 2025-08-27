import type { ExtractionResult, HtmlResult } from '../types';

// Backend API base URL - adjust according to your deployment
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * Step 1: Extract HTML from PDF using the backend
 */
export const extractHtmlFromPdf = async (
    file: File, 
    onProgress: (progress: { current: number, total: number }) => void
): Promise<HtmlResult[]> => {
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch(`${API_BASE_URL}/extract-html`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ detail: 'Server error' }));
            throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
        }

        const htmlResults: HtmlResult[] = await response.json();
        
        // Simulate progress since the backend processes everything at once
        // In a real implementation, you might want to use WebSockets or Server-Sent Events for real progress
        const totalPages = htmlResults.length > 0 ? Math.max(...htmlResults.map(r => r.pageNumber)) : 1;
        for (let i = 1; i <= totalPages; i++) {
            onProgress({ current: i, total: totalPages });
            // Small delay to show progress visually
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        return htmlResults;
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        } else {
            throw new Error('Failed to extract HTML from PDF');
        }
    }
};

/**
 * Step 2: Structure data from HTML using the backend
 */
export const structureDataFromHtml = async (
    htmlResults: HtmlResult[], 
    documentName: string
): Promise<ExtractionResult> => {
    try {
        const requestBody = {
            htmlResults: htmlResults,
            documentName: documentName
        };

        const response = await fetch(`${API_BASE_URL}/structure-data`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ detail: 'Server error' }));
            throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
        }

        const result: ExtractionResult = await response.json();
        return result;
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        } else {
            throw new Error('Failed to structure data from HTML');
        }
    }
};

/**
 * Health check endpoint
 */
export const healthCheck = async (): Promise<boolean> => {
    try {
        const response = await fetch(`${API_BASE_URL.replace('/api', '')}/health`, {
            method: 'GET',
        });
        return response.ok;
    } catch {
        return false;
    }
};