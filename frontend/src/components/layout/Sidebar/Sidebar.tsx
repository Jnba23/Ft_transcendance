import Navigation from './Navigation/Navigation';
import DirectMessages from './sections/DirectMessages';
import UserDirectory from './sections/UserDirectory';
import Chat from './Chat/Chat';
import { useState } from 'react';
import { users } from '@utils/data';

function Sidebar() {
  const [isDMOpen, setIsDMOpen] = useState(true);
  const switchSection = () => setIsDMOpen(!isDMOpen);

  const [openChatId, setOpenChatId] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const setOpenChatUserId = (id: string) => {
    setOpenChatId(id);
    setIsChatOpen(true);
  };
  const hideChat = () => setIsChatOpen(false);
  const openChatUser =
    users.find((user) => user.id == openChatId) ?? users[users.length - 1];

  return (
    <aside
      className={[
        'w-64 p-4',
        'bg-[#16213E]/30',
        'border-r border-white/10',
      ].join(' ')}
    >
      <div className="flex flex-col gap-8">
        <Navigation />
        <div className="overflow-hidden">
          <div
            className={[
              `${!isDMOpen && 'transform-[translateX(-100%)]'}`,
              'flex transition-[transform] duration-300',
            ].join(' ')}
          >
            <DirectMessages
              users={users} // send interacted with only
              switchSection={switchSection}
              setOpenChatUserId={setOpenChatUserId}
            />
            <UserDirectory // send all
              users={users}
              switchSection={switchSection}
              setOpenChatUserId={setOpenChatUserId}
            />
          </div>
        </div>
      </div>
      <Chat isOpen={isChatOpen} user={openChatUser!} hide={hideChat} />
    </aside>
  );
}

export default Sidebar;
