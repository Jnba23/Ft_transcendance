type RequestActionsProps = {
	section: 'friendRequest' | 'notification';
};

function RequestActions({ section }: RequestActionsProps) {
	return (
		<div className={[
			`${section === 'friendRequest' ? '' : 'mt-2'}`,
			"flex gap-2 "
		].join(' ')}>
			<button
				className={[
				`${
					section === 'friendRequest' ?
					'py-1.5 rounded-lg' : 'py-1 rounded-md'
				}`,
				'bg-primary hover:bg-primary/90',
				'text-white text-xs font-bold px-3',
				].join(' ')}
			>
				Accept
			</button>
			<button
				className={[
				`${
					section === 'friendRequest' ?
					'py-1.5 rounded-lg' : 'py-1 rounded-md'
				}`,
				'text-white/90 bg-white/10',
				'text-xs font-medium px-3',
				'hover:bg-white/20',
				].join(' ')}
			>
				Decline
			</button>
		</div>
	);
}

export default RequestActions;