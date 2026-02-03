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
import { Cpu, Eye, EyeClosed, Play, Wifi } from "lucide-react";
import { useEffect, useState } from "react";
import { SandpackManager } from "./sandpack-manager";
import { RunTsxInSandbox } from "@/lib/api";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  sandboxUrl: string | null;
}

function RenderPreview({ id, mode, sandboxUrl }: RenderPreviewProps) {
  if (mode === "simple") {
    return (
      <div id={`preview-${id}`} className="bg-white overflow-hidden relative">
        {sandboxUrl ? (
          <iframe
            src={sandboxUrl}
            sandbox="allow-scripts"
            className="w-full h-full border-none"
          />
        ) : (
          <div className="p-4 text-gray-400 italic">
            Clique em "Executar" para renderizar...
          </div>
        )}
      </div>
    );
  }

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
  const [sandboxUrl, setSandboxUrl] = useState<string | null>(null);

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

  const handleRunSimple = async () => {
    const url = await RunTsxInSandbox(block, pageBlocks);
    setSandboxUrl(url);
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
          <div className="grid grid-cols-1 md:flex items-center justify-end px-4 gap-2 py-2 bg-[#252525] border-b border-[#333]">
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

            <div className="grid grid-cols-1 md:flex flex-cols gap-2 w-full justify-end">
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
              <Select
                onValueChange={(e) => {
                  setMode(e as TsMode);
                }}
              >
                <SelectTrigger className="bg-[#333] hover:bg-[#444] py-5 w-full justify-center md:w-44 h-full rounded text-foreground">
                  <SelectValue
                    placeholder={
                      mode === "advanced" ? (
                        <div className="flex justify-center">
                          <Wifi /> Modo Sandpack
                        </div>
                      ) : (
                        <div className="flex justify-center">
                          <Cpu />
                          Modo Nativo
                        </div>
                      )
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="advanced">
                      <Wifi /> Modo Sandpack
                    </SelectItem>
                    <SelectItem value="simple">
                      <Cpu />
                      Modo Nativo
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
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
          </div>
          <SandpackLayout>
            <SandpackCodeEditor
              showTabs
              showLineNumbers
              showInlineErrors
              showRunButton={mode === "advanced"}
              className="h-100 text-[0.9rem]"
            />
            {showPreview && (
              <RenderPreview
                sandboxUrl={sandboxUrl}
                id={block.id}
                mode={mode}
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
