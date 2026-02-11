import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type State = {
  amount: number;
  setAmount: (amount: number) => void;
  totalBalance: string;
  setTotalBalance: (totalBalance: string) => void;
  reset: () => void;
};

const initialState: Omit<State, "setAmount" | "setTotalBalance" | "reset"> = {
  amount: 0,
  totalBalance: "",
};
export const useTransactionStore = create<State>()(
  persist(
    (set) => ({
      ...initialState,
      setAmount: (amount: number) => set(() => ({ amount })),
      setTotalBalance: (totalBalance: string) => set(() => ({ totalBalance })),
      reset: () => set(initialState),
    }),

    {
      name: "transaction",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
