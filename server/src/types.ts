export type MessageType = 'text' | 'image' | 'video' | 'voice';
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'seen' | 'failed';

export interface Message {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  type: MessageType;
  text?: string;
  createdAt: number;
  status: MessageStatus;
}

export interface Participant {
  id: string;
  displayName: string;
  online: boolean;
}

export interface Room {
  id: string;
  createdAt: number;
  participants: Map<string, { ws?: import('ws').WebSocket; participant: Participant }>;
  lastActivityAt: number;
  messages: Message[];
}

export type ClientEvent =
  | 'room.join'
  | 'room.leave'
  | 'message.send'
  | 'message.seen'
  | 'typing.start'
  | 'typing.stop';

export interface ClientEnvelope {
  event: ClientEvent;
  payload: unknown;
}
