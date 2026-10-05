import { chatSocket } from './websocket';
import type { Message } from '../types/message';
import type { SocketPayloadMap } from '../types/websocket';

export const chatService = {
  joinRoom(payload: SocketPayloadMap['room.join']) {
    return chatSocket.send('room.join', payload);
  },

  leaveRoom(payload: SocketPayloadMap['room.leave']) {
    return chatSocket.send('room.leave', payload);
  },

  sendMessage(roomId: string, message: Message) {
    return chatSocket.send('message.send', { roomId, message });
  },

  markSeen(roomId: string, messageId: string) {
    return chatSocket.send('message.seen', { roomId, messageId });
  },

  startTyping(roomId: string) {
    return chatSocket.send('typing.start', { roomId });
  },

  stopTyping(roomId: string) {
    return chatSocket.send('typing.stop', { roomId });
  },
};
