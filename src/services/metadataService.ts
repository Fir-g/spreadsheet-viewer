import { apiClient } from './base/ApiClient';

interface MetadataRequest {
  project_id: string;
  file_id?: string;
  filters?: Record<string, any>;
}

interface MetadataResponse {
  metadata: Record<string, any>;
  total_count: number;
  page: number;
  page_size: number;
}

class MetadataService {
  async getProjectMetadata(projectId: string): Promise<MetadataResponse> {
    return apiClient.get<MetadataResponse>(`/metadata/project/${projectId}`);
  }

  async getFileMetadata(projectId: string, fileId: string): Promise<MetadataResponse> {
    return apiClient.get<MetadataResponse>(`/metadata/project/${projectId}/file/${fileId}`);
  }

  async updateMetadata(
    projectId: string, 
    metadata: Record<string, any>
  ): Promise<{ success: boolean }> {
    return apiClient.put<{ success: boolean }>(`/metadata/project/${projectId}`, metadata);
  }

  async searchMetadata(
    projectId: string,
    query: string,
    filters?: Record<string, any>
  ): Promise<MetadataResponse> {
    const searchParams = new URLSearchParams({
      q: query,
      ...(filters && Object.fromEntries(
        Object.entries(filters).map(([key, value]) => [key, String(value)])
      ))
    });

    return apiClient.get<MetadataResponse>(
      `/metadata/project/${projectId}/search?${searchParams.toString()}`
    );
  }

  async exportMetadata(
    projectId: string,
    format: 'json' | 'csv' | 'xlsx' = 'json'
  ): Promise<Blob> {
    const response = await fetch(
      `${apiClient['baseURL']}/metadata/project/${projectId}/export?format=${format}`,
      {
        method: 'GET',
        headers: apiClient['getAuthHeaders'](),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to export metadata');
    }

    return response.blob();
  }
}

export const metadataService = new MetadataService();