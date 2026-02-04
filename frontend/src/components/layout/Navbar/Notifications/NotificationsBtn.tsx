type NotificationsBtnProps = {
	onClick: () => void,
	buttonRef: React.RefObject<HTMLButtonElement | null>,
}

function NotificationsBtn({onClick: toggle, buttonRef} : NotificationsBtnProps) {
  return (
    <button className={[
      'size-10 bg-[#16213E]/50',
      'border border-white/10 rounded-full',
      'flex items-center',
      'justify-center',
      'relative hover:bg-white/10',
      'transition-[background-color]'
    ].join(' ')} onClick={toggle} ref={buttonRef}>
      <span className="material-symbols-outlined text-white/80">
				notifications
      </span>
      <span className={[
        'bg-primary', 'border-2 border-[#101622]',
        'rounded-full', 'size-2',
        'absolute', 'top-1.5', 'right-1.5',
      ].join(' ')}>
      </span>
    </button>
  );
}

export default NotificationsBtn;