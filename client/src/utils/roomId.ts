export function isValidRoomId(roomId: string): boolean {
  return /^[A-Za-z0-9_-]{8,64}$/.test(roomId);
}

export function isValidMessageId(messageId: string): boolean {
  return /^msg_[A-Za-z0-9_-]{8,80}$/.test(messageId);
}
