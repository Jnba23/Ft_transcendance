import { useFriendRequestsStore } from "@stores/friendRequests.store";
import { useFriendsStore } from "@stores/Friends.store";
import { useUserDirectoryStore } from "@stores/userDirectory.store";

type FriendsBtnProps = {
	btnRef: React.RefObject<HTMLButtonElement | null>
	userId: number
}

function FriendsBtn({ btnRef, userId } : FriendsBtnProps) {
	const { me } = useUserDirectoryStore((state) => state);
	const sendFriendReq = useFriendRequestsStore((state) => (
		state.sendRequest
	));
	const {
		toggle, includes,
		openConfirmation, setAwaitingConfirm
	} = useFriendsStore((state) => state);

	const friendship = includes(userId);

	const status = getBtnStatus(userId, !!friendship);
	const icon = getIconForStatus(status, userId)

	const handleClick = () => {
		if (userId === me?.id)
		{
			toggle();
			return;
		}

		if (status === 'Unfriend') {
			setAwaitingConfirm(friendship?.id!, 'temp');
			openConfirmation();
			return;
		}

		if (['Pending', 'Loading'].includes(status)) return;

		sendFriendReq(userId);
	}

	return ( // style based on status
		<button className={[
			`${getStyleForStatus(status)}`,
			'flex',
			'px-4 py-2 gap-2 rounded-lg text-sm font-medium',
			'transition-colors',
		].join(' ')} onClick={handleClick} ref={btnRef}>
			<span className='material-symbols-outlined !text-sm'>
				{icon}
			</span>
			<span>
				{status}
			</span>
		</button>
	);
}

function getBtnStatus(userId: number, isFriend: boolean) {
	const userDirStore = useUserDirectoryStore.getState();
	const friendsStore = useFriendsStore.getState();

	if (userDirStore.isLoading || friendsStore.isLoading)
		return 'Loading';

	if (userId === userDirStore.me?.id) {
		return `${friendsStore.total} Friends`;
	}

	if (isFriend) return 'Unfriend';

	if (userDirStore.hasFriendRequest(userId)) return 'Pending';

	return 'Add Friend';
}

function getIconForStatus(status: string, userId: number | undefined) {
	const userDirStore = useUserDirectoryStore.getState()

	if (userId === userDirStore.me?.id) return 'group';

	if (status === 'Unfriend') return 'person_remove';

	if (['Pending', 'Loading'].includes(status)) return 'hourglass_bottom';

	return 'person_add';
}

function getStyleForStatus(status: string) {
	if (status === 'Unfriend') {
		return 'bg-loss/10 text-loss hover:bg-loss/20';
	}

	if (['Pending', 'Loading'].includes(status)) {
		return 'bg-white/10 text-white'
	}

	return 'text-white bg-primary hover:bg-primary/90';
}

export default FriendsBtn;