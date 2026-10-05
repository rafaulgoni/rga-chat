import { useEffect, useRef } from 'react';
import type { Message } from '../../types/message';
import { MessageBubble } from './MessageBubble';

interface ChatMessagesProps { messages: Message[]; selfId: string; onSeen: (messageId: string) => void; }

export function ChatMessages({ messages, selfId, onSeen }: ChatMessagesProps) {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages.length]);

  if (messages.length === 0) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center px-6 text-center">
        <div className="max-w-sm">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-indigo-500/10 text-2xl">💬</div>
          <h2 className="mt-4 text-lg font-semibold text-white">No messages yet</h2>
          <p className="mt-1 text-sm leading-6 text-slate-400">Send a message to start the private conversation.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="message-scroll min-h-0 flex-1 overflow-y-auto px-3 py-5 sm:px-6 sm:py-6">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-3">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            own={message.senderId === selfId}
            onSeen={() => message.senderId !== selfId && onSeen(message.id)}
          />
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
