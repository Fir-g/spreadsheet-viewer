import { apiClient } from './base/ApiClient';
import type { FileData } from '@/types';

interface UploadFileData {
  file: File;
  document_type: string;
  project_id: string;
  description?: string;
}

interface FileMetadata {
  document_type: string;
  description?: string;
  xlsx_metadata?: {
    sheets: Array<{
      sheet_name: string;
      data_range: {
        start: number;
        end: number;
        header: number;
      };
    }>;
  };
}

class FileService {
  async getFiles(projectId: string): Promise<FileData[]> {
    return apiClient.get<FileData[]>(`/projects/${projectId}/files`);
  }

  async getFile(projectId: string, fileId: string): Promise<FileData> {
    return apiClient.get<FileData>(`/projects/${projectId}/files/${fileId}`);
  }

  async uploadFile(data: UploadFileData): Promise<FileData> {
    const formData = new FormData();
    formData.append('file', data.file);
    formData.append('document_type', data.document_type.toLowerCase());
    formData.append('project_id', data.project_id);
    
    if (data.description?.trim()) {
      formData.append('description', data.description.trim());
    }

    const response = await apiClient.upload<any>('/ingest/upload', formData);
    
    // Map response fields to FileData interface
    return {
      id: response.file_id || response.id,
      name: response.filename || response.name,
      type: data.file.name.split('.').pop()?.toLowerCase() || '',
      document_type: data.document_type,
      file_size: response.file_size || String(data.file.size),
      uploaded_at: response.uploaded_at,
      modified_at: response.modified_at || response.uploaded_at,
      status: response.status,
      description: data.description,
    } as FileData;
  }

  async uploadMultipleFiles(
    files: File[], 
    metadata: Record<number, FileMetadata>, 
    projectId: string
  ): Promise<FileData[]> {
    const results: FileData[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileMeta = metadata[i];
      
      const uploadedFile = await this.uploadFile({
        file,
        document_type: fileMeta.document_type,
        project_id: projectId,
        description: fileMeta.description,
      });
      
      results.push(uploadedFile);
    }

    return results;
  }

  async deleteFile(projectId: string, fileId: string): Promise<void> {
    return apiClient.delete(`/projects/${projectId}/files/${fileId}`);
  }

  async updateFileMetadata(
    projectId: string, 
    fileId: string, 
    metadata: Partial<FileMetadata>
  ): Promise<FileData> {
    return apiClient.put<FileData>(`/projects/${projectId}/files/${fileId}/metadata`, metadata);
  }

  validateFileType(file: File): { isValid: boolean; error?: string } {
    const allowedTypes = ['.pdf', '.xlsx'];
    const allowedMimeTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    const maxSize = 50 * 1024 * 1024; // 50MB

    if (!allowedMimeTypes.includes(file.type)) {
      return {
        isValid: false,
        error: `File "${file.name}" is not a supported format. Only PDF and XLSX files are allowed.`
      };
    }

    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!allowedTypes.includes(fileExtension)) {
      return {
        isValid: false,
        error: `File "${file.name}" has an unsupported extension. Only .pdf and .xlsx files are allowed.`
      };
    }

    if (file.size > maxSize) {
      return {
        isValid: false,
        error: `File "${file.name}" is too large. Maximum file size is 50MB.`
      };
    }

    return { isValid: true };
  }

  validateFileList(fileList: FileList): { isValid: boolean; error?: string } {
    for (let i = 0; i < fileList.length; i++) {
      const validation = this.validateFileType(fileList[i]);
      if (!validation.isValid) {
        return validation;
      }
    }
    return { isValid: true };
  }
}

export const fileService = new FileService();