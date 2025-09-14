import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle, FileSpreadsheet } from 'lucide-react';
import type { SplitManagerResponse } from '@/services/splitService';

interface FileNavigationPanelProps {
  splitData: SplitManagerResponse | null;
  decisions: Record<string, 0 | 1>;
  onDecision: (questionId: string, decision: 0 | 1) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export const FileNavigationPanel = ({
  splitData,
  decisions,
  onDecision,
  onSubmit,
  isSubmitting
}: FileNavigationPanelProps) => {
  if (!splitData) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <div className="flex flex-col items-center py-8">
          <FileSpreadsheet className="h-12 w-12 text-gray-300 mb-4" />
          <div className="text-center">
            <p className="font-medium mb-2">Loading split questions...</p>
            <p className="text-sm text-gray-400">
              File may still be processing. Please wait...
            </p>
          </div>
        </div>
      </div>
    );
  }

  const allQuestions = (splitData?.sheets || []).flatMap(sheet => sheet.questions);
  const answeredCount = Object.keys(decisions).length;
  const totalQuestions = allQuestions.length;

  if (totalQuestions === 0) {
    return (
      <div className="p-4 text-center">
        <div className="flex flex-col items-center py-8">
          <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
          <h3 className="font-medium text-gray-900 mb-2">No Questions Found</h3>
          <p className="text-sm text-muted-foreground">
            This file doesn't have any split questions to review.
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {/* Progress */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground mb-2">
            {answeredCount} of {totalQuestions} questions answered
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Questions by Sheet */}
      {splitData.sheets.map((sheet, sheetIndex) => (
        <Card key={sheetIndex}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              {sheet.sheet_name}
              <Badge variant="outline">{sheet.questions.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {sheet.questions.map((question, questionIndex) => (
              <div key={question.question_id} className="border rounded-lg p-3">
                <div className="flex items-start justify-between mb-2">
                  <div className="text-xs font-medium text-muted-foreground">
                    Q{sheetIndex + 1}.{questionIndex + 1}
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {question.range.left_letter}{question.range.top}:
                    {question.range.right_letter}{question.range.bottom}
                  </Badge>
                </div>

                <div className="mb-3">
                  <div className="text-sm font-medium mb-1">
                    Split Column {question.range.left_letter}?
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {question.decision.reasoning}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Confidence: {Math.round(question.decision.confidence * 100)}%
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Table: {question.metadata.table_name}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant={decisions[question.question_id] === 0 ? "default" : "outline"}
                    size="sm"
                    onClick={() => onDecision(question.question_id, 0)}
                    className="flex-1"
                  >
                    <XCircle className="h-3 w-3 mr-1" />
                    No Split
                  </Button>
                  <Button
                    variant={decisions[question.question_id] === 1 ? "default" : "outline"}
                    size="sm"
                    onClick={() => onDecision(question.question_id, 1)}
                    className="flex-1"
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Split
                  </Button>
                </div>

                {decisions[question.question_id] !== undefined && (
                  <div className="mt-2 text-xs text-center">
                    <Badge 
                      variant={decisions[question.question_id] === 1 ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {decisions[question.question_id] === 1 ? "Will Split" : "No Split"}
                    </Badge>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
      </div>

      {/* Submit Button */}
      {totalQuestions > 0 && (
        <div className="flex-shrink-0 p-4 border-t bg-white">
          <Button
            onClick={onSubmit}
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <AlertCircle className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                Submit Decisions ({answeredCount}/{totalQuestions})
              </>
            )}
          </Button>
          
          <div className="mt-2 text-xs text-center text-muted-foreground">
            Modal will stay open for next file
          </div>
        </div>
      )}
    </div>
  );
};