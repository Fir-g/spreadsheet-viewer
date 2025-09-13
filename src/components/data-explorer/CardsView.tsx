import { Database, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface CardsViewProps {
  sheetData: any;
  onViewData: () => void;
}

export const CardsView = ({ sheetData, onViewData }: CardsViewProps) => {
  if (!sheetData?.Tables) return null;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Object.entries(sheetData.Tables).map(([tableName, tableInfo]) => (
        <Card key={tableName} className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Database className="h-4 w-4 text-gray-400" />
              {tableName}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Rows</span>
                <span className="font-medium">{(tableInfo as any).dimensions?.rows || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Columns</span>
                <span className="font-medium">{(tableInfo as any).dimensions?.columns || 0}</span>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-4"
              onClick={onViewData}
            >
              <Eye className="h-4 w-4 mr-1.5" />
              View Data
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};