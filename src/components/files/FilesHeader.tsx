import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

interface FilesHeaderProps {
  onUploadClick: () => void;
}

export const FilesHeader = ({ onUploadClick }: FilesHeaderProps) => {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
      <div>
        <h2 className="text-xl font-bold text-foreground">Files</h2>
        <p className="text-sm text-muted-foreground">
          Upload and manage your PDF and XLSX files
        </p>
      </div>

      <Button 
        onClick={onUploadClick}
        className="bg-black hover:bg-black text-white"
      >
        <Upload className="h-4 w-4 mr-2" />
        Upload Files
      </Button>
    </div>
  );
};