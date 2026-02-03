import { Loader2, Play } from "lucide-react";

interface RunButtonProps {
  isRunning: boolean;
  handleRun: () => void;
  isLoading: boolean;
}

export function RunButton({ isRunning, handleRun, isLoading }: RunButtonProps) {
  return (
    <button
      type="button"
      disabled={isRunning || isLoading}
      onClick={handleRun}
      className={`
      flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-bold transition-all
      ${
        isRunning || isLoading
          ? "bg-[#444] text-[#888] cursor-not-allowed"
          : "bg-emerald-600 text-white hover:bg-emerald-500 active:scale-95 shadow-lg shadow-emerald-900/20"
      }`}
    >
      {isRunning ? (
        <Loader2 className="size-3.5 animate-spin" />
      ) : (
        <Play className="size-3.5 fill-current" />
      )}
      {isRunning ? "Compilando..." : "Executar"}
    </button>
  );
}
