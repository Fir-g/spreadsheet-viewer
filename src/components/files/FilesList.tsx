import { FileText, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { FileCard } from "./FileCard";
import type { FileData } from "@/types";

interface FilesListProps {
  files: FileData[];
  loading: boolean;
  onRequestDelete: (file: FileData) => void;
}

export const FilesList = ({ files, loading, onRequestDelete }: FilesListProps) => {
  const getFileIcon = (type?: string) => {
    switch (type?.toLowerCase()) {
      case "pdf":
        return <FileText className="h-5 w-5 text-red-500" />;
      case "xlsx":
      case "xls":
        return <FileText className="h-5 w-5 text-green-600" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
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
          <FileCard
            key={`${file.name}-${index}`}
            file={file}
            index={index}
            getFileIcon={getFileIcon}
            getStatusColor={getStatusColor}
            getStatusDisplay={getStatusDisplay}
            formatDate={formatDate}
            onRequestDelete={onRequestDelete}
          />
        ))}
      </div>
    </div>
  );
};