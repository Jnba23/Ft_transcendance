import { useFriendsStore } from "@stores/Friends.store";

function FriendsHeader() {
	const hideFriends = useFriendsStore((state) => state.hide);

	return (
		<div className='flex justify-between items-center'> {/* header */}
			<h2 className='text-white text-lg font-bold'>
				Friends
			</h2>
			<button className={[
				'text-white/80 hover:bg-white/10',
				'rounded-md duration-150 transition-colors size-8.5 flex',
				'justify-center items-center',
				'hover:text-white',
			].join(' ')} onClick={hideFriends}>
				<span className="material-symbols-outlined !text-xl">
					close
				</span>
			</button>
		</div>
	);
}

export default FriendsHeader;