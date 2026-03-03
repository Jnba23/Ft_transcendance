import Avatar from '@ui/Avatar';
import type { StatusStyle } from '@utils/types.ts';
import { useUserDirectoryStore } from '@stores/userDirectory.store';

const statusStyle = {
  online: 'bg-win border border-[#16213E]/50',
  offline: 'bg-gray-500 border border-[#16213E]',
} satisfies StatusStyle;

export type SectionSizes = {
  DM: string;
  chat: string;
  friendRequest: string;
};

const sectionSizes = {
  DM: 'text-xs',
  chat: 'text-base',
  friendRequest: 'text-sm',
} satisfies SectionSizes;

type UserBadgeProps = {
  id?: number;
  username: string;
  avatar: string;
  status?: keyof StatusStyle;
  section: keyof SectionSizes;
};

function UserBadge({ id, username, avatar, status, section }: UserBadgeProps) {
  const me = useUserDirectoryStore((state) => state.me);

  status = id === me?.id ? 'online' : status;

  return (
    <div className="flex gap-3 items-center ">
      <div className="relative flex items-center">
        <Avatar path={avatar} section={section} />
        <span
          className={[
            'size-2.5 rounded-full',
            `${status ? statusStyle[status] : 'hidden'}`,
            'absolute right-0 bottom-0',
          ].join(' ')}
        ></span>
      </div>
      <span
        className={[
          'text-white',
          `${sectionSizes[section]}`,
          'font-medium',
          'tracking-wider',
        ].join(' ')}
      >
        {username === me?.username ? `${username} (You)` : username}
      </span>
    </div>
  );
}

export default UserBadge;
