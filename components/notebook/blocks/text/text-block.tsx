"use client";
import { useState } from "react";
import Markdown from "react-markdown";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";

interface TextBlockProps {
  content: string;
  onChange: (v: string) => void;
}

export function TextBlock({ content, onChange }: TextBlockProps) {
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return (
      <textarea
        className="w-full bg-transparent text-gray-200 text-lg outline-none resize-none border-l-2 border-emerald-500 pl-4 py-2"
        value={content}
        onBlur={() => setIsEditing(false)}
        onChange={(e) => onChange(e.target.value)}
        rows={content.split("\n").length || 1}
        style={{ minHeight: "60px" }}
      />
    );
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className="prose prose-invert max-w-none prose-headings:mt-2 prose-headings:mb-1 prose-p:my-1 cursor-text hover:bg-white/5 p-2 rounded-lg transition-colors"
    >
      {content ? (
        <Markdown rehypePlugins={[rehypeSlug, remarkGfm]}>{content}</Markdown>
      ) : (
        <span className="text-gray-600 italic">Clique para escrever...</span>
      )}
    </div>
  );
}
