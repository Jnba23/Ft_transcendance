import type { Message } from '@utils/types.ts';
import Msg from './Msg';
type ConversationProps = {
  avatar: string;
  messages: Message[];
};

function Conversation({ avatar, messages }: ConversationProps) {
  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto custom-scrollbar">
      {messages.map((msg) => (
        <Msg key={msg.id} avatar={avatar} msg={msg} />
      ))}
    </div>
  );
}

export default Conversation;
