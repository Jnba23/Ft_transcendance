function NotificationOptions() {
  return (
    <div className="flex gap-2 mt-2">
      <button className={[
        'bg-primary hover:bg-primary/90',
        'text-white text-xs font-bold',
        'py-1 px-3 rounded-md',
      ].join(' ')}>
				Accept
      </button>
      <button className={[
        'text-white/90 bg-white/10',
        'text-xs font-medium',
        'py-1 px-3 rounded-md',
        'hover:bg-white/20',
      ].join(' ')}>
				Decline
      </button>
    </div>
  );
}

export default NotificationOptions;