import { create } from 'zustand';

interface layoutStore {
  isSidebarShown: boolean;
  showSidebar: () => void;
  hideSidebar: () => void;

  isNavbarShown: boolean;
  showNavbar: () => void;
  hideNavbar: () => void;

  isSidebarOmited: boolean;

  omitSidebar: () => void;
  unomitSidebar: () => void;
}

export const useLayoutStore = create<layoutStore>((set) => ({
  isSidebarShown: false,

  showSidebar: () => {
    set({ isSidebarShown: true });
  },
  hideSidebar: () => {
    set({ isSidebarShown: false });
  },

  isNavbarShown: true,

  showNavbar: () => {
    set({ isNavbarShown: true });
  },
  hideNavbar: () => {
    set({ isNavbarShown: false });
  },

  isSidebarOmited: false,

  omitSidebar: () => {
    set({ isSidebarOmited: true });
  },

  unomitSidebar: () => {
    set({ isSidebarOmited: false });
  },
}));
