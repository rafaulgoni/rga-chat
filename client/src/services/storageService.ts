import { APP_CONFIG, STORAGE_KEYS } from '../config/app';
import type { Message } from '../types/message';
import type { AnonymousUser } from '../types/user';

interface StoredRoom {
  roomId: string;
  messages: Message[];
  updatedAt: number;
}

function safeRead<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export const storageService = {
  getAnonymousUser(): AnonymousUser {
    const existing = safeRead<AnonymousUser>(STORAGE_KEYS.user);
    if (existing?.id && existing.displayName) return existing;

    const suffix = crypto.randomUUID().slice(0, 4).toUpperCase();
    const user: AnonymousUser = {
      id: `guest_${crypto.randomUUID().replaceAll('-', '')}`,
      displayName: `Guest ${suffix}`,
    };
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
    return user;
  },

  loadMessages(roomId: string): Message[] {
    const stored = safeRead<StoredRoom>(`${STORAGE_KEYS.roomPrefix}${roomId}`);
    return stored?.messages ?? [];
  },

  saveMessages(roomId: string, messages: Message[]): void {
    const trimmed = messages.slice(-APP_CONFIG.maxStoredMessages);
    const payload: StoredRoom = { roomId, messages: trimmed, updatedAt: Date.now() };
    localStorage.setItem(`${STORAGE_KEYS.roomPrefix}${roomId}`, JSON.stringify(payload));
  },

  clearRoom(roomId: string): void {
    localStorage.removeItem(`${STORAGE_KEYS.roomPrefix}${roomId}`);
  },

  clearAllChatData(): void {
    const toDelete: string[] = [];
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (key?.startsWith(STORAGE_KEYS.roomPrefix)) toDelete.push(key);
    }
    toDelete.forEach((key) => localStorage.removeItem(key));
  },
};
