import Msg from './Msg';
import NoMessages from './NoMessages';
import { useRef } from 'react';
import { useChatStore } from '@stores/chat.store';

type ConversationProps = {
  username: string,
  avatar: string;
};

function Conversation({ username, avatar }: ConversationProps) {
  const {messages} = useChatStore((state) => state);

  if (!messages.length) {
    return (
      <NoMessages username={username} />
    )
  }

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto custom-scrollbar">
      {messages.map((m) => (
        <Msg key={m.id} avatar={avatar} message={m} />
      ))}
    </div>
  );
}

export default Conversation;
