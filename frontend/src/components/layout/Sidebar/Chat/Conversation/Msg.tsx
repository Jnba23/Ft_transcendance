import type { Message } from 'types/message';
import Avatar from '@ui/Avatar';
import { useUserDirectoryStore } from '@stores/userDirectory.store';

type MsgProps = {
  userId?: number;
  message: Message;
};

function Msg({ userId, message }: MsgProps) {
  const me = useUserDirectoryStore((state) => state.me);
  const isSent = message.sender_id === me?.id;

  return (
    <div className={`flex items-start gap-3 ${isSent && 'flex-row-reverse'}`}>
      <Avatar userId={isSent ? me.id : userId} section="msg" />
      <div className="flex flex-col gap-1">
        <div
          className={[
            `${isSent ? 'bg-primary rounded-tr-none' : 'bg-[#1F2C4A] rounded-tl-none'}`,
            'p-3 rounded-lg wrap-break-word',
            'text-sm max-w-md',
          ].join(' ')}
        >
          <p className="text-white/90">{message.content}</p>
        </div>
        <span className="text-xs text-white/50 ">{message.sent_at}</span>
      </div>
    </div>
  );
}

export default Msg;
