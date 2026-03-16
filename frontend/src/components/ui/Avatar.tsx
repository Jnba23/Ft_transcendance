// add [secion_name: section_size_utility_class] mapping for
// the section where you wish to use this component

import { useEffect, useState } from 'react';
import { useErrorStore } from '@stores/error.store';
import { userAPI } from '@api/user.api';

type SectionSizes = {
  // section_name: string
  userMenu: string;
  DM: string;
  chat: string;
  msg: string;
  friendRequest: string;
  profile: string;
  friends: string;
  history: string;
};

const sectionSizes = {
  // section_name: section_size
  userMenu: 'size-8',
  DM: 'size-8',
  chat: 'size-10',
  msg: 'size-8',
  friendRequest: 'size-10',
  profile: 'size-32',
  friends: 'size-8',
  history: 'size-8',
} satisfies SectionSizes;

type AvatarProps = {
  userId?: number;
  section: keyof SectionSizes;
  size?: string;
};

function Avatar({ userId, section = 'userMenu', size }: AvatarProps) {
  const showError = useErrorStore((state) => state.showError);
  const [avatarUrl, setAvatarUrl] = useState('');

  useEffect(() => {
    if (!userId) return;

    let objectUrl = '';
    const fetchAvatarUrl = async () => {
      try {
        objectUrl = await userAPI.getAvatar(userId);
        setAvatarUrl(objectUrl);
      } catch {
        showError('Failed to fetch avatar url');
      }
    };

    fetchAvatarUrl();

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [userId, showError]);

  return (
    <div
      className={[
        `${size || sectionSizes[section]}`,
        'rounded-full',
        'overflow-hidden',
        'aspect-square',
        !avatarUrl ? 'bg-white/10 flex items-center justify-center' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt="User avatar"
          className="w-full h-full object-cover"
        />
      ) : (
        <span
          className="material-symbols-outlined text-white/50"
          style={{ fontSize: '1.2rem' }}
        >
          person
        </span>
      )}
    </div>
  );
}

export default Avatar;
