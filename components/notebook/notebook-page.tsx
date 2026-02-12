"use client";

import { Reorder } from "framer-motion";
import { useEffect, useState } from "react";
import { useAutomergeSync } from "@/hooks/use-automerge-sync";
import { useLocalStorage } from "@/hooks/use-local-storate";
import type { BlockMetadata, BlockType, Language } from "@/lib/types";
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
  const { isDragging, setIsDragging } = useNotebook();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [autoSaveInterval, _setAutoSaveInterval] = useLocalStorage<number>(
    "editor-autosave-interval",
    10000,
  );

  const {
    doc,
    isConnected,
    addBlockSync,
    updateBlockContent,
    updateBlockMetadataSync,
    deleteBlock,
    reorderBlocks,
  } = useAutomergeSync(pageId);

  const blocks = doc?.blocks || [];

  console.log(doc?.id);

  useEffect(() => {
    if (!autoSaveInterval || autoSaveInterval <= 0) return;

    const interval = setInterval(() => {
      console.log("Auto-save disparado!");
    }, autoSaveInterval);

    return () => clearInterval(interval);
  }, [autoSaveInterval]);

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

  const handleAddBlock = (
    index: number,
    type: BlockType,
    language?: Language,
    metadata?: BlockMetadata,
  ) => {
    const content = getInitialCode(language ?? "rust");
    const title = getBlockTitle(type, language ?? "rust", blocks.length);

    addBlockSync(index, type, content, language ?? "rust", title);
    setHoveredIndex(null);
  };

  if (!isConnected) {
    return <div>Conectando ao servidor...</div>;
  }

  return (
    <div className="min-h-screen flex flex-row w-full">
      <Reorder.Group
        axis="y"
        values={blocks}
        onReorder={reorderBlocks}
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
                code: `import { App as Component } from "./${blockName}"; export default function Main() { return <Component />; }`,
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
                  addBlock={handleAddBlock}
                />

                <ReorderItem
                  block={block}
                  isDragging={isDragging}
                  pageFiles={pageFiles}
                  pageBlocks={blocks}
                  setBlocks={() => {}}
                  setIsDragging={setIsDragging}
                  removeBlock={deleteBlock}
                  updateBlock={updateBlockContent}
                  updateBlockMetadata={updateBlockMetadataSync}
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
