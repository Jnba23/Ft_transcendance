import type { Message } from 'types/message';
import Msg from './Msg';
import NoMessages from './NoMessages';

type ConversationProps = {
  username: string,
  avatar: string;
  messages: Message[];
};

function Conversation({ username, avatar, messages }: ConversationProps) {

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
