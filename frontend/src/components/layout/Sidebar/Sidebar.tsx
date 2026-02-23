import Navigation from './Navigation/Navigation';
import DirectMessages from './sections/DirectMessages/DirectMessages';
import UserDirectory from './sections/UserDirectory/UserDirectory';
import Chat from './Chat/Chat';
import { useState } from 'react';

function Sidebar() {
  const [isDMOpen, setIsDMOpen] = useState(true);
  const switchSection = () => setIsDMOpen(!isDMOpen);

  return (
    <aside
      className={[
        'w-64 p-4',
        'bg-[#16213E]/30',
        'border-r border-white/10',
      ].join(' ')}
    >
      <div className="flex flex-col gap-8 h-full">
        <Navigation />
        <div className="overflow-hidden min-h-0">
          <div
            className={[
              `${!isDMOpen && 'transform-[translateX(-100%)]'}`,
              'flex transition-[transform] duration-300',
              'h-full'
            ].join(' ')}
          >
            <DirectMessages
              switchSection={switchSection}
            />
            <UserDirectory
              switchSection={switchSection}
            />
          </div>
        </div>
      </div>
      <Chat />
    </aside>
  );
}

export default Sidebar;
