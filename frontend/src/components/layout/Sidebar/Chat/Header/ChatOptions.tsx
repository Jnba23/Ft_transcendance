import { useRef } from 'react';
import getTransitionClasses from '@utils/transitionStyles';
import ChatOptsItem from './ChatOptsItem';
import useClickOutside from '@hooks/useClickOutside';
import { useNavigate } from 'react-router-dom';

type ChatOptionsProps = {
  isOpen: boolean;
  hide: () => void;
  hideChat: () => void
  user_id: number,
  isFriend?: boolean;
  btnRef: React.RefObject<HTMLButtonElement | null>;
};

function ChatOptions({ isOpen, hide, hideChat,user_id, isFriend, btnRef }: ChatOptionsProps) {
  const optsRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const toProfile = () => {
    hideChat();
    navigate(`/profile/${user_id}`);
  }

  useClickOutside(isOpen, hide, [optsRef, btnRef]);

  return (
    <div
      className={[
        `${getTransitionClasses(isOpen, 'navbar')}`,
        'p-2 border border-white/10 rounded-lg',
        'bg-[#1F2C4A] shadow-lg ',
        'absolute top-full right-0 mt-2 w-56',
      ].join(' ')}
      ref={optsRef}
    >
      <ChatOptsItem icon="visibility" label="View Profile" onClick={toProfile}/>
      {isFriend && (
        <ChatOptsItem icon="sports_esports" label="Send Game Request" />
      )}
    </div>
  );
}

export default ChatOptions;
