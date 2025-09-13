import { create } from 'zustand';
import { extractedDataService } from '@/services';

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
      const specifications = await extractedDataService.getSpecifications(projectId);

      set(state => ({
        data: { ...state.data, [projectId]: specifications },
        loading: { ...state.loading, [projectId]: false },
        error: { ...state.error, [projectId]: null },
        lastFetched: { ...state.lastFetched, [projectId]: now }
      }));

    } catch (err) {
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