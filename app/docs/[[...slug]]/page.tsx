import { createRelativeLink } from "fumadocs-ui/mdx";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from "@/components/layout/docs/page";
import { env } from "@/lib/env";
import { formatFullDate } from "@/lib/formatFullDate";
import { getPageImage, source } from "@/lib/source";
import { getMDXComponents } from "@/mdx-components";

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
  const page = source.getPage(params.slug);
  if (!page) notFound();
  const lastModifiedTime = page.data.lastModified;

  const MDX = page.data.body;

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

  return (
    <DocsPage
      toc={page.data.toc}
      full={page.data.full}
      tableOfContent={{
        style: "clerk",
      }}
      tableOfContentPopover={{
        style: "clerk",
      }}
    >
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription className="mb-0">
        {page.data.description}
      </DocsDescription>
      {lastModifiedTime && <UpdatedAt date={lastModifiedTime} />}
      <DocsBody>
        <MDX
          components={getMDXComponents({
            // this allows you to link to other pages with relative file paths
            a: createRelativeLink(source, page),
          })}
        />
      </DocsBody>
    </DocsPage>
  );
}

export async function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(
  props: PageProps<"/docs/[[...slug]]">,
): Promise<Metadata> {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
    openGraph: {
      images: getPageImage(page).url,
    },
  };
}
