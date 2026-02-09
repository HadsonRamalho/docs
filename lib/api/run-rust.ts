import type { RunStatus } from "../types";
import { api } from "./base";

interface RunRustProps {
  setOutput: (o: string) => void;
  setStatus: (s: RunStatus) => void;
  setIsRunning: (r: boolean) => void;
  code: string;
}

interface RustApiResponse {
  stdout?: string;
  stderr?: string;
}

export async function RunRust({
  setOutput,
  setIsRunning,
  setStatus,
  code,
}: RunRustProps) {
  setIsRunning(true);
  setStatus("idle");
  setOutput("");
  try {
    const data: RustApiResponse = await api.post("/run", {
      code,
    });
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
          "Finished `dev` profile [unoptimized + debuginfo]",
        ) ||
        data.stderr.includes("Finished dev [unoptimized + debuginfo]")
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
