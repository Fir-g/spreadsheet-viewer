import { apiClient } from './base/ApiClient';
import type { Project } from '@/types';

interface CreateProjectData {
  name: string;
  description: string;
}

interface UpdateProjectData {
  name?: string;
  description?: string;
}

class ProjectService {
  async getProjects(): Promise<Project[]> {
    return apiClient.get<Project[]>('/projects');
  }

  async getProject(projectId: string): Promise<Project> {
    return apiClient.get<Project>(`/projects/${projectId}`);
  }

  async createProject(data: CreateProjectData): Promise<Project> {
    return apiClient.post<Project>('/projects', data);
  }

  async updateProject(projectId: string, data: UpdateProjectData): Promise<Project> {
    return apiClient.put<Project>(`/projects/${projectId}`, data);
  }

  async deleteProject(projectId: string): Promise<void> {
    return apiClient.delete(`/projects/${projectId}`);
  }
}

export const projectService = new ProjectService();