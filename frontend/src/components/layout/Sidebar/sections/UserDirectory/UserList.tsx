import UserListItem from './UserListItem';
import type { User } from 'types/user';
import { useState } from 'react';
// remove later
import girl from '@assets/girl.jpg'
import FindConnections from './FindConnections';
import NoMatchedUser from '../shared/NoMatchedUser';

type UserListProps = {
  users: User[];
  isSearching: boolean
};

function UserList({ users, isSearching }: UserListProps) {
  const status = "online"; // remove later
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
    <div className="flex flex-col gap-1 mt-2 ">
      {users.map((u) => {
        return (
          <UserListItem
            key={u.id}
            user={u}
            avatarPath={girl}
            status={status}
            hasOpenOpts={openItemId == u.id}
            openOptions={() =>
              setOpenItemId((prev) => (prev === u.id ? null : u.id))
            }
          />
        );
      })}
    </div>
  );
}

export default UserList;
