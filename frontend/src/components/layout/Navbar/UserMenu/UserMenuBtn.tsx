import { useEffect, useState } from 'react';
import Avatar from '@ui/Avatar';
import { useAuth } from '../../../../context/AuthContext';
import { userAPI } from '../../../../api/user.api';

type UserMenuBtnProps = {
  isOpen: boolean;
  onClick: () => void;
  buttonRef: React.RefObject<HTMLButtonElement | null>;
};

function UserMenuBtn({ isOpen, onClick: toggle, buttonRef }: UserMenuBtnProps) {
  const { user } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState<string>(user?.avatar_url || '');

  useEffect(() => {
    let objectUrl = '';

    const fetchAvatar = async () => {
      // Only fetch if the user has a real avatar_url stored in the DB
      if (user?.id && user?.avatar_url && user.avatar_url.trim() !== '') {
        try {
          const url = await userAPI.getAvatar(user.id);
          setAvatarUrl(url);
          objectUrl = url;
        } catch (error) {
          console.error('Failed to load user avatar:', error);
          setAvatarUrl('');
        }
      } else {
        setAvatarUrl('');
      }
    };

    fetchAvatar();

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [user?.id, user?.avatar_url]);

  return (
    <button
      className={[
        'flex items-center gap-3',
        'bg-[#16213E]/50 rounded-full',
        'border border-white/10',
        'p-1 pr-4 hover:bg-white/10',
        'transition-[background-color]',
      ].join(' ')}
      onClick={toggle}
      ref={buttonRef}
    >
      <Avatar path={avatarUrl} section="userMenu" />
      <div className="flex items-center gap-1">
        <span className="text-white text-sm font-medium">{user?.username}</span>
        <span
          className={[
            `${isOpen && 'rotate-180'}`,
            'material-symbols-outlined',
            'text-white/70',
            'transition-transform',
          ].join(' ')}
        >
          expand_more
        </span>
      </div>
    </button>
  );
}

export default UserMenuBtn;
