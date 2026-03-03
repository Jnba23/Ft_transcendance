import { Conversation } from 'types/conversation';
import DMListItem from './DMListItem';
import { useState } from 'react';
import NoMatchedUser from '@ui/NoMatchedUser';
import NoConversations from './NoConversations';
import { useDirectMessagesStore } from '@stores/directMessages.store';

type DMListProps = {
  conversations: Conversation[];
  isSearching: boolean;
};

function DMList({ conversations, isSearching }: DMListProps) {
  const [openItemId, setOpenItemId] = useState<number | null>(null);
  const isLoading = useDirectMessagesStore((state) => state.isLoading);

  if (isLoading) return <div></div>;

  if (!conversations.length && !isSearching) {
    return <NoConversations />;
  }

  if (!conversations.length) {
    return <NoMatchedUser />;
  }

  return (
    <div className="overflow-y-auto custom-scrollbar mt-2">
      <div className="flex flex-col gap-1">
        {conversations.map((convo) => {
          return (
            <DMListItem
              key={convo.id}
              convo={convo}
              hasOpenOpts={openItemId === convo.id}
              openOptions={() =>
                setOpenItemId((prev) => (prev === convo.id ? null : convo.id))
              }
            />
          );
        })}
      </div>
    </div>
  );
}

export default DMList;
