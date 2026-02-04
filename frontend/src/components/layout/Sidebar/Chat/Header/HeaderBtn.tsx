type HeaderBtnProps = {
  icon: string;
  onClick: () => void;
  btnRef?: React.Ref<HTMLButtonElement | null>;
};

function HeaderBtn({ icon, onClick, btnRef }: HeaderBtnProps) {
  return (
    <button
      className={[
        'text-white/70 size-8',
        'rounded-full hover:bg-white/10',
        'hover:text-white transition-colors',
        'flex items-center justify-center',
      ].join(' ')}
      onClick={onClick}
      ref={btnRef}
    >
      <span className="material-symbols-outlined !text-xl">{icon}</span>
    </button>
  );
}

export default HeaderBtn;
