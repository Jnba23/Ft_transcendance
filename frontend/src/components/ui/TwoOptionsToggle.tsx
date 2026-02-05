import React from 'react';

type TwoOptionsToggleProps = {
	opt1: string,
	opt2: string,
	onOpt1Select?: () => void,
	onOpt2Select?: () => void,
};

function TwoOptionsToggle({
	opt1,
	opt2,
	onOpt1Select,
	onOpt2Select
}: TwoOptionsToggleProps) {

	const [isActive, setIsActive] = React.useState(false);

	return (
		<div className="flex gap-2 items-center bg-black/20 rounded-lg p-1">
			<button
				className={[
					"flex-1 py-1.5 px-3 rounded-md transition-colors",
					"text-sm font-semibold text-white/60",
					"hover:bg-white/10 hover:text-white",
					"aria-pressed:bg-primary aria-pressed:text-white",
				].join(' ')}
				onClick={() => { setIsActive(true); onOpt1Select?.(); }}
				aria-pressed={isActive}
			>
				{opt1}
			</button>
			<button
				className={[
					"flex-1 py-1.5 px-3 rounded-md transition-colors",
					"text-sm font-semibold text-white/60",
					"hover:bg-white/10 hover:text-white",
					"aria-pressed:bg-primary aria-pressed:text-white",
				].join(' ')}
				onClick={() => { setIsActive(false); onOpt2Select?.(); }}
				aria-pressed={!isActive}
			>
				{opt2}
			</button>
		</div>
	);
}

export default TwoOptionsToggle;