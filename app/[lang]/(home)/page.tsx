import { HomeLayout } from "fumadocs-ui/layouts/home";
import { BookSearch, Info } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { baseOptions } from "@/lib/layout.shared";

export default function HomePage() {
  const t = useTranslations("homepage");

  return (
    <HomeLayout {...baseOptions()}>
      <main className="relative overflow-hidden">
        <section className="mx-auto max-w-7xl px-6 py-24 lg:py-32 text-center">
          <div className="flex flex-row items-center justify-center md:-ml-20 gap-4">
            <Image src="/logo.png" alt="Logo" width={77} height={77} />
            <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl">
              {t("nav.docs")}
            </h1>
          </div>
          <div className="mt-12 flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/explore"
              className="flex items-center justify-center rounded-xl border bg-card px-8 py-4 text-sm font-bold shadow-lg transition-transform hover:-translate-y-1"
            >
              <BookSearch className="mr-2 h-4 w-4" />
              {t("nav.explore")}
            </Link>

            <Link
              href="/docs"
              className="flex items-center justify-center rounded-xl border px-8 py-4 text-sm font-bold text-foreground shadow-lg transition-transform hover:-translate-y-1"
            >
              <Info className="mr-2 h-4 w-4" />
              {t("about.title")}
            </Link>
          </div>
        </section>

        <section className="border-y bg-muted/30">
          <div className="mx-auto max-w-7xl px-6 py-20">
            <div className="flex flex-col md:flex-row items-center justify-between gap-12">
              <div className="max-w-md">
                <h2 className="text-3xl font-bold mb-4 italic">
                  {t("about.shortcuts_title")}
                </h2>
                <p className="text-muted-foreground">
                  {t("about.shortcuts_desc")}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full md:w-auto">
                {shortcuts.map((s) => (
                  <Link
                    key={s.title}
                    href={s.href}
                    className="flex items-center p-4 bg-background border rounded-lg hover:border-fd-primary transition-colors text-sm font-medium"
                  >
                    <span className="text-fd-primary mr-3 text-lg font-mono">
                      {s.prefix}
                    </span>
                    {t(s.title)}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-24 text-center">
          <h2 className="text-4xl font-bold mb-6 tracking-tight">
            {t("contribute.title")}
          </h2>
          <p className="text-muted-foreground mb-2 max-w-lg mx-auto">
            {t("contribute.description")}
          </p>
          <Link
            href="https://github.com/HadsonRamalho/docs"
            className="underline decoration-fd-primary underline-offset-4 font-semibold hover:text-fd-primary transition-colors"
          >
            {t("contribute.button")}
          </Link>
        </section>
      </main>
    </HomeLayout>
  );
}

const shortcuts = [
  { prefix: "01", title: "items.home", href: "/docs" },
  {
    prefix: "02",
    title: "nav.explore",
    href: "/explore",
  },
];
