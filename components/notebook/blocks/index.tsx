import type { Block, BlockType, Language } from "@/lib/types";
import { ReorderItem } from "../reorder/reorder-item";
import { ReorderTools } from "../reorder/reorder-tools";

interface RenderBlockProps {
  block: Block;
  isDragging: boolean;
  pageFiles: Record<string, any>;
  pageBlocks: Block[];
  index: number;
  hoveredIndex: number | null;
  setBlocks: (b: Block[]) => void;
  setIsDragging: (d: boolean) => void;
  removeBlock: (id: string) => void;
  updateBlock: (id: string, newContent: string) => void;
  setHoveredIndex: (i: number | null) => void;
  addBlock: (index: number, type: BlockType, language?: Language) => void;
}

export function RenderBlock({
  block,
  setIsDragging,
  isDragging,
  pageBlocks,
  pageFiles,
  index,
  setBlocks,
  updateBlock,
  removeBlock,
  setHoveredIndex,
  hoveredIndex,
  addBlock,
}: RenderBlockProps) {
  const getFileName = (title: string) => {
    return title.replace(/[^a-zA-Z0-9]/g, "_");
  };

  const blockName = getFileName(block.title);
  const currentBlockFileName = `/${blockName}.tsx`;
  const isTS = block.language === "typescript";
  const filesForThisBlock = {
    ...pageFiles,
    [currentBlockFileName]: block.content,
  };
  if (isTS) {
    const tsCode = `
    import { App as Component } from "./${blockName}";
    export default function Main() {
      return <Component />;
    }
    `;
    filesForThisBlock["/App.tsx"] = {
      code: tsCode,
      hidden: true,
    };
  }
  delete filesForThisBlock[currentBlockFileName];

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: <Necessário para interagir com o render>
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
        pageBlocks={pageBlocks}
        setBlocks={setBlocks}
        setIsDragging={setIsDragging}
        removeBlock={removeBlock}
        updateBlock={updateBlock}
        updateBlockMetadata={() => {}}
      />
    </div>
  );
}
