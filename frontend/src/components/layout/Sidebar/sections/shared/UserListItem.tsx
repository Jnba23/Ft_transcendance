import UserOptions from "./UserOptions";
import { useRef } from "react";
import type { StatusStyle } from "@utils/types.ts";
import UserBadge from "@ui/UserBadge";

type UserListItemProps = {
	username: string,
	avatarPath: string,
	status: keyof StatusStyle,
	hasOpenOpts: boolean,
	openOptions: () => void,
	openChat: () => void,
}

function UserListItem({
	username,
	avatarPath,
	status,
	hasOpenOpts,
	openOptions,
	openChat
} : UserListItemProps) {

	const optsBtnRef = useRef<HTMLButtonElement>(null);
	const onItemClick = (e: React.MouseEvent<HTMLDivElement>) => {
		const isOptsBtnCicked = 
			optsBtnRef.current?.contains(e.target as Node);

		if (!isOptsBtnCicked)
			openChat();
	}

	return (
		<div className={[
			`${hasOpenOpts ? "bg-white/10" : "hover:bg-white/5"}`,
			"flex flex-col rounded-lg cursor-pointer",
			"trasition-[background-color] duration-300"
		].join(' ')}>
			<div className="p-2" onClick={onItemClick}>
				<div className="flex items-center justify-between">
					<UserBadge
						username={username} avatar={avatarPath}
						status={status} section="DM"
					/>
					<button className={[
						"p-1 rounded-md transition-colors",
						"text-white/40",
						"hover:text-white hover:bg-white/10",
					].join(' ')} onClick={openOptions} ref={optsBtnRef}>
						<span className="material-symbols-outlined !text-base">
							more_vert
						</span>
					</button>
				</div>
			</div>
			<UserOptions isOpen={hasOpenOpts}/>
		</div>
	);
}

export default UserListItem;