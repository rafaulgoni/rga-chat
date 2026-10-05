import type { ConnectionState } from './chat';
import type { Message, MessageStatus } from './message';
import type { Participant } from './user';

export type SocketEvent =
  | 'room.join'
  | 'room.leave'
  | 'message.send'
  | 'message.seen'
  | 'typing.start'
  | 'typing.stop';

export type ServerEvent =
  | 'room.joined'
  | 'room.history'
  | 'room.full'
  | 'room.invalid'
  | 'room.state'
  | 'room.left'
  | 'message.accepted'
  | 'message.receive'
  | 'message.status'
  | 'presence.update'
  | 'typing.update'
  | 'server.error';

export interface SocketPayloadMap {
  'room.join': {
    roomId: string;
    userId: string;
    displayName: string;
  };
  'room.leave': {
    roomId: string;
    userId: string;
  };
  'message.send': {
    roomId: string;
    message: Message;
  };
  'message.seen': {
    roomId: string;
    messageId: string;
  };
  'typing.start': { roomId: string };
  'typing.stop': { roomId: string };

  'room.joined': {
    roomId: string;
    self: Participant;
    participants: Participant[];
  };
  'room.history': { messages: Message[] };
  'room.full': { message: string };
  'room.invalid': { message: string };
  'room.state': { participants: Participant[] };
  'room.left': { userId: string };
  'message.accepted': { messageId: string };
  'message.receive': { message: Message };
  'message.status': { messageId: string; status: MessageStatus };
  'presence.update': { participants: Participant[] };
  'typing.update': { userId: string; displayName: string; typing: boolean };
  'server.error': { code: string; message: string };
}

export interface ConnectionSnapshot {
  state: ConnectionState;
}
