import { DataTable } from "./DataTable";

interface TableViewProps {
  sheetData: any;
}

export const TableView = ({ sheetData }: TableViewProps) => {
  if (!sheetData?.Tables) return null;
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {Object.entries(sheetData.Tables).map(([tableName, tableInfo]) => {
        if (tableInfo && typeof tableInfo === 'object' && 'data' in tableInfo) {
          return (
            <DataTable
              key={tableName}
              data={(tableInfo as any).data}
              tableName={tableName}
              dimensions={(tableInfo as any).dimensions}
            />
          );
        }
        return null;
      })}
    </div>
  );
};