import { useChatStore } from '@stores/chat.store';
import InputField from '@ui/InputField';
import { useState } from 'react';

function ChatFooter() {
  const [message, setMessage] = useState('');
  const setInputValue = (value: string) => setMessage(value);
  const addMessage = useChatStore((state) => state.addMessage);

  const sendMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    message && addMessage(message);
    setMessage('');
  };

  return (
    <div className="p-4 flex-shrink-0 border-t border-white/10">
      <form className="flex items-center gap-2" onSubmit={sendMessage}>
        <InputField placeholder="Type a message..." value={message} setInputVal={setInputValue}/>
        <button
          className={[
            'text-sm font-bold text-white bg-primary',
            'py-2 px-4 rounded-lg hover:bg-primary/90',
            'transition-[background-color] flex-shrink-0',
          ].join(' ')}
        >
          Send
        </button>
      </form>
    </div>
  );
}

export default ChatFooter;
