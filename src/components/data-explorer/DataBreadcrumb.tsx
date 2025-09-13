import { FileSpreadsheet, ChevronRight } from "lucide-react";

interface DataBreadcrumbProps {
  fileName: string;
  sheetName: string;
}

export const DataBreadcrumb = ({ fileName, sheetName }: DataBreadcrumbProps) => {
  return (
    <div className="border-b border-gray-100 bg-white px-6 py-3">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <FileSpreadsheet className="h-4 w-4" />
        <span className="font-medium text-gray-900">{fileName}</span>
        <ChevronRight className="h-4 w-4" />
        <span>{sheetName}</span>
      </div>
    </div>
  );
};