import { useState } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { validateProjectName, validateRequired } from '@/utils/validators';

interface CreateProjectDialogProps {
  onCreateProject: (name: string, description: string) => Promise<void>;
  isLoading: boolean;
}

export const CreateProjectDialog = ({ onCreateProject, isLoading }: CreateProjectDialogProps) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [errors, setErrors] = useState<{ name?: string; description?: string }>({});

  const validateForm = () => {
    const newErrors: { name?: string; description?: string } = {};
    
    const nameValidation = validateProjectName(formData.name);
    if (!nameValidation.isValid) {
      newErrors.name = nameValidation.error;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      await onCreateProject(formData.name, formData.description);
      setFormData({ name: '', description: '' });
      setErrors({});
      setOpen(false);
    } catch (error) {
      // Error handling is done in the parent component
    }
  };

  const handleInputChange = (field: 'name' | 'description', value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-primary hover:opacity-90 shadow-md">
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Set up a new data processing project
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="project-name">Project Name</Label>
            <Input
              id="project-name"
              placeholder="Enter project name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="project-description">Description</Label>
            <Input
              id="project-description"
              placeholder="Brief description of your project"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-gradient-primary hover:opacity-90"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <Loader2 className="animate-spin h-4 w-4 mr-2" />
                Creating...
              </span>
            ) : (
              'Create Project'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};