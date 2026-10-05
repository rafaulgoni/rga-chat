import { useCallback, useEffect, useRef, useState } from 'react';
import { chatService } from '../services/chatService';
import { chatSocket } from '../services/websocket';

export function useTyping(roomId: string, selfId: string, enabled = true) {
  const [typingUser, setTypingUser] = useState<{ id: string; displayName: string } | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const off = chatSocket.on('typing.update', ({ userId, displayName, typing }) => {
      if (userId === selfId) return;
      setTypingUser(typing ? { id: userId, displayName } : null);
    });
    return () => {
      off();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [enabled, selfId]);

  const handleTyping = useCallback(() => {
    if (!enabled) return;
    chatService.startTyping(roomId);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => chatService.stopTyping(roomId), 1200);
  }, [enabled, roomId]);

  const stopTyping = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (!enabled) return;
    chatService.stopTyping(roomId);
  }, [enabled, roomId]);

  return { typingUser, handleTyping, stopTyping };
}
