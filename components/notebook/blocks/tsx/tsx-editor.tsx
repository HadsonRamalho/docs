"use client";

import { Block } from "@/lib/types";
import {
  SandpackCodeEditor,
  SandpackConsole,
  SandpackInternalOptions,
  SandpackLayout,
  SandpackPreview,
  SandpackProvider,
} from "@codesandbox/sandpack-react";
import { Eye, EyeClosed } from "lucide-react";
import { useState } from "react";
import { SandpackManager } from "./sandpack-manager";

interface TsxEditorProps {
  pageFiles: Record<string, any>;
  block: Block;
  pageBlocks: Block[];
  setBlocksAction: (blocks: Block[]) => void;
  updateBlockAction: (id: string, newContent: string) => void;
}

export function TsxEditor({
  pageFiles,
  block,
  pageBlocks,
  setBlocksAction,
  updateBlockAction,
}: TsxEditorProps) {
  const [showPreview, setShowPreview] = useState(true);
  const editorOptions: SandpackInternalOptions = {
    initMode: "lazy",
    recompileMode: "delayed",
    recompileDelay: 1000,
  };
  const editorFiles = { ...pageFiles, "/App.tsx": block.content };

  return (
    <div className="rounded-lg overflow-hidden border border-[#333]">
      <SandpackProvider
        theme="dark"
        template="react-ts"
        files={editorFiles}
        options={editorOptions}
      >
        <div className="flex flex-col border border-[#333] rounded-lg overflow-hidden bg-[#1a1a1a]">
          <div className="flex items-center justify-end px-4 py-2 bg-[#252525] border-b border-[#333]">
            <input
              value={block.title}
              onChange={(e) => {
                const newBlocks = pageBlocks.map((b) =>
                  b.id === block.id ? { ...b, title: e.target.value } : b,
                );
                setBlocksAction(newBlocks);
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
                  <Eye className="size-4" /> Ocultar Renderização
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
            onChange={(val) => updateBlockAction(block.id, val)}
          />
        </div>
      </SandpackProvider>
    </div>
  );
}
