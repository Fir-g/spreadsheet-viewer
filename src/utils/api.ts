import { extractedDataService } from '@/services';
import { apiClient } from '@/services/base/ApiClient';
import { STORAGE_KEYS } from '@/config/constants';

// API utility functions
export const fetchCompaniesFundsAPI = async (projectId: string) => {
  try {
    return await extractedDataService.getExtractedData(projectId);
  } catch (error) {
    console.error('Failed to fetch companies and funds data:', error);
    throw error;
  }
};

export const handleAuthError = (error: any): boolean => {
  const errorMessage = error?.message || error?.detail || '';
  const isAuthError = errorMessage.toLowerCase().includes('authentication') ||
                     errorMessage.toLowerCase().includes('unauthorized') ||
                     errorMessage.toLowerCase().includes('invalid credentials');
  
  if (isAuthError) {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    window.location.href = '/auth';
    return true;
  }
  
  return false;
};

export const getBackendUrl = (): string => {
  const envUrl = import.meta.env.VITE_BACKEND_URL;
  
  if (envUrl) {
    if (window.location.protocol === 'https:' && envUrl.startsWith('http:')) {
      return envUrl.replace('http:', 'https:');
    }
    return envUrl;
  }
  
  return window.location.protocol === 'https:'
    ? 'https://52.66.225.78:8000'
    : 'https://kubera-backend.thetailoredai.co';
};