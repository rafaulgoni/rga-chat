import type { SocketEvent, SocketPayloadMap, ServerEvent } from '../types/websocket';
import { getWebSocketUrl } from '../config/app';

export type SocketConnectionListener = (state: WebSocket['readyState']) => void;
export type SocketEventListener<E extends ServerEvent> = (payload: SocketPayloadMap[E]) => void;

export class ChatWebSocket {
  private socket: WebSocket | null = null;
  private listeners = new Map<string, Set<(payload: unknown) => void>>();
  private connectionListeners = new Set<SocketConnectionListener>();

  connect(): void {
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.socket = new WebSocket(getWebSocketUrl());

    this.socket.addEventListener('open', () => this.emitConnectionState());
    this.socket.addEventListener('close', () => this.emitConnectionState());
    this.socket.addEventListener('error', () => this.emitConnectionState());
    this.socket.addEventListener('message', (event) => {
      try {
        const message = JSON.parse(String(event.data)) as { event: ServerEvent; payload: unknown };
        this.emit(message.event, message.payload);
      } catch {
        // Ignore malformed server messages. The server is expected to validate payloads.
      }
    });
  }

  send<E extends SocketEvent>(event: E, payload: SocketPayloadMap[E]): boolean {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return false;
    this.socket.send(JSON.stringify({ event, payload }));
    return true;
  }

  on<E extends ServerEvent>(event: E, listener: SocketEventListener<E>): () => void {
    const set = this.listeners.get(event) ?? new Set<(payload: unknown) => void>();
    set.add(listener as (payload: unknown) => void);
    this.listeners.set(event, set);
    return () => set.delete(listener as (payload: unknown) => void);
  }

  onConnectionState(listener: SocketConnectionListener): () => void {
    this.connectionListeners.add(listener);
    return () => this.connectionListeners.delete(listener);
  }

  get readyState(): number {
    return this.socket?.readyState ?? WebSocket.CLOSED;
  }

  disconnect(): void {
    this.socket?.close();
    this.socket = null;
    this.listeners.clear();
    this.connectionListeners.clear();
  }

  private emit(event: string, payload: unknown): void {
    this.listeners.get(event)?.forEach((listener) => listener(payload));
  }

  private emitConnectionState(): void {
    const state = this.socket?.readyState ?? WebSocket.CLOSED;
    this.connectionListeners.forEach((listener) => listener(state));
  }
}

export const chatSocket = new ChatWebSocket();
