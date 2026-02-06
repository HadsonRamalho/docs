"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Boxes,
  Code2,
  Loader,
  Pi,
  Plus,
  ChevronLeft,
  AlertCircle,
  Info,
  Zap,
  Terminal,
  Box,
} from "lucide-react";
import { useState } from "react";
import type { BlockType, Language, BlockMetadata } from "@/lib/types";

interface ReorderToolsProps {
  hoveredIndex: number | null;
  index: number;
  addBlock: (
    index: number,
    type: BlockType,
    language?: Language,
    metadata?: BlockMetadata,
  ) => void;
}

type ToolButtonConfig = {
  label: string;
  icon: React.ReactNode;
  color: string;
  onClick?: () => void;
  targetView?: string;
};

export function ReorderTools({
  hoveredIndex,
  index,
  addBlock,
}: ReorderToolsProps) {
  const [view, setView] = useState<string>("main");

  const resetView = () => setView("main");

  const menuRegistry: Record<
    string,
    { buttons: ToolButtonConfig[]; parent?: string }
  > = {
    main: {
      buttons: [
        {
          label: "Texto",
          icon: <Plus size={14} />,
          color: "hover:text-blue-400",
          onClick: () => addBlock(index, "text"),
        },
        {
          label: "Código",
          icon: <Terminal size={14} />,
          color: "hover:text-orange-400",
          targetView: "languages",
        },
        {
          label: "UI",
          icon: <Loader size={14} />,
          color: "hover:text-emerald-400",
          targetView: "ui",
        },
      ],
    },
    languages: {
      parent: "main",
      buttons: [
        {
          label: "Rust",
          icon: <Code2 size={14} />,
          color: "hover:text-orange-500",
          onClick: () => addBlock(index, "code", "rust"),
        },
        {
          label: "React/TS",
          icon: <Boxes size={14} />,
          color: "hover:text-cyan-400",
          onClick: () => addBlock(index, "code", "typescript"),
        },
        {
          label: "Python",
          icon: <Pi size={14} />,
          color: "hover:text-indigo-500",
          onClick: () => addBlock(index, "code", "python"),
        },
      ],
    },
    ui: {
      parent: "main",
      buttons: [
        {
          label: "Callout",
          icon: <Info size={14} />,
          color: "hover:text-blue-400",
          targetView: "ui_callout",
        },
        {
          label: "Card",
          icon: <Box size={14} />,
          color: "hover:text-purple-400",
          onClick: () =>
            addBlock(index, "component", undefined, {
              type: "card",
              props: { title: "" },
            }),
        },
      ],
    },
    ui_callout: {
      parent: "ui",
      buttons: [
        {
          label: "Info",
          icon: <Info size={14} />,
          color: "hover:text-blue-400",
          onClick: () => addCallout("info"),
        },
        {
          label: "Aviso",
          icon: <Zap size={14} />,
          color: "hover:text-yellow-500",
          onClick: () => addCallout("warn"),
        },
        {
          label: "Erro",
          icon: <AlertCircle size={14} />,
          color: "hover:text-red-500",
          onClick: () => addCallout("error"),
        },
      ],
    },
  };

  const addCallout = (type: "info" | "warn" | "error") => {
    addBlock(index, "component", undefined, {
      type: "callout",
      props: { type },
    });
    resetView();
  };

  const currentMenu = menuRegistry[view];

  return (
    <AnimatePresence onExitComplete={resetView}>
      {hoveredIndex === index && (
        <motion.div
          initial={{ y: 10, scale: 0.95, opacity: 0 }}
          animate={{ y: 0, scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="absolute -bottom-8 left-1/2 -translate-x-1/2 z-50 w-max max-w-[90vw]"
        >
          <div className="flex bg-card items-center gap-1 border border-white/10 p-1.5 rounded-2xl shadow-2xl backdrop-blur-xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={view}
                initial={{ x: 5, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -5, opacity: 0 }}
                className="flex items-center gap-1"
              >
                {currentMenu.parent && (
                  <BackButton onClick={() => setView(currentMenu.parent!)} />
                )}

                {currentMenu.buttons.map((btn, i) => (
                  <ToolButton
                    key={btn.label}
                    icon={btn.icon}
                    label={btn.label}
                    color={btn.color}
                    onClick={() => {
                      if (btn.targetView) setView(btn.targetView);
                      if (btn.onClick) btn.onClick();
                    }}
                  />
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const ToolButton = ({ onClick, icon, label, color }: any) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-1.5 px-3 py-2 sm:py-1.5 hover:bg-white/5 text-gray-400 ${color} rounded-xl transition-all text-[10px] font-bold uppercase tracking-tight`}
  >
    {icon} <span>{label}</span>
  </button>
);

const BackButton = ({ onClick }: { onClick: () => void }) => (
  <button
    onClick={onClick}
    className="p-2 mr-1 hover:bg-white/10 rounded-xl text-gray-500 transition-colors"
  >
    <ChevronLeft size={14} />
  </button>
);
