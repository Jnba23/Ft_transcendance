import InputField from "@ui/InputField";

function ChatFooter() {
	return (
		<div className="p-4 flex-shrink-0 border-t border-white/10">
			<div className="flex items-center gap-2">
				<InputField placeholder="Type a message..."/>
				<button className={[
					"text-sm font-bold text-white bg-primary",
					"py-2 px-4 rounded-lg hover:bg-primary/90",
					"transition-[background-color] flex-shrink-0",
				].join(' ')}>
					Send
				</button>
			</div>
		</div>
	);
}

export default ChatFooter;