export type BlockType = "text" | "code";

export interface Block {
  id: string;
  type: BlockType;
  content: string;
}

export interface NotebookMeta {
  id: string;
  title: string;
  createdAt: number;
}

export interface Notebook extends NotebookMeta {
  updatedAt: number;
  blocks: Block[];
}
