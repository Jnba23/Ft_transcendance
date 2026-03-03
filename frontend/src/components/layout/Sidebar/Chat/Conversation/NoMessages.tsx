type NoMessagesProps = {
  username: string;
};

function NoMessages({ username }: NoMessagesProps) {
  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto custom-scrollbar flex flex-col item-center justify-center text-center">
      <div className="flex flex-col gap-6">
        <div className="flex justify-center">
          <div className="rounded-full bg-white/5 size-20 text-[#2a3b5a] grid place-items-center">
            <span className="material-symbols-outlined !text-5xl">forum</span>
          </div>
        </div>
        <div>
          <h4 className="text-white text-xl font-bold mb-2">
            No messages yet.
          </h4>
          <p className="text-[#A0A6BD] text-sm leading-relaxed">
            Say hi to {username} to start the conversation!
          </p>
        </div>
      </div>
    </div>
  );
}

export default NoMessages;
