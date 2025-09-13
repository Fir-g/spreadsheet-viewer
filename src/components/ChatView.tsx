import { useEffect, useRef } from "react";
import { Bot, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChatStore } from "../stores/chatStore";
import { ChatHeader, ChatMessages, ChatInput, ChatWelcome } from "./chat";
import { v4 as uuidv4 } from "uuid";

interface ChatViewProps {
  projectId?: string;
}

export function ChatView({ projectId }: ChatViewProps) {
  const {
    sessions,
    activeSessionId,
    currentMessages,
    loading,
    isTyping,
    error,
    loadSessions,
    setActiveSession,
    sendMessage,
    deleteSession,
    clearCurrentChat,
  } = useChatStore();

  const hasInitialized = useRef(false);

  // Initialize chat when component mounts or project changes
  useEffect(() => {
    if (projectId && !hasInitialized.current) {
      hasInitialized.current = true;
      initializeChat();
    }

    // Reset initialization flag when project changes
    return () => {
      if (projectId) {
        hasInitialized.current = false;
      }
    };
  }, [projectId]);

  const initializeChat = async () => {
    if (!projectId) return;

    try {
      // Load existing sessions for this project
      await loadSessions(projectId, true); // Force refresh to get latest sessions
    } catch (error) {
      console.error("Failed to initialize chat:", error);
    }
  };

  const handleSendMessage = async (message: string) => {
    if (!projectId) return;
    
    try {
      await sendMessage(message, projectId);
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleNewChat = async () => {
    if (!projectId) return;

    try {
      const newSessionId = (crypto.randomUUID?.() || uuidv4());
      await setActiveSession(newSessionId, projectId, false);
    } catch (error) {
      console.error("Failed to create new chat:", error);
    }
  };

  const handleRefresh = async () => {
    if (!projectId) return;
    
    try {
      await loadSessions(projectId, true);
    } catch (error) {
      console.error("Failed to refresh sessions:", error);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!projectId) return;
    
    try {
      await deleteSession(sessionId, projectId);
    } catch (error) {
      console.error("Failed to delete session:", error);
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

  const getActiveSessionTitle = () => {
    if (!activeSessionId || sessions.length === 0) return "New Chat";
    
    const activeSession = sessions.find(s => s.session_id === activeSessionId);
    if (!activeSession) return "New Chat";

    // Check if session has messages and get the first user message
    if (currentMessages && currentMessages.length > 0) {
      const firstUserMessage = currentMessages.find(
        (msg: any) => msg.role === "user"
      );
      if (firstUserMessage && firstUserMessage.content) {
        const content = firstUserMessage.content;
        return content.length > 40
          ? `${content.substring(0, 40)}...`
          : content;
      }
    }
    
    // Fallback to creation date
    const formatDate = (dateString: string) => {
      try {
        return new Date(dateString).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
      } catch {
        return "Unknown";
      }
    };
    
    return `Chat ${formatDate(activeSession.created_at)}`;
  };

  if (!projectId) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            No Project Selected
          </h3>
          <p className="text-muted-foreground">
            Please select a project to start chatting.
          </p>
        </div>
      </div>
    );
  }

  if (loading && !hasInitialized.current) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading chat sessions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Bot className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            Error Loading Chat
          </h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header with Session Title and New Chat Button */}
      <ChatHeader
        sessionTitle={getActiveSessionTitle()}
        activeSessionId={activeSessionId}
        onNewChat={handleNewChat}
        onRefresh={handleRefresh}
        onDeleteSession={handleDeleteSession}
        loading={loading}
      />

      {!activeSessionId || currentMessages.length === 0 ? (
        <ChatWelcome
          activeSessionId={activeSessionId}
          sessionsLength={sessions.length}
          onNewChat={handleNewChat}
        />
      ) : (
        <ChatMessages
          messages={currentMessages}
          isTyping={isTyping}
          formatTime={formatTime}
        />
      )}

      {activeSessionId && (
        <ChatInput
          onSendMessage={handleSendMessage}
          isTyping={isTyping}
          loading={loading}
        />
      )}
    </div>
  );
}