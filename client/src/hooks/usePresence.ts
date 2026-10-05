import { useEffect, useState } from 'react';
import { chatSocket } from '../services/websocket';
import type { Participant } from '../types/user';

export function usePresence(): Participant[] {
  const [participants, setParticipants] = useState<Participant[]>([]);

  useEffect(() => {
    const offPresence = chatSocket.on('presence.update', ({ participants: next }) => setParticipants(next));
    return offPresence;
  }, []);

  return participants;
}
