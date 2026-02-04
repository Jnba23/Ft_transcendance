type SectionHeaderProps = {
  icon: string;
  label: string;
  switchSection: () => void;
};

function SectionHeader({ icon, label, switchSection }: SectionHeaderProps) {
  return (
    <div
      className={['flex items-center justify-between', 'px-2 pt-2 mb-2'].join(
        ' '
      )}
    >
      <h2
        className={[
          'text-xs uppercase font-bold',
          'text-white/60 tracking-wider',
        ].join(' ')}
      >
        {label}
      </h2>
      <button
        className={[
          'flex items-center justify-center',
          'hover:bg-white/10 hover:text-white',
          'text-white/80 size-7 rounded-md ',
        ].join(' ')}
        onClick={switchSection}
      >
        <span className="material-symbols-outlined !text-base">{icon}</span>
      </button>
    </div>
  );
}

export default SectionHeader;
