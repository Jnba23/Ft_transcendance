type ColorStyles = {
  blue: string;
  red: string;
};

const iconColorStyles = {
  blue: 'text-primary',
  red: 'text-loss',
} satisfies ColorStyles;

const alertColorStyles = {
  blue: 'bg-primary',
  red: 'bg-loss',
} satisfies ColorStyles;

type NotificationsItemProps = {
  icon: string;
  iconColor: keyof ColorStyles;
  label: React.ReactNode;
  actions?: React.ReactNode;
};

function NotificationsItem({
  icon,
  iconColor,
  label,
  actions,
}: NotificationsItemProps) {
  return (
    <div className="p-2 rounded-md hover:bg-white/5">
      <div className="flex gap-3 items-start">
        <div className="relative mt-1">
          <span
            className={[
              'material-symbols-outlined',
              `${iconColorStyles[iconColor]}`,
              '!text-xl',
            ].join(' ')}
          >
            {icon}
          </span>
          <div
            className={[
              `${alertColorStyles[iconColor]}`,
              'size-1.5 rounded-full',
              'absolute -top-1 -right-1',
            ].join(' ')}
          ></div>
        </div>
        <div>
          {label}
          {actions}
          <p className="text-xs text-white/50 mt-1">5 minutes ago</p>
        </div>
      </div>
    </div>
  );
}

export default NotificationsItem;
