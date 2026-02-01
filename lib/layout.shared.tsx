import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import Image from "next/image";

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      children: (
        <div className="flex mx-auto items-center gap-2">
          <Image src="/logo.png" alt="Logo" width={50} height={50} />
          <h1 className="text-xl font-bold">Docs</h1>
        </div>
      ),
    },
    githubUrl: "https://github.com/HadsonRamalho/docs",
    links: [
      {
        text: "HadsonRamalho",
        url: "https://github.com/HadsonRamalho/docs",
        icon: <Image src="/logo.png" alt="Logo" width={33} height={33} />,
        type: "icon",
      },
    ],
  };
}
