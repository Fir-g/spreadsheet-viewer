import { create } from "zustand";
import { persist } from "zustand/middleware";
import { chatService } from '@/services';
import type { Message, ChatSession, BasicSession } from '@/types';


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
          const sessions = await chatService.getChatSessions(projectId);

          const sortedSessions = chatService.sortSessionsByActivity(sessions);

          set((state) => ({
            sessions: sortedSessions,
            loading: false,
            lastFetched: { ...state.lastFetched, [projectId]: Date.now() },
          }));
        } catch (error) {
          console.error("Failed to load chat sessions:", error);
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
            const sessionDetails = await chatService.getChatSession(sessionId, projectId);

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
          const stream = await chatService.sendMessage({
            session_id: activeSessionId,
            project_id: projectId,
            message,
            messages: currentMessages,
          });

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
          await chatService.deleteSession(sessionId, projectId);
          
          set((state) => ({
            sessions: state.sessions.filter(s => s.session_id !== sessionId),
            activeSessionId: state.activeSessionId === sessionId ? null : state.activeSessionId,
            currentMessages: state.activeSessionId === sessionId ? [] : state.currentMessages,
          }));
        } catch (error) {
          console.error("Failed to delete session:", error);
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