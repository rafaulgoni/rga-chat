import { useState } from 'react';
import { Button } from '../common/Button';
import type { Participant } from '../../types/user';

interface ChatHeaderProps {
  otherParticipant: Participant | null;
  connectionState: string;
  onCopyLink: () => Promise<void>;
  onLeave: () => void;
}

export function ChatHeader({ otherParticipant, connectionState, onCopyLink, onLeave }: ChatHeaderProps) {
  const [copied, setCopied] = useState(false);
  const online = otherParticipant?.online ?? false;

  const copy = async () => {
    await onCopyLink();
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <header className="safe-top border-b border-white/10 bg-slate-950/90 px-3 py-3 backdrop-blur sm:px-5">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-indigo-500/15 text-indigo-300">R</span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">Private Chat</p>
              <p className="flex items-center gap-1.5 text-xs text-slate-400">
                <span className={`h-2 w-2 rounded-full ${online ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                {otherParticipant ? (online ? `${otherParticipant.displayName} · Online` : `${otherParticipant.displayName} · Offline`) : 'Waiting for another person'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {connectionState !== 'connected' ? (
            <span className="hidden rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1.5 text-xs font-medium text-amber-300 sm:inline-flex">
              {connectionState === 'connecting' ? 'Connecting…' : 'Connection lost'}
            </span>
          ) : null}
          <button onClick={copy} className="min-h-10 rounded-xl bg-white/5 px-3 text-xs font-semibold text-slate-200 ring-1 ring-white/10 transition hover:bg-white/10" aria-label="Copy chat link">
            {copied ? 'Copied!' : 'Copy link'}
          </button>
          <Button variant="ghost" className="min-h-10 px-3 text-xs text-rose-300" onClick={onLeave}>Leave</Button>
        </div>
      </div>
    </header>
  );
}
