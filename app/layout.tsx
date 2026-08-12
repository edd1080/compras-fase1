import type { Metadata } from "next";
import { Space_Grotesk, DM_Sans, DM_Mono } from "next/font/google";
import "../styles/globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Portal de Compras BIA",
  description:
    "Solicita una compra y deja que el equipo de Compras la gestione con especificaciones claras y comparables.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-HN">
      <body
        className={`${spaceGrotesk.variable} ${dmSans.variable} ${dmMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
