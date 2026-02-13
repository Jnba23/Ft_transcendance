import { Conversation } from "types/conversation";
import UserBadge from "@components/ui/UserBadge";
import UserOptions from "../shared/UserOptions";
import girl from '@assets/girl.jpg';
import { useChatStore } from "@stores/chat.store";
import { useRef, useState } from "react";

type DMListItemProps  = {
  convo: Conversation,
	openChat: () => void,
  hasOpenOpts: boolean,
  openOptions: () => void
}

function DMListItem({
  convo,
  openChat,
  hasOpenOpts,
  openOptions
}: DMListItemProps) {

  const [isConvoRead, setIsConvoRead] = useState(!convo.unread_count);
  const markConvoRead = () => setIsConvoRead(true);

	const status = "online"; //remove later
  const optsBtnRef = useRef<HTMLButtonElement | null>(null);

  const update = useChatStore((state) => state.update);
  const updateChat = (e: React.MouseEvent<HTMLDivElement>) => {
    const isOptsBtnClick = optsBtnRef.current?.contains(e.target as Node);

    if (isOptsBtnClick) return;
  
    openChat();
    update(convo, markConvoRead);
  }

	return (
	  <div
      className={[
        `${isConvoRead ? 'hover:bg-white/5' : 'bg-white/10'}`,
        'flex flex-col rounded-lg cursor-pointer',
        'trasition-[background-color] duration-300',
        'overflow-hidden'
      ].join(' ')}
    >
      <div
        className={`${isConvoRead ? 'p-2' :  'p-2 bg-primary/20 border-l-2 border-primary'}`}
        onClick={updateChat}
        >
        <div className="flex items-center justify-between">
          <UserBadge
            username={convo.user.username}
            avatar={girl}
            status={status}
            section="DM"
          />
          <button
            className={[
              'p-1 rounded-md transition-colors',
              'text-white/40',
              'hover:text-white hover:bg-white/10',
            ].join(' ')}
            onClick={() => true && openOptions()}
            ref={optsBtnRef}
          >
            <span className="material-symbols-outlined !text-base">
              more_vert
            </span>
          </button>
        </div>
      </div>
      <UserOptions isOpen={hasOpenOpts} user_id={convo.user.id}/>
    </div>
	);
}

export default DMListItem;