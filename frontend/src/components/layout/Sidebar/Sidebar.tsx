import Navigation from './Navigation/Navigation';
import DirectMessages from './sections/DirectMessages/DirectMessages';
import UserDirectory from './sections/UserDirectory/UserDirectory';
import Chat from './Chat/Chat';
import { useRef, useState } from 'react';
import getTransitionClasses from '@utils/transitionStyles';
import useClickOutside from '@hooks/useClickOutside';
import { useLayoutStore } from '@stores/layout.store';

function Sidebar() {
  const ref = useRef<HTMLElement>(null);
  const {isSidebarShown, hideSidebar} = useLayoutStore((state) => state);
  const [isDMOpen, setIsDMOpen] = useState(true);
  const switchSection = () => setIsDMOpen(!isDMOpen);

  useClickOutside(isSidebarShown, hideSidebar, [ref]);

  return (
    <aside
      className={[
        `${getTransitionClasses(isSidebarShown, 'sidebar')}`,
        'w-64 p-4 md:block',
        'bg-[#16213E] md:bg-[#16213E]/30',
        'border-r border-white/10',
        'fixed inset-y-0 left-0 z-60',
        'md:static md:translate-x-0',
    ].join(' ')} ref={ref}>
      <div className="flex flex-col gap-8 h-full">
        <Navigation/>
        <div className="overflow-hidden min-h-0">
          <div
            className={[
              `${!isDMOpen && 'transform-[translateX(-100%)]'}`,
              'flex transition-[transform] duration-300',
              'h-full',
            ].join(' ')}
          >
            <DirectMessages switchSection={switchSection} />
            <UserDirectory switchSection={switchSection} />
          </div>
        </div>
      </div>
      <Chat />
    </aside>
  );
}

export default Sidebar;
