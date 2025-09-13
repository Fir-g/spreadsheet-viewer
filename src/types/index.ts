// Global type definitions
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  created_at: string;
  user_id: string;
}

export interface FileData {
  id: string;
  name: string;
  type: string;
  document_type: string;
  file_size: string | null;
  uploaded_at: string;
  modified_at: string;
  status: string;
  description?: string;
}

export interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface ChatSession {
  session_id: string;
  user_id: string;
  project_id: string;
  created_at: string;
  last_activity: string;
  messages: Message[];
}

export interface BasicSession {
  session_id: string;
  project_id: string;
  created_at: string;
  last_activity: string;
}

export interface ExtractedDataItem {
  key: string;
  value: string;
  type: string;
  source: string;
  citation: number;
  expected_data_sources: string[];
  extracted_at: number;
  heading: string;
  sub_heading: string;
}

export interface TableDimensions {
  rows: number;
  columns: number;
}

export interface TableInfo {
  name: string;
  table_number: number;
  section_number: number;
  row_count: number;
  column_count: number;
  start_row: number;
  end_row: number;
  max_column: number;
  dimensions: TableDimensions;
  data: any[][];
  metadata: any;
}

export interface SheetData {
  Tables: Record<string, TableInfo>;
  Metadata: any;
}

export interface FileDataExtracted {
  file_id: string;
  file_type: string;
  file_path: string;
  sheets: Record<string, SheetData>;
}

export interface ProjectExtractedData {
  gp_name: string;
  files: Record<string, FileDataExtracted>;
}

export interface FundCompanyData {
  fund_name: string;
  company_names: string[];
}

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
  detail?: string;
}

export interface UploadProgress {
  fileIndex: number;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
}