import { getCookie } from "cookies-next";
import { useCallback, useEffect, useRef, useState } from "react";
import type { User } from "@/lib/types/user-types";

export type Collaborator = {
  id: string;
  name: string;
  color: string;
  avatar?: string;
  cursor: { x: number; y: number } | null;
  focusedBlockId: string | null;
};

const stringToColor = (str: string) => {
  if (str.includes("Hadson")) {
    return "hsl(157, 76%, 35%)";
  }
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return `hsl(${hash % 360}, 80%, 50%)`;
};

export function usePresence(pageId: string, currentUser: User | null) {
  const [collaborators, setCollaborators] = useState<Map<string, Collaborator>>(
    new Map(),
  );
  const wsRef = useRef<WebSocket | null>(null);

  const lastSendTime = useRef(0);

  const myState = useRef({
    cursor: null as { x: number; y: number } | null,
    focusedBlockId: null as string | null,
  });

  useEffect(() => {
    if (wsRef.current) {
      if (
        wsRef.current.readyState === WebSocket.OPEN ||
        wsRef.current.readyState === WebSocket.CONNECTING
      ) {
        return;
      }
      wsRef.current.close();
    }

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}${process.env.NEXT_PUBLIC_WS_URL}/notebook/ws/presence/${pageId}`;

    const tokenX = getCookie("auth_token");
    const token = tokenX?.toString() || "";
    const protocols = token.length > 0 ? ["access_token", token] : undefined;

    const ws = new WebSocket(wsUrl, protocols);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.userId === currentUser?.id) return;

        setCollaborators((prev) => {
          const next = new Map(prev);
          next.set(data.userId, {
            id: data.userId,
            name: data.name || "Visitante",
            color: stringToColor(data.name || data.userId),
            cursor: data.cursor,
            focusedBlockId: data.focusedBlockId,
          });
          return next;
        });
      } catch (e) {
        console.error("Erro ao ler presença:", e);
      }
    };

    ws.onopen = () => {
      broadcastPresence();
    };

    return () => {
      if (ws) {
        ws.onopen = null;
        ws.onmessage = null;
        ws.onclose = null;
        ws.close();
      }
      wsRef.current = null;
    };
  }, [pageId, currentUser?.id]);

  const broadcastPresence = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN && currentUser?.id) {
      wsRef.current.send(
        JSON.stringify({
          userId: currentUser.id,
          name: currentUser.name || "Visitante",
          cursor: myState.current.cursor,
          focusedBlockId: myState.current.focusedBlockId,
        }),
      );
    }
  }, [currentUser]);

  const updateCursor = useCallback(
    (x: number, y: number) => {
      myState.current.cursor = { x, y };

      const now = Date.now();
      if (now - lastSendTime.current > 50) {
        broadcastPresence();
        lastSendTime.current = now;
      }
    },
    [broadcastPresence],
  );

  const updateFocus = useCallback(
    (blockId: string | null) => {
      myState.current.focusedBlockId = blockId;
      broadcastPresence();
    },
    [broadcastPresence],
  );

  return {
    collaborators: Array.from(collaborators.values()),
    updateCursor,
    updateFocus,
  };
}
