import { API_CONFIG, STORAGE_KEYS } from '@/config/constants';

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
  detail?: string;
}

export interface RequestConfig extends RequestInit {
  timeout?: number;
  retries?: number;
}

class ApiClient {
  private baseURL: string;
  private defaultTimeout: number;
  private defaultRetries: number;

  constructor() {
    this.baseURL = this.getBackendUrl();
    this.defaultTimeout = API_CONFIG.TIMEOUT;
    this.defaultRetries = API_CONFIG.RETRY_ATTEMPTS;
  }

  private getBackendUrl(): string {
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
  }

  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  private isAuthError(error: any, response?: Response): boolean {
    const errorMessage = error?.message || error?.detail || '';
    return (
      response?.status === 401 ||
      errorMessage.toLowerCase().includes('invalid credentials') ||
      errorMessage.toLowerCase().includes('invalid authentication credentials') ||
      errorMessage.toLowerCase().includes('authentication failed') ||
      errorMessage.toLowerCase().includes('unauthorized') ||
      (errorMessage.toLowerCase().includes('token') && errorMessage.toLowerCase().includes('invalid'))
    );
  }

  private handleAuthError(): void {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    window.location.href = '/auth';
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorData: any;
      try {
        errorData = await response.json();
      } catch {
        errorData = { detail: `HTTP error! status: ${response.status}` };
      }

      if (this.isAuthError(errorData, response)) {
        this.handleAuthError();
        throw new Error('Authentication failed');
      }

      throw new Error(errorData.detail || errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  private async makeRequest<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<T> {
    const {
      timeout = this.defaultTimeout,
      retries = this.defaultRetries,
      ...requestConfig
    } = config;

    const url = `${this.baseURL}${endpoint}`;
    const controller = new AbortController();
    
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...requestConfig,
        signal: controller.signal,
        headers: {
          ...this.getAuthHeaders(),
          ...requestConfig.headers,
        },
      });

      clearTimeout(timeoutId);
      return await this.handleResponse<T>(response);
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (this.isAuthError(error)) {
        this.handleAuthError();
        throw new Error('Authentication failed');
      }
      
      throw error;
    }
  }

  async get<T = any>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.makeRequest<T>(endpoint, { ...config, method: 'GET' });
  }

  async post<T = any>(endpoint: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      ...config,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T = any>(endpoint: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T = any>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.makeRequest<T>(endpoint, { ...config, method: 'DELETE' });
  }

  async upload<T = any>(endpoint: string, formData: FormData, config?: RequestConfig): Promise<T> {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    const url = `${this.baseURL}${endpoint}`;
    
    const response = await fetch(url, {
      ...config,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        ...config?.headers,
      },
      body: formData,
    });

    return this.handleResponse<T>(response);
  }

  async stream(endpoint: string, data?: any, config?: RequestConfig): Promise<ReadableStream<Uint8Array> | null> {
    const url = `${this.baseURL}${endpoint}`;
    
    const response = await fetch(url, {
      ...config,
      method: 'POST',
      headers: {
        ...this.getAuthHeaders(),
        ...config?.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      let errorData: any;
      try {
        errorData = await response.json();
      } catch {
        errorData = { detail: `HTTP error! status: ${response.status}` };
      }

      if (this.isAuthError(errorData, response)) {
        this.handleAuthError();
        throw new Error('Authentication failed');
      }

      throw new Error(errorData.detail || 'Failed to get stream response');
    }

    return response.body;
  }
}

export const apiClient = new ApiClient();