import { useEffect, useRef, useState } from 'react';
import { APP_CONFIG } from '../../config/app';
import { Button } from '../common/Button';

interface MessageComposerProps { disabled?: boolean; onSend: (text: string) => boolean; onTyping: () => void; onStopTyping: () => void; }

export function MessageComposer({ disabled = false, onSend, onTyping, onStopTyping }: MessageComposerProps) {
  const [text, setText] = useState('');
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const submit = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const sent = onSend(trimmed);
    if (sent) {
      setText('');
      onStopTyping();
    }
  };

  return (
    <div className="safe-bottom border-t border-white/10 bg-slate-950/95 px-3 py-3 backdrop-blur sm:px-5">
      <div className="mx-auto flex max-w-4xl items-end gap-2 rounded-2xl border border-white/10 bg-slate-900 p-2 shadow-xl shadow-black/10">
        <textarea
          ref={inputRef}
          value={text}
          disabled={disabled}
          maxLength={APP_CONFIG.maxMessageLength}
          rows={1}
          onChange={(event) => {
            setText(event.target.value);
            if (event.target.value.trim()) onTyping();
          }}
          onBlur={onStopTyping}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              submit();
            }
          }}
          placeholder={disabled ? 'Waiting for the other person…' : 'Write a message…'}
          className="max-h-32 min-h-11 flex-1 resize-none bg-transparent px-3 py-2.5 text-[15px] leading-6 text-slate-100 outline-none placeholder:text-slate-500 disabled:cursor-not-allowed"
          aria-label="Message"
        />
        <Button onClick={submit} disabled={disabled || !text.trim()} className="shrink-0">Send</Button>
      </div>
      <div className="mx-auto mt-1.5 flex max-w-4xl justify-between px-1 text-[11px] text-slate-500">
        <span>Enter to send · Shift + Enter for a new line</span>
        <span>{text.length}/{APP_CONFIG.maxMessageLength}</span>
      </div>
    </div>
  );
}
