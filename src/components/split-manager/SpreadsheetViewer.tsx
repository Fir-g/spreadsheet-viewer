import { useState, useEffect } from 'react';
import { FileSpreadsheet, ExternalLink, AlertCircle, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import type { SplitManagerResponse } from '@/services/splitService';

interface SpreadsheetViewerProps {
  fileUrl?: string;
  splitData: SplitManagerResponse | null;
  decisions: Record<string, 0 | 1>;
}

export const SpreadsheetViewer = ({
  fileUrl,
  splitData,
  decisions
}: SpreadsheetViewerProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Convert Excel file to viewable format using iframe
  const renderSpreadsheet = () => {
    if (!fileUrl) return null;

    // Use Office Online viewer for Excel files
    const officeViewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`;
    
    return (
      <div className="h-full flex flex-col overflow-hidden">
        <div className="border-b border-gray-100 bg-white px-6 py-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Spreadsheet Preview</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Review ranges and make split decisions
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(fileUrl, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                Open
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = fileUrl;
                  link.download = splitData?.file_id || 'file';
                  link.click();
                }}
              >
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 relative overflow-hidden">
          <iframe
            src={officeViewerUrl}
            width="100%"
            height="100%"
            frameBorder="0"
            onLoad={() => setLoading(false)}
            onError={() => setError('Failed to load spreadsheet preview')}
            className="w-full h-full"
            title="Excel Spreadsheet Preview"
          />

          {/* Highlight overlay for selected ranges */}
          {splitData && (
            <div className="absolute inset-0 pointer-events-none">
              {/* Highlight ranges based on decisions */}
              {splitData.sheets.map(sheet =>
                sheet.questions.map(question => {
                  const decision = decisions[question.question_id];
                  if (decision === undefined) return null;

                  // Create a simple overlay indicator
                  return (
                    <div
                      key={question.question_id}
                      className={`absolute border-2 pointer-events-auto ${
                        decision === 1
                          ? 'border-green-500 bg-green-100/30'
                          : 'border-red-500 bg-red-100/30'
                      } rounded`}
                      title={`${question.range.left_letter}${question.range.top}:${question.range.right_letter}${question.range.bottom} - ${decision === 1 ? 'Split' : 'No Split'}`}
                    >
                      <div className="text-xs font-medium p-1 bg-white/80 rounded">
                        {question.range.left_letter}{question.range.top}:
                        {question.range.right_letter}{question.range.bottom}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {loading && (
            <div className="absolute inset-0 bg-white/90 flex items-center justify-center z-10">
              <LoadingSpinner text="Loading spreadsheet..." />
            </div>
          )}

          {error && (
            <div className="absolute inset-0 bg-white flex items-center justify-center z-10">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-600 mb-4">{error}</p>
                <div className="flex gap-2 justify-center">
                  <Button
                    variant="outline"
                    onClick={() => window.open(fileUrl, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open File
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setError(null);
                      setLoading(true);
                    }}
                  >
                    Retry
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (!fileUrl) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <FileSpreadsheet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No spreadsheet to display</p>
          <p className="text-sm text-muted-foreground mt-2">
            Waiting for file data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full">
      {renderSpreadsheet()}
    </div>
  );
};