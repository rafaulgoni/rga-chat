import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import CreateChat from './pages/CreateChat';
import ChatRoom from './pages/ChatRoom';
import Privacy from './pages/Privacy';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<CreateChat />} />
        <Route path="/chat/:roomId" element={<ChatRoom />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
