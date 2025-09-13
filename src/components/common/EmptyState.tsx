import { DivideIcon as LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}: EmptyStateProps) => {
  return (
    <div className={`text-center py-12 ${className}`}>
      <Icon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {title}
      </h3>
      <p className="text-muted-foreground mb-4">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction} className="bg-gradient-primary hover:opacity-90">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};