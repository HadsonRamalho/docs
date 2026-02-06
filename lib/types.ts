import { CalloutContainerProps } from "fumadocs-ui/components/callout";

export type BlockType = "text" | "code" | "component";
export type Language = "rust" | "typescript" | "python";
export type RunStatus = "idle" | "success" | "error";
export type TsMode = "simple" | "advanced";

export type BlockComponentType =
  | "callout"
  | "card"
  | "steps"
  | "tabs"
  | "github_repo";

export interface CalloutMetadata {
  type: "callout";
  props: CalloutContainerProps;
}

export interface CardMetadata {
  type: "card";
  props: {
    title: string;
    description?: string;
    href?: string;
  };
}

export interface GithubRepoMetadata {
  type: "github_repo";
  props: {
    owner: string;
    repo: string;
  };
}

export type BlockMetadata =
  | CardMetadata
  | CalloutMetadata
  | GithubRepoMetadata
  | { type: "generic"; props?: Record<string, any> };

export interface Block {
  id: string;
  title: string;
  type: BlockType;
  content: string;
  language?: Language;
  metadata?: BlockMetadata;
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
