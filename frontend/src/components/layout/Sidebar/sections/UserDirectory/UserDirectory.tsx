import SectionHeader from '../shared/SectionHeader';
import InputField from '@ui/InputField';
import UserList from './UserList';
import { useUserDirectoryStore } from '@stores/userDirectory.store';
import { useMemo, useState } from 'react';

type UserDirectoryProps = {
  switchSection: () => void;
};

function UserDirectory({ switchSection }: UserDirectoryProps) {
  const users = useUserDirectoryStore((state) => state.users);
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => {
    if (!query) return [];

    return users.filter(
      u => u.username.toLowerCase().includes(query.toLowerCase())
    );
  }, [query, users]);

  return (
    <div className="w-full flex-shrink-0 flex flex-col h-full min-h-0">
      <SectionHeader
        icon="close"
        label="user directory"
        switchSection={switchSection}
      />
      <InputField placeholder="Find users" icon="search" value={query} setInputVal={setQuery}/>
      <UserList users={filtered} isSearching={Boolean(query)} />
    </div>
  );
}

export default UserDirectory;
