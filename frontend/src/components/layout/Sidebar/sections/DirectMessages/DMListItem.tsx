import { Conversation } from 'types/conversation';
import UserBadge from '@components/ui/UserBadge';
import UserOptions from '../shared/UserOptions';
import { useChatStore } from '@stores/chat.store';
import { useRef } from 'react';
import { useDirectMessagesStore } from '@stores/directMessages.store';
import { useLayoutStore } from '@stores/layout.store';

type DMListItemProps = {
  convo: Conversation;
  hasOpenOpts: boolean;
  openOptions: () => void;
};

function DMListItem({ convo, hasOpenOpts, openOptions }: DMListItemProps) {
  const isConvoRead = !convo.unread_count;
  const optsBtnRef = useRef<HTMLButtonElement | null>(null);
  const replaceConversation = useDirectMessagesStore(
    (state) => state.replaceConversation
  );

  const openChat = useChatStore((state) => state.openChat);
  const update = useChatStore((state) => state.update);
  const hideSidebar = useLayoutStore((state) => state.hideSidebar);
  const updateChat = (e: React.MouseEvent<HTMLDivElement>) => {
    const isOptsBtnClick = optsBtnRef.current?.contains(e.target as Node);

    if (isOptsBtnClick) return;

    const markConvoRead = (convo: Conversation) => {
      convo.unread_count = 0;
      replaceConversation(convo);
    };

    hideSidebar();
    openChat();
    update(convo, convo.user, markConvoRead);
  };

  return (
    <div
      className={[
        `${!hasOpenOpts ? 'hover:bg-white/5' : 'bg-white/10'}`,
        'flex flex-col rounded-lg cursor-pointer',
        'trasition-[background-color] duration-300',
        'overflow-hidden',
      ].join(' ')}
    >
      <div
        className={`${isConvoRead ? 'p-2' : 'p-2 bg-primary/20 border-l-2 border-primary'}`}
        onClick={updateChat}
      >
        <div className="flex items-center justify-between">
          <UserBadge {...convo.user} section="DM" />
          <button
            className={[
              'p-1 rounded-md transition-colors',
              'text-white/40',
              'hover:text-white hover:bg-white/10',
            ].join(' ')}
            onClick={openOptions}
            ref={optsBtnRef}
          >
            <span className="material-symbols-outlined !text-base">
              more_vert
            </span>
          </button>
        </div>
      </div>
      <UserOptions
        isOpen={hasOpenOpts}
        user_id={convo.user.id}
        hasFriendRequest={!!convo.user.hasFriendRequest}
      />
    </div>
  );
}

export default DMListItem;
