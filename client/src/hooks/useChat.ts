import { useCallback, useEffect, useMemo, useState } from 'react';
import { APP_CONFIG } from '../config/app';
import { chatService } from '../services/chatService';
import { storageService } from '../services/storageService';
import { chatSocket } from '../services/websocket';
import type { ConnectionState, RoomState } from '../types/chat';
import type { Message, MessageStatus } from '../types/message';
import type { Participant } from '../types/user';

function updateStatus(messages: Message[], id: string, status: MessageStatus): Message[] {
  return messages.map((message) => (message.id === id ? { ...message, status } : message));
}

export function useChat(roomId: string, userId: string, displayName: string, enabled = true) {
  const [messages, setMessages] = useState<Message[]>(() => storageService.loadMessages(roomId));
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [connectionState, setConnectionState] = useState<ConnectionState>('connecting');
  const [roomState, setRoomState] = useState<RoomState>('joining');
  const [error, setError] = useState<string | null>(null);

  const mergeMessages = useCallback((incoming: Message[]) => {
    setMessages((current) => {
      const byId = new Map(current.map((message) => [message.id, message]));
      incoming.forEach((message) => byId.set(message.id, message));
      return Array.from(byId.values()).sort((a, b) => a.createdAt - b.createdAt).slice(-APP_CONFIG.maxStoredMessages);
    });
  }, []);

  useEffect(() => {
    let joined = false;

    const join = () => {
      if (joined) return;
      const sent = chatService.joinRoom({ roomId, userId, displayName });
      if (sent) {
        joined = true;
        setError(null);
        setRoomState('joining');
      }
    };

    if (!enabled) return;

    const offConnection = chatSocket.onConnectionState((readyState) => {
      if (readyState === WebSocket.OPEN) {
        setConnectionState('connected');
        setError(null);
        join();
      } else if (readyState === WebSocket.CONNECTING) {
        setConnectionState('connecting');
      } else if (readyState === WebSocket.CLOSED || readyState === WebSocket.CLOSING) {
        setConnectionState('disconnected');
      } else {
        setConnectionState('failed');
      }
    });

    const offJoined = chatSocket.on('room.joined', ({ participants: nextParticipants }) => {
      setParticipants(nextParticipants);
      setRoomState(nextParticipants.length >= APP_CONFIG.maxParticipants ? 'ready' : 'waiting');
    });

    const offHistory = chatSocket.on('room.history', ({ messages: history }) => mergeMessages(history));

    const offState = chatSocket.on('room.state', ({ participants: nextParticipants }) => {
      setParticipants(nextParticipants);
      setRoomState(nextParticipants.length >= APP_CONFIG.maxParticipants ? 'ready' : 'waiting');
    });

    const offPresence = chatSocket.on('presence.update', ({ participants: nextParticipants }) => {
      setParticipants(nextParticipants);
      setRoomState(nextParticipants.length >= APP_CONFIG.maxParticipants ? 'ready' : 'waiting');
    });

    const offReceived = chatSocket.on('message.receive', ({ message }) => {
      mergeMessages([{ ...message, status: message.senderId === userId ? message.status : 'delivered' }]);
      if (message.senderId !== userId) {
        chatService.markSeen(roomId, message.id);
      }
    });

    const offAccepted = chatSocket.on('message.accepted', ({ messageId }) => {
      setMessages((current) => updateStatus(current, messageId, 'sent'));
    });

    const offMessageStatus = chatSocket.on('message.status', ({ messageId, status }) => {
      setMessages((current) => updateStatus(current, messageId, status));
    });

    const offFull = chatSocket.on('room.full', ({ message }) => {
      setRoomState('full');
      setError(message);
    });

    const offInvalid = chatSocket.on('room.invalid', ({ message }) => {
      setRoomState('invalid');
      setError(message);
    });

    const offServerError = chatSocket.on('server.error', ({ message }) => setError(message));

    const offLeft = chatSocket.on('room.left', ({ userId: leftUserId }) => {
      if (leftUserId !== userId) {
        setParticipants((current) => current.filter((participant) => participant.id !== leftUserId));
        setRoomState('waiting');
      }
    });

    chatSocket.connect();
    if (chatSocket.readyState === WebSocket.OPEN) {
      setConnectionState('connected');
      join();
    }

    return () => {
      offConnection();
      offJoined();
      offHistory();
      offState();
      offPresence();
      offReceived();
      offAccepted();
      offMessageStatus();
      offFull();
      offInvalid();
      offServerError();
      offLeft();
    };
  }, [displayName, enabled, mergeMessages, roomId, userId]);

  useEffect(() => {
    if (enabled) storageService.saveMessages(roomId, messages);
  }, [enabled, messages, roomId]);

  const sendMessage = useCallback((text: string): boolean => {
    const trimmed = text.trim();
    if (!trimmed || trimmed.length > APP_CONFIG.maxMessageLength) return false;

    const message: Message = {
      id: `msg_${crypto.randomUUID().replaceAll('-', '')}`,
      roomId,
      senderId: userId,
      senderName: displayName,
      type: 'text',
      text: trimmed,
      createdAt: Date.now(),
      status: 'sending',
    };

    setMessages((current) => [...current, message].slice(-APP_CONFIG.maxStoredMessages));
    const sent = chatService.sendMessage(roomId, message);
    if (!sent) {
      setMessages((current) => updateStatus(current, message.id, 'failed'));
      setError('Message failed to send. Check your connection and try again.');
    }
    return sent;
  }, [displayName, roomId, userId]);

  const markSeen = useCallback((messageId: string) => {
    chatService.markSeen(roomId, messageId);
  }, [roomId]);

  const leave = useCallback(() => {
    chatService.leaveRoom({ roomId, userId });
  }, [roomId, userId]);

  const otherParticipant = useMemo(
    () => participants.find((participant) => participant.id !== userId) ?? null,
    [participants, userId],
  );

  return {
    messages,
    participants,
    otherParticipant,
    connectionState,
    roomState,
    error,
    sendMessage,
    markSeen,
    leave,
  };
}
