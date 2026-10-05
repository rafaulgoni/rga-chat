interface LoadingProps { label?: string; fullscreen?: boolean; }

export function Loading({ label = 'Loading…', fullscreen = false }: LoadingProps) {
  return (
    <div className={`${fullscreen ? 'min-h-dvh' : 'min-h-40'} flex items-center justify-center gap-3 text-sm text-slate-400`}>
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-500 border-t-indigo-400" />
      <span>{label}</span>
    </div>
  );
}
