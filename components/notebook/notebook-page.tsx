"use client";

import { getCookie } from "cookies-next";
import { Reorder } from "framer-motion";
import { useMemo, useState } from "react";
import { useAutomergeSync } from "@/hooks/use-automerge-sync";
import type { Block, BlockMetadata, BlockType, Language } from "@/lib/types";
import { InlineTOC } from "../inline-toc";
import { Button } from "../ui/button";
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
  const tokenX = getCookie("auth_token");
  const token = tokenX?.toString() || "";

  const {
    doc,
    isConnected,
    addBlockSync,
    updateBlockContent,
    updateBlockMetadataSync,
    deleteBlock,
    reorderBlocks,
  } = useAutomergeSync(pageId, token);

  const blocks = useMemo(() => {
    if (!doc || !doc.blocks) return [];
    const data = JSON.parse(JSON.stringify(doc.blocks));
    return data as Block[];
  }, [doc]);

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
    const content =
      type === "code" ? getInitialCode(language ?? "rust") : "Escreva aqui";
    const title = getBlockTitle(type, language ?? "rust", blocks.length);

    addBlockSync(index, type, content, language, title, metadata);
    setHoveredIndex(null);
  };

  if (!doc || !isConnected) {
    return (
      <div className="flex h-screen w-full items-center justify-center text-muted-foreground">
        <h2>Conectando ao servidor...</h2>
      </div>
    );
  }

  if (blocks.length === 0) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center text-muted-foreground space-y-4">
        <h2>Esta página está vazia.</h2>
        <Button
          onClick={() => handleAddBlock(-1, "text")}
          className="px-4 py-2 bg-fd-primary text-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          Adicionar Primeiro Bloco
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-row w-full">
      <Reorder.Group
        axis="y"
        values={blocks}
        onReorder={reorderBlocks}
        className="space-y-4 w-full"
      >
        {blocks.map((block, index) => {
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
