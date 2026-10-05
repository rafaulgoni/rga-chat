import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { APP_CONFIG } from '../config/app';
import { ChatHeader } from '../components/chat/ChatHeader';
import { ChatMessages } from '../components/chat/ChatMessages';
import { MessageComposer } from '../components/chat/MessageComposer';
import { TypingIndicator } from '../components/chat/TypingIndicator';
import { Button } from '../components/common/Button';
import { Loading } from '../components/common/Loading';
import { Modal } from '../components/common/Modal';
import { storageService } from '../services/storageService';
import { useChat } from '../hooks/useChat';
import { useTyping } from '../hooks/useTyping';
import { isValidRoomId } from '../utils/roomId';

export default function ChatRoom() {
  const navigate = useNavigate();
  const { roomId = '' } = useParams();
  const user = storageService.getAnonymousUser();
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const validRoom = isValidRoomId(roomId);
  const chat = useChat(roomId, user.id, user.displayName, validRoom);
  const typing = useTyping(roomId, user.id, validRoom);

  useEffect(() => {
    return () => {
      chat.leave();
    };
  }, [chat.leave]);

  if (!validRoom) {
    return (
      <main className="grid min-h-dvh place-items-center bg-slate-950 px-4 text-center">
        <div><h1 className="text-2xl font-bold text-white">Invalid room</h1><p className="mt-2 text-sm text-slate-400">This chat link is not valid.</p><Button className="mt-5" onClick={() => navigate('/')}>Back to Home</Button></div>
      </main>
    );
  }

  
  const copyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
  };

  const leave = (deleteLocalData: boolean) => {
    chat.leave();
    if (deleteLocalData) storageService.clearRoom(roomId);
    navigate('/');
  };

  if (chat.roomState === 'invalid' || chat.roomState === 'full') {
    return (
      <main className="grid min-h-dvh place-items-center bg-slate-950 px-4 text-center">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-rose-500/10 text-rose-300">!</div>
          <h1 className="mt-5 text-2xl font-bold text-white">{chat.roomState === 'full' ? 'This chat is full.' : 'This room does not exist.'}</h1>
          <p className="mt-2 text-sm leading-6 text-slate-400">{chat.error ?? 'The room is unavailable.'}</p>
          <Button className="mt-5 w-full" onClick={() => navigate('/')}>Back to Home</Button>
        </div>
      </main>
    );
  }

  if (chat.connectionState === 'connecting' && chat.messages.length === 0 && chat.roomState === 'joining') {
    return <Loading fullscreen label="Joining private chat…" />;
  }

  const chatDisabled = chat.connectionState !== 'connected' || chat.roomState !== 'ready';
  const participantLabel = chat.otherParticipant ? `${chat.otherParticipant.displayName} ${chat.otherParticipant.online ? 'is online' : 'is offline'}` : 'Share this room link with one person.';

  return (
    <main className="flex min-h-dvh flex-col overflow-hidden bg-slate-950">
      <ChatHeader otherParticipant={chat.otherParticipant} connectionState={chat.connectionState} onCopyLink={copyLink} onLeave={() => setShowLeaveModal(true)} />

      <div className="flex min-h-0 flex-1 flex-col">
        <div className="border-b border-white/5 bg-slate-950/60 px-4 py-2 text-center text-xs text-slate-500 sm:px-6">
          {chat.roomState === 'waiting' ? `Waiting for your second participant · ${participantLabel}` : participantLabel}
        </div>

        <ChatMessages messages={chat.messages} selfId={user.id} onSeen={chat.markSeen} />

        {typing.typingUser ? <TypingIndicator displayName={typing.typingUser.displayName} /> : null}

        {chat.error && chat.connectionState !== 'connected' ? (
          <div className="mx-auto mb-2 max-w-4xl px-4 text-center text-xs text-rose-300">{chat.error}</div>
        ) : null}

        <MessageComposer disabled={chatDisabled} onSend={chat.sendMessage} onTyping={typing.handleTyping} onStopTyping={typing.stopTyping} />
      </div>

      <Modal
        open={showLeaveModal}
        title="আপনি কি সব চ্যাট ডিলিট করতে চান?"
        onCancel={() => setShowLeaveModal(false)}
        onConfirm={() => leave(true)}
        confirmLabel="হ্যাঁ, সব ডিলিট করুন"
        danger
      >
        <p>এটি এই browser-এ RGA Chat-এর stored chat data মুছে দেবে। অন্য ব্যক্তির device বা browser backup-এর data এটি মুছবে না।</p>
        <button onClick={() => leave(false)} className="mt-3 text-xs font-medium text-indigo-300 hover:text-indigo-200">Delete না করে chat leave করতে চান?</button>
      </Modal>

      <div className="sr-only" aria-live="polite">
        {chat.connectionState === 'connected' ? 'Connected' : 'Connection unavailable'}
        {chat.roomState === 'ready' ? ` Room ready for ${APP_CONFIG.maxParticipants} participants.` : ''}
      </div>
    </main>
  );
}
