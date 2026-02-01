import { env } from "@/lib/env";
import {
  ArrowUpRight,
  BookOpen,
  Code2,
  MoveRight,
  Workflow,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  const renderApiReference = env.get("NEXT_PUBLIC_MODE") !== "NO_ENDPOINTS";
  return (
    <main className="relative overflow-hidden">
      <section className="mx-auto max-w-7xl px-6 py-24 lg:py-32 text-center">
        <div className="flex flex-row items-center justify-center -ml-20">
          <Image src="/logo.png" alt="Logo" width={150} height={150} />
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl mb-6">
            Docs
          </h1>
        </div>
        <div className="mt-12 flex flex-col sm:flex-row justify-center gap-4">
          <Link
            href="/docs"
            className="flex items-center justify-center rounded-xl border bg-fd-primary px-8 py-4 text-sm font-bold text-fd-primary-foreground shadow-lg transition-transform hover:-translate-y-1"
          >
            Começar Agora <MoveRight className="ml-2 h-4 w-4" />
          </Link>

          {renderApiReference && (
            <Link
              href="/docs/api-reference"
              className="flex items-center justify-center rounded-xl border bg-fd-background px-8 py-4 text-sm font-bold hover:bg-muted transition-colors"
            >
              API Reference
            </Link>
          )}
        </div>
      </section>

      <section className="border-y bg-muted/30">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="max-w-md">
              <h2 className="text-3xl font-bold mb-4 italic">Atalhos Úteis</h2>
              <p className="text-muted-foreground">
                Links diretos para as páginas mais comuns das documentações.
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
                  {s.title}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24 text-center">
        <h2 className="text-4xl font-bold mb-6 tracking-tight">
          Pull Requests são bem-vindos.
        </h2>
        <p className="text-muted-foreground mb-2 max-w-lg mx-auto">
          Encontrou algo desatualizado por aqui? Nossa documentação também é
          código. Contribua no repositório oficial.
        </p>
        <Link
          href="https://github.com/HadsonRamalho/docs"
          className="underline decoration-fd-primary underline-offset-4 font-semibold hover:text-fd-primary transition-colors"
        >
          Ver repositório no GitHub
        </Link>
      </section>
    </main>
  );
}

const shortcuts = [
  { prefix: "01", title: "Vincular tasks do ClickUp", href: "/docs/clickup" },
  { prefix: "02", title: "Configurar Stripe Local", href: "/docs/stripe" },
];
