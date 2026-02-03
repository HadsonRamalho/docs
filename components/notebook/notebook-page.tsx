"use client";

import { useState, useEffect, useRef } from "react";
import { Reorder } from "framer-motion";
import { useNotebook } from "./notebook-context";
import { Block, BlockType, Language } from "@/lib/types";
import { ReorderItem } from "./reorder/reorder-item";
import { ReorderTools } from "./reorder/reorder-tools";

interface RustInteractivePageProps {
  pageId: string;
}

export default function RustInteractivePage({
  pageId = "default",
}: RustInteractivePageProps) {
  const { saveSignal, setIsSaving, setHasSaved, isDragging, setIsDragging } =
    useNotebook();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [blocks, setBlocks] = useState<Block[]>([
    {
      title: "Bloco de Texto",
      id: "init-1",
      type: "text",
      content: "# Notas\nComece a editar...",
    },
  ]);

  const storageKey = `rust-notebook-${pageId}`;

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setBlocks(parsed);
        }
      } catch (e) {
        console.error("Erro ao ler dados salvos", e);
      }
    }
  }, [storageKey]);

  const blocksRef = useRef(blocks);
  useEffect(() => {
    blocksRef.current = blocks;
  }, [blocks]);

  useEffect(() => {
    if (saveSignal === 0) return;

    const saveData = async () => {
      setIsSaving(true);

      localStorage.setItem(storageKey, JSON.stringify(blocksRef.current));

      await new Promise((r) => setTimeout(r, 600));

      setIsSaving(false);
      setHasSaved(true);
      setTimeout(() => setHasSaved(false), 2000);
    };

    saveData();
  }, [saveSignal, setIsSaving, setHasSaved, storageKey]);

  const getFileName = (title: string) => {
    return title.replace(/[^a-zA-Z0-9]/g, "_");
  };

  const pageFiles = blocks.reduce(
    (acc, b) => {
      if (b.type === "code" && b.language === "typescript" && b.title) {
        let name = b.title.replace(/[^a-zA-Z0-9]/g, "_");
        if (/^\d/.test(name)) name = "_" + name;

        acc[`/${name}.tsx`] = {
          code: b.content,
          hidden: true,
        };
      }
      return acc;
    },
    {} as Record<string, any>,
  );

  const addBlock = (index: number, type: BlockType, language?: Language) => {
    const codeBlock =
      language === "rust"
        ? '// Escreva seu código Rust aqui :))\nfn main() {\n    println!("Olá mundo!");\n}'
        : "export default function App() {\n  return <h1>Olá React!</h1>\n}";

    const title =
      type === "code" && language === "typescript"
        ? `Componente_${blocks.length}`
        : type === "code" && language === "rust"
          ? "file.rs"
          : "Bloco de Texto";

    const newBlock: Block = {
      id: Math.random().toString(36).slice(2, 11),
      type,
      title,
      content: type === "code" ? codeBlock : "",
      language,
    };
    const newBlocks = [...blocks];
    newBlocks.splice(index + 1, 0, newBlock);
    setBlocks(newBlocks);
    setHoveredIndex(null);
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
    <div className="mx-auto min-h-screen">
      <Reorder.Group
        axis="y"
        values={blocks}
        onReorder={setBlocks}
        className="space-y-4"
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
                />
              </div>
            );
          })}
      </Reorder.Group>
    </div>
  );
}
