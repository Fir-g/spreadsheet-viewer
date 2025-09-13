import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Files, Database, MessageSquare } from "lucide-react";

type ActiveView = "files" | "data" | "chat";

interface SidebarNavigationProps {
  activeView: ActiveView;
  onViewChange: (view: ActiveView) => void;
}

const menuItems = [
  {
    id: "files" as ActiveView,
    label: "Files",
    icon: Files,
    description: "Upload and manage files",
  },
  {
    id: "data" as ActiveView,
    label: "Extracted Data",
    icon: Database,
    description: "View processed data",
  },
  {
    id: "chat" as ActiveView,
    label: "Chat",
    icon: MessageSquare,
    description: "AI assistant chat",
  },
];

export function SidebarNavigation({ activeView, onViewChange }: SidebarNavigationProps) {
  return (
    <div className="flex-shrink-0 py-4">
      <h3 className="text-sm font-medium text-muted-foreground uppercase mb-2 tracking-wide">
        Workspace
      </h3>

      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;

          return (
            <Button
              key={item.id}
              variant="ghost"
              onClick={() => onViewChange(item.id)}
              className={cn(
                "w-full justify-start h-auto p-4 text-left transition-all duration-200",
                isActive
                  ? "bg-gradient-primary text-white shadow-md hover:opacity-90"
                  : "hover:bg-secondary/80"
              )}
            >
              <div className="flex items-start space-x-3">
                <Icon
                  className={cn(
                    "h-5 w-5 mt-0.5",
                    isActive ? "text-white" : "text-muted-foreground"
                  )}
                />
                <div>
                  <div
                    className={cn(
                      "font-medium",
                      isActive ? "text-white" : "text-foreground"
                    )}
                  >
                    {item.label}
                  </div>
                  <div
                    className={cn(
                      "text-xs mt-1",
                      isActive ? "text-white/80" : "text-muted-foreground"
                    )}
                  >
                    {item.description}
                  </div>
                </div>
              </div>
            </Button>
          );
        })}
      </nav>
    </div>
  );
}