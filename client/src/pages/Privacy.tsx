import { Link } from 'react-router-dom';

export default function Privacy() {
  return (
    <main className="min-h-dvh bg-slate-950 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <Link to="/" className="text-sm font-medium text-indigo-300 hover:text-indigo-200">← Back to RGA Chat</Link>
        <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-300">Privacy</p>
          <h1 className="mt-3 text-3xl font-bold text-white">How RGA Chat handles your data</h1>
          <p className="mt-4 text-sm leading-7 text-slate-400">RGA Chat MVP is designed around temporary, no-account conversations. The MVP does not use a permanent application database for chat messages.</p>

          <div className="mt-8 space-y-7 text-sm leading-7 text-slate-300">
            <section><h2 className="font-semibold text-white">No account required</h2><p className="mt-1 text-slate-400">You do not need to register, log in, or create a password to use a private room.</p></section>
            <section><h2 className="font-semibold text-white">Temporary server state</h2><p className="mt-1 text-slate-400">The real-time server keeps active room and message state in memory while the session is active. This MVP does not persist chat messages in a permanent database.</p></section>
            <section><h2 className="font-semibold text-white">Browser storage</h2><p className="mt-1 text-slate-400">Text messages are stored in your browser's LocalStorage so a refresh does not immediately remove the current room's local copy.</p></section>
            <section><h2 className="font-semibold text-white">Delete chat</h2><p className="mt-1 text-slate-400">The delete action removes application-managed chat data from this browser. It does not remove screenshots, operating-system backups, browser-managed backups, or data stored on another participant's device.</p></section>
            <section><h2 className="font-semibold text-white">Security note</h2><p className="mt-1 text-slate-400">A room link is the access credential for an anonymous chat. Treat the link as private and share it only with the person you intend to invite.</p></section>
          </div>
        </div>
      </div>
    </main>
  );
}
