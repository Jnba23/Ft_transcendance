function NoConversations() {
  return (
    <div className="text-center p-12 px-4">
      <span className="material-symbols-outlined text-white/20 !text-4xl mb-3">
        chat_bubble
      </span>
      <h3 className="text-white font-bold text-sm">No chats yet</h3>
      <p className="text-xs text-[#A0A6BD]">
        Start a conversation by finding a user!
      </p>
    </div>
  );
}

export default NoConversations;
