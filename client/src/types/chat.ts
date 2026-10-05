import type { Message } from './message';
import type { Participant } from './user';

export type ConnectionState = 'connecting' | 'connected' | 'disconnected' | 'failed';
export type RoomState = 'unknown' | 'joining' | 'waiting' | 'ready' | 'full' | 'invalid' | 'error';

export interface ChatSnapshot {
  roomId: string;
  messages: Message[];
  participants: Participant[];
}
