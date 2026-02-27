import { useRef } from 'react';
import useClickOutside from '@hooks/useClickOutside';
import type { headerMenuProps } from '@utils/types';
import UserMenuItem from './UserMenuItem';
import getTransitionClasses from '@utils/transitionStyles';
import { useAuth } from '../../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function UserMenu({ isOpen, hide, buttonRef }: headerMenuProps) {
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useClickOutside(isOpen, hide, [buttonRef, userMenuRef]);

  const handleLogout = async () => {
    await logout();
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    hide();
  };

  return (
    <div
      className={[
        `${getTransitionClasses(isOpen, 'navbar')}`,
        'rounded-lg shadow-lg mt-2',
        'bg-[#1F2C4A] border border-white/10',
        'absolute w-48 right-0',
      ].join(' ')}
      ref={userMenuRef}
    >
      <div className="p-1">
        <UserMenuItem
          icon="person"
          label="Profile"
          onClick={() => handleNavigation('/profile')}
        />
        <UserMenuItem
          icon="settings"
          label="Settings"
          onClick={() => handleNavigation('/settings')}
        />
        <div className="my-1 h-px bg-white/10"></div>
        <UserMenuItem
          icon="logout"
          label="Logout"
          color="red"
          onClick={handleLogout}
        />
      </div>
    </div>
  );
}

export default UserMenu;
