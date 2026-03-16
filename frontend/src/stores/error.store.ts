import { create } from 'zustand';

interface ErrorStoreState {
  error: string | null;
  timeoutId: ReturnType<typeof setTimeout> | null;
  showError: (message: string, duration?: number) => void;
  clearError: () => void;
}

export const useErrorStore = create<ErrorStoreState>((set, get) => ({
  error: null,
  timeoutId: null,

  showError: (message, duration = 3000) => {
    const existingTimeout = get().timeoutId;

    if (existingTimeout) clearTimeout(existingTimeout);

    const timeoutId = setTimeout(() => {
      set({ error: null, timeoutId: null });
    }, duration);

    set({ error: message, timeoutId });
  },

  clearError: () => {
    const existingTimeout = get().timeoutId;

    if (existingTimeout) clearTimeout(existingTimeout);

    set({ error: null, timeoutId: null });
  },
}));
