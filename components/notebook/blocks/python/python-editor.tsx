"use client";
import Editor from "@monaco-editor/react";
import { AlertCircle, CheckCircle2, Terminal } from "lucide-react";
import Script from "next/script";
import { useState } from "react";
import type { Block, RunStatus, TsMode } from "@/lib/types";
import { EditorHeader } from "../default/editor-header";
import { RunButton } from "../default/run-button";

interface PythonSandboxProps {
  block: Block;
  isDragging: boolean;
  onCodeChange: (newCode: string) => void;
}

export default function PythonSandbox({
  onCodeChange,
  isDragging,
  block,
}: PythonSandboxProps) {
  const [output, setOutput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [status, setStatus] = useState<RunStatus>("idle");

  async function handleRun() {
    setIsRunning(true);
    const { RunPythonInSandbox } = await import("../../../../lib/api");
    const res = await RunPythonInSandbox(block.content);

    if (res.error) {
      setOutput(`Erro: ${res.error}`);
      setStatus("error");
    } else {
      setOutput(res.output || res.result);
      setStatus("success");
    }
    setIsRunning(false);
  }

  return (
    <div className="rounded-lg p-2">
      <Script
        src="https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js"
        onLoad={() => setIsLoading(false)}
      />
      <div
        className={`flex flex-col gap-6 w-full mb-6 mt-2 ${isDragging ? "pointer-events-none" : ""}`}
      >
        <div className="flex flex-col rounded-xl border border-[#333] bg-[#1e1e1e] shadow-2xl overflow-hidden transition-all duration-300 hover:border-[#444]">
          <div className="flex items-center justify-between bg-[#252525] px-4 py-2 border-b border-[#333]">
            <EditorHeader
              block={block}
              pageBlocks={[]}
              setBlocksAction={(_b: Block[]): void => {}}
              mode={"simple"}
              babelReady={false}
              handleRunSimple={(): void => {}}
              setMode={(_m: TsMode): void => {}}
              setShowPreview={(_s: boolean): void => {}}
              showPreview={false}
            />
            <RunButton
              isRunning={isRunning}
              handleRun={handleRun}
              isLoading={isLoading}
            />
          </div>

          <div className="relative group">
            {isDragging ? (
              <div className="h-100">
                <p>Termine de editar antes de continuar escrevendo...</p>
              </div>
            ) : (
              <Editor
                height="280px"
                defaultLanguage="python"
                theme="vs-dark"
                value={block.content}
                onChange={(v) => onCodeChange(v || "")}
                options={{
                  fontSize: 14,
                  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                  minimap: { enabled: false },
                  lineNumbers: "on",
                  padding: { top: 16, bottom: 16 },
                  scrollBeyondLastLine: false,
                }}
              />
            )}
          </div>

          {!isDragging && (
            <div className="border-t border-[#333] bg-[#0f0f0f]">
              <div className="flex items-center justify-between px-4 py-2 bg-[#1a1a1a] border-b border-[#333]">
                <span className="text-[10px] font-bold text-[#555] uppercase tracking-widest">
                  Console
                </span>
                {status !== "idle" && (
                  <div
                    className={`flex items-center gap-1.5 text-[12px] font-bold uppercase ${status === "success" ? "text-emerald-500" : "text-red-500"}`}
                  >
                    {status === "success" ? (
                      <CheckCircle2 size={16} />
                    ) : (
                      <AlertCircle size={16} />
                    )}
                    {status === "success" ? "Sucesso" : "Falha"}
                  </div>
                )}
              </div>
              <div className="p-4 font-mono text-sm min-h-20 max-h-60 overflow-y-auto custom-scrollbar">
                {output ? (
                  <pre
                    className={`whitespace-pre-wrap ${status === "error" ? "text-red-400" : "text-gray-300"}`}
                  >
                    {output}
                  </pre>
                ) : (
                  <span className="text-[#444] italic">Output...</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
