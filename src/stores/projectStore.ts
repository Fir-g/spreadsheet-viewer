
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Project {
  id: string;
  name: string;
  description: string;
  created_at: string;
  user_id: string;
}

interface ProjectState {
  projects: Project[];
  isLoading: boolean;
  lastFetched: number | null;
  
  // Actions
  setProjects: (projects: Project[]) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  setLoading: (loading: boolean) => void;
  clearProjects: () => void;
  shouldRefetch: () => boolean;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      projects: [],
      isLoading: false,
      lastFetched: null,

      setProjects: (projects) => 
        set({ 
          projects, 
          lastFetched: Date.now() 
        }),

      addProject: (project) =>
        set((state) => ({
          projects: [...state.projects, project],
        })),

      updateProject: (id, updates) =>
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === id ? { ...project, ...updates } : project
          ),
        })),

      deleteProject: (id) =>
        set((state) => ({
          projects: state.projects.filter((project) => project.id !== id),
        })),

      setLoading: (loading) => set({ isLoading: loading }),

      clearProjects: () => 
        set({ 
          projects: [], 
          lastFetched: null 
        }),

      shouldRefetch: () => {
        const { lastFetched } = get();
        if (!lastFetched) return true;
        return Date.now() - lastFetched > CACHE_DURATION;
      },
    }),
    {
      name: 'project-storage',
      // Only persist projects and lastFetched, not loading state
      partialize: (state) => ({ 
        projects: state.projects, 
        lastFetched: state.lastFetched 
      }),
    }
  )
);