import { useRef, useState } from 'react';
import UserBadge from '@ui/UserBadge';
import HeaderBtn from './HeaderBtn';
import ChatOptions from './ChatOptions';
import { UserSummaryRes } from '@api/user.api';
// remove later
import girl from '@assets/girl.jpg';

type ChatHeaderProps = {
  user: UserSummaryRes;
  hide: () => void;
};

function ChatHeader({ user, hide }: ChatHeaderProps) {
  const optsBtnRef = useRef<HTMLButtonElement>(null);
  const [isChatOptsOpen, setIsChatOptsOpen] = useState(false);
  const toggleChatOpts = () => setIsChatOptsOpen(!isChatOptsOpen);
  const hideChatOpts = () => setIsChatOptsOpen(false);

  return (
    <header className="flex justify-between p-4 border-b border-white/10">
      <UserBadge {...user} avatar={girl} section="chat" />
      <div className="flex gap-2">
        <div className="relative">
          <HeaderBtn
            icon="more_vert"
            onClick={toggleChatOpts}
            btnRef={optsBtnRef}
          />
          <ChatOptions
            isOpen={isChatOptsOpen}
            hide={hideChatOpts}
            hideChat={hide}
            user_id={user?.id}
            hasFriendRequest={!!user?.hasFriendRequest}
            btnRef={optsBtnRef}
          />
        </div>
        <HeaderBtn icon="close" onClick={hide} />
      </div>
    </header>
  );
}

export default ChatHeader;
