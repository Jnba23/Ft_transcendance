import { useMemo, useRef, useState } from 'react';
import FriendsHeader from './FriendsHeader';
import InputField from '@components/ui/InputField';
import FriendsList from './FriendsList/FriendsList';
import { useFriendsStore } from '@stores/Friends.store';
import useClickOutside from '@hooks/useClickOutside';
import getTransitionClasses from '@utils/transitionStyles';
import ConfirmationModal from './ConfirmationModal';

type FriendsProps = {
  btnRef: React.RefObject<HTMLButtonElement | null>;
};

function Friends({ btnRef }: FriendsProps) {
  const friendsRef = useRef<HTMLDivElement>(null);
  const { isOpen, friends, hide, isConfirmOpen } = useFriendsStore(
    (state) => state
  );
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => {
    if (!query) return friends;

    return friends.filter((u) =>
      u.username.toLowerCase().includes(query.toLowerCase())
    );
  }, [query, friends]);

  useClickOutside(isOpen && !isConfirmOpen, hide, [btnRef, friendsRef]);

  return (
    <>
      <div
        className={[
          `${getTransitionClasses(isOpen, 'friends')}`,
          'bg-[#1F2C4A] md:w-80 w-70 absolute md:right-0 mt-3',
          'rounded-xl top-full border border-white/10',
          'shadow-2xl right-1/2 translate-x-1/2',
          'md:right-0 md:translate-x-0 z-[60]',
        ].join(' ')}
        ref={friendsRef}
      >
        <div className="p-4 flex flex-col border-b border-white/10 gap-4">
          <FriendsHeader />
          <InputField
            placeholder="Search friends"
            icon="search"
            value={query}
            setInputVal={setQuery}
          />
        </div>
        <FriendsList friends={filtered} isSearching={!!query.length} />
      </div>
      <ConfirmationModal />
    </>
  );
}

export default Friends;
