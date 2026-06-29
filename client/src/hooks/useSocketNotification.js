import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import useAuthStore from "../store/authStore";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

export function useSocketNotification(onNew) {
  const socketRef = useRef(null);
  const onNewRef = useRef(onNew);
  onNewRef.current = onNew;

  const accessToken = useAuthStore((s) => s.accessToken);

  useEffect(() => {
    if (!accessToken) return;

    let socket;
    try {
      socket = io(SOCKET_URL, {
        auth: { token: accessToken },
        reconnectionAttempts: 3,
        reconnectionDelay: 5000,
        timeout: 10000,
      });
    } catch {
      return;
    }

    socket.on("connect", () => {
      const userId = useAuthStore.getState().user?.id;
      if (userId) {
        socket.emit("join", userId);
      }
    });

    socket.on("connect_error", () => {});

    socket.on("notification:new", (notification) => {
      onNewRef.current?.(notification);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [accessToken]);

  return socketRef;
}
