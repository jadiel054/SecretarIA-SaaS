import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SecretárIA — Secretária Inteligente para Barbearias",
  description: "Automatize agendamentos, responda clientes no WhatsApp 24h e gerencie toda sua barbearia com Inteligência Artificial.",
  keywords: ["barbearia", "agendamento", "inteligência artificial", "whatsapp"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col" style={{ background: '#0A0A0A', color: '#F5F0EB' }}>{children}</body>
    </html>
  );
}
