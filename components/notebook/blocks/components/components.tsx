"use client";

import type { Block } from "@/lib/types";
import { Callout } from "fumadocs-ui/components/callout";
import { TextBlock } from "../text/text-block";
import { Card } from "fumadocs-ui/components/card";

interface ComponentRendererProps {
  block: Block;
  updateBlockAction: (id: string, content: string) => void;
}

export function ComponentRenderer({
  block,
  updateBlockAction,
}: ComponentRendererProps) {
  const metadata = block.metadata;

  switch (metadata?.type) {
    case "callout":
      return (
        <div className="group relative my-4">
          <Callout type={metadata.props?.type || "info"}>
            <TextBlock
              content={block.content}
              onChange={(newVal) => updateBlockAction(block.id, newVal)}
            />
          </Callout>
        </div>
      );

    case "card":
      return (
        <div className="group relative my-4">
          <Card title={block.metadata?.props?.title}>
            <TextBlock
              content={block.content}
              onChange={(newVal) => updateBlockAction(block.id, newVal)}
            />
          </Card>
        </div>
      );

    default:
      return (
        <div className="p-4 border border-dashed border-white/10 rounded-lg italic text-gray-500">
          Componente {metadata?.type} em desenvolvimento...
        </div>
      );
  }
}
