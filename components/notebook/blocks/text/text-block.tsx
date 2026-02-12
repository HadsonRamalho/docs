"use client";
import { useState } from "react";
import Markdown from "react-markdown";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import { BlockEditor } from "../block-editor";

interface TextBlockProps {
  content: string;
  onChange: (v: string) => void;
}

export function TextBlock({ content, onChange }: TextBlockProps) {
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return (
      <BlockEditor
        className="w-full bg-muted text-foreground text-lg outline-none resize-none border-l-2 border-emerald-500  py-2"
        content={content}
        onBlur={() => {
          setIsEditing(false);
        }}
        onChange={(e) => onChange(e)}
        minHeight="60px"
        type="text"
      />
    );
  }

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: <.>
    // biome-ignore lint/a11y/useKeyWithClickEvents: <.>
    <div
      onClick={() => setIsEditing(true)}
      className="prose prose-invert max-w-none prose-headings:mt-2
      prose-headings:mb-1 prose-p:my-1 cursor-text hover:bg-white/5 p-2 rounded-lg transition-colors whitespace-pre-wrap"
    >
      {content ? (
        <Markdown rehypePlugins={[rehypeSlug, remarkGfm]}>{content}</Markdown>
      ) : (
        <span className="text-gray-600 italic">Clique para escrever...</span>
      )}
    </div>
  );
}
