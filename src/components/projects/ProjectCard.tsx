import { Calendar, Folder, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/utils/formatters';
import type { Project } from '@/types';

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
  onDelete: () => void;
}

export const ProjectCard = ({ project, onClick, onDelete }: ProjectCardProps) => {
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
  };

  return (
    <Card
      className="hover:shadow-lg transition-all duration-200 cursor-pointer border-0 bg-white/60 backdrop-blur hover:bg-white/80 group"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-gradient-secondary">
              <Folder className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">
                {project.name}
              </CardTitle>
              <CardDescription className="text-sm">
                {project.description || "No description"}
              </CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-red-500 bg-transparent hover:bg-red-600 hover:text-white shadow-none transition-colors"
            onClick={handleDeleteClick}
          >
            <Trash2 className="w-5 h-5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(project.created_at)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};