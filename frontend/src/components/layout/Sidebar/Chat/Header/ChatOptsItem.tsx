type ChatOptsItemProps = {
  icon: string;
  label: string;
  onClick?: () => void,
};

function ChatOptsItem({ icon, label, onClick }: ChatOptsItemProps) {
  return (
    <button
      className={[
        'flex items-center gap-3',
        'w-full px-3 py-2 rounded-lg',
        'hover:bg-white/5',
        'text-white text-sm',
      ].join(' ')}
      onClick={onClick}
    >
      <span className="material-symbols-outlined !text-base">{icon}</span>
      <span>{label}</span>
    </button>
  );
}

export default ChatOptsItem;
