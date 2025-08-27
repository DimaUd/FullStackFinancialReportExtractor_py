export interface TableData {
  title: string;
  html: string;
  rawData: string[][];
  columns: string[];
  confidence: number;
  errors: string[];
  csv: string;
  pageNumber: number;
}

export interface DocumentMetadata {
  currency: string;
  reportingPeriod: string;
  sourceType: 'balance_sheet' | 'income_statement' | 'cash_flow' | 'notes' | 'mixed';
  processingTimestamp: string; // ISO-8601
}

export interface ExtractionResult {
  documentName: string;
  totalPages: number;
  tables: TableData[];
  metadata: DocumentMetadata;
}

export interface HtmlResult {
  pageNumber: number;
  html: string;
}