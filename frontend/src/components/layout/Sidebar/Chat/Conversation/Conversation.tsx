import type { Message } from 'types/message';
import Msg from './Msg';
import { measureMemory } from 'node:vm';
type ConversationProps = {
  avatar: string;
  messages: Message[];
};

function Conversation({ avatar, messages }: ConversationProps) {
  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto custom-scrollbar">
      {messages.map((m) => (
        <Msg key={m.id} avatar={avatar} message={m} />
      ))}
    </div>
  );
}

export default Conversation;
