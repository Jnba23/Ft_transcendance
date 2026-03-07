import { useRef, useState, useEffect } from 'react';
import { useChatStore } from '@stores/chat.store';
import useClickOutside from '@hooks/useClickOutside';
import getTransitionClasses from '@utils/transitionStyles';
import ChatHeader from './Header/ChatHeader';
import Conversation from './Conversation/Conversation';
import ChatFooter from './Footer/ChatFooter';

function Chat() {
  const chatRef = useRef<HTMLDivElement>(null);
  const {
    closeChat,
    isOpen: isChatOpen,
    user,
  } = useChatStore((state) => state);
  const [inputValue, setInputValue] = useState('');
  const cleanHide = () => {
    closeChat();
    setInputValue('');
  };

  useClickOutside(isChatOpen, cleanHide, [chatRef]);

  useEffect(() => {
    document.body.classList.toggle("overflow-hidden", isChatOpen);
  }, [isChatOpen]);

  return (
    <>
      <div
        className={[
          `${getTransitionClasses(isChatOpen, 'overlay')}`,
          'transition-opacity',
          'fixed inset-0 bg-black/50 z-[70] touch-none ',
        ].join(' ')}
      ></div>

      <div
        className={[
          `${getTransitionClasses(isChatOpen, 'chat')}`,
          'bg-[#16213E] rounded-xl',
          'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
          'z-[70] md:w-[700px] md:h-[550px]',
          'h-140 w-110',
          'flex flex-col shadow-2x1 border border-white/10',
        ].join(' ')}
        ref={chatRef}
      >
        <ChatHeader user={user!} hide={cleanHide} />
        <Conversation username={user?.username} userId={user?.id} />
        <ChatFooter inputValue={inputValue} setInputValue={setInputValue} />
      </div>
    </>
  );
}

export default Chat;
