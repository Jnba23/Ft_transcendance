import { useChatStore } from '@stores/chat.store';
import InputField from '@ui/InputField';
import { messageSchema } from '@schemas/chat.schema';
import { useErrorStore } from '@stores/error.store';

type ChatFooterProps = {
  inputValue: string
  setInputValue: React.Dispatch<React.SetStateAction<string>>,
}

function ChatFooter({ inputValue, setInputValue }: ChatFooterProps) {
  const sendMessage = useChatStore((state) => state.sendMessage);
  const showError = useErrorStore((state) => state.showError);

  const handleSubmit =  async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const result = messageSchema.safeParse({
      message: inputValue
    });

    if (!result.success) {
      showError(result.error.issues[0].message);
      return;
    }

    sendMessage(inputValue);
    setInputValue('');
  };

  return (
    <div className="p-4 flex-shrink-0 border-t border-white/10">
      <form className="flex items-center gap-2" onSubmit={handleSubmit}>
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
