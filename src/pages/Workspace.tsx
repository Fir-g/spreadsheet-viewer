import { useState, useRef } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SidebarProvider } from "@/components/ui/sidebar";
import { WorkspaceSidebar } from "@/components/WorkspaceSidebar";
import { FilesView } from "@/components/FilesView";
import { ExtractedDataView } from "@/components/ExtractedDataView";
import { ChatView } from "@/components/ChatView";
import { ChevronLeft, Settings, Info, Plus } from "lucide-react";
import { format } from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type ActiveView = "files" | "data" | "chat";

const Workspace = () => {
  const [activeView, setActiveView] = useState<ActiveView>("files");
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  // Get project data from either route params, location state, or defaults
  const projectId = params.projectId;
  const projectName = location.state?.projectName || "Project";
  const projectDescription =
    location.state?.projectDescription || "No description.";
  const projectCreatedAt = location.state?.projectCreatedAt;

  const [quickMenuOpen, setQuickMenuOpen] = useState(false);
  const quickMenuRef = useRef<HTMLDivElement>(null);

  const renderActiveView = () => {
    switch (activeView) {
      case "files":
        return <FilesView />;
      case "data":
        return <ExtractedDataView />;
      case "chat":
        return <ChatView projectId={projectId} />;
      default:
        return <FilesView />;
    }
  };

  const handleQuickAction = (action: string) => {
    setQuickMenuOpen(false);
    switch (action) {
      case "add_file":
        // Switch to files view and trigger upload (you could pass a prop to FilesView to auto-open upload dialog)
        setActiveView("files");
        break;
      case "invite_member":
        alert("Invite Member functionality coming soon!");
        break;
      case "run_evaluation":
        alert("Run Evaluation functionality coming soon!");
        break;
      case "new_chat":
        // Switch to chat view and create new chat
        setActiveView("chat");
        break;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        {/* Header - Fixed positioning */}
        <div className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur border-b z-20 px-4">
          <div className="flex items-center justify-between h-12">
            <div className="flex items-center">
              <Button variant="ghost" onClick={() => navigate("/dashboard")}>
                <ChevronLeft className="h-12 w-12" />
              </Button>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center cursor-default">
                      <h1
                        className="text-xl font-semibold text-foreground ml-2 "
                        id="workspace-project-name"
                      >
                        {projectName}
                      </h1>
                      <Info className="h-5 w-5 text-muted-foreground ml-6" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs">
                    <div>
                      <div className="mb-1 ">
                        <b>Project:</b> {projectName}
                      </div>
                      <div className="mb-1">
                        <b>Description:</b> {projectDescription}
                      </div>
                      <div>
                        <b>Created:</b>{" "}
                        {projectCreatedAt
                          ? format(new Date(projectCreatedAt), "PPP")
                          : "Unknown"}
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div
              className="flex items-center gap-2"
              style={{ position: "relative" }}
            >
              <Button
                variant="ghost"
                size="icon"
                aria-label="Quick Action"
                onClick={() => setQuickMenuOpen((open) => !open)}
              >
                <Plus className="h-5 w-5 text-muted-foreground" />
              </Button>
              {quickMenuOpen && (
                <div
                  ref={quickMenuRef}
                  className="absolute w-40 bg-white border rounded shadow z-[100]"
                  style={{ top: "100%", right: 0 }}
                  onMouseLeave={() => setQuickMenuOpen(false)}
                >
                  <button
                    className="w-full text-left px-4 py-2 hover:bg-gray-100"
                    onClick={() => handleQuickAction("add_file")}
                  >
                    Add File
                  </button>
                  <button
                    className="w-full text-left px-4 py-2 hover:bg-gray-100"
                    onClick={() => handleQuickAction("new_chat")}
                  >
                    New Chat
                  </button>
                  <button
                    className="w-full text-left px-4 py-2 hover:bg-gray-100"
                    onClick={() => handleQuickAction("invite_member")}
                  >
                    Invite Member
                  </button>
                  <button
                    className="w-full text-left px-4 py-2 hover:bg-gray-100"
                    onClick={() => handleQuickAction("run_evaluation")}
                  >
                    Run Evaluation
                  </button>
                </div>
              )}
              <Button variant="ghost" size="icon" aria-label="Project Settings">
                <Settings className="h-5 w-5 text-muted-foreground" />
              </Button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <WorkspaceSidebar
          activeView={activeView}
          onViewChange={setActiveView}
        />

        {/* Main Content */}
        <main className="flex-1 h-screen pt-12 pl-64">
          <div className="h-full">{renderActiveView()}</div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Workspace;
