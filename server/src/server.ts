import http from 'node:http';
import { URL } from 'node:url';
import { WebSocket, WebSocketServer } from 'ws';
import { createRoomId, createMessageId, isValidRoomId, isValidText } from './utils.js';
import { RoomManager } from './roomManager.js';
import type { ClientEnvelope, Message, Participant, Room } from './types.js';

const PORT = Number(process.env.PORT ?? 8787);
const MAX_PARTICIPANTS = 2;
const MAX_MESSAGES_PER_ROOM = 500;
const roomManager = new RoomManager();
const socketRooms = new Map<WebSocket, string>();
const socketUsers = new Map<WebSocket, Participant>();

function send(ws: WebSocket, event: string, payload: unknown) {
  if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ event, payload }));
}

function participantsOf(room: Room): Participant[] {
  return Array.from(room.participants.values()).map(({ participant }) => participant);
}

function broadcast(room: Room, event: string, payload: unknown, except?: WebSocket) {
  room.participants.forEach(({ ws }) => {
    if (ws && ws !== except) send(ws, event, payload);
  });
}

function getRoomFor(ws: WebSocket): Room | undefined {
  const roomId = socketRooms.get(ws);
  return roomId ? roomManager.get(roomId) : undefined;
}

function leaveCurrentRoom(ws: WebSocket, permanent = true) {
  const room = getRoomFor(ws);
  const user = socketUsers.get(ws);
  if (!room || !user) return;

  const entry = room.participants.get(user.id);
  if (!entry) return;

  if (permanent) {
    room.participants.delete(user.id);
  } else {
    entry.ws = undefined;
    entry.participant.online = false;
  }

  room.lastActivityAt = Date.now();
  socketRooms.delete(ws);
  socketUsers.delete(ws);

  broadcast(room, 'room.left', { userId: user.id }, ws);
  broadcast(room, 'presence.update', { participants: participantsOf(room) });
  roomManager.deleteIfEmpty(room.id);
}

function handleJoin(ws: WebSocket, payload: unknown) {
  if (!payload || typeof payload !== 'object') return send(ws, 'server.error', { code: 'INVALID_PAYLOAD', message: 'Invalid join payload.' });

  const data = payload as Partial<{ roomId: string; userId: string; displayName: string }>;
  if (!isValidRoomId(data.roomId) || typeof data.userId !== 'string' || typeof data.displayName !== 'string') {
    return send(ws, 'server.error', { code: 'INVALID_PAYLOAD', message: 'Invalid room or user information.' });
  }

  const room = roomManager.get(data.roomId);
  if (!room) return send(ws, 'room.invalid', { message: 'This room does not exist.' });
  if (room.participants.size >= MAX_PARTICIPANTS && !room.participants.has(data.userId)) {
    return send(ws, 'room.full', { message: 'This chat is full.' });
  }

  leaveCurrentRoom(ws);

  const existing = room.participants.get(data.userId);
  if (existing?.ws && existing.ws !== ws) {
    socketRooms.delete(existing.ws);
    socketUsers.delete(existing.ws);
    existing.ws.close(1000, 'Reconnected from another tab');
    existing.ws = undefined;
  }

  const participant: Participant = existing?.participant ?? {
    id: data.userId,
    displayName: data.displayName.slice(0, 40),
    online: true,
  };
  participant.displayName = data.displayName.slice(0, 40);
  participant.online = true;
  room.participants.set(participant.id, { ws, participant });
  room.lastActivityAt = Date.now();
  socketRooms.set(ws, room.id);
  socketUsers.set(ws, participant);

  send(ws, 'room.joined', { roomId: room.id, self: participant, participants: participantsOf(room) });
  send(ws, 'room.history', { messages: room.messages });
  broadcast(room, 'presence.update', { participants: participantsOf(room) });
  send(ws, 'room.state', { participants: participantsOf(room) });
  return undefined;
}

function handleMessageSend(ws: WebSocket, payload: unknown) {
  const room = getRoomFor(ws);
  const user = socketUsers.get(ws);
  if (!room || !user || !payload || typeof payload !== 'object') {
    return send(ws, 'server.error', { code: 'NOT_IN_ROOM', message: 'Join a room before sending messages.' });
  }

  const data = payload as { roomId?: unknown; message?: Partial<Message> };
  if (data.roomId !== room.id || !data.message || data.message.senderId !== user.id || data.message.type !== 'text' || !isValidText(data.message.text)) {
    return send(ws, 'server.error', { code: 'INVALID_MESSAGE', message: 'Message payload is invalid.' });
  }

  const message: Message = {
    id: typeof data.message.id === 'string' ? data.message.id : createMessageId(),
    roomId: room.id,
    senderId: user.id,
    senderName: user.displayName,
    type: 'text',
    text: data.message.text!.trim(),
    createdAt: Number.isFinite(data.message.createdAt) ? Number(data.message.createdAt) : Date.now(),
    status: 'sent',
  };

  const alreadyExists = room.messages.some((item) => item.id === message.id);
  if (alreadyExists) {
    send(ws, 'message.accepted', { messageId: message.id });
    return;
  }

  room.messages.push(message);
  room.messages = room.messages.slice(-MAX_MESSAGES_PER_ROOM);
  room.lastActivityAt = Date.now();
  send(ws, 'message.accepted', { messageId: message.id });
  broadcast(room, 'message.receive', { message }, ws);

  const recipient = Array.from(room.participants.entries()).find(([id]) => id !== user.id)?.[1];
  if (recipient) {
    message.status = recipient.participant.online && recipient.ws ? 'delivered' : 'sent';
    send(ws, 'message.status', { messageId: message.id, status: message.status });
  }
}

function handleSeen(ws: WebSocket, payload: unknown) {
  const room = getRoomFor(ws);
  const user = socketUsers.get(ws);
  if (!room || !user || !payload || typeof payload !== 'object') return;
  const { roomId, messageId } = payload as { roomId?: unknown; messageId?: unknown };
  if (roomId !== room.id || typeof messageId !== 'string') return;
  const message = room.messages.find((item) => item.id === messageId);
  if (!message || message.senderId === user.id) return;

  message.status = 'seen';
  const senderEntry = room.participants.get(message.senderId);
  if (senderEntry?.ws) send(senderEntry.ws, 'message.status', { messageId, status: 'seen' });
}

function handleTyping(ws: WebSocket, payload: unknown, typing: boolean) {
  const room = getRoomFor(ws);
  const user = socketUsers.get(ws);
  if (!room || !user || !payload || typeof payload !== 'object') return;
  const { roomId } = payload as { roomId?: unknown };
  if (roomId !== room.id) return;
  broadcast(room, 'typing.update', { userId: user.id, displayName: user.displayName, typing }, ws);
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);

  if (req.method === 'OPTIONS') {
    res.writeHead(204, { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' });
    return res.end();
  }

  if (req.method === 'GET' && url.pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    return res.end(JSON.stringify({ ok: true }));
  }

  if (req.method === 'POST' && url.pathname === '/api/rooms') {
    const roomId = createRoomId();
    roomManager.create(roomId);
    res.writeHead(201, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'Access-Control-Allow-Origin': '*' });
    return res.end(JSON.stringify({ roomId }));
  }

  res.writeHead(404, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
  return res.end(JSON.stringify({ error: 'Not found' }));
});

const wss = new WebSocketServer({ server, path: '/ws', maxPayload: 32 * 1024 });

// Remove abandoned rooms after 30 minutes with no online participants.
setInterval(() => {
  const cutoff = Date.now() - 30 * 60 * 1000;
  for (const room of roomManager.list()) {
    const roomId = room.id;
    const hasOnline = Array.from(room.participants.values()).some((entry) => entry.participant.online && entry.ws);
    if (!hasOnline && room.lastActivityAt < cutoff) {
      // The manager intentionally exposes deletion through deleteIfEmpty only, so clear offline participants first.
      room.participants.clear();
      roomManager.deleteIfEmpty(roomId);
    }
  }
}, 5 * 60 * 1000).unref();

wss.on('connection', (ws) => {
  ws.on('message', (raw) => {
    try {
      const envelope = JSON.parse(String(raw)) as ClientEnvelope;
      switch (envelope.event) {
        case 'room.join': handleJoin(ws, envelope.payload); break;
        case 'room.leave': leaveCurrentRoom(ws); break;
        case 'message.send': handleMessageSend(ws, envelope.payload); break;
        case 'message.seen': handleSeen(ws, envelope.payload); break;
        case 'typing.start': handleTyping(ws, envelope.payload, true); break;
        case 'typing.stop': handleTyping(ws, envelope.payload, false); break;
        default: send(ws, 'server.error', { code: 'UNKNOWN_EVENT', message: 'Unknown event.' });
      }
    } catch {
      send(ws, 'server.error', { code: 'BAD_REQUEST', message: 'Malformed WebSocket message.' });
    }
  });

  ws.on('close', () => leaveCurrentRoom(ws));
});

server.listen(PORT, () => {
  console.log(`RGA WebSocket/API server listening on http://localhost:${PORT}`);
});
