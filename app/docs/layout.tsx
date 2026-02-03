import { NotebookProvider } from "@/components/notebook/notebook-context";
import { NotebookManagerProvider } from "@/components/notebook/notebook-manager";
import { UserSidebar } from "@/components/notebook/user-sidebar";
import { DocsLayout } from "@/components/layout/docs";
import { env } from "@/lib/env";
import { baseOptions } from "@/lib/layout.shared";
import { source } from "@/lib/source";

export default function Layout({ children }: LayoutProps<"/docs">) {
  const mode = env.get("NEXT_PUBLIC_MODE");
  const tree = source.getPageTree();
  const filteredTree = {
    ...tree,
    children: tree.children.filter((node) => {
      if (mode === "NO_ENDPOINTS") {
        const isApiNode =
          node.type === "folder" && node.name === "API Reference";

        return !isApiNode;
      }

      return true;
    }),
  };

  return (
    <NotebookManagerProvider>
      <NotebookProvider>
        <DocsLayout
          tree={filteredTree}
          {...baseOptions()}
          sidebar={{
            defaultOpenLevel: 1,
            banner: <UserSidebar />,
          }}
        >
          {children}
        </DocsLayout>
      </NotebookProvider>
    </NotebookManagerProvider>
  );
}
