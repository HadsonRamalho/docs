"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Trash2, GripVertical, Code2 } from "lucide-react";
import { motion, Reorder, AnimatePresence } from "framer-motion";
import { RustNotebook } from "./rust-editor";
import { useNotebook } from "./notebook-context";
import { useDragControls } from "framer-motion";
import { useNotebookManager } from "./notebook-manager";
import Markdown from "react-markdown";

type BlockType = "text" | "code";

interface Block {
  id: string;
  type: BlockType;
  content: string;
}

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
  const [blocks, setBlocks] = useState<Block[]>([
    {
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

  const addBlock = (index: number, type: BlockType) => {
    const newBlock: Block = {
      id: Math.random().toString(36).slice(2, 11),
      type,
      content:
        type === "code"
          ? '// Escreva seu código Rust aqui :))\nfn main() {\n    println!("Olá mundo!");\n}'
          : "",
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
        {blocks.map((block, index) => (
          <div
            key={block.id}
            className="relative group overflow-visible"
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <AnimatePresence>
              {hoveredIndex === index && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{ bottom: "50px", left: "-125px" }}
                  className="absolute z-50 flex items-center gap-2 group/adder"
                >
                  <div className="flex items-center gap-1 bg-[#1a1a1a] border border-[#333] p-0.5 rounded-md shadow-xl backdrop-blur-sm">
                    <button
                      onClick={() => {
                        addBlock(index, "text");
                        triggerAddBlock();
                      }}
                      className="flex items-center gap-1.5 px-2 py-1 hover:bg-[#252525] text-[#555] hover:text-blue-400 hover:cursor-pointer rounded transition-colors"
                    >
                      <Plus size={12} />
                      <span className="text-sm font-medium uppercase">
                        Texto
                      </span>
                    </button>
                    <div className="w-px h-3 bg-[#333]" />
                    <button
                      onClick={() => addBlock(index, "code")}
                      className="flex items-center gap-1.5 px-2 py-1 hover:bg-[#252525] text-[#555] hover:cursor-pointer hover:text-emerald-500 rounded transition-colors"
                    >
                      <Code2 size={12} />
                      <span className="text-sm font-medium uppercase">
                        Código
                      </span>
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
        ))}
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
