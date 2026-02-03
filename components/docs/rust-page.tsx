"use client";

import { useState, useEffect, useRef } from "react";
import {
  Plus,
  Trash2,
  GripVertical,
  Code2,
  Boxes,
  Eye,
  EyeClosed,
} from "lucide-react";
import { motion, Reorder, AnimatePresence } from "framer-motion";
import { RustNotebook } from "./rust-editor";
import { useNotebook } from "./notebook-context";
import { useDragControls } from "framer-motion";
import {
  SandpackCodeEditor,
  SandpackConsole,
  SandpackLayout,
  SandpackPreview,
  SandpackProvider,
} from "@codesandbox/sandpack-react";
import Markdown from "react-markdown";
import { SandpackManager } from "./sandpack-manager";
import { Block, BlockType, Language } from "@/lib/types";

interface RustInteractivePageProps {
  pageId: string;
}

export default function RustInteractivePage({
  pageId = "default",
}: RustInteractivePageProps) {
  const {
    triggerAddBlock,
    saveSignal,
    setIsSaving,
    setHasSaved,
    isDragging,
    setIsDragging,
  } = useNotebook();
  const dragControls = useDragControls();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [showPreview, setShowPreview] = useState(true);
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

  const globalFiles = blocks.reduce(
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
        {blocks.map((block, index) => {
          const blockName = getFileName(block.title);
          const currentBlockFileName = `/${blockName}.tsx`;
          const isTS = block.language === "typescript";
          const filesForThisBlock = {
            ...globalFiles,
            currentBlockFileName: block.content,
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
              <AnimatePresence>
                {hoveredIndex === index && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="absolute -bottom-6 left-1/2 -translate-x-1/2 z-50"
                  >
                    <div className="flex items-center gap-1 bg-[#1a1a1a] border border-[#333] p-1 rounded-full shadow-2xl backdrop-blur-md">
                      <button
                        onClick={() => addBlock(index, "text")}
                        className="flex items-center gap-1.5 px-3 py-1 hover:bg-[#252525] text-gray-400 hover:text-blue-400 rounded-full transition-colors text-xs font-bold uppercase"
                      >
                        <Plus size={14} /> Texto
                      </button>
                      <div className="w-px h-3 bg-[#333]" />
                      <button
                        onClick={() => addBlock(index, "code", "rust")}
                        className="flex items-center gap-1.5 px-3 py-1 hover:bg-[#252525] text-gray-400 hover:text-orange-500 rounded-full transition-colors text-xs font-bold uppercase"
                      >
                        <Code2 size={14} /> Rust
                      </button>
                      <button
                        onClick={() => addBlock(index, "code", "typescript")}
                        className="flex items-center gap-1.5 px-3 py-1 hover:bg-[#252525] text-gray-400 hover:text-cyan-400 rounded-full transition-colors text-xs font-bold uppercase"
                      >
                        <Boxes size={14} /> React/TS
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <Reorder.Item
                value={block}
                id={block.id}
                className="group/item flex gap-4 items-start relative"
                dragControls={dragControls}
                onDragStart={() => setIsDragging(true)}
                onDragEnd={() => setIsDragging(false)}
              >
                <div
                  className="flex flex-col gap-2 mt-4 transition-opacity hover:cursor-grab active:cursor-grabbing"
                  onPointerDown={(e) => dragControls.start(e)}
                >
                  <GripVertical
                    size={16}
                    className="text-gray-600 cursor-grab active:cursor-grabbing"
                  />
                  <button
                    onClick={() => removeBlock(block.id)}
                    className="text-gray-600 hover:text-red-500"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="flex-1 min-w-0">
                  {block.type === "text" ? (
                    <TextBlock
                      content={block.content}
                      onChange={(val) => updateBlock(block.id, val)}
                    />
                  ) : block.language === "typescript" ? (
                    <div className="rounded-lg overflow-hidden border border-[#333]">
                      <SandpackProvider
                        theme="dark"
                        template="react-ts"
                        files={{ ...globalFiles, "/App.tsx": block.content }}
                        options={{
                          initMode: "lazy",
                          recompileMode: "delayed",
                          recompileDelay: 1000,
                        }}
                      >
                        <div className="flex flex-col border border-[#333] rounded-lg overflow-hidden bg-[#1a1a1a]">
                          <div className="flex items-center justify-end px-4 py-2 bg-[#252525] border-b border-[#333]">
                            <input
                              value={block.title}
                              onChange={(e) => {
                                const newBlocks = blocks.map((b) =>
                                  b.id === block.id
                                    ? { ...b, title: e.target.value }
                                    : b,
                                );
                                setBlocks(newBlocks);
                              }}
                              className="bg-transparent text-gray-300 text-sm font-mono focus:outline-none focus:text-cyan-400 w-1/2"
                              placeholder="Nome do componente..."
                            />
                            <button
                              onClick={() => setShowPreview(!showPreview)}
                              className="px-3 py-1 text-xs bg-[#333] hover:bg-[#444] text-white rounded transition-colors"
                            >
                              {showPreview ? (
                                <div className="flex items-center justify-center gap-2">
                                  <Eye className="size-4" /> Ocultar
                                  Renderização
                                </div>
                              ) : (
                                <div className="flex items-center justify-center gap-2">
                                  <EyeClosed className="size-4" />
                                  Mostrar Renderização
                                </div>
                              )}
                            </button>
                          </div>
                          <SandpackLayout>
                            <SandpackCodeEditor
                              showTabs
                              showLineNumbers
                              showInlineErrors
                              className="h-100 text-[0.9rem]"
                            />
                            {showPreview && (
                              <SandpackPreview
                                showNavigator={false}
                                showRestartButton={true}
                                showOpenNewtab={false}
                                showOpenInCodeSandbox={false}
                                className="h-100"
                              />
                            )}
                          </SandpackLayout>

                          <div className="border-t bg-card h-24">
                            <SandpackConsole
                              resetOnPreviewRestart={true}
                              showResetConsoleButton={true}
                              className="h-36"
                            />
                          </div>

                          <SandpackManager
                            code={block.content}
                            onChange={(val) => updateBlock(block.id, val)}
                          />
                        </div>
                      </SandpackProvider>
                    </div>
                  ) : (
                    <RustNotebook
                      isDragging={isDragging}
                      code={block.content}
                      onCodeChange={(val) => updateBlock(block.id, val)}
                    />
                  )}
                </div>
              </Reorder.Item>
            </div>
          );
        })}
      </Reorder.Group>
    </div>
  );
}

function TextBlock({
  content,
  onChange,
}: {
  content: string;
  onChange: (v: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return (
      <textarea
        autoFocus
        className="w-full bg-transparent text-gray-200 text-lg outline-none resize-none border-l-2 border-emerald-500 pl-4 py-2"
        value={content}
        onBlur={() => setIsEditing(false)}
        onChange={(e) => onChange(e.target.value)}
        rows={content.split("\n").length || 1}
        style={{ minHeight: "60px" }}
      />
    );
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className="prose prose-invert max-w-none prose-headings:mt-2 prose-headings:mb-1 prose-p:my-1 cursor-text hover:bg-white/5 p-2 rounded-lg transition-colors"
    >
      {content ? (
        <Markdown>{content}</Markdown>
      ) : (
        <span className="text-gray-600 italic">Clique para escrever...</span>
      )}
    </div>
  );
}
