import type * as AutomergeType from "@automerge/automerge";
import { useCallback, useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import type { Block, Notebook } from "@/lib/types";

export function useAutomergeSync(notebookId: string) {
  const [isConnected, setIsConnected] = useState(false);
  const automerge = useRef<typeof AutomergeType | null>(null);

  const [doc, setDoc] = useState<Notebook | null>(null);

  const syncState = useRef<any>(null);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadLibrary() {
      const automergex = await import("@automerge/automerge");
      if (!isMounted) return;

      automerge.current = automergex;
      syncState.current = automergex.initSyncState();

      const initialDoc = automergex.init<Notebook>();

      const docWithData = automergex.change(initialDoc, (n) => {
        if (!n.blocks) {
          n.id = notebookId;
          n.title = "Carregando...";
          n.blocks = [
            {
              id: uuidv4(),
              type: "text",
              title: "Nota Inicial",
              content: "# Bem vindo ao seu Notebook\nComece a editar...",
              language: "rust", // valor padrão
            },
          ];
        }
      });

      setDoc(docWithData);
    }
    loadLibrary();
    return () => {
      isMounted = false;
    };
  }, [notebookId]);

  useEffect(() => {
    if (!doc || !automerge.current) return;

    if (socketRef.current?.readyState === WebSocket.OPEN) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl =
      process.env.NEXT_PUBLIC_WS_URL ||
      `${protocol}//6hpqpw43-3099.brs.devtunnels.ms/api/notebook/ws/${notebookId}`;

    const socket = new WebSocket(wsUrl);
    socket.binaryType = "arraybuffer";
    socketRef.current = socket;

    socket.onopen = () => setIsConnected(true);
    socket.onclose = () => setIsConnected(false);

    socket.onmessage = (event) => {
      const binaryMessage = new Uint8Array(event.data);

      setDoc((currentDoc) => {
        if (!currentDoc || !automerge.current) return currentDoc;

        const docClone = automerge.current.clone(currentDoc);

        const [nextDoc, nextSyncState] = automerge.current.receiveSyncMessage(
          docClone,
          syncState.current,
          binaryMessage,
        );

        syncState.current = nextSyncState;

        const [updatedSyncState, responseMessage] =
          automerge.current.generateSyncMessage(nextDoc, syncState.current);

        syncState.current = updatedSyncState;

        if (responseMessage && socket.readyState === WebSocket.OPEN) {
          socket.send(responseMessage);
        }

        console.log(nextDoc.blocks);

        return nextDoc;
      });
    };

    return () => {
      socket.close();
      socketRef.current = null;
    };
  }, [notebookId, !!doc]);

  const updateDoc = useCallback((callback: (d: Notebook) => void) => {
    if (!automerge.current) return;

    setDoc((currentDoc) => {
      if (!currentDoc || !automerge.current) return null;

      const docClone = automerge.current.clone(currentDoc);

      const newDoc = automerge.current.change(docClone, callback);

      const [nextSyncState, message] = automerge.current.generateSyncMessage(
        newDoc,
        syncState.current,
      );
      syncState.current = nextSyncState;

      if (message && socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(message);
      }
      return newDoc;
    });
  }, []);

  const addBlockSync = (
    index: number,
    type: "text" | "code" | "component",
    content = "",
    language = "rust",
    title = "",
  ) => {
    updateDoc((d) => {
      const newBlock: Block = {
        id: uuidv4(),
        title,
        type: type as any,
        content,
        language: language as any,
      };
      d.blocks.splice(index + 1, 0, newBlock);
    });
  };

  const updateBlockContent = (blockId: string, newContent: string) => {
    updateDoc((d) => {
      const block = d.blocks.find((b) => b.id === blockId);
      if (block) block.content = newContent;
    });
  };

  const updateBlockMetadataSync = (blockId: string, meta: any) => {
    updateDoc((d) => {
      const block = d.blocks.find((b) => b.id === blockId);
      if (block) block.metadata = meta;
    });
  };

  const deleteBlock = (blockId: string) => {
    updateDoc((d) => {
      const index = d.blocks.findIndex((b) => b.id === blockId);
      if (index !== -1) {
        d.blocks.splice(index, 1);
      }
    });
  };

  const reorderBlocks = (newOrder: Block[]) => {
    updateDoc((d) => {
      d.blocks = newOrder;
    });
  };

  return {
    doc,
    isConnected,
    addBlockSync,
    updateBlockContent,
    updateBlockMetadataSync,
    deleteBlock,
    reorderBlocks,
  };
}
