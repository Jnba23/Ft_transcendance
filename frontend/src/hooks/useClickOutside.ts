import { useEffect } from 'react';

function useClickOutside(
  isOpen : boolean,
  onOutsideClick : () => void,
  refs: React.RefObject<HTMLElement | null>[]
) {
  useEffect(() => {
    if (!isOpen)
      return;
 
    function handlePointerDown(e: PointerEvent) {
      const clickedInside = refs.some(
        ref => ref.current?.contains(e.target as Node)
      );

      if (!clickedInside) onOutsideClick();
    }

    document.addEventListener('pointerdown', handlePointerDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [isOpen, onOutsideClick, refs]);
}

export default useClickOutside;