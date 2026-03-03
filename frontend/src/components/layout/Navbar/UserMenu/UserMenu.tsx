import { useRef } from 'react';
import useClickOutside from '@hooks/useClickOutside';
import UserMenuItem from './UserMenuItem';
import getTransitionClasses from '@utils/transitionStyles';
import { useAuth } from '@context/AuthContext';

type HeaderMenuProps = {
  isOpen: boolean;
  hide: () => void;
  buttonRef: React.RefObject<HTMLButtonElement | null>;
}

function UserMenu({ isOpen, hide, buttonRef }: HeaderMenuProps) {
  const userMenuRef = useRef<HTMLDivElement>(null);

  const { logout, user } = useAuth();
  const handleLogout = async () => {
    await logout();
  };

  useClickOutside(isOpen, hide, [buttonRef, userMenuRef]);

  return (
    <div
      className={[
        `${getTransitionClasses(isOpen, 'navbar')}`,
        'rounded-lg shadow-lg mt-2',
        'bg-[#1F2C4A] border border-white/10',
        'absolute w-48 right-0 z-[40]',
      ].join(' ')}
      ref={userMenuRef}
    >
      <div className="p-1">
        <UserMenuItem
          icon="person"
          label="Profile"
          path={`/profile/${user?.id}`}
          onClick={hide}
        />
        <UserMenuItem
          icon="settings"
          label="Settings"
          path="/settings"
          onClick={hide}
        />
        <div className="my-1 h-px bg-white/10"></div>
        <UserMenuItem
          icon="logout"
          label="Logout"
          color="red"
          path="/login"
          onClick={handleLogout}
        />
      </div>
    </div>
  );
}

export default UserMenu;
