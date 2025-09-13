import { apiClient } from './base/ApiClient';
import type { ChatSession, BasicSession, Message } from '@/types';

interface SendMessageData {
  session_id: string;
  project_id: string;
  message: string;
  messages: Message[];
}

interface CreateSessionData {
  project_id: string;
  initial_message?: string;
}

class ChatService {
  async getChatSessions(projectId: string): Promise<BasicSession[]> {
    const response = await apiClient.get<{ sessions: BasicSession[] }>(`/chat/${projectId}/sessions`);
    return response.sessions || [];
  }

  async getChatSession(sessionId: string, projectId: string): Promise<ChatSession> {
    return apiClient.post<ChatSession>(`/chat/${projectId}/sessions/${sessionId}`, {});
  }

  async createChatSession(data: CreateSessionData): Promise<ChatSession> {
    return apiClient.post<ChatSession>(`/chat/${data.project_id}/sessions`, data);
  }

  async sendMessage(data: SendMessageData): Promise<ReadableStream<Uint8Array> | null> {
    return apiClient.stream('/chat', data);
  }

  async deleteSession(sessionId: string, projectId: string): Promise<void> {
    return apiClient.delete(`/chat/${projectId}/sessions/${sessionId}`);
  }

  async updateSessionTitle(sessionId: string, projectId: string, title: string): Promise<ChatSession> {
    return apiClient.put<ChatSession>(`/chat/${projectId}/sessions/${sessionId}`, { title });
  }

  // Utility methods
  generateSessionTitle(firstMessage: string): string {
    if (!firstMessage) return 'New Chat';
    return firstMessage.length > 30 
      ? `${firstMessage.substring(0, 30)}...`
      : firstMessage;
  }

  sortSessionsByActivity(sessions: BasicSession[]): BasicSession[] {
    return sessions.sort(
      (a, b) => new Date(b.last_activity).getTime() - new Date(a.last_activity).getTime()
    );
  }
}

export const chatService = new ChatService();