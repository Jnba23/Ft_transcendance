import UserListItem from './UserListItem';
import type { User } from '@utils/types.ts';
import { useState } from 'react';

type UserListProps = {
  users: User[];
  setOpenChatUserId: (id: string) => void;
};

function UserList({ users, setOpenChatUserId }: UserListProps) {
  const [openItemId, setOpenItemId] = useState<string | null>(null); // for options menu

  return (
    <div className="flex flex-col gap-1 mt-2 ">
      {users.map(({ id, avatar, status, username }) => {
        return (
          <UserListItem
            key={id}
            username={username}
            avatarPath={avatar}
            status={status}
            hasOpenOpts={openItemId == id}
            openOptions={() =>
              setOpenItemId((prev) => (prev === id ? null : id))
            }
            openChat={() => setOpenChatUserId(id)}
          />
        );
      })}
    </div>
  );
}

export default UserList;
