import UserListItem from './UserListItem';
import { useState } from 'react';
import FindConnections from './FindConnections';
import NoMatchedUser from '@ui/NoMatchedUser';
import { UserSummaryRes } from '@api/user.api';

type UserListProps = {
  users: UserSummaryRes[];
  isSearching: boolean
};

function UserList({ users, isSearching }: UserListProps) {
  const [openItemId, setOpenItemId] = useState<number | null>(null); // for options menu

  if (!users.length && !isSearching) {
    return (
      <FindConnections />
    );
  }

  if (!users.length) {
    return (
        <NoMatchedUser />
    );
  }

  return (
    <div className='overflow-y-auto custom-scrollbar mt-2'>
      <div className="flex flex-col gap-1">
        {users.map((u) => {
          return (
            <UserListItem
              key={u.id}
              user={u}
              hasOpenOpts={openItemId == u.id}
              openOptions={() =>
                setOpenItemId((prev) => (prev === u.id ? null : u.id))
              }
            />
          );
        })}
      </div>
    </div>
  );
}

export default UserList;
