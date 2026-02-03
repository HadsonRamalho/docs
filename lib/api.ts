import { env } from "@/lib/env";
import { Block, RunStatus } from "./types";

interface RunRustProps {
  setOutput: (o: string) => void;
  setStatus: (s: RunStatus) => void;
  setIsRunning: (r: boolean) => void;
  code: string;
}

export async function RunRust({
  setOutput,
  setIsRunning,
  setStatus,
  code,
}: RunRustProps) {
  try {
    env.loadEnv();
  } catch (e) {
    console.error("Erro de configuração:", e);
    setOutput("Erro interno: Ambiente não configurado corretamente.");
    setStatus("error");
    setIsRunning(false);
    return;
  }

  const API_URL = env.get("NEXT_PUBLIC_RUST_NOTEBOOK_API");
  setIsRunning(true);
  setStatus("idle");
  setOutput("");
  try {
    const response = await fetch(`${API_URL}/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
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
    console.error(err);
    setOutput("Erro: Não foi possível conectar ao servidor Rust.");
    setStatus("error");
  } finally {
    setIsRunning(false);
  }
}

export async function RunTsxInSandbox(block: Block, pageBlocks: Block[]) {
  const babel = (window as any).Babel;

  const modulesData = pageBlocks
    .filter((b) => b.type === "code" && b.id !== block.id)
    .reduce(
      (acc, b) => {
        const name = `./${b.title.replace(/[^a-zA-Z0-9]/g, "_")}`;
        const { code: transpilado } = babel.transform(b.content, {
          filename: "module.tsx",
          presets: ["react", "typescript"],
          plugins: [["transform-modules-commonjs"]],
        });
        acc[name] = transpilado;
        return acc;
      },
      {} as Record<string, string>,
    );

  const { code: mainCodeTranspiled } = babel.transform(block.content, {
    filename: "App.tsx",
    presets: ["react", "typescript"],
    plugins: [["transform-modules-commonjs"]],
  });

  const iframeHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <script type="importmap">
            { "imports": {
              "react": "https://esm.sh/react@18",
              "react-dom/client": "https://esm.sh/react-dom@18/client"
            }}
          </script>
        </head>
        <body style="margin:0; background: #1a1a1a; color: white; font-family: sans-serif;">
          <div id="root"></div>
          <script type="module">
            import React from "react";
            import ReactDOM from "react-dom/client";
            window.React = React;
            Object.defineProperty(window, 'parent', { get: () => undefined });

            const virtualFS = ${JSON.stringify(modulesData)};
            const mainCode = ${JSON.stringify(mainCodeTranspiled)};
            const cache = {};

            function require(path) {
              if (path === "react") return React;
              if (cache[path]) return cache[path].exports;
              const code = virtualFS[path];
              if (!code) throw new Error("Módulo não encontrado: " + path);
              const module = { exports: {} };
              cache[path] = module;
              new Function("exports", "module", "require", "React", code)(module.exports, module, require, React);
              return module.exports;
            }

            try {
              const mainModule = { exports: {} };
              new Function("exports", "module", "require", "React", mainCode)(mainModule.exports, mainModule, require, React);

              const Component = mainModule.exports.default || mainModule.exports.App || window.App;

              if (Component) {
                const root = ReactDOM.createRoot(document.getElementById("root"));
                root.render(React.createElement(Component));
              } else {
                throw new Error("Componente App não encontrado. Verifique se usou 'export default' ou 'function App'");
              }
            } catch (e) {
              document.getElementById("root").innerHTML = "<div style='color:#ff5555; padding:20px; font-family:monospace;'><b>Erro de Execução:</b><br/>" + e.message + "</div>";
            }
          </script>
        </body>
      </html>
    `;
  const blob = new Blob([iframeHtml], { type: "text/html" });
  return URL.createObjectURL(blob);
}
