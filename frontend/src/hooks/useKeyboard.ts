import { useState, useEffect } from 'react';
import type { KeyboardState } from '../types/game.types';

const initial = {
  up: false,
  down: false,
};

export const useKeyboard = () => {
  const [keys, setKeys] = useState(initial);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.code === 'KeyW') {
        e.preventDefault();
        setKeys((k) => ({ ...k, up: true }));
      } else if (e.code === 'KeyS') {
        e.preventDefault();
        setKeys((k) => ({ ...k, down: true }));
      }
    };
    const up = (e: KeyboardEvent) => {
      if (e.code === 'KeyW') {
        setKeys((k) => ({ ...k, up: false }));
      } else if (e.code === 'KeyS') {
        setKeys((k) => ({ ...k, down: false }));
      }
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
