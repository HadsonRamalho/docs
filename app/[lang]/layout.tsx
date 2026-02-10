import "katex/dist/katex.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../global.css";
import Script from "next/script";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/auth-context";
import { Provider } from "../search-provider";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Rust Notebook",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

export default function Layout({ children }: LayoutProps<"/[lang]">) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <AuthProvider>
          <Toaster richColors={true} />
          <Provider>{children}</Provider>
        </AuthProvider>
      </body>
      <Script src="https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js" />
      <Script src="https://unpkg.com/@babel/standalone/babel.min.js" />
    </html>
  );
}
