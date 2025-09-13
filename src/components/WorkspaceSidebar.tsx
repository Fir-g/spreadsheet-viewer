import { SidebarNavigation, ChatSessionsList } from "./workspace";
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

  useEffect(() => {
    if (projectId) {
      loadSessions(projectId);
    }
  }, [projectId, loadSessions]);

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
      <SidebarNavigation 
        activeView={activeView}
        onViewChange={onViewChange}
      />

      {activeView === "chat" && (
        <ChatSessionsList
          sessions={sessions}
          activeSessionId={activeSessionId}
          loadingSessionId={loadingSessionId}
          loading={loading}
          onNewChat={handleNewChat}
          onSessionClick={handleSessionClick}
          getSessionTitle={getSessionTitle}
          formatDate={formatDate}
          formatTime={formatTime}
        />
      )}
    </div>
  );
}