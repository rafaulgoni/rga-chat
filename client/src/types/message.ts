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
