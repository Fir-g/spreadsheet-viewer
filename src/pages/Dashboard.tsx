import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Plus,
  Settings,
  Folder,
  Calendar,
  User,
  LogOut,
  Zap,
  Loader2,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { useProjectStore } from "../stores/projectStore";

interface Project {
  id: string;
  name: string;
  description: string;
  created_at: string;
  user_id: string;
}

const Dashboard = () => {
  const navigate = useNavigate();

  // Zustand store
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

  const [userName, setUserName] = useState<string>("");
  const [creatingProject, setCreatingProject] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const projectNameRef = useRef<HTMLInputElement>(null);
  const projectDescRef = useRef<HTMLInputElement>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const getBackendUrl = () => {
    return (
      import.meta.env.VITE_BACKEND_URL ||
      "https://kubera-backend.thetailoredai.co"
    );
  };

  const fetchProjects = async (force = false) => {
    // Check if we need to refetch
    if (!force && !shouldRefetch()) {
      console.log("Using cached projects");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/auth");
        return;
      }

      setLoading(true);
      const baseUrl = getBackendUrl();
      const response = await fetch(`${baseUrl}/projects`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setProjects(data);
        console.log("Projects fetched from API");
      } else if (response.status === 401) {
        localStorage.removeItem("token");
        clearProjects();
        navigate("/auth");
      }
    } catch (err) {
      console.error("Failed to fetch projects:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/auth");
        return;
      }
      const baseUrl = getBackendUrl();
      const response = await fetch(`${baseUrl}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setUserName(data.name);
      } else if (response.status === 401) {
        localStorage.removeItem("token");
        clearProjects();
        navigate("/auth");
      }
    } catch (err) {
      console.error("Failed to fetch user:", err);
      navigate("/auth");
    }
  };

  useEffect(() => {
    fetchUser();
    fetchProjects();
  }, [navigate]);

  const handleProjectClick = (project: Project) => {
    navigate(`/workspace/${project.id}`, {
      state: {
        projectId: project.id,
        projectName: project.name,
        projectDescription: project.description,
        projectCreatedAt: project.created_at,
      },
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    clearProjects(); // Clear projects from store on logout
    navigate("/auth");
  };

  const handleCreateProject = async () => {
    const name = projectNameRef.current?.value || "";
    const description = projectDescRef.current?.value || "";
    if (!name) return;

    setCreatingProject(true);
    try {
      const token = localStorage.getItem("token");
      const baseUrl = getBackendUrl();
      const response = await fetch(`${baseUrl}/projects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, description }),
      });

      if (response.ok) {
        const newProject = await response.json();

        // Add to Zustand store instead of local state
        addProject(newProject);

        setCreatingProject(false);
        setDialogOpen(false);
        if (projectNameRef.current) projectNameRef.current.value = "";
        if (projectDescRef.current) projectDescRef.current.value = "";
      } else if (response.status === 401) {
        localStorage.removeItem("token");
        clearProjects();
        navigate("/auth");
      } else {
        setCreatingProject(false);
        console.error("Failed to create project");
      }
    } catch (err) {
      setCreatingProject(false);
      console.error("Error creating project:", err);
    }
  };

  const handleDeleteProject = async () => {
    if (!projectToDelete) return;

    setDeleting(true);
    try {
      const token = localStorage.getItem("token");
      const baseUrl = getBackendUrl();
      const response = await fetch(
        `${baseUrl}/projects/${projectToDelete.id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        // Remove from Zustand store
        removeProject(projectToDelete.id);
        setDeleteDialogOpen(false);
        setProjectToDelete(null);
      } else if (response.status === 401) {
        localStorage.removeItem("token");
        clearProjects();
        navigate("/auth");
      }
    } catch (error) {
      console.error("Failed to delete project:", error);
    } finally {
      setDeleting(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchProjects(true); // Force refetch
    setRefreshing(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
            
              <div>
                <h1 className="text-xl text-foreground font-bold bg-clip-text">
                  Qubera AI
                </h1>
                <p className="text-xs text-muted-foreground">
                  Project Dashboard
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>{userName || "User"}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-foreground">
              Your Projects ({projects.length})
            </h2>
            
          </div>

          <div className="flex gap-2">
            

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
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
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="project-name">Project Name</Label>
                    <Input
                      id="project-name"
                      placeholder="Enter project name"
                      ref={projectNameRef}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="project-description">Description</Label>
                    <Input
                      id="project-description"
                      placeholder="Brief description of your project"
                      ref={projectDescRef}
                    />
                  </div>
                  <Button
                    onClick={handleCreateProject}
                    className="w-full bg-gradient-primary hover:opacity-90"
                    disabled={creatingProject}
                  >
                    {creatingProject ? (
                      <span className="flex items-center justify-center">
                        <Loader2 className="animate-spin h-4 w-4 mr-2" />{" "}
                        Creating...
                      </span>
                    ) : (
                      "Create Project"
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        

        {/* Loading State */}
        {isLoading && projects.length === 0 && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">
              Loading projects...
            </span>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && projects.length === 0 && (
          <div className="text-center py-12">
            <Folder className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No projects yet
            </h3>
            <p className="text-muted-foreground mb-4">
              Create your first project to get started
            </p>
            <Button
              onClick={() => setDialogOpen(true)}
              className="bg-gradient-primary hover:opacity-90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Project
            </Button>
          </div>
        )}

        {/* Projects Grid */}
        {projects.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card
                key={project.id}
                className="hover:shadow-lg transition-all duration-200 cursor-pointer border-0 bg-white/60 backdrop-blur hover:bg-white/80 group"
                onClick={() => handleProjectClick(project)}
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
                    <div className="flex gap-2">
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 bg-transparent hover:bg-red-600 hover:text-white shadow-none transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          setProjectToDelete(project);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </div>
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
            ))}
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Project</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete <b>{projectToDelete?.name}</b>?
                <br />
                This action cannot be undone and will permanently delete the
                project and all its files.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-2 mt-4">
              <Button
                variant="secondary"
                onClick={() => setDeleteDialogOpen(false)}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteProject}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default Dashboard;
