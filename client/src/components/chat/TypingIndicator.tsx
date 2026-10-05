interface TypingIndicatorProps { displayName?: string | null; }

export function TypingIndicator({ displayName }: TypingIndicatorProps) {
  if (!displayName) return null;
  return (
    <div className="px-4 pb-2 text-xs text-slate-400 sm:px-6">
      <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1.5">
        <span className="flex gap-0.5"><i className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.2s]" /><i className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.1s]" /><i className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" /></span>
        {displayName} is typing…
      </span>
    </div>
  );
}
