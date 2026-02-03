"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Boxes, Code2, Pi, Plus } from "lucide-react";
import type { BlockType, Language } from "@/lib/types";

interface ReorderToolsProps {
  hoveredIndex: number | null;
  index: number;
  addBlock: (index: number, type: BlockType, language?: Language) => void;
}

export function ReorderTools({
  hoveredIndex,
  index,
  addBlock,
}: ReorderToolsProps) {
  return (
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
              type="button"
              onClick={() => addBlock(index, "text")}
              className="flex items-center gap-1.5 px-3 py-1 hover:bg-[#252525] text-gray-400 hover:text-blue-400 rounded-full transition-colors text-xs font-bold uppercase"
            >
              <Plus size={14} /> Texto
            </button>
            <div className="w-px h-3 bg-[#333]" />
            <button
              type="button"
              onClick={() => addBlock(index, "code", "rust")}
              className="flex items-center gap-1.5 px-3 py-1 hover:bg-[#252525] text-gray-400 hover:text-orange-500 rounded-full transition-colors text-xs font-bold uppercase"
            >
              <Code2 size={14} /> Rust
            </button>
            <button
              type="button"
              onClick={() => addBlock(index, "code", "typescript")}
              className="flex items-center gap-1.5 px-3 py-1 hover:bg-[#252525] text-gray-400 hover:text-cyan-400 rounded-full transition-colors text-xs font-bold uppercase"
            >
              <Boxes size={14} /> React/TS
            </button>
            <button
              type="button"
              onClick={() => addBlock(index, "code", "python")}
              className="flex items-center gap-1.5 px-3 py-1 hover:bg-[#252525] text-gray-400 hover:text-indigo-500 rounded-full transition-colors text-xs font-bold uppercase"
            >
              <Pi size={14} /> Python
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
