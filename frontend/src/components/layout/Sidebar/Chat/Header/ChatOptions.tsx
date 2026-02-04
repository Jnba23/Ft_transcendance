import { useRef } from "react";
import getTransitionClasses from "@utils/transitionStyles";
import ChatOptsItem from "./ChatOptsItem";
import useClickOutside from "@hooks/useClickOutside";

type ChatOptionsProps = {
	isOpen: boolean,
	isFriend?: boolean,
	btnRef: React.RefObject<HTMLButtonElement | null>,
	hide: () => void,
}

function ChatOptions({ isOpen, isFriend, btnRef, hide } : ChatOptionsProps) {
	const optsRef = useRef<HTMLDivElement>(null);

	useClickOutside(isOpen, hide, [optsRef, btnRef]);

	return (
		<div className={[
			`${getTransitionClasses(isOpen, "navbar")}`,
			"p-2 border border-white/10 rounded-lg",
			"bg-[#1F2C4A] shadow-lg ",
			"absolute top-full right-0 mt-2 w-56",
		].join(' ')} ref={optsRef}>
			<ChatOptsItem icon="visibility" label="View Profile"/>
			<ChatOptsItem icon="block" label="Block User"/>
			<ChatOptsItem icon="sports_esports" label="Send Game Request"/>
			{
				isFriend &&
				<ChatOptsItem icon="sports_esports" label="Send Game Request"/>
			}
		</div>
	);
}

export default ChatOptions;