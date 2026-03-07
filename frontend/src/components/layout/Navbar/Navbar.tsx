import { useRef, useState } from 'react';
import UserMenuBtn from './UserMenu/UserMenuBtn';
import UserMenu from './UserMenu/UserMenu';
import SidebarMenu from './SidebarMenu/SidebarMenu';
import getTransitionClasses from '@utils/transitionStyles';
import { useLayoutStore } from '@stores/layout.store';

function Navbar() {
  const [isUserOpen, setIsUserOpen] = useState(false);
  const isNavbarOpen = useLayoutStore((state) => state.isNavbarShown);

  const userMenu = {
    isOpen: isUserOpen,
    toggle: () => setIsUserOpen(!isUserOpen),
    hide: () => setIsUserOpen(false),
    buttonRef: useRef<HTMLButtonElement>(null),
  };

  return (
    <header className={[
      `${getTransitionClasses(isNavbarOpen, 'navbar')}`,
      "flex gap-3 items-center justify-between",
      "md:justify-end mb-8"
    ].join(' ')}>
      <SidebarMenu />
      <div className="relative">
        <UserMenuBtn
          isOpen={userMenu.isOpen}
          onClick={userMenu.toggle}
          buttonRef={userMenu.buttonRef}
        />
        <UserMenu {...userMenu} />
      </div>
    </header>
  );
}

export default Navbar;
