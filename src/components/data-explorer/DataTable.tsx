import { Database } from "lucide-react";

interface DataTableProps {
  data: any[][];
  tableName: string;
  dimensions: { rows: number; columns: number };
}

export const DataTable = ({ data, tableName, dimensions }: DataTableProps) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Database className="h-12 w-12 text-gray-300 mb-4" />
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden border border-gray-200 rounded-lg">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {data[0]?.map((header: any, colIndex: number) => (
                <th 
                  key={colIndex} 
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                >
                  {header || `Column ${colIndex + 1}`}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {data.slice(1).map((row: any[], rowIndex: number) => (
              <tr 
                key={rowIndex} 
                className="hover:bg-gray-50 transition-colors"
              >
                {row.map((cell: any, colIndex: number) => (
                  <td 
                    key={colIndex} 
                    className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap"
                  >
                    <div className="max-w-xs truncate" title={cell !== null && cell !== undefined ? String(cell) : ''}>
                      {cell !== null && cell !== undefined ? String(cell) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};