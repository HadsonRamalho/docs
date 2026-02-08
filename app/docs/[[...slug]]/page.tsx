import { createRelativeLink } from "fumadocs-ui/mdx";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from "@/components/layout/docs/page";
import { NotebookProvider } from "@/components/notebook/notebook-context";
import { NotebookControls } from "@/components/notebook/notebook-controls";
import RustInteractivePage from "@/components/notebook/notebook-page";
import { NotebookTitle } from "@/components/notebook/notebook-title";
import { env } from "@/lib/env";
import { formatFullDate } from "@/lib/formatFullDate";
import { getPageImage, source } from "@/lib/source";
import { getMDXComponents } from "@/mdx-components";

export const dynamicParams = true;

type UpdatedAtProps = {
  date: Date;
};

function UpdatedAt({ date }: UpdatedAtProps) {
  return (
    <span className="text-sm text-fd-muted-foreground">
      Última atualização em: {formatFullDate(date)}
    </span>
  );
}

export default async function Page(props: PageProps<"/docs/[[...slug]]">) {
  const params = await props.params;
  console.log("Acessando Slug:", params.slug);
  const page = source.getPage(params.slug);

  if (params.slug && params.slug.length === 1) {
    const pageId = params.slug[0];
    return (
      <NotebookProvider pageId={pageId}>
        <DocsPage>
          <div className="mb-8">
            <NotebookTitle pageTitle={page?.data.title} pageId={pageId} />
            <p className="text-muted-foreground text-xs mt-1 font-mono">
              ID: {pageId}
            </p>
            <div className="flex mt-2 justify-end">
              <NotebookControls />
            </div>
          </div>

          <DocsBody>
            <RustInteractivePage pageId={pageId} />
          </DocsBody>
        </DocsPage>
      </NotebookProvider>
    );
  }

  if (page) {
    const lastModifiedTime = page.data.lastModified;
    if (page.data.title === "API Reference") {
      const mode = env.get("NEXT_PUBLIC_MODE");
      if (mode === "NO_ENDPOINTS") {
        return (
          <DocsPage>
            <DocsTitle>Conteúdo indisponível</DocsTitle>
            <DocsDescription className="mb-0">
              Os endpoints não estão disponíveis no momento, pois o MODE da API
              está configurado como {mode}.
            </DocsDescription>
            <DocsBody />
          </DocsPage>
        );
      }
    }
    const MDX = page.data.body;

    return (
      <DocsPage>
        <DocsTitle>{page.data.title}</DocsTitle>
        <DocsDescription>{page.data.description}</DocsDescription>
        {lastModifiedTime && <UpdatedAt date={lastModifiedTime} />}
        <DocsBody>
          <MDX
            components={getMDXComponents({
              a: createRelativeLink(source, page),
            })}
          />
        </DocsBody>
      </DocsPage>
    );
  }

  if (!page) notFound();
}

export async function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(props: {
  params: Promise<{ slug?: string[] }>;
}): Promise<Metadata> {
  const params = await props.params;
  const page = source.getPage(params.slug);

  if (page) {
    return {
      title: page.data.title,
      description: page.data.description,
      openGraph: {
        images: getPageImage(page).url,
      },
    };
  }

  if (params.slug && params.slug.length === 1) {
    return {
      title: "Meu Caderno",
      description: "Caderno de anotações e código Rust interativo.",
    };
  }

  return notFound();
}
