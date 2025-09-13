import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Folder, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AppHeader } from '@/components/layout/AppHeader';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { CreateProjectDialog } from '@/components/projects/CreateProjectDialog';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { useAuth } from '@/hooks/useAuth';
import { useProjects } from '@/hooks/useProjects';
import { ROUTES } from '@/config/constants';
import type { Project } from '@/types';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { projects, isLoading, error, createProject, deleteProject, refreshProjects } = useProjects();
  
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; project: Project | null }>({
    open: false,
    project: null,
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleProjectClick = (project: Project) => {
    navigate(`${ROUTES.WORKSPACE}/${project.id}`, {
      state: {
        projectId: project.id,
        projectName: project.name,
        projectDescription: project.description,
        projectCreatedAt: project.created_at,
      },
    });
  };

  const handleDeleteProject = async () => {
    if (!deleteDialog.project) return;

    setIsDeleting(true);
    try {
      await deleteProject(deleteDialog.project.id);
      setDeleteDialog({ open: false, project: null });
    } catch (error) {
      // Error handling is done in useProjects hook
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshProjects();
    setIsRefreshing(false);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader userName={user?.name} onLogout={logout} subtitle="Project Dashboard" />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ErrorMessage message={error} />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader userName={user?.name} onLogout={logout} subtitle="Project Dashboard" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-foreground">
              Your Projects ({projects.length})
            </h2>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center space-x-1"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>

            <CreateProjectDialog onCreateProject={createProject} isLoading={isLoading} />
          </div>
        </div>

        {isLoading && projects.length === 0 ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner text="Loading projects..." />
          </div>
        ) : projects.length === 0 ? (
          <EmptyState
            icon={Folder}
            title="No projects yet"
            description="Create your first project to get started"
            actionLabel="Create Project"
            onAction={() => {/* This will be handled by CreateProjectDialog */}}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onClick={() => handleProjectClick(project)}
                onDelete={() => setDeleteDialog({ open: true, project })}
              />
            ))}
          </div>
        )}

        <ConfirmDialog
          open={deleteDialog.open}
          onOpenChange={(open) => setDeleteDialog({ open, project: deleteDialog.project })}
          title="Delete Project"
          description={`Are you sure you want to delete "${deleteDialog.project?.name}"? This action cannot be undone and will permanently delete the project and all its files.`}
          confirmLabel="Delete"
          onConfirm={handleDeleteProject}
          isDestructive
          isLoading={isDeleting}
        />
      </main>
    </div>
  );
};

export default Dashboard;