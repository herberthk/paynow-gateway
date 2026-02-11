"use client";
import { useAppStore } from "./app";
import { useNotificationStore } from "./notification";
import { useTransactionStore } from "./transation";

export const clearAllStores = () => {
  useAppStore.getState().reset();
  useNotificationStore.getState().reset();
  useTransactionStore.getState().reset();
  localStorage.removeItem("transaction");
};
