import { useRef, useState } from 'react';
import NotificationsBtn from './Notifications/NotificationsBtn';
import NotificationsMenu from './Notifications/NotificationsMenu';
import UserMenuBtn from './UserMenu/UserMenuBtn';
import UserMenu from './UserMenu/UserMenu';

function Navbar() {
  const [isNotifsOpen, setIsNotifsOpen] = useState(false);
  const [isUserOpen, setIsUserOpen] = useState(false);

  const notifsMenu = {
    isOpen: isNotifsOpen,
    toggle: () => setIsNotifsOpen(!isNotifsOpen),
    hide: () => setIsNotifsOpen(false),
    buttonRef: useRef<HTMLButtonElement>(null),
  };

  const userMenu = {
    isOpen: isUserOpen,
    toggle: () => setIsUserOpen(!isUserOpen),
    hide: () => setIsUserOpen(false),
    buttonRef: useRef<HTMLButtonElement>(null),
  };

  return (
    <header className="flex gap-3 items-center justify-end">
      <div className='relative'>
        <NotificationsBtn
          onClick={notifsMenu.toggle}
          buttonRef={notifsMenu.buttonRef}
        />
        <NotificationsMenu {...notifsMenu}/>
      </div>

      <div className="relative">
        <UserMenuBtn
          isOpen={userMenu.isOpen}
          onClick={userMenu.toggle}
          buttonRef={userMenu.buttonRef}
        />
        <UserMenu {...userMenu}/>
      </div>
    </header>
  );
}

export default Navbar;