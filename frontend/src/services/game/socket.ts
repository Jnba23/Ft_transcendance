import { getManager } from '@services/manager';

export function createMatchmakingSocket() {
  return getManager().socket('/matchmaking');
}

export function createPongSocket() {
  return getManager().socket('/pong');
}
