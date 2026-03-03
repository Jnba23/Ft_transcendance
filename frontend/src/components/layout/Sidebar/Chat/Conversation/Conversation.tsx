import { useEffect, useRef } from 'react';
import Msg from './Msg';
import NoMessages from './NoMessages';
import { useChatStore } from '@stores/chat.store';

type ConversationProps = {
  username: string;
  avatar: string;
};

function Conversation({ username, avatar }: ConversationProps) {
  const { messages, isLoading } = useChatStore((state) => state);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (isLoading) return <div className="h-full"></div>;

  if (!messages.length) {
    return <NoMessages username={username} />;
  }

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto custom-scrollbar">
      {messages.map((m) => (
        <Msg key={m.id} avatar={avatar} message={m} />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}

export default Conversation;
