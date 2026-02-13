import { Conversation } from "types/conversation";
import DMListItem from "./DMListItem";
import { useState } from "react";

type DMListProps = {
	conversations: Conversation[],
	openChat: () => void
}

function DMList({ conversations, openChat }: DMListProps) {
	const [openItemId, setOpenItemId] = useState< number| null>(null);

	return (
		<div className="flex flex-col gap-1 mt-2 ">
			{
				conversations.map(convo => {
					return <DMListItem
								key={convo.id}
								convo={convo}
								openChat={openChat}
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