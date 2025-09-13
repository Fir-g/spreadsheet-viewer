import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { handleAuthError } from "../utils/api";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Upload,
  Search,
  Filter,
  FileText,
  Download,
  Trash2,
  Eye,
  Loader2,
  AlertCircle,
  CheckCircle,
  X,
  HardDrive,
  Calendar,
  File,
  FileType,
  Info,
  Tag
} from "lucide-react";
import { useLocation, useParams } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { useFileStore } from "../stores/fileStore";
import EnhancedFileUpload from "./FileUploadComponent";

interface FileData {
  id: string;
  name: string;
  type: string;
  document_type: string;
  file_size: string | null;
  uploaded_at: string;
  modified_at: string;
  status: string;
  description: string;
}

export function FilesView() {
  const location = useLocation();
  const params = useParams();

  // Move these hook calls inside the component
  const [sortField, setSortField] = useState<"name" | "uploaded_at">(
    "uploaded_at"
  );
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Add zustand store integration
  const { files: storedFiles, setFiles: setStoredFiles } = useFileStore();

  const projectUuid = params.projectId || location.state?.projectId;
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; file: FileData | null }>({ open: false, file: null });

  const [files, setFiles] = useState<FileData[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [documentTypeFilter, setDocumentTypeFilter] = useState("all");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  const [deleting, setDeleting] = useState(false);

  const getFileIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case "xlsx":
      case "excel":
        return <FileText className="h-4 w-4 text-green-600" />;
      case "pdf":
        return <FileText className="h-4 w-4 text-red-600" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };


  const sortFiles = (files: FileData[]) => {
    return [...files].sort((a, b) => {
      let aValue: string | Date;
      let bValue: string | Date;

      if (sortField === "name") {
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
      } else {
        aValue = new Date(a.uploaded_at);
        bValue = new Date(b.uploaded_at);
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  };


  const fetchFiles = async () => {
    if (!projectUuid) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const getBackendUrl = (): string => {
        const envUrl = import.meta.env.VITE_BACKEND_URL;
        if (envUrl) {
          if (
            window.location.protocol === "https:" &&
            envUrl.startsWith("https:")
          ) {
            return envUrl.replace("https:", "https:");
          }
          return envUrl;
        }
        return window.location.protocol === "https:"
          ? "https://52.66.225.78:8000"
          : "https://kubera-backend.thetailoredai.co";
      };
      const baseUrl = getBackendUrl();
      const response = await fetch(`${baseUrl}/projects/${projectUuid}/files`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setFiles(data);
        setStoredFiles(data); // Also store in zustand
      }
    } catch (error) {
      console.error("Failed to fetch files:", error);
      // Handle authentication errors
      if (handleAuthError(error)) {
        return;
      }
    } finally {
      setLoading(false);
    }
  };
  const deleteFile = async (file: FileData) => {
    try {
      setDeleting(true); // Start loading

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const getBackendUrl = (): string => {
        const envUrl = import.meta.env.VITE_BACKEND_URL;
        if (envUrl) {
          if (
            window.location.protocol === "https:" &&
            envUrl.startsWith("https:")
          ) {
            return envUrl.replace("https:", "https:");
          }
          return envUrl;
        }
        return window.location.protocol === "https:"
          ? "https://52.66.225.78:8000"
          : "https://kubera-backend.thetailoredai.co";
      };
      const baseUrl = getBackendUrl();

      const response = await fetch(
        `${baseUrl}/projects/${projectUuid}/files/${file.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to delete file");
      }

      toast({
        title: "File Deleted",
        description: `"${file.name}" has been deleted successfully.`,
        variant: "default",
      });

      // Refresh the files list
      await fetchFiles();
    } catch (error) {
      // Handle authentication errors
      if (handleAuthError(error)) {
        toast({
          title: "Authentication Failed",
          description: "Please log in again to continue.",
          variant: "destructive",
        });
        return;
      }
      
      const errorMessage =
        error instanceof Error ? error.message : "Delete failed";
      toast({
        title: "Delete Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setDeleting(false); // End loading
      setDeleteDialog({ open: false, file: null });
    }
  };

  const filteredFiles = sortFiles(
    files.filter((file) => {
      const matchesSearch = (file.name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "all" ||
        (file.status || "").toLowerCase() === statusFilter.toLowerCase();
      const matchesType =
        typeFilter === "all" ||
        (file.type || "").toLowerCase() === typeFilter.toLowerCase();
      const matchesDocumentType =
        documentTypeFilter === "all" ||
        (file.document_type || "").toLowerCase() ===
          documentTypeFilter.toLowerCase();
      return (
        matchesSearch && matchesStatus && matchesType && matchesDocumentType
      );
    })
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleUploadSuccess = () => {
    fetchFiles();
  };

  useEffect(() => {
    fetchFiles();
  }, [projectUuid]);

  return (
    <div className="h-screen flex flex-col p-6 space-y-6 max-w-7xl mx-auto overflow-hidden">

      {/* Compact Header with Controls */}
      <Card className="border-0 bg-white/60 backdrop-blur shadow-sm flex-shrink-0">
        <CardContent className="p-4">
          {/* Title and Action Buttons */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
            <div>
              <h2 className="text-xl font-bold text-foreground">Files</h2>
              <p className="text-sm text-muted-foreground">
                Upload and manage your PDF and XLSX files
              </p>
            </div>

            <Button 
              onClick={() => setUploadDialogOpen(true)}
              className="bg-black hover:bg-black text-white"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Files
            </Button>

            {/* Delete Confirmation Dialog */}
            <Dialog
              open={deleteDialog.open}
              onOpenChange={(open) =>
                setDeleteDialog({ open, file: deleteDialog.file })
              }
            >
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Delete File</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-900">
                        Are you sure you want to delete this file?
                      </p>
                      <p className="text-sm text-gray-600 mt-1 font-medium">
                        "{deleteDialog.file?.name}"
                      </p>
                      <p className="text-xs text-red-600 mt-2">
                        This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setDeleteDialog({ open: false, file: null })}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => deleteFile(deleteDialog.file)}
                    className="bg-red-600 hover:bg-red-700"
                    disabled={deleting} // Disable the button while deleting
                  >
                    {deleting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />{" "}
                        {/* Add loading spinner */}
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete File
                      </>
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Compact Filters Row */}
          <div className="space-y-3">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-9"
              />
            </div>

            {/* Filter Dropdowns in Responsive Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="uploaded">Uploaded</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="xlsx">XLSX</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={documentTypeFilter}
                onValueChange={setDocumentTypeFilter}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Doc Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Doc Types</SelectItem>
                  <SelectItem value="ddq">DDQ</SelectItem>
                  <SelectItem value="lpa">LPA</SelectItem>
                  <SelectItem value="ppm">PPM</SelectItem>
                  <SelectItem value="summary">Summary</SelectItem>
                  <SelectItem value="cashflows">Cashflows</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={`${sortField}-${sortDirection}`}
                onValueChange={(value) => {
                  const [field, direction] = value.split("-") as [
                    typeof sortField,
                    typeof sortDirection
                  ];
                  setSortField(field);
                  setSortDirection(direction);
                }}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="uploaded_at-desc">
                    Date (Newest)
                  </SelectItem>
                  <SelectItem value="uploaded_at-asc">Date (Oldest)</SelectItem>
                  <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                  <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Showing {filteredFiles.length} of {files.length} files
              </span>
              {(searchTerm ||
                statusFilter !== "all" ||
                typeFilter !== "all" ||
                documentTypeFilter !== "all") && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs"
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                    setTypeFilter("all");
                    setDocumentTypeFilter("all");
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <FileCardsLayout 
        files={filteredFiles}
        loading={loading}
        onRequestDelete={(file) => setDeleteDialog({ open: true, file })}
      />

      {/* Enhanced File Upload Component */}
      <EnhancedFileUpload
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        projectUuid={projectUuid}
        onUploadSuccess={handleUploadSuccess}
      />
    </div>
  );
}

interface FileCardsLayoutProps {
  files: FileData[];
  loading: boolean;
  onRequestDelete: (file: FileData) => void;
}

const FileCardsLayout: React.FC<FileCardsLayoutProps> = ({
  files,
  loading,
  onRequestDelete,
}) => {
  const getFileIcon = (type?: string) => {
    switch (type?.toLowerCase()) {
      case "pdf":
        return <FileText className="h-5 w-5 text-red-500" />;
      case "xlsx":
      case "xls":
        return <File className="h-5 w-5 text-green-600" />;
      default:
        return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    const normalizedStatus = status?.toLowerCase();
    switch (normalizedStatus) {
      case "completed":
        return "bg-green-500 text-white";
      case "processing":
      case "in_progress":
        return "bg-gray-400 text-white-800";
      case "uploaded":
        return "bg-blue-500 text-white";
      case "failed":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-200 text-gray-800";
    }
  };

  const getStatusDisplay = (status: string) => {
    const normalizedStatus = status?.toLowerCase();
    if (normalizedStatus === "in_progress") {
      return "Processing";
    }
    // Capitalize first letter for all other statuses
    return status
      ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
      : "";
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <Card className="border-0 bg-white/60 backdrop-blur shadow-sm flex-1 flex flex-col overflow-hidden">
        <CardContent className="p-6 flex-1 flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-3" />
          <div className="text-gray-600">Loading files...</div>
        </CardContent>
      </Card>
    );
  }

  if (files.length === 0) {
    return (
      <Card className="border-0 bg-white/60 backdrop-blur shadow-sm flex-1 flex flex-col overflow-hidden">
        <CardContent className="p-6 flex-1 flex flex-col items-center justify-center">
          <FileText className="h-16 w-16 text-gray-300 mb-4" />
          <div className="text-lg font-semibold text-gray-700 mb-2">No files found</div>
          <div className="text-gray-500 text-center">
            Upload your first PDF or XLSX file to get started.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex-1 overflow-auto p-4">
      <div className="grid gap-4">
        {files.map((file, index) => (
          <Card
            key={`${file.name}-${index}`}
            className="bg-white/80 backdrop-blur border border-gray-200 hover:shadow-md transition-all duration-200 hover:bg-white/90"
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  {getFileIcon(file.type)}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate text-lg" title={file.name}>
                      {file.name}
                    </h3>
                    <div className="flex items-center space-x-3 mt-1">
                      <Badge variant="outline" className="text-xs px-2 py-1">
                        <FileType className="h-3 w-3 mr-1" />
                        {file.type?.toUpperCase()}
                      </Badge>
                      <Badge variant="outline" className="text-xs px-2 py-1">
                        <Tag className="h-3 w-3 mr-1" />
                        {file.document_type?.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <div>
                    <div className="text-xs text-gray-500">Upload Date</div>
                    <div className="text-sm font-medium text-gray-800">
                      {formatDate(file.uploaded_at)}
                    </div>
                  </div>
                  <Badge
                    className={`${getStatusColor(file.status)} px-3 py-1 text-xs font-semibold rounded-full`}
                  >
                    {getStatusDisplay(file.status)}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-red-400 hover:text-red-600 hover:bg-red-50"
                    onClick={() => onRequestDelete(file)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* File Details */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                {file.description || "Description of the file"}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
