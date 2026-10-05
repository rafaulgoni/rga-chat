import type { Message } from '../../types/message';
import { formatTime } from '../../utils/formatTime';

interface MessageBubbleProps { message: Message; own: boolean; onSeen?: () => void; }

const statusLabel: Record<Message['status'], string> = {
  sending: 'Sending…',
  sent: 'Sent',
  delivered: 'Delivered',
  seen: 'Seen',
  failed: 'Failed',
};

export function MessageBubble({ message, own, onSeen }: MessageBubbleProps) {
  const content = message.type === 'text' ? message.text : '[Unsupported MVP message type]';

  return (
    <div className={`flex ${own ? 'justify-end' : 'justify-start'} animate-fade-up`}>
      <div
        className={`max-w-[88%] break-words rounded-2xl px-4 py-3 sm:max-w-[75%] lg:max-w-[65%] ${own ? 'rounded-br-md bg-indigo-500 text-white' : 'rounded-bl-md bg-slate-800 text-slate-100 ring-1 ring-white/5'}`}
        onMouseEnter={!own ? onSeen : undefined}
      >
        <p className="whitespace-pre-wrap text-[15px] leading-6 [overflow-wrap:anywhere]">{content}</p>
        <div className={`mt-1.5 flex items-center justify-end gap-2 text-[11px] ${own ? 'text-indigo-100/75' : 'text-slate-400'}`}>
          <span>{formatTime(message.createdAt)}</span>
          {own ? <span>{statusLabel[message.status]}</span> : null}
        </div>
      </div>
    </div>
  );
}
