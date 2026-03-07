import { getManager } from '@services/manager';

export function createUsersSocket() {
  return getManager().socket('/users');
}
