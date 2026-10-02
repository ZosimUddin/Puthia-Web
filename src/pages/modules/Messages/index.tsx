import React from 'react';
import { AddaMessengerHub } from '../../../components/adda/AddaMessengerHub';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';

const Messages: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const initialChatId = searchParams.get('chat') || searchParams.get('id') || location.state?.chatId || undefined;

  return (
    <div className="h-[100dvh] max-h-[100dvh] w-full bg-white flex flex-col overflow-hidden">
      {/* Pure standalone Messenger view */}
      <main className="flex-1 w-full max-w-7xl mx-auto bg-white overflow-hidden flex flex-col h-full">
        <AddaMessengerHub initialChatId={initialChatId} onClose={() => navigate('/discussion')} />
      </main>
    </div>
  );
};

export default Messages;

