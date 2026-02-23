import SectionHeader from '../shared/SectionHeader';
import InputField from '@ui/InputField';
import DMList from './DMList';
import { useDirectMessagesStore } from '@stores/directMessages.store';
import { useMemo, useState } from 'react';

type DirectMessagesProps = {
  switchSection: () => void;
};

function DirectMessages({ switchSection }: DirectMessagesProps) {

  const [query, setQuery] = useState('');
  const setInput = (value: string) => setQuery(value);

  const conversations = useDirectMessagesStore((state) => state.conversations);
  const filtered = useMemo(() => {
    if (!query) return conversations;

    return conversations.filter(
      c => c.user.username.toLowerCase().includes(query.toLowerCase())
    );
  }, [query, conversations]);

  return (
    <div className="w-full flex-shrink-0 flex flex-col h-full min-h-0">
      <SectionHeader
        icon="person_search"
        label="direct messages"
        switchSection={switchSection}
      />
      <InputField placeholder="Find a friend" icon="search" value={query} setInputVal={setInput}/>
      <DMList conversations={filtered} isSearching={Boolean(query)} />
    </div>
  );
}

export default DirectMessages;
