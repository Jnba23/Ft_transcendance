import { useChatStore } from '@stores/chat.store';
import { useDirectMessagesStore } from '@stores/directMessages.store';
import InputField from '@ui/InputField';

type ChatFooterProps = {
  inputValue: string
  setInputValue: React.Dispatch<React.SetStateAction<string>>,
}

function ChatFooter({ inputValue, setInputValue }: ChatFooterProps) {
  const addMessage = useChatStore((state) => state.addMessage);
  const addConversation = useDirectMessagesStore((state) => state.addConversation);

  const sendMessage =  async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (inputValue) {
      const result = await addMessage(inputValue);

      if (result.isNewConversation) addConversation(result.conversation);

      setInputValue('');
    }
  };

  return (
    <div className="p-4 flex-shrink-0 border-t border-white/10">
      <form className="flex items-center gap-2" onSubmit={sendMessage}>
        <InputField placeholder="Type a message..." value={inputValue} setInputVal={setInputValue}/>
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
