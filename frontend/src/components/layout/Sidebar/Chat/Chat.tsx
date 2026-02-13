import { useRef } from 'react';
import { useChatStore } from '@stores/chat.store';
import useClickOutside from '@hooks/useClickOutside';
import getTransitionClasses from '@utils/transitionStyles';
import ChatHeader from './Header/ChatHeader';
import Conversation from './Conversation/Conversation';
import ChatFooter from './Footer/ChatFooter';
//remove later
import girl from '@assets/girl.jpg'

type ChatProps = {
  isOpen: boolean;
  hide: () => void;
};

function Chat({ hide, isOpen }: ChatProps) {
  const chatRef = useRef<HTMLDivElement>(null);
  const {user, messages} = useChatStore((state) => state);

  useClickOutside(isOpen, hide, [chatRef]);

  return (
    <>
      <div
        className={[
          `${getTransitionClasses(isOpen, 'overlay')}`,
          'transition-opacity',
          'fixed inset-0 bg-black/50 z-1',
        ].join(' ')}
      ></div>

      <div
        className={[
          `${getTransitionClasses(isOpen, 'chat')}`,
          'bg-[#16213E] rounded-xl',
          'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
          'z-2 w-[700px] h-[550px]',
          'flex flex-col shadow-2x1 border border-white/10',
        ].join(' ')}
        ref={chatRef}
      >
        <ChatHeader user={user!} hide={hide} />
        <Conversation avatar={girl} messages={messages} />
        <ChatFooter />
      </div>
    </>
  );
}

export default Chat;
