import { useRef, useState } from 'react';
import { useChatStore } from '@stores/chat.store';
import useClickOutside from '@hooks/useClickOutside';
import getTransitionClasses from '@utils/transitionStyles';
import ChatHeader from './Header/ChatHeader';
import Conversation from './Conversation/Conversation';
import ChatFooter from './Footer/ChatFooter';
//remove later
import girl from '@assets/girl.jpg'

function Chat() {
  const chatRef = useRef<HTMLDivElement>(null);
  const {closeChat, isOpen: isChatOpen, user} = useChatStore((state) => state);
  const [inputValue, setInputValue] = useState('');
  const cleanHide = () => {
    closeChat();
    setInputValue('');
  }

  useClickOutside(isChatOpen, cleanHide, [chatRef]);

  return (
    <>
      <div
        className={[
          `${getTransitionClasses(isChatOpen, 'overlay')}`,
          'transition-opacity',
          'fixed inset-0 bg-black/50 z-[40] touch-none ',
        ].join(' ')}
      ></div>

      <div
        className={[
          `${getTransitionClasses(isChatOpen, 'chat')}`,
          'bg-[#16213E] rounded-xl',
          'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
          'z-[50] w-[700px] h-[550px]',
          'flex flex-col shadow-2x1 border border-white/10',
        ].join(' ')}
        ref={chatRef}
      >
        <ChatHeader user={user!} hide={cleanHide} />
        <Conversation username={user?.username!} avatar={girl}/>
        <ChatFooter inputValue={inputValue} setInputValue={setInputValue}/>
      </div>
    </>
  );
}

export default Chat;
