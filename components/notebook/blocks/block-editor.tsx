import { javascript } from "@codemirror/lang-javascript";
import { markdown } from "@codemirror/lang-markdown";
import { python } from "@codemirror/lang-python";
import { rust } from "@codemirror/lang-rust";
import { EditorView } from "@codemirror/view";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import CodeMirror from "@uiw/react-codemirror";
import React, { useCallback } from "react";
import type { Language } from "@/lib/types";

interface BlockEditorProps {
  content: string;
  language: Language | "markdown";
  onChange: (val: string) => void;
  readOnly?: boolean;
  className?: string;
  minHeight?: string;
}

export const BlockEditor = React.memo(
  ({
    content,
    language,
    onChange,
    readOnly = false,
    className,
  }: BlockEditorProps) => {
    const getLanguageExtension = useCallback(() => {
      switch (language) {
        case "rust":
          return rust();
        case "typescript":
          return javascript({ typescript: true, jsx: true });
        case "python":
          return python();
        default:
          return markdown();
      }
    }, [language]);

    const handleChange = useCallback(
      (val: string) => {
        onChange(val);
      },
      [onChange],
    );

    return (
      <CodeMirror
        value={content}
        height="auto"
        minHeight="40px"
        theme={vscodeDark}
        extensions={[getLanguageExtension(), EditorView.lineWrapping]}
        onChange={handleChange}
        editable={!readOnly}
        basicSetup={{
          lineNumbers: language !== "markdown",
          foldGutter: false,
          highlightActiveLine: false,
        }}
        className={`text-sm w-full border border-border rounded-md overflow-hidden ${className}`}
      />
    );
  },
);

BlockEditor.displayName = "BlockEditor";
