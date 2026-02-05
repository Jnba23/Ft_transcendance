import React from 'react';

type TwoOptionsToggleProps = {
	opt1: string,
	opt2: string,
	setRequestType?: (type: string) => void, // make type boolean or keyof something
};

function TwoOptionsToggle({ opt1, opt2, setRequestType }: TwoOptionsToggleProps) {
	const [isActive, setIsActive] = React.useState(false);

	return (
		<div className="flex gap-2 items-center bg-black/20 rounded-lg p-1"> {/*TwoOptionToggle <ui> */}
			<button className={[
				"flex-1 py-1.5 px-3 rounded-md transition-colors",
				"text-sm font-semibold text-white/60",
				"hover:bg-white/10 hover:text-white",
				"aria-pressed:bg-primary aria-pressed:text-white",
			].join(' ')} onClick={() => setIsActive(true)} aria-pressed={isActive}>
				{opt1}
			</button>
			<button className={[
				"flex-1 py-1.5 px-3 rounded-md transition-colors",
				"text-sm font-semibold text-white/60",
				"hover:bg-white/10 hover:text-white",
				"aria-pressed:bg-primary aria-pressed:text-white",
			].join(' ')} onClick={() => setIsActive(false)} aria-pressed={!isActive}>
				{opt2}
			</button>
		</div>
	);
}

export default TwoOptionsToggle;