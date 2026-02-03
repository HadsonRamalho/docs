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

export async function RunTsx(
  block: Block,
  containerId: string,
  pageBlocks: Block[],
) {
  try {
    const babel = (window as any).Babel;
    if (!babel) throw new Error("Babel não encontrado.");

    const moduleEntries = pageBlocks
      .filter((b) => b.type === "code" && b.id !== block.id)
      .map((b) => {
        const name = b.title.replace(/[^a-zA-Z0-9]/g, "_");
        const transpilado = babel.transform(b.content, {
          filename: `${name}.tsx`,
          presets: ["react", "typescript"],
        }).code;

        const mBlob = new Blob(
          [
            `
          import React from "https://esm.sh/react@18";
          ${transpilado}
        `,
          ],
          { type: "text/javascript" },
        );

        return [name, URL.createObjectURL(mBlob)];
      });

    const moduleMap = Object.fromEntries(moduleEntries);

    let output = babel.transform(block.content, {
      filename: "App.tsx",
      presets: ["react", "typescript"],
    }).code;

    Object.entries(moduleMap).forEach(([name, url]) => {
      const regex = new RegExp(`from\\s+['"]\\.?\\/?${name}['"]`, "g");
      output = output.replace(regex, `from "${url}"`);
    });

    const blobContent = `
      import React from "https://esm.sh/react@18";
      import ReactDOM from "https://esm.sh/react-dom@18/client";
      window.React = React;

      ${output}

      (async () => {
        const container = document.getElementById("${containerId}");
        if (!container) return;

        container.innerHTML = "";
        const root = ReactDOM.createRoot(container);

        try {
          const Component = (typeof App !== 'undefined') ? App : null;

          if (Component) {
            root.render(React.createElement(Component));
          } else {
             container.innerHTML = "<div style='color:orange;padding:10px;border:1px solid'> Certifique-se de que sua função se chama <b>App</b>.</div>";
          }
        } catch (e) {
          container.innerHTML = "<pre style='color:red'>" + e.message + "</pre>";
        }
      })();
    `;

    const blob = new Blob([blobContent], { type: "text/javascript" });
    const url = URL.createObjectURL(blob);

    const oldScript = document.getElementById(`script-${containerId}`);
    if (oldScript) oldScript.remove();

    const script = document.createElement("script");
    script.id = `script-${containerId}`;
    script.type = "module";
    script.src = url;
    document.head.appendChild(script);
  } catch (err: any) {
    console.error(err);
  }
}
