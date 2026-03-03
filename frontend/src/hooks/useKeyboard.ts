import { useState, useEffect } from 'react';
import type { KeyboardState } from '../types/game.types';

const initial: KeyboardState = {
  ArrowUp: false,
  ArrowDown: false,
  KeyW: false,
  KeyS: false,
};

export const useKeyboard = (): KeyboardState => {
  const [keys, setKeys] = useState(initial);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.code in initial) {
        e.preventDefault();
        setKeys((k) => ({ ...k, [e.code]: true }));
      }
    };
    const up = (e: KeyboardEvent) => {
      if (e.code in initial) setKeys((k) => ({ ...k, [e.code]: false }));
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, []);

  return keys;
};

export default useKeyboard;
