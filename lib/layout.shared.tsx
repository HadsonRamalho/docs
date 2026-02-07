import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import Image from "next/image";
import Link from "next/link";
import { UserNav } from "@/components/nav/user-nav";

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      children: (
        <div className="flex w-full items-center justify-between gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <Image src="/logo.png" alt="Logo" width={40} height={40} />
            <span className="text-xl font-bold hidden md:block">Docs</span>
          </Link>

          <div className="flex items-center gap-2">
            <UserNav />
          </div>
        </div>
      ),
      title: null,
    },
    githubUrl: "https://github.com/HadsonRamalho/docs",
    links: [],
  };
}
