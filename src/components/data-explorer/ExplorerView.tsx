import { Database } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "./DataTable";

interface ExplorerViewProps {
  sheetData: any;
  selectedFileId: string;
  selectedSheet: string;
  excelData: any;
}

export const ExplorerView = ({ sheetData, selectedFileId, selectedSheet, excelData }: ExplorerViewProps) => {
  if (!sheetData?.Tables) return null;
  
  return (
    <div className="space-y-6">
      {Object.entries(sheetData.Tables).map(([tableName, tableInfo]) => {
        if (tableInfo && typeof tableInfo === 'object' && 'data' in tableInfo) {
          return (
            <div key={tableName} className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <h4 className="font-medium text-gray-900 flex items-center gap-2">
                  <Database className="h-4 w-4 text-gray-400" />
                  {tableName}
                </h4>
                <Badge variant="secondary" className="text-xs">
                  {(tableInfo as any).dimensions?.rows || 0} × {(tableInfo as any).dimensions?.columns || 0}
                </Badge>
              </div>
              <div className="p-4">
                <DataTable
                  data={(tableInfo as any).data}
                  tableName={tableName}
                  dimensions={(tableInfo as any).dimensions}
                />
              </div>
            </div>
          );
        }
        return null;
      })}
    </div>
  );
};