"use client";

import { Reorder } from "framer-motion";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useAuth } from "@/context/auth-context";
import { useLocalStorage } from "@/hooks/use-local-storate";
import { handleApiError } from "@/lib/api/handle-api-error";
import {
  getCurrentNotebookWithBlocks,
  saveNotebookData,
} from "@/lib/api/notebook-service";
import type { Block, BlockMetadata, BlockType, Language } from "@/lib/types";
import { InlineTOC } from "../inline-toc";
import { useNotebook } from "./notebook-context";
import { ReorderItem } from "./reorder/reorder-item";
import { ReorderTools } from "./reorder/reorder-tools";

interface RustInteractivePageProps {
  pageId: string;
}

export default function RustInteractivePage({
  pageId = "default",
}: RustInteractivePageProps) {
  const t = useTranslations("api_errors");
  const { user } = useAuth();
  const {
    saveSignal,
    notebook,
    triggerSave,
    setIsSaving,
    setHasSaved,
    isDragging,
    setIsDragging,
    isPublic,
  } = useNotebook();
  const isOwner = notebook?.userId === user?.id;
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [autoSaveInterval, _setAutoSaveInterval] = useLocalStorage<number>(
    "editor-autosave-interval",
    10000,
  );
  const [blocks, setBlocks] = useState<Block[]>([
    {
      title: "Bloco de Texto",
      id: "init-1",
      type: "text",
      content: "# Notas\nComece a editar...",
    },
  ]);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      const notebook = await getCurrentNotebookWithBlocks(pageId);

      if (isMounted && notebook?.blocks) {
        setBlocks(notebook.blocks);
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, [pageId]);

  const blocksRef = useRef(blocks);
  useEffect(() => {
    blocksRef.current = blocks;
  }, [blocks]);

  useEffect(() => {
    if (saveSignal === 0 || !isOwner || !user) return;

    const saveData = async () => {
      setIsSaving(true);

      try {
        await saveNotebookData(
          pageId,
          notebook?.title || "Sem título",
          blocksRef.current,
          isPublic ?? false,
        );

        await new Promise((r) => setTimeout(r, 600));

        setIsSaving(false);
        setHasSaved(true);
        setTimeout(() => setHasSaved(false), 2000);
      } catch (err) {
        handleApiError({ err, t });

        setIsSaving(false);
      }
    };

    saveData();
  }, [
    saveSignal,
    pageId,
    notebook?.title,
    isPublic,
    setIsSaving,
    setHasSaved,
    isOwner,
    user,
    t,
  ]);

  useEffect(() => {
    if (!autoSaveInterval || autoSaveInterval <= 0) return;

    const interval = setInterval(() => {
      triggerSave();
      console.log("Auto-save disparado!");
    }, autoSaveInterval);

    return () => clearInterval(interval);
  }, [triggerSave, autoSaveInterval]);

  const getFileName = (title: string) => {
    return title.replace(/[^a-zA-Z0-9]/g, "_");
  };

  const pageFiles = blocks.reduce(
    (acc, b) => {
      if (b.type === "code" && b.language === "typescript" && b.title) {
        let name = b.title.replace(/[^a-zA-Z0-9]/g, "_");
        if (/^\d/.test(name)) name = `_${name}`;

        acc[`/${name}.tsx`] = {
          code: b.content,
          hidden: true,
        };
      }
      return acc;
    },
    {} as Record<string, any>,
  );

  function getInitialCode(language: Language): string {
    const templates: Record<Language, string> = {
      rust: '// Escreva seu código Rust aqui :))\nfn main() {\n    println!("Olá mundo!");\n}',
      typescript:
        "export default function App() {\n  return <h1>Olá React!</h1>\n}",
      python: 'import math \nprint(f"O valor de PI é {math.pi}")',
    };

    return templates[language] ?? templates.python;
  }

  function getBlockTitle(
    type: BlockType,
    language: Language,
    blockCount: number,
  ): string {
    if (type !== "code") return "Bloco de Texto";

    const titles: Record<string, string> = {
      typescript: `Componente_${blockCount}`,
      rust: "file.rs",
      python: "script.py",
    };

    return titles[language] ?? "Arquivo de Código";
  }

  const addBlock = (
    index: number,
    type: BlockType,
    language?: Language,
    metadata?: BlockMetadata,
  ) => {
    const codeBlock = getInitialCode(language ?? "rust");

    const title = getBlockTitle(type, language ?? "rust", blocks.length);

    const newBlock: Block = {
      id: uuidv4(),
      type,
      title,
      content: type === "code" ? codeBlock : "",
      language,
      metadata,
    };
    const newBlocks = [...blocks];
    newBlocks.splice(index + 1, 0, newBlock);
    setBlocks(newBlocks);
    setHoveredIndex(null);
  };

  const updateBlockMetadata = (id: string, newMetadata: BlockMetadata) => {
    const newBlocks = blocks.map((b) =>
      b.id === id ? { ...b, metadata: newMetadata } : b,
    );
    setBlocks(newBlocks);
  };

  const updateBlock = (id: string, newContent: string) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, content: newContent } : b)),
    );
  };

  const removeBlock = (id: string) => {
    if (blocks.length > 1) {
      setBlocks(blocks.filter((b) => b.id !== id));
    }
  };

  return (
    <div className="min-h-screen flex flex-row w-full">
      <Reorder.Group
        axis="y"
        values={blocks}
        onReorder={setBlocks}
        className="space-y-4 w-full"
      >
        {blocks.length > 0 &&
          blocks.map((block, index) => {
            const blockName = getFileName(block.title);
            const currentBlockFileName = `/${blockName}.tsx`;
            const isTS = block.language === "typescript";
            const filesForThisBlock = {
              ...pageFiles,
              [currentBlockFileName]: block.content,
            };
            if (isTS) {
              filesForThisBlock["/App.tsx"] = {
                code: `
                import { App as Component } from "./${blockName}";
                export default function Main() {
                  return <Component />;
                }
              `,
                hidden: true,
              };
            }
            delete filesForThisBlock[currentBlockFileName];
            return (
              // biome-ignore lint/a11y/noStaticElementInteractions: <Necessário pra controlar o render>
              <div
                key={block.id}
                className="relative group overflow-visible"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <ReorderTools
                  hoveredIndex={hoveredIndex}
                  index={index}
                  addBlock={addBlock}
                />

                <ReorderItem
                  block={block}
                  isDragging={isDragging}
                  pageFiles={pageFiles}
                  pageBlocks={blocks}
                  setBlocks={setBlocks}
                  setIsDragging={setIsDragging}
                  removeBlock={removeBlock}
                  updateBlock={updateBlock}
                  updateBlockMetadata={updateBlockMetadata}
                />
              </div>
            );
          })}
      </Reorder.Group>
      <aside className="hidden xl:block w-70">
        <div className="sticky top-24">
          <InlineTOC blocks={blocks} />
        </div>
      </aside>
    </div>
  );
}
