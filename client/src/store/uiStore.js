import { create } from "zustand";

const useUIStore = create((set) => ({
  sidebarOpen: true,
  onboardingStep: 0,
  totalOnboardingSteps: 5,

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  setOnboardingStep: (step) => set({ onboardingStep: step }),

  nextOnboardingStep: () =>
    set((state) => ({
      onboardingStep: Math.min(
        state.onboardingStep + 1,
        state.totalOnboardingSteps - 1
      ),
    })),

  prevOnboardingStep: () =>
    set((state) => ({
      onboardingStep: Math.max(state.onboardingStep - 1, 0),
    })),

  resetOnboarding: () => set({ onboardingStep: 0 }),
}));

export default useUIStore;
