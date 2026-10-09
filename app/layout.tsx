import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sinal — laboratório de recomendações",
  description: "Uma demonstração visual e interativa de um algoritmo de recomendação.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
