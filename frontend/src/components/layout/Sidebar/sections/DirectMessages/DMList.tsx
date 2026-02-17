import { Conversation } from "types/conversation";
import DMListItem from "./DMListItem";
import { useState } from "react";
import NoMatchedUser from "../shared/NoMatchedUser";
import NoConversations from "./NoConversations";

type DMListProps = {
	conversations: Conversation[],
	isSearching: boolean
}

function DMList({ conversations, isSearching }: DMListProps) {
	const [openItemId, setOpenItemId] = useState< number| null>(null);

	if (!conversations.length && !isSearching) {
		return (
			<NoConversations />
		);
	}
	
	if (!conversations.length) {
		return (
			<NoMatchedUser />
		);
	}

	return (
		<div className="flex flex-col gap-1 mt-2 ">
			{
				conversations.map(convo => {
					return <DMListItem
								key={convo.id}
								convo={convo}
								hasOpenOpts={openItemId === convo.id}
								openOptions={() =>
									setOpenItemId(prev => (prev === convo.id ? null : convo.id))
								}
							/>
				})
			}
		</div>
	);
}

export default DMList;