import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type State = {
  amount: number;
  setAmount: (amount: number) => void;
  totalBalance: string;
  setTotalBalance: (totalBalance: string) => void;
};

export const useTransactionStore = create<State>()(
  persist(
    (set) => ({
      amount: 0,
      setAmount: (amount: number) => set(() => ({ amount })),
      totalBalance: "",
      setTotalBalance: (totalBalance: string) => set(() => ({ totalBalance })),
    }),
    {
      name: "transaction",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
