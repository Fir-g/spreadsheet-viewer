import React, { useRef } from 'react';
import { Upload, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { SpreadsheetData } from '../types/spreadsheet';

interface FileUploadProps {
  onLoadFile: (data: SpreadsheetData) => Promise<{ success: boolean; message?: string }>;
  onSaveFile: () => string;
  currentData: SpreadsheetData;
}

export function FileUpload({ onLoadFile, onSaveFile, currentData }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      
      // Convert workbook to our spreadsheet format
      const spreadsheetData: SpreadsheetData = {
        name: file.name.replace('.xlsx', ''),
        sheets: workbook.SheetNames.map((sheetName, index) => ({
          name: sheetName,
          index,
          ranges: [], // Start with no ranges, user will add them
          data: XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { 
            header: 1,
            defval: '' 
          }) as any[][]
        }))
      };

      const result = await onLoadFile(spreadsheetData);
      if (result.success) {
        toast.success('XLSX file loaded successfully!');
      } else {
        toast.error(result.message || 'Failed to load file');
      }
    } catch (error) {
      toast.error('Failed to parse XLSX file');
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSaveFile = () => {
    // Create a new workbook
    const workbook = XLSX.utils.book_new();
    
    // Add each sheet to the workbook
    currentData.sheets.forEach(sheet => {
      const worksheet = sheet.data 
        ? XLSX.utils.aoa_to_sheet(sheet.data)
        : XLSX.utils.aoa_to_sheet([]);
      
      XLSX.utils.book_append_sheet(workbook, worksheet, sheet.name);
    });
    
    // Generate XLSX file
    const xlsxData = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([xlsxData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentData.name}.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('XLSX file saved successfully!');
  };

  const handleSaveRangesAsJSON = () => {
    const jsonData = onSaveFile();
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentData.name}-ranges.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Range data saved as JSON!');
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">File Operations</h3>
      <div className="space-y-3">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Upload size={20} />
          Load XLSX File
        </button>
        
        <button
          onClick={handleSaveFile}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Download size={20} />
          Save as XLSX
        </button>
        
        <button
          onClick={handleSaveRangesAsJSON}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Download size={20} />
          Save Ranges (JSON)
        </button>
        
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>
    </div>
  );
}