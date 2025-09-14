import { Button } from "@/components/ui/button";
import { Upload, Split } from "lucide-react";

interface FilesHeaderProps {
  onUploadClick: () => void;
  onSplitManagerClick: () => void;
}

export const FilesHeader = ({ onUploadClick, onSplitManagerClick }: FilesHeaderProps) => {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
      <div>
        <h2 className="text-xl font-bold text-foreground">Files</h2>
        <p className="text-sm text-muted-foreground">
          Upload and manage your PDF and XLSX files
        </p>
      </div>

      <div className="flex gap-2">
        <Button 
          onClick={onSplitManagerClick}
          variant="outline"
          className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
        >
          <Split className="h-4 w-4 mr-2" />
          Split Manager
        </Button>

        <Button 
          onClick={onUploadClick}
          className="bg-black hover:bg-black text-white"
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload Files
        </Button>
      </div>
    </div>
  );
};