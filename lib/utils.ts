import { type ClassValue, clsx } from "clsx";
import type { TOCItemType } from "fumadocs-core/toc";
import Slugger from "github-slugger";
import { twMerge } from "tailwind-merge";
import type { Block } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function extractTOCFromBlocks(blocks: Block[]): TOCItemType[] {
  const slugger = new Slugger();
  const items: TOCItemType[] = [];

  blocks.forEach((block) => {
    if (block.type === "text") {
      const regex = /^(#{1,6})\s+(.+)$/gm;
      let match;

      while ((match = regex.exec(block.content)) !== null) {
        const depth = match[1].length;
        const title = match[2].trim();
        const url = "#" + slugger.slug(title);

        items.push({
          title,
          url,
          depth,
        });
      }
    }
  });

  return items;
}
