// Centralized service exports
export { apiClient } from './base/ApiClient';
export { authService } from './authService';
export { projectService } from './projectService';
export { fileService } from './fileService';
export { chatService } from './chatService';
export { extractedDataService } from './extractedDataService';
export { metadataService } from './metadataService';

// Re-export types for convenience
export type { ApiResponse, RequestConfig } from './base/ApiClient';