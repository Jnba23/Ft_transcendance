import Avatar from '@ui/Avatar';
import { useUserDirectoryStore } from '@stores/userDirectory.store';

type StatusStyle = {
  online: string;
  offline: string;
};

const statusStyle = {
  online: 'bg-win border border-[#16213E]/50',
  offline: 'bg-gray-500 border border-[#16213E]',
} satisfies StatusStyle;

export type SectionSizes = {
  DM: string;
  chat: string;
  friendRequest: string;
  history: string;
};

const sectionSizes = {
  DM: 'text-xs',
  chat: 'text-base',
  friendRequest: 'text-sm',
  history: 'text-sm font-medium'
} satisfies SectionSizes;

type UserBadgeProps = {
  id?: number;
  username: string;
  status?: keyof StatusStyle;
  section: keyof SectionSizes;
  toCols?: boolean
};

function UserBadge({ id, username, status, section, toCols=false }: UserBadgeProps) {
  const me = useUserDirectoryStore((state) => state.me);

  status = id === me?.id ? 'online' : status;

  return (
    <div className={[
      `${toCols ? 'gap-2 md:gap-3' : 'gap-3'}`,
      'flex items-center',
      `${toCols ? 'flex-col md:flex-row' : ''}`
    ].join(' ')}>
      <div className="relative flex items-center">
        <Avatar userId={id} section={section} size={toCols ? 'size-15 md:size-10' : ''}/>
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
          'text-white truncate',
          `${sectionSizes[section]}`,
          'tracking-wider',
          `${toCols ? 'font-bold text-lg md:font-medium' : 'font-medium'}`,
        ].join(' ')}
      >
        {username === me?.username ? `${username} (You)` : username}
      </span>
    </div>
  );
}

export default UserBadge;
