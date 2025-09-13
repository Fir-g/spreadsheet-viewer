import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Files, Database, MessageSquare, Plus, Clock, Loader2 } from "lucide-react";
import { useChatStore } from "../stores/chatStore";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

type ActiveView = "files" | "data" | "chat";

interface WorkspaceSidebarProps {
  activeView: ActiveView;
  onViewChange: (view: ActiveView) => void;
}

export function WorkspaceSidebar({
  activeView,
  onViewChange,
}: WorkspaceSidebarProps) {
  const { projectId } = useParams();
  const {
    sessions,
    activeSessionId,
    setActiveSession,
    loadSessions,
    loading,
  } = useChatStore();

  // Local state to track which session is being loaded
  const [loadingSessionId, setLoadingSessionId] = useState<string | null>(null);

  // Load sessions when component mounts or project changes
  useEffect(() => {
    if (projectId) {
      loadSessions(projectId);
    }
  }, [projectId, loadSessions]);

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

  const handleNewChat = async () => {
    if (!projectId) return;

    try {
      const newSessionId = (crypto.randomUUID?.() || uuidv4());
      setActiveSession(newSessionId, projectId, false);
      onViewChange("chat");
    } catch (error) {
      console.error("Failed to create new chat:", error);
    }
  };

  const handleSessionClick = async (sessionId: string) => {
    try {
      setLoadingSessionId(sessionId); // Set loading for this specific session
      await setActiveSession(sessionId, projectId, true);
      onViewChange("chat");
    } catch (error) {
      console.error("Failed to load session:", error);
    } finally {
      setLoadingSessionId(null); // Clear loading state
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    } catch {
      return "";
    }
  };

  const formatTime = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    } catch {
      return "";
    }
  };

  const getSessionTitle = (session: any) => {
    // Check if session has messages and get the first user message
    if (session.messages && session.messages.length > 0) {
      const firstUserMessage = session.messages.find(
        (msg: any) => msg.role === "user"
      );
      if (firstUserMessage && firstUserMessage.content) {
        const content = firstUserMessage.content;
        return content.length > 30
          ? `${content.substring(0, 30)}...`
          : content;
      }
    }
    // Fallback to session creation date
    return `Chat ${formatDate(session.created_at)}`;
  };

  return (
    <div className="fixed left-0 top-10 min-h-[100%] w-64 bg-white/60 backdrop-blur border-r z-10 flex flex-col px-3">
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

      {/* Chat Sessions List - Only show when chat is active */}
      {activeView === "chat" && (
        <div className="flex-1 flex flex-col min-h-0 pb-3">
          <div className="flex items-center justify-between mb-3 flex-shrink-0">
            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Chat Sessions
            </h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNewChat}
              disabled={loading}
              className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto overflow-x-hidden space-y-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400 scrollbar-thumb-rounded-full">
            {loading && sessions.length === 0 ? (
              <div className="text-xs text-muted-foreground p-2 text-center">
                Loading sessions...
              </div>
            ) : sessions.length === 0 ? (
              <div className="text-xs text-muted-foreground p-2 text-center">
                No chat sessions yet
                <br />
                Click + to create one
              </div>
            ) : (
              sessions.map((session) => {
                const isLoadingThisSession = loadingSessionId === session.session_id;
                
                return (
                  <Button
                    key={session.session_id}
                    variant="ghost"
                    onClick={() => handleSessionClick(session.session_id)}
                    disabled={isLoadingThisSession}
                    className={cn(
                      "w-full justify-start p-3 h-auto text-left transition-all duration-200",
                      activeSessionId === session.session_id
                        ? "bg-gradient-primary text-white shadow-sm hover:opacity-90"
                        : "hover:bg-secondary/60",
                      isLoadingThisSession && "opacity-60"
                    )}
                  >
                    <div className="w-full min-w-0">
                      <div className="flex items-center justify-between">
                        <div
                          className={cn(
                            "text-xs font-medium break-words leading-relaxed flex-1",
                            activeSessionId === session.session_id
                              ? "text-white"
                              : "text-foreground"
                          )}
                        >
                          {getSessionTitle(session)}
                        </div>
                        {isLoadingThisSession && (
                          <Loader2 className="h-3 w-3 animate-spin ml-2 flex-shrink-0" />
                        )}
                      </div>
                      <div
                        className={cn(
                          "text-xs mt-0.5 flex items-center space-x-1",
                          activeSessionId === session.session_id
                            ? "text-white/70"
                            : "text-muted-foreground"
                        )}
                      >
                        <Clock className="h-2 w-2 flex-shrink-0" />
                        <span className="break-words">
                          {formatDate(session.last_activity)}{" "}
                          {formatTime(session.last_activity)}
                        </span>
                      </div>
                    </div>
                  </Button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}