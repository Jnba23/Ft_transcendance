import { create } from 'zustand';

interface layoutStore {
  isSidebarShown: boolean;
  showSidebar: () => void;
  hideSidebar: () => void;
}

export const useLayoutStore = create<layoutStore>((set) => ({
  isSidebarShown: false,

  showSidebar: () => {
    set({ isSidebarShown: true });
  },
  hideSidebar: () => {
    set({ isSidebarShown: false });
  }
}));
