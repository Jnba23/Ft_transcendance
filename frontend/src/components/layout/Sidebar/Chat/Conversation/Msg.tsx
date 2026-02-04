import type { Message } from '@utils/types.ts';
import Avatar from '@ui/Avatar';
import self from '/src/assets/boy.jpg';

type MsgProps = {
  avatar: string;
  msg: Message;
};

function Msg({ avatar, msg }: MsgProps) {
  return (
    <div
      className={`flex items-start gap-3 ${msg.isSent && 'flex-row-reverse'}`}
    >
      <Avatar path={msg.isSent ? self : avatar} section="msg" />
      <div className="flex flex-col gap-1">
        <div
          className={[
            `${msg.isSent ? 'bg-primary' : 'bg-[#1F2C4A]'}`,
            'p-3 rounded-lg rounded-tl-none',
            'text-sm max-w-md',
          ].join(' ')}
        >
          <p className="text-white/90">{msg.message}</p>
        </div>
        <span className="text-xs text-white/50 ">{msg.time}</span>
      </div>
    </div>
  );
}

export default Msg;
