type UserOptsItemProps = {
  icon: string;
  label: string;
};

function UserOptsItem({ icon, label }: UserOptsItemProps) {
  return (
    <button
      className={[
        'text-white/70 text-xs transition-colors',
        'flex gap-2 items-center',
        'px-2 py-1.5 rounded-md',
        'hover:bg-white/10 hover:text-white',
      ].join(' ')}
    >
      <span className="material-symbols-outlined !text-sm">{icon}</span>
      <span>{label}</span>
    </button>
  );
}

export default UserOptsItem;
