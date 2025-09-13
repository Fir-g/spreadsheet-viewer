import { create } from 'zustand';
import { handleAuthError } from '../utils/api';

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

interface ExtractedDataStore {
  data: Record<string, ExtractedDataItem[]>; // keyed by projectId
  loading: Record<string, boolean>;
  error: Record<string, string | null>;
  lastFetched: Record<string, number>;
  
  fetchData: (projectId: string, forceRefresh?: boolean) => Promise<void>;
  clearData: (projectId: string) => void;
  setError: (projectId: string, error: string | null) => void;
  setLoading: (projectId: string, loading: boolean) => void;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useExtractedDataStore = create<ExtractedDataStore>((set, get) => ({
  data: {},
  loading: {},
  error: {},
  lastFetched: {},

  fetchData: async (projectId: string, forceRefresh = false) => {
    const state = get();
    const now = Date.now();
    const lastFetch = state.lastFetched[projectId] || 0;
    
    // Skip fetch if data is fresh and not forcing refresh
    if (!forceRefresh && state.data[projectId] && (now - lastFetch) < CACHE_DURATION) {
      return;
    }

    set(state => ({
      loading: { ...state.loading, [projectId]: true },
      error: { ...state.error, [projectId]: null }
    }));

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const getBackendUrl = (): string => {
        const envUrl = import.meta.env.VITE_BACKEND_URL;
        if (envUrl) {
          if (window.location.protocol === 'https:' && envUrl.startsWith('http:')) {
            return envUrl.replace('http:', 'https:');
          }
          return envUrl;
        }
        return window.location.protocol === 'https:' 
          ? 'https://52.66.225.78:8000'
          : 'http://52.66.225.78:8000';
      };

      const baseUrl = getBackendUrl();
      const response = await fetch(
        `${baseUrl}/metadata/specification?project_id=${projectId}`,
        {
          method: "GET",
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        // Try to get error details from response
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { detail: `HTTP error! status: ${response.status}` };
        }

        // Handle authentication errors
        if (handleAuthError(errorData, response)) {
          throw new Error("Authentication failed. Please log in again.");
        } else if (response.status === 404) {
          throw new Error("Project not found or no data available yet.");
        } else {
          throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
        }
      }

      const responseData = await response.json();
      const specifications = responseData.specifications || [];

      set(state => ({
        data: { ...state.data, [projectId]: specifications },
        loading: { ...state.loading, [projectId]: false },
        error: { ...state.error, [projectId]: null },
        lastFetched: { ...state.lastFetched, [projectId]: now }
      }));

    } catch (err) {
      // Handle authentication errors in catch block too
      if (handleAuthError(err)) {
        set(state => ({
          loading: { ...state.loading, [projectId]: false },
          error: { ...state.error, [projectId]: "Authentication failed. Please log in again." }
        }));
        return;
      }
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch data";
      set(state => ({
        loading: { ...state.loading, [projectId]: false },
        error: { ...state.error, [projectId]: errorMessage }
      }));
    }
  },

  clearData: (projectId: string) => {
    set(state => {
      const newData = { ...state.data };
      const newLoading = { ...state.loading };
      const newError = { ...state.error };
      const newLastFetched = { ...state.lastFetched };
      
      delete newData[projectId];
      delete newLoading[projectId];
      delete newError[projectId];
      delete newLastFetched[projectId];
      
      return {
        data: newData,
        loading: newLoading,
        error: newError,
        lastFetched: newLastFetched
      };
    });
  },

  setError: (projectId: string, error: string | null) => {
    set(state => ({
      error: { ...state.error, [projectId]: error }
    }));
  },

  setLoading: (projectId: string, loading: boolean) => {
    set(state => ({
      loading: { ...state.loading, [projectId]: loading }
    }));
  },
}));