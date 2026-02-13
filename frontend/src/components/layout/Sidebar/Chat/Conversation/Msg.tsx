import type { Message } from 'types/message';
import Avatar from '@ui/Avatar';
import self from '/src/assets/boy.jpg';

type MsgProps = {
  avatar: string;
  message: Message;
};

function Msg({ avatar, message }: MsgProps) {
  const isSent = message.sender_id == 1; // replace 1 with authed user id

  return (
    <div
      className={`flex items-start gap-3 ${isSent && 'flex-row-reverse'}`}
    >
      <Avatar path={isSent ? self : avatar} section="msg" />
      <div className="flex flex-col gap-1">
        <div
          className={[
            `${(isSent) ? 'bg-primary' : 'bg-[#1F2C4A]'}`,
            'p-3 rounded-lg rounded-tl-none',
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
