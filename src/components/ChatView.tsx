import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MarkdownComponent } from "@/components/Markdown";
import { useChatStore } from "../stores/chatStore";
import {
  Send,
  MessageSquare,
  Bot,
  User,
  Loader2,
  RefreshCw,
  Trash2,
} from "lucide-react";

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

  const [newMessage, setNewMessage] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasInitialized = useRef(false);

  // Auto-scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages, isTyping]);

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

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !projectId || isTyping) return;
    
    const message = newMessage.trim();
    setNewMessage("");
    
    try {
      await sendMessage(message, projectId);
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
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
      <div className="flex-shrink-0 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-semibold">
              {getActiveSessionTitle()}
            </h3>
            {activeSessionId && (
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRefresh}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteSession(activeSessionId)}
                  className="text-muted-foreground hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleNewChat}
            className="flex items-center space-x-1"
            disabled={loading}
          >
            <MessageSquare className="h-4 w-4" />
            <span>New Chat</span>
          </Button>
        </div>
      </div>

      {/* Welcome Message for Empty State */}
      {!activeSessionId || currentMessages.length === 0 ? (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center max-w-md">
            <Bot className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              {!activeSessionId 
                ? "Select a chat session or start a new conversation" 
                : "Start your conversation"}
            </h3>
            <p className="text-muted-foreground text-sm mb-4">
              Ask questions about your data, request analysis, or get insights to get started.
            </p>
            {!activeSessionId && sessions.length === 0 && (
              <Button onClick={handleNewChat} className="bg-gradient-primary">
                <MessageSquare className="h-4 w-4 mr-2" />
                Create First Chat
              </Button>
            )}
          </div>
        </div>
      ) : (
        /* Chat Messages - Scrollable Area */
        <div className="flex-1 px-4 pb-3 overflow-hidden">
          <Card className="h-full border-0 bg-white/60 backdrop-blur shadow-sm">
            <CardContent className="p-0 h-full">
              <ScrollArea className="h-full" ref={scrollAreaRef}>
                <div className="p-3">
                  <div className="space-y-4">
                    {currentMessages.map((message, index) => (
                      <div
                        key={index}
                        className={`flex ${
                          message.role === "user"
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`flex max-w-[80%] space-x-3 ${
                            message.role === "user"
                              ? "flex-row-reverse space-x-reverse"
                              : ""
                          }`}
                        >
                          <Avatar className="h-8 w-8 flex-shrink-0">
                            <AvatarFallback
                              className={
                                message.role === "user"
                                  ? "bg-gradient-primary text-white"
                                  : "bg-secondary"
                              }
                            >
                              {message.role === "user" ? (
                                <User className="h-4 w-4" />
                              ) : (
                                <Bot className="h-4 w-4" />
                              )}
                            </AvatarFallback>
                          </Avatar>

                          <div className="space-y-1 min-w-0">
                            <div
                              className={`rounded-lg px-4 py-2 ${
                                message.role === "user"
                                  ? "bg-gradient-primary text-white"
                                  : "bg-secondary text-foreground"
                              }`}
                            >
                              <MarkdownComponent content={message.content} />
                            </div>
                            <p className="text-xs text-muted-foreground px-2">
                              {formatTime(message.timestamp)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}

                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="flex max-w-[80%] space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-secondary">
                              <Bot className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="bg-secondary rounded-lg px-4 py-2">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                              <div
                                className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                                style={{ animationDelay: "0.1s" }}
                              ></div>
                              <div
                                className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                                style={{ animationDelay: "0.2s" }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Invisible element to scroll to */}
                    <div ref={messagesEndRef} />
                  </div>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Fixed Message Input Area */}
      {activeSessionId && (
        <div className="flex-shrink-0 px-4 pb-4">
          <Card className="border-0 bg-white/60 backdrop-blur shadow-sm">
            <CardContent className="p-3">
              <div className="flex items-center space-x-2">
                <div className="flex-1">
                  <Input
                    placeholder="Ask about your data, request analysis, or get insights..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="border-0 bg-transparent"
                    disabled={isTyping || loading}
                  />
                </div>

                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || isTyping || loading}
                  className="bg-gradient-primary hover:opacity-90 shadow-md"
                >
                  {isTyping ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}