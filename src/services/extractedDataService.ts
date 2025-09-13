import { apiClient } from './base/ApiClient';

interface ExtractedDataItem {
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

interface CompanyFundData {
  fund_name: string;
  company_names: string[];
}

interface ExtractedFieldsData {
  company_name: string;
  fund_name: string;
}

interface FundDetailedData {
  fund_name: string;
}

interface TableDimensions {
  rows: number;
  columns: number;
}

interface TableInfo {
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

interface SheetData {
  Tables: Record<string, TableInfo>;
  Metadata: any;
}

interface FileData {
  file_id: string;
  file_type: string;
  file_path: string;
  sheets: Record<string, SheetData>;
}

interface ProjectExtractedData {
  gp_name: string;
  files: Record<string, FileData>;
}

class ExtractedDataService {
  async getSpecifications(projectId: string): Promise<ExtractedDataItem[]> {
    const response = await apiClient.get<{ specifications: ExtractedDataItem[] }>(
      `/metadata/specification?project_id=${projectId}`
    );
    return response.specifications || [];
  }

  async getExtractedData(projectId: string): Promise<ProjectExtractedData> {
    return apiClient.get<ProjectExtractedData>(`/metadata/projects/${projectId}/table/extracted`);
  }

  async getFiles(projectId: string): Promise<FileData[]> {
    return apiClient.get<FileData[]>(`/projects/${projectId}/files`);
  }

  async extractFields(
    projectId: string, 
    data: ExtractedFieldsData
  ): Promise<{ extracted_data: any }> {
    return apiClient.post<{ extracted_data: any }>(
      `/metadata/extract-fields/${projectId}`,
      data
    );
  }

  async getFundDetailed(
    projectId: string, 
    data: FundDetailedData
  ): Promise<{ extracted_data: any }> {
    return apiClient.post<{ extracted_data: any }>(
      `/metadata/fund-detailed/${projectId}`,
      data
    );
  }

  // Utility methods for data processing
  flattenExtractedData(data: ProjectExtractedData): any[] {
    const flattened: any[] = [];
    
    Object.values(data.files).forEach(file => {
      Object.values(file.sheets).forEach(sheet => {
        Object.values(sheet.Tables).forEach(table => {
          if (table.data && Array.isArray(table.data)) {
            flattened.push(...table.data);
          }
        });
      });
    });
    
    return flattened;
  }

  getFileTypeConfig(fileName: string) {
    const name = fileName.toLowerCase();
    if (name.includes('irr') || name.includes('cashflow') || name.includes('cash flow')) {
      return { 
        label: 'CASHFLOWS',
        color: 'text-green-600', 
        bgColor: 'bg-green-50'
      };
    }
    if (name.includes('portfolio') || name.includes('summary')) {
      return { 
        label: 'SUMMARY',
        color: 'text-blue-600', 
        bgColor: 'bg-blue-50'
      };
    }
    if (name.includes('transaction')) {
      return { 
        label: 'TRANSACTION',
        color: 'text-purple-600', 
        bgColor: 'bg-purple-50'
      };
    }
    return { 
      label: 'EXCEL',
      color: 'text-gray-600', 
      bgColor: 'bg-gray-50'
    };
  }
}

export const extractedDataService = new ExtractedDataService();