import { create } from "zustand";
import { persist } from "zustand/middleware";
import { handleAuthError } from "../utils/api";

// Chat API interfaces
interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface ChatSession {
  session_id: string;
  user_id: string;
  project_id: string;
  created_at: string;
  last_activity: string;
  messages: Message[];
}

interface BasicSession {
  session_id: string;
  project_id: string;
  created_at: string;
  last_activity: string;
}

interface ChatResponse {
  response: string;
  session_id: string;
  message_data: any;
  timestamp: string;
}

class ChatAPI {
  private baseURL =
    import.meta.env.VITE_BACKEND_URL ||
    "https://kubera-backend.thetailoredai.co";

  private getAuthToken(): string | null {
    return localStorage.getItem("token");
  }

  private getAuthHeaders() {
    const token = this.getAuthToken();
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  }

  // Load all chat sessions for a project
  async getChatSessions(projectId: string): Promise<BasicSession[]> {
    const response = await fetch(`${this.baseURL}/chat/${projectId}/sessions`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${this.getAuthToken()}`,
      },
    });

    if (!response.ok) {
      // Try to get error details from response
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { detail: `Failed to fetch chat sessions: ${response.status}` };
      }

      // Handle authentication errors
      if (handleAuthError(errorData, response)) {
        throw new Error("Authentication failed");
      }
      
      throw new Error(errorData.detail || `Failed to fetch chat sessions: ${response.status}`);
    }

    const data = await response.json();
    return data.sessions || [];
  }

  // Get specific session details with messages
  async getChatSession(sessionId: string, projectId: string): Promise<ChatSession> {
    const response = await fetch(`${this.baseURL}/chat/${projectId}/sessions/${sessionId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.getAuthToken()}`,
      },
    });

    if (!response.ok) {
      // Try to get error details from response
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { detail: `Failed to fetch chat session: ${response.status}` };
      }

      // Handle authentication errors
      if (handleAuthError(errorData, response)) {
        throw new Error("Authentication failed");
      }
      
      throw new Error(errorData.detail || `Failed to fetch chat session: ${response.status}`);
    }

    return response.json();
  }

  // Send message in a chat session (streaming)
  async sendMessage(
    message: string,
    sessionId: string,
    projectId: string,
    messages: Message[] = []
  ): Promise<ReadableStream<Uint8Array> | null> {
    const response = await fetch(`${this.baseURL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.getAuthToken()}`,
      },
      body: JSON.stringify({
        session_id: sessionId,
        project_id: projectId,
        message: message,
        messages: messages,
      }),
    });

    if (!response.ok) {
      // Try to get error details from response
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { detail: `Failed to send message: ${response.status}` };
      }

      // Handle authentication errors
      if (handleAuthError(errorData, response)) {
        throw new Error("Authentication failed");
      }
      
      throw new Error(errorData.detail || `Failed to send message: ${response.status}`);
    }

    return response.body;
  }

  // Delete a chat session
  async deleteSession(sessionId: string, projectId: string): Promise<void> {
    const response = await fetch(`${this.baseURL}/chat/${projectId}/sessions/${sessionId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${this.getAuthToken()}`,
      },
    });

    if (!response.ok) {
      // Try to get error details from response
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { detail: `Failed to delete session: ${response.status}` };
      }

      // Handle authentication errors
      if (handleAuthError(errorData, response)) {
        throw new Error("Authentication failed");
      }
      
      throw new Error(errorData.detail || `Failed to delete session: ${response.status}`);
    }
  }
}

const chatAPI = new ChatAPI();

interface ChatStore {
  // State
  sessions: BasicSession[];
  activeSessionId: string | null;
  currentMessages: Message[];
  loading: boolean;
  isTyping: boolean;
  error: string | null;
  lastFetched: Record<string, number>;

  // Actions
  loadSessions: (projectId: string, forceRefresh?: boolean) => Promise<void>;
  setActiveSession: (sessionId: string, projectId: string, callApi: boolean) => Promise<void>;
  sendMessage: (message: string, projectId: string) => Promise<void>;
  deleteSession: (sessionId: string, projectId: string) => Promise<void>;
  clearCurrentChat: () => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  setTyping: (isTyping: boolean) => void;
  shouldRefetch: (projectId: string) => boolean;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      // Initial state
      sessions: [],
      activeSessionId: null,
      currentMessages: [],
      loading: false,
      isTyping: false,
      error: null,
      lastFetched: {},

      shouldRefetch: (projectId: string) => {
        const { lastFetched } = get();
        const lastFetch = lastFetched[projectId] || 0;
        return Date.now() - lastFetch > CACHE_DURATION;
      },

      loadSessions: async (projectId: string, forceRefresh = false) => {
        const { shouldRefetch } = get();

        if (!forceRefresh && !shouldRefetch(projectId)) {
          return;
        }

        try {
          set({ loading: true, error: null });
          const sessions = await chatAPI.getChatSessions(projectId);

          // Sort sessions by last activity (most recent first)
          const sortedSessions = sessions.sort(
            (a, b) =>
              new Date(b.last_activity).getTime() -
              new Date(a.last_activity).getTime()
          );

          set((state) => ({
            sessions: sortedSessions,
            loading: false,
            lastFetched: { ...state.lastFetched, [projectId]: Date.now() },
          }));
        } catch (error) {
          console.error("Failed to load chat sessions:", error);
          // Handle authentication errors
          if (handleAuthError(error)) {
            set({
              error: "Authentication failed. Please log in again.",
              loading: false,
            });
            return;
          }
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to load sessions",
            loading: false,
          });
        }
      },

      setActiveSession: async (sessionId: string, projectId: string, callApi: boolean) => {
        const { sessions } = get();

        // Check if we already have the session data loaded
        const existingSession = sessions.find(
          (s) => s.session_id === sessionId
        );

        // If callApi is false, just set the session without loading from API
        if (!callApi) {
          set({
            activeSessionId: sessionId,
            currentMessages: [],
          });
          return;
        }

        // If we have an existing session and callApi is true, load from API
        if (existingSession) {
          try {
            set({ loading: true, error: null });
            const sessionDetails = await chatAPI.getChatSession(sessionId, projectId);

            set((state) => ({
              activeSessionId: sessionId,
              currentMessages: sessionDetails.messages || [],
              loading: false,
            }));
          } catch (error) {
            console.error("Failed to load session details:", error);
            set({
              error:
                error instanceof Error ? error.message : "Failed to load session",
              loading: false,
            });
          }
        } else {
          // Session doesn't exist, just set it as active with empty messages
          set({
            activeSessionId: sessionId,
            currentMessages: [],
          });
        }
      },

      sendMessage: async (message: string, projectId: string) => {
        const { activeSessionId, currentMessages } = get();

        if (!activeSessionId) {
          throw new Error("No active session");
        }

        const userMessage: Message = {
          role: "user",
          content: message,
          timestamp: new Date().toISOString(),
        };

        // Add user message immediately
        set((state) => ({
          currentMessages: [...state.currentMessages, userMessage],
          isTyping: true,
        }));

        try {
          const stream = await chatAPI.sendMessage(
            message,
            activeSessionId,
            projectId,
            currentMessages
          );

          if (!stream) {
            throw new Error("No response stream received");
          }

          const reader = stream.getReader();
          const decoder = new TextDecoder();
          let assistantMessage = "";
          let isFirstChunk = true;

          while (true) {
            const { done, value } = await reader.read();
            
            if (done) break;
            
            const chunk = decoder.decode(value, { stream: true });
            
            if (isFirstChunk) {
              assistantMessage = chunk;
              isFirstChunk = false;
            } else {
              assistantMessage += chunk;
            }

            // Update the assistant message in real-time
            set((state) => ({
              currentMessages: state.currentMessages.map((msg, index) =>
                index === state.currentMessages.length - 1 && msg.role === "assistant"
                  ? { ...msg, content: assistantMessage }
                  : msg
              ),
            }));
          }

          // Add the final assistant message
          const aiResponse: Message = {
            role: "assistant",
            content: assistantMessage,
            timestamp: new Date().toISOString(),
          };

          set((state) => ({
            currentMessages: [...state.currentMessages, aiResponse],
            isTyping: false,
          }));

          // Refresh sessions to update last activity
          await get().loadSessions(projectId, true);

        } catch (error) {
          console.error("Failed to send message:", error);

          // Handle authentication errors
          if (handleAuthError(error)) {
            const errorMessage: Message = {
              role: "assistant",
              content: "Authentication failed. Please log in again to continue.",
              timestamp: new Date().toISOString(),
            };

            set((state) => ({
              currentMessages: [...state.currentMessages, errorMessage],
              isTyping: false,
            }));
            return;
          }

          const errorMessage: Message = {
            role: "assistant",
            content:
              "Sorry, I encountered an error while processing your message. Please try again.",
            timestamp: new Date().toISOString(),
          };

          set((state) => ({
            currentMessages: [...state.currentMessages, errorMessage],
            isTyping: false,
          }));
        }
      },

      deleteSession: async (sessionId: string, projectId: string) => {
        try {
          await chatAPI.deleteSession(sessionId, projectId);
          
          set((state) => ({
            sessions: state.sessions.filter(s => s.session_id !== sessionId),
            activeSessionId: state.activeSessionId === sessionId ? null : state.activeSessionId,
            currentMessages: state.activeSessionId === sessionId ? [] : state.currentMessages,
          }));
        } catch (error) {
          console.error("Failed to delete session:", error);
          // Handle authentication errors
          if (handleAuthError(error)) {
            throw new Error("Authentication failed");
          }
          throw error;
        }
      },

      clearCurrentChat: () => {
        set({
          activeSessionId: null,
          currentMessages: [],
        });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      setLoading: (loading: boolean) => {
        set({ loading });
      },

      setTyping: (isTyping: boolean) => {
        set({ isTyping });
      },
    }),
    {
      name: "chat-storage",
      partialize: (state) => ({
        sessions: state.sessions,
        lastFetched: state.lastFetched,
      }),
    }
  )
);