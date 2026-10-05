import { randomBytes } from 'node:crypto';

export function createRoomId(): string {
  return randomBytes(12).toString('base64url');
}

export function createMessageId(): string {
  return `msg_${randomBytes(18).toString('base64url')}`;
}

export function isValidRoomId(value: unknown): value is string {
  return typeof value === 'string' && /^[A-Za-z0-9_-]{8,64}$/.test(value);
}

export function isValidText(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= 5000;
}
