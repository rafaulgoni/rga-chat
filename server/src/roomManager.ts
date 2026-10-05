import type { Room } from './types.js';

export class RoomManager {
  private rooms = new Map<string, Room>();

  create(roomId: string): Room {
    const room: Room = {
      id: roomId,
      createdAt: Date.now(),
      participants: new Map(),
      messages: [],
      lastActivityAt: Date.now(),
    };
    this.rooms.set(roomId, room);
    return room;
  }

  get(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  list(): Room[] {
    return Array.from(this.rooms.values());
  }

  deleteIfEmpty(roomId: string): void {
    const room = this.rooms.get(roomId);
    if (room && room.participants.size === 0) this.rooms.delete(roomId);
  }
}
