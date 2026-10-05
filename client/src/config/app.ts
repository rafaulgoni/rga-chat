export const APP_CONFIG = {
  appName: 'RGA Chat',
  maxParticipants: 2,
  maxMessageLength: 5000,
  maxStoredMessages: 500,
};

export const STORAGE_KEYS = {
  user: 'rga:anonymous-user',
  roomPrefix: 'rga:chat:',
};

export function getWebSocketUrl(): string {
  const configured = import.meta.env.VITE_WS_URL as string | undefined;
  if (configured) return configured;

  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.host}/ws`;
}
