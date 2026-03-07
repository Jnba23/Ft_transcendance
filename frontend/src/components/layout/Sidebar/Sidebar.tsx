import Navigation from './Navigation/Navigation';
import DirectMessages from './sections/DirectMessages/DirectMessages';
import UserDirectory from './sections/UserDirectory/UserDirectory';
import Chat from './Chat/Chat';
import { useState } from 'react';
import { Link } from 'react-router-dom';

function Sidebar() {
  const [isDMOpen, setIsDMOpen] = useState(true);
  const switchSection = () => setIsDMOpen(!isDMOpen);

  return (
    <aside
      className={[
        'w-64 pt-4 px-4 pb-16', // Adjust padding for absolute footer
        'bg-[#16213E]/30',
        'border-r border-white/10',
        'relative',
      ].join(' ')}
    >
      <div className="flex flex-col gap-8 h-full">
        <Navigation />
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

      <div className="absolute bottom-0 left-0 w-full p-4 flex justify-center gap-4 text-xs font-medium text-white/50 border-t border-white/10 bg-[#16213E]/30">
        <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
        <span>&bull;</span>
        <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
      </div>
    </aside>
  );
}

export default Sidebar;
