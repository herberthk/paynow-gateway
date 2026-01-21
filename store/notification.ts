import { create } from "zustand";
// import { immer } from "zustand/middleware/immer";

type State = {
  notifications: Notifications[];
  notify: (
    type: "success" | "error" | "info" | "warning",
    message: string,
  ) => void;
  removeNotification: (id: string) => void;
};

export const useNotificationStore = create<State>((set) => ({
  notifications: [],
  notify: (type, message) =>
    set((state) => ({
      notifications: [
        ...state.notifications,
        { id: Math.random().toString(36).substr(2, 9), type, message },
      ],
    })),
  removeNotification: (id: string) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
}));
