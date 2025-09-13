import { Calendar, FileType, Tag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { FileData } from "@/types";

interface FileCardProps {
  file: FileData;
  index: number;
  getFileIcon: (type?: string) => JSX.Element;
  getStatusColor: (status: string) => string;
  getStatusDisplay: (status: string) => string;
  formatDate: (dateString?: string) => string;
  onRequestDelete: (file: FileData) => void;
}

export const FileCard = ({
  file,
  index,
  getFileIcon,
  getStatusColor,
  getStatusDisplay,
  formatDate,
  onRequestDelete,
}: FileCardProps) => {
  return (
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
  );
};