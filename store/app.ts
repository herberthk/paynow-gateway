import { create } from "zustand";

type State = {
  currentUser: User | null;
  setCurrentUser: (user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
  activeSecurityTab: SecurityTab;
  setActiveSecurityTab: (tab: SecurityTab) => void;
  paymentModal: PaymentModalProps;
  setPaymentModal: (modal: PaymentModalProps) => void;
  closePaymentModal: () => void;
  openPaymentModal: (type: "deposit" | "withdraw") => void;
  handleUpdateUser: (updatedData: User) => void;
};

export const useAppStore = create<State>((set) => ({
  currentUser: null,
  isAuthenticated: false,
  isSidebarOpen: false,
  activeSecurityTab: "profile",
  setCurrentUser: (user: User) =>
    set(() => ({
      currentUser: user,
      isAuthenticated: true,
    })),
  logout: () => set(() => ({ currentUser: null, isAuthenticated: false })),
  setIsSidebarOpen: (isOpen: boolean) => set(() => ({ isSidebarOpen: isOpen })),
  setActiveSecurityTab: (tab: SecurityTab) =>
    set(() => ({ activeSecurityTab: tab })),
  paymentModal: { isOpen: false, type: "deposit" },
  setPaymentModal: (modal: PaymentModalProps) =>
    set(() => ({ paymentModal: modal })),
  closePaymentModal: () =>
    set(() => ({
      paymentModal: { isOpen: false, type: "deposit" },
    })),
  openPaymentModal: (type: "deposit" | "withdraw") =>
    set(() => ({
      paymentModal: { isOpen: true, type },
    })),
  handleUpdateUser: (updatedData: User) =>
    set((state) => ({
      currentUser: { ...state.currentUser, ...updatedData },
    })),
}));
