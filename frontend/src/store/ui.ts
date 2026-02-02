import { create } from 'zustand';

type UiState = {
  isLoginOpen: boolean;
  openLogin: () => void;
  closeLogin: () => void;
  toggleLogin: () => void;
};

export const useUiStore = create<UiState>((set) => ({
  isLoginOpen: false,
  openLogin: () => set({ isLoginOpen: true }),
  closeLogin: () => set({ isLoginOpen: false }),
  toggleLogin: () => set((state) => ({ isLoginOpen: !state.isLoginOpen })),
}));
