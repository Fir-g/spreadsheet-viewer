import { useState, useEffect, useCallback } from 'react';
import { projectService } from '@/services/projectService';
import { useProjectStore } from '@/stores/projectStore';
import type { Project } from '@/types';

interface UseProjectsReturn {
  projects: Project[];
  isLoading: boolean;
  error: string | null;
  createProject: (name: string, description: string) => Promise<Project>;
  deleteProject: (projectId: string) => Promise<void>;
  refreshProjects: () => Promise<void>;
}

export const useProjects = (): UseProjectsReturn => {
  const {
    projects,
    isLoading,
    setProjects,
    addProject,
    deleteProject: removeProject,
    setLoading,
    clearProjects,
    shouldRefetch,
  } = useProjectStore();

  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async (force = false) => {
    if (!force && !shouldRefetch()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const fetchedProjects = await projectService.getProjects();
      setProjects(fetchedProjects);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch projects';
      setError(errorMessage);
      
      if (errorMessage.includes('Authentication failed')) {
        clearProjects();
      }
    } finally {
      setLoading(false);
    }
  }, [setLoading, setProjects, shouldRefetch, clearProjects]);

  const createProject = useCallback(async (name: string, description: string): Promise<Project> => {
    try {
      setError(null);
      const newProject = await projectService.createProject({ name, description });
      addProject(newProject);
      return newProject;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create project';
      setError(errorMessage);
      throw err;
    }
  }, [addProject]);

  const deleteProject = useCallback(async (projectId: string): Promise<void> => {
    try {
      setError(null);
      await projectService.deleteProject(projectId);
      removeProject(projectId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete project';
      setError(errorMessage);
      throw err;
    }
  }, [removeProject]);

  const refreshProjects = useCallback(async (): Promise<void> => {
    await fetchProjects(true);
  }, [fetchProjects]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return {
    projects,
    isLoading,
    error,
    createProject,
    deleteProject,
    refreshProjects,
  };
};