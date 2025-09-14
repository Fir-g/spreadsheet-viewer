import { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileNavigationPanel } from './FileNavigationPanel';
import { SpreadsheetViewer } from './SpreadsheetViewer';
import { splitService } from '@/services/splitService';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { toast } from '@/hooks/use-toast';
import type { FileData } from '@/types';
import type { SplitManagerResponse, SplitDecision } from '@/services/splitService';

interface SplitManagerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  xlsxFiles: FileData[];
}

export const SplitManagerModal = ({
  open,
  onOpenChange,
  projectId,
  xlsxFiles
}: SplitManagerModalProps) => {
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [splitData, setSplitData] = useState<SplitManagerResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [decisions, setDecisions] = useState<Record<string, 0 | 1>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const pollTimeoutRef = useRef<NodeJS.Timeout>();
  
  const currentFile = xlsxFiles[currentFileIndex];

  // Reset when files change
  useEffect(() => {
    if (xlsxFiles.length > 0) {
      setCurrentFileIndex(0);
      setSplitData(null);
      setDecisions({});
    }
  }, [xlsxFiles]);
  // Start polling for the current file
  const startPolling = async (fileId: string) => {
    // Initial request
    try {
      const data = await splitService.getFileQuestions(projectId, fileId);
      setSplitData(data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      if (errorMessage.includes('is either not found or is still being processed')) {
        console.log('File is still being processed, will continue polling...');
        setSplitData(null); // Clear any existing data
      } else {
        console.error('Failed to fetch initial questions:', error);
        toast({
          title: "Error",
          description: "Failed to load split questions",
          variant: "destructive"
        });
      }
    }

    // Start continuous polling every 5 seconds
    const poll = async () => {
      try {
        console.log(`Polling for file ${fileId} at ${new Date().toISOString()}`);
        const data = await splitService.getFileQuestions(projectId, fileId);
        setSplitData(data);
        
        // Continue polling every 5 seconds regardless of status
        pollTimeoutRef.current = setTimeout(poll, 5000);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        
        if (errorMessage.includes('is either not found or is still being processed')) {
          console.log('File still being processed, continuing to poll...');
          setSplitData(null); // Keep data cleared while processing
        } else {
          console.error('Polling failed with error:', error);
        }
        
        // Always continue polling regardless of error type
        pollTimeoutRef.current = setTimeout(poll, 5000);
      }
    };

    // Start polling after 5 seconds
    pollTimeoutRef.current = setTimeout(poll, 5000);
  };

  // Stop polling
  const stopPolling = () => {
    if (pollTimeoutRef.current) {
      clearTimeout(pollTimeoutRef.current);
    }
  };

  // Load data when file changes
  useEffect(() => {
    if (currentFile && open) {
      console.log('Loading data for file:', currentFile.id, currentFile.name);
      setLoading(true);
      setSplitData(null);
      setDecisions({});
      
      stopPolling();
      startPolling(currentFile.id).finally(() => {
        setLoading(false);
      });
    }

    return () => stopPolling();
  }, [currentFile?.id, open, projectId]);

  // Clean up on close
  useEffect(() => {
    if (!open) {
      stopPolling();
      setSplitData(null);
      setDecisions({});
      setCurrentFileIndex(0);
    }
  }, [open]);
  // Navigation handlers
  const goToPrevious = () => {
    if (currentFileIndex > 0) {
      setCurrentFileIndex(currentFileIndex - 1);
    }
  };

  const goToNext = () => {
    if (currentFileIndex < xlsxFiles.length - 1) {
      setCurrentFileIndex(currentFileIndex + 1);
    }
  };

  // Decision handlers
  const handleDecision = (questionId: string, decision: 0 | 1) => {
    setDecisions(prev => ({
      ...prev,
      [questionId]: decision
    }));
  };

  const handleSubmit = async () => {
    if (!currentFile || !splitData) return;

    const allQuestions = splitData.sheets.flatMap(sheet => sheet.questions);
    const submissionDecisions: SplitDecision[] = allQuestions.map(q => ({
      question_id: q.question_id,
      decision: decisions[q.question_id] ?? 0
    }));

    setIsSubmitting(true);
    try {
      await splitService.submitSplitDecisions(
        projectId, 
        currentFile.id, 
        submissionDecisions
      );
      
      toast({
        title: "Success",
        description: "Split decisions submitted successfully",
      });

      // Clear decisions for this file
      setDecisions({});

      // Move to next file if available, otherwise stay on current file
      if (currentFileIndex < xlsxFiles.length - 1) {
        goToNext();
      }
      // Modal stays open - user must manually close
    } catch (error) {
      toast({
        title: "Error", 
        description: "Failed to submit decisions",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  // Show message if no XLSX files
  if (xlsxFiles.length === 0) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <div className="text-center p-6">
            <h3 className="text-lg font-semibold mb-2">No XLSX Files</h3>
            <p className="text-muted-foreground mb-4">
              Upload XLSX files first to use the Split Manager.
            </p>
            <Button onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <div 
      className={`fixed inset-0 z-[9999] transition-opacity duration-300 ${
        open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />
      
      {/* Modal Content */}
      <div className="absolute inset-4 bg-white rounded-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <div className="flex items-center gap-6 flex-1 min-w-0">
            <h2 className="text-xl font-semibold">Split Manager</h2>
            
            {/* Current File Info */}
            <div className="flex items-center gap-4 flex-1 min-w-0">
              {currentFile && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-0">
                  <span className="font-medium truncate" title={currentFile.name}>
                    {currentFile.name}
                  </span>
                  <span className="text-xs bg-gray-200 px-2 py-1 rounded-full whitespace-nowrap">
                    {currentFileIndex + 1} of {xlsxFiles.length}
                  </span>
                </div>
              )}
              
              {/* File Navigation */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToPrevious}
                  disabled={currentFileIndex === 0}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <div className="flex gap-1">
                  {xlsxFiles.map((file, index) => (
                    <button
                      key={file.id}
                      onClick={() => setCurrentFileIndex(index)}
                      title={file.name}
                      className={`h-8 min-w-[2rem] px-2 rounded text-xs font-medium transition-colors ${
                        index === currentFileIndex
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-gray-200 hover:bg-gray-300'
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToNext}
                  disabled={currentFileIndex === xlsxFiles.length - 1}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Close Button */}
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <LoadingSpinner text="Loading split questions..." />
            </div>
          ) : (
            <>
              {/* Left Panel - 30% */}
              <div className="w-[30%] border-r bg-gray-50 overflow-y-auto">
                <FileNavigationPanel
                  splitData={splitData}
                  decisions={decisions}
                  onDecision={handleDecision}
                  onSubmit={handleSubmit}
                  isSubmitting={isSubmitting}
                />
              </div>

              {/* Right Panel - 70% */}
              <div className="flex-1 overflow-hidden">
                <SpreadsheetViewer
                  fileUrl={splitData?.file_url}
                  splitData={splitData}
                  decisions={decisions}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};