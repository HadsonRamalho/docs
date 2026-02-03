"use client";

import { Block, TsMode } from "@/lib/types";
import {
  SandpackCodeEditor,
  SandpackConsole,
  SandpackInternalOptions,
  SandpackLayout,
  SandpackPreview,
  SandpackProvider,
} from "@codesandbox/sandpack-react";
import { Eye, EyeClosed, Play } from "lucide-react";
import { useEffect, useState } from "react";
import { SandpackManager } from "./sandpack-manager";
import { RunTsx } from "@/lib/api";

interface TsxEditorProps {
  pageFiles: Record<string, any>;
  block: Block;
  pageBlocks: Block[];
  setBlocksAction: (blocks: Block[]) => void;
  updateBlockAction: (id: string, newContent: string) => void;
}

interface RenderPreviewProps {
  id: string;
  mode: TsMode;
}

function RenderPreview({ id, mode }: RenderPreviewProps) {
  if (mode === "simple")
    return (
      <div id={`preview-${id}`} className="bg-card p-4 max-w-1/2 overflow-auto">
        <p className="text-muted-foreground">O conteúdo aparecerá aqui...</p>
      </div>
    );

  if (mode === "advanced") {
    return (
      <SandpackPreview
        showNavigator={false}
        showRestartButton={true}
        showOpenNewtab={false}
        showOpenInCodeSandbox={false}
        className="h-100"
      />
    );
  }
}

export function TsxEditor({
  pageFiles,
  block,
  pageBlocks,
  setBlocksAction,
  updateBlockAction,
}: TsxEditorProps) {
  const [showPreview, setShowPreview] = useState(true);
  const [mode, setMode] = useState<TsMode>("advanced");
  const containerId = `preview-${block.id}`;

  function loadBabel() {
    const script = document.createElement("script");
    script.src = "https://unpkg.com/@babel/standalone/babel.min.js";
    script.async = true;
    document.head.appendChild(script);

    script.onload = () => console.log("Babel carregado dinamicamente!");
  }
  useEffect(() => {
    if (!(window as any).Babel) {
      loadBabel();
    }
  }, []);

  const editorOptions: SandpackInternalOptions = {
    initMode: "lazy",
    recompileMode: "delayed",
    recompileDelay: 1000,
  };
  const editorFiles = { ...pageFiles, "/App.tsx": block.content };

  const handleRunSimple = () => {
    RunTsx(block, containerId, pageBlocks);
  };

  return (
    <div className="rounded-lg overflow-hidden border border-[#333]">
      <SandpackProvider
        theme="dark"
        template="react-ts"
        files={editorFiles}
        options={editorOptions}
      >
        <div className="flex flex-col border border-[#333] rounded-lg overflow-hidden bg-[#1a1a1a]">
          <div className="flex items-center justify-end px-4 gap-2 py-2 bg-[#252525] border-b border-[#333]">
            <input
              value={block.title}
              onChange={(e) => {
                const newBlocks = pageBlocks.map((b) =>
                  b.id === block.id ? { ...b, title: e.target.value } : b,
                );
                setBlocksAction(newBlocks);
              }}
              className="bg-transparent text-foreground text-sm font-mono focus:outline-none focus:text-emerald-400 w-1/2"
              placeholder="Nome do componente..."
            />
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as any)}
              className="bg-background p-1 rounded-md text-xs text-foreground"
            >
              <option value="advanced">Modo Sandpack</option>
              <option value="simple">Modo Nativo</option>
            </select>

            {mode === "simple" && (
              <button
                onClick={handleRunSimple}
                className="px-3 py-1 text-xs bg-[#333] hover:bg-[#444] text-white rounded transition-colors"
              >
                <div className="flex items-center justify-center gap-2">
                  <Play className="size-4" /> Executar
                </div>
              </button>
            )}
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
              showRunButton={mode === "advanced"}
              className="h-100 text-[0.9rem]"
            />
            {showPreview && <RenderPreview id={block.id} mode={mode} />}
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
