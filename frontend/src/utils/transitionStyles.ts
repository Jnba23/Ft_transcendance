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

const friendsTransition = {
  enter: 'opacity-100 translate-y-2 duration-300 ease-out',
  leave: 'opacity-0 translate-y-0 duration-200 ease-in pointer-events-none',
} satisfies TransitionStyles;

const modalTransition = {
  enter: 'opacity-100 duration-300 ease-out scale-100 ',
  leave: 'opacity-0 scale-95 duration-200 ease-in pointer-events-none',
};

const errorTransition = {
  enter: 'opacity-100 translate-y-12 duration-300 ease-out',
  leave: 'opacity-0 translate-y-0 duration-200 ease-in'
}

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
    case 'friends':
      if (isOpen) return friendsTransition.enter;

      return friendsTransition.leave;
    case 'confirmationModal':
      if (isOpen) return modalTransition.enter;

      return modalTransition.leave;
    
    case 'error':
      if (isOpen) return errorTransition.enter;

      return errorTransition.leave;
  }
}

export default getTransitionClasses;
