import { useRef } from 'react';
import getTransitionClasses from '@utils/transitionStyles';
import ChatOptsItem from './ChatOptsItem';
import useClickOutside from '@hooks/useClickOutside';
import { useNavigate } from 'react-router-dom';
import { useUserDirectoryStore } from '@stores/userDirectory.store';
import { useFriendRequestsStore } from '@stores/friendRequests.store';

type ChatOptionsProps = {
  isOpen: boolean;
  hide: () => void;
  hideChat: () => void
  user_id: number,
  hasFriendRequest: boolean | null,
  btnRef: React.RefObject<HTMLButtonElement | null>;
};

function ChatOptions({ isOpen, hide, hideChat, user_id, hasFriendRequest, btnRef }: ChatOptionsProps) {
  const me = useUserDirectoryStore((state) => state.me);
  const showAddFriend = !hasFriendRequest && user_id !== me?.id;
  const optsRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const toProfile = () => {
    hideChat();
    navigate(`/profile/${user_id}`);
  }
  const sendRequest = useFriendRequestsStore((state) => state.sendRequest);
  const sendFriendRequest = () => {
    sendRequest(user_id);
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
      {showAddFriend && (
        <ChatOptsItem icon="person_add" label="Send Friend Request" onClick={sendFriendRequest}/>
      )}
    </div>
  );
}

export default ChatOptions;
