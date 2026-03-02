import { getManager } from '@services/manager';

export function createChatSocket() {
	return getManager().socket('/chat');
}
