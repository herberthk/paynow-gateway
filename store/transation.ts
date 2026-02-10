import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type State = {
  amount: number;
  setAmount: (amount: number) => void;
  fee: number;
  setFee: (fee: number) => void;
  total: number;
  setTotal: (total: number) => void;
};

export const useTransactionStore = create<State>()(
  persist(
    (set) => ({
      amount: 0,
      setAmount: (amount: number) => set(() => ({ amount })),
      fee: 0,
      setFee: (fee: number) => set(() => ({ fee })),
      total: 0,
      setTotal: (total: number) => set(() => ({ total })),
    }),
    {
      name: "transaction",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
