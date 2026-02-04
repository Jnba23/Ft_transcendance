type TransitionStyles = {
  enter: string;
  leave: string;
};

const navbarTransitions = {
  enter: 'opacity-100 scale-100 duration-150 ease-out',
  leave: 'opacity-0 scale-95 duration-75 ease-in pointer-events-none',
} satisfies TransitionStyles;

const overlayTransitions = {
  enter: 'opacity-100 duration-300 ease-out',
  leave: 'opacity-0 ease-in pointer-events-none',
};

const chatTransitions = {
  enter: 'opacity-100 duration-300 ease-out scale-100 ',
  leave: 'opacity-0 scale-95 duration-200 ease-in pointer-events-none',
};

function getTransitionClasses(isOpen: boolean, section: string) {
  switch (section) {
  case 'navbar':
    if (isOpen) return navbarTransitions.enter;

    return navbarTransitions.leave;
  case 'overlay':
    if (isOpen) return overlayTransitions.enter;

    return overlayTransitions.leave;
  case 'chat':
    if (isOpen) return chatTransitions.enter;

    return chatTransitions.leave;
  }
}

export default getTransitionClasses;
