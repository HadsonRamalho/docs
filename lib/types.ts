export type BlockType = "text" | "code";
export type Language = "rust" | "typescript" | "python";
export type RunStatus = "idle" | "success" | "error";
export type TsMode = "simple" | "advanced";

export interface Block {
  id: string;
  title: string;
  type: BlockType;
  content: string;
  language?: Language;
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
