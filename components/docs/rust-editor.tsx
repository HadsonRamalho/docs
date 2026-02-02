"use client";

import Editor from "@monaco-editor/react";
import {
  Play,
  Loader2,
  Terminal,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { useState } from "react";

interface RustNotebookProps {
  code: string;
  onCodeChange: (newCode: string) => void;
  isDragging?: boolean;
}

export function RustNotebook({
  code,
  onCodeChange,
  isDragging = false,
}: RustNotebookProps) {
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const getFileName = (codeVal: string): string => {
    const match = codeVal.match(/^\/\/ *#\[mod=([a-zA-Z0-9_]+)\]/m);
    return match && match[1] ? `${match[1]}.rs` : "main.rs";
  };

  async function handleRun() {
    setIsRunning(true);
    setStatus("idle");
    setOutput("");
    try {
      const response = await fetch(
        "https://fxppb0wx-3001.brs.devtunnels.ms/run",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
        },
      );
      const data = await response.json();
      if (data.stderr) {
        setStatus("error");
        setOutput(data.stderr);

        if (data.stderr.includes("file not found for module")) {
          setOutput(
            "Falha relacionada a outro módulo. Tente compilar outros blocos primeiro :))\n\n" +
              data.stderr,
          );
          return;
        }

        if (
          data.stderr.includes(
            "Finished `dev` profile [unoptimized + debuginfo] ",
          )
        ) {
          setOutput("Bloco compilado!");
          setStatus("success");
          return;
        }
        return;
      }

      setOutput(data.stdout || "Código executado com sucesso.");
      setStatus("success");
    } catch (err) {
      setOutput("Erro: Não foi possível conectar ao servidor Rust.");
      setStatus("error");
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <div
      className={`flex flex-col gap-6 w-full mb-6 mt-2 ${isDragging ? "pointer-events-none" : ""}`}
    >
      <div className="flex flex-col rounded-xl border border-[#333] bg-[#1e1e1e] shadow-2xl overflow-hidden transition-all duration-300 hover:border-[#444]">
        <div className="flex items-center justify-between bg-[#252525] px-4 py-2 border-b border-[#333]">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-[#888]">
              <Terminal size={14} />
              <span className="text-xs font-mono uppercase tracking-widest">
                {getFileName(code)}
              </span>
            </div>
          </div>
          <button
            disabled={isRunning}
            onClick={handleRun}
            className={`
                flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-bold transition-all
                ${
                  isRunning
                    ? "bg-[#444] text-[#888] cursor-not-allowed"
                    : "bg-emerald-600 text-white hover:bg-emerald-500 active:scale-95 shadow-lg shadow-emerald-900/20"
                }
            `}
          >
            {isRunning ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Play className="size-3.5 fill-current" />
            )}
            {isRunning ? "Compilando..." : "Executar"}
          </button>
        </div>

        <div className="relative group">
          {isDragging ? (
            <p>Termine de ordenar antes de continuar editando...</p>
          ) : (
            <Editor
              height="280px"
              defaultLanguage="rust"
              theme="vs-dark"
              value={code}
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
                  className={`flex items-center gap-1.5 text-[10px] font-bold uppercase ${status === "success" ? "text-green-500" : "text-red-500"}`}
                >
                  {status === "success" ? (
                    <CheckCircle2 size={12} />
                  ) : (
                    <AlertCircle size={12} />
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
                <span className="text-[#444] italic">// Output...</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
