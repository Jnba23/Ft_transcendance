import type { StatusStyle } from '@utils/types.ts';
import UserBadge from '@ui/UserBadge';
import UserOptions from '../shared/UserOptions';
import { useRef } from 'react';
import { User } from 'types/user';
import { useChatStore } from '@stores/chat.store';
import { useDirectMessagesStore } from '@stores/directMessages.store';
import { Conversation } from 'types/conversation';

type UserListItemProps = {
  user: User,
  avatarPath: string;
  status: keyof StatusStyle;
  hasOpenOpts: boolean;
  openOptions: () => void;
};

function UserListItem({
  user,
  avatarPath,
  status,
  hasOpenOpts,
  openOptions,
}: UserListItemProps) {
  const optsBtnRef = useRef<HTMLButtonElement | null>(null);
  
  const getConversationByUserId = useDirectMessagesStore((state) =>
    state.getConversationByUserId
  );
  const replaceConversation = useDirectMessagesStore((state) =>
    state.replaceConversation
  );

  const openChat = useChatStore((state) => state.openChat);
  const update = useChatStore((state) => state.update);
  const updateChat = (e: React.MouseEvent<HTMLDivElement>) => {
    const isOptsBtnClick = optsBtnRef.current?.contains(e.target as Node);

    if (isOptsBtnClick) return;
  
    const convo = getConversationByUserId(user.id);

    const markConvoRead = (convo: Conversation) => {
      convo.unread_count = 0;
      replaceConversation(convo);
    }

    openChat();
    update(convo ?? null, user, markConvoRead);
  }

  return (
    <div
      className={[
        `${hasOpenOpts ? 'bg-white/10' : 'hover:bg-white/5'}`,
        'flex flex-col rounded-lg cursor-pointer',
        'trasition-[background-color] duration-300',
      ].join(' ')}
    >
      <div className="p-2" onClick={updateChat}>
        <div className="flex items-center justify-between">
          <UserBadge
            username={user.username}
            avatar={avatarPath}
            status={status}
            section="DM"
          />
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
      <UserOptions isOpen={hasOpenOpts} user_id={user.id}/>
    </div>
  );
}

export default UserListItem;
