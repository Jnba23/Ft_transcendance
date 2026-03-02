import { getManager } from '@services/manager';

export function createFriendsSocket() {
	return getManager().socket('/friends');
}
