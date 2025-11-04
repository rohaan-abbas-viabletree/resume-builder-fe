import { create } from "zustand";

interface State {
  isDark: boolean;
  changeTheme: () => void;
}

export const useThemeStore = create<State>((set) => ({
  isDark: false,
  changeTheme: () => set((state) => ({ isDark: !state.isDark }))
}));
