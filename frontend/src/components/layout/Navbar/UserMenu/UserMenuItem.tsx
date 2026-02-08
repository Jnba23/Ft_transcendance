// add [color: color_utility_classes] mapping for
// the color you wish to use

type ColorStyles = {
  // color: string [!always]
  white: string;
  red: string;
};

const colorStyles = {
  // color: "text-<color> hover:bg-<color>/5"
  white: 'text-white hover:bg-white/5',
  red: 'text-loss hover:bg-loss/10',
} satisfies ColorStyles;

type UserMenuItemProps = {
  icon: string;
  label: string;
  color?: keyof ColorStyles | undefined;
  onClick?: () => void;
};

function UserMenuItem({
  icon,
  label,
  color = 'white',
  onClick,
}: UserMenuItemProps) {
  return (
    <button
      onClick={onClick}
      className={[
        `${colorStyles[color]}`,
        'text-sm',
        'flex gap-3 items-center',
        'px-3 py-2 rounded-md',
        'w-full text-left', // Ensure button behaves like block link
      ].join(' ')}
    >
      <span className="material-symbols-outlined !text-base">{icon}</span>
      <span>{label}</span>
    </button>
  );
}

export default UserMenuItem;
