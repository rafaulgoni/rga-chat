import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { Loading } from '../components/common/Loading';

export default function Home() {
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createRoom = async () => {
    setCreating(true);
    setError(null);
    try {
      const response = await fetch('/api/rooms', { method: 'POST' });
      if (!response.ok) throw new Error('Unable to create chat.');
      const data = (await response.json()) as { roomId: string };
      navigate(`/chat/${data.roomId}`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to create chat.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <main className="min-h-dvh overflow-hidden bg-[radial-gradient(circle_at_top,rgba(79,70,229,0.16),transparent_35%),#020617]">
      <div className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-500/15 font-bold text-indigo-300 ring-1 ring-indigo-400/15">R</span>
            <span className="font-semibold text-white">RGA Chat</span>
          </div>
          <Link to="/privacy" className="rounded-lg px-3 py-2 text-sm text-slate-400 transition hover:bg-white/5 hover:text-slate-200">Privacy</Link>
        </header>

        <section className="flex flex-1 items-center justify-center py-16 sm:py-20">
          <div className="w-full max-w-3xl text-center">
            <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-indigo-400/15 bg-indigo-400/5 px-3 py-1.5 text-xs font-medium text-indigo-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> No account required
            </div>
            <h1 className="mt-6 text-4xl font-black tracking-tight text-white sm:text-6xl">Private chat.<br /><span className="text-indigo-300">No sign-up.</span></h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">Create a private two-person room, share one link, and start chatting in real time.</p>

            <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
              <Button onClick={createRoom} loading={creating} className="min-h-12 px-6 text-base">Create Private Chat</Button>
              <Link to="/privacy" className="inline-flex min-h-12 items-center justify-center rounded-xl px-6 text-sm font-semibold text-slate-300 ring-1 ring-white/10 transition hover:bg-white/5">How privacy works</Link>
            </div>

            {creating ? <div className="mt-5"><Loading label="Creating your private room…" /></div> : null}
            {error ? <p className="mt-5 text-sm text-rose-300">{error}</p> : null}

            <div className="mx-auto mt-14 grid max-w-2xl gap-3 text-left sm:grid-cols-3">
              {[
                ['1', 'Create a room', 'One secure, shareable link.'],
                ['2', 'Invite one person', 'The room accepts up to two users.'],
                ['3', 'Chat instantly', 'Real-time messages, presence, and typing.'],
              ].map(([number, title, description]) => (
                <div key={number} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="text-xs font-bold text-indigo-300">STEP {number}</div>
                  <h2 className="mt-2 text-sm font-semibold text-white">{title}</h2>
                  <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <footer className="border-t border-white/5 py-5 text-center text-xs text-slate-600">Anonymous by design · MVP build</footer>
      </div>
    </main>
  );
}
