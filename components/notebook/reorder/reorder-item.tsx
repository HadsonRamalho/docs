"use client";

import { Trash2, GripVertical } from "lucide-react";
import { Reorder } from "framer-motion";
import { useDragControls } from "framer-motion";
import { Block } from "@/lib/types";
import { TextBlock } from "../blocks/text/text-block";
import { TsxEditor } from "../blocks/tsx/tsx-editor";
import { RustEditor } from "../blocks/rust/rust-editor";

interface ReorderItemProps {
  block: Block;
  isDragging: boolean;
  pageFiles: Record<string, any>;
  pageBlocks: Block[];
  setBlocks: (b: Block[]) => void;
  setIsDragging: (d: boolean) => void;
  removeBlock: (id: string) => void;
  updateBlock: (id: string, newContent: string) => void;
}

export function ReorderItem({
  block,
  setIsDragging,
  isDragging,
  pageBlocks,
  pageFiles,
  setBlocks,
  updateBlock,
  removeBlock,
}: ReorderItemProps) {
  const dragControls = useDragControls();

  return (
    <Reorder.Item
      value={block}
      id={block.id}
      className="group/item flex items-start relative mb-4"
      dragControls={dragControls}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={() => setIsDragging(false)}
      dragListener={false}
    >
      <div
        className="absolute -left-6 top-2 flex flex-col gap-2 transition-opacity opacity-100 md:opacity-0 group-hover/item:opacity-100 hover:cursor-grab active:cursor-grabbing select-none touch-none"
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
          <TsxEditor
            pageFiles={pageFiles}
            block={block}
            pageBlocks={pageBlocks}
            setBlocksAction={setBlocks}
            updateBlockAction={updateBlock}
          />
        ) : (
          <RustEditor
            isDragging={isDragging}
            code={block.content}
            onCodeChange={(val: string) => updateBlock(block.id, val)}
          />
        )}
      </div>
    </Reorder.Item>
  );
}
