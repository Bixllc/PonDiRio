// app/layout.tsx
import "./globals.css";
import { Inter, Cinzel } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

const cinzel = Cinzel({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-serif",
});

export const metadata = {
  metadataBase: new URL(
    process.env.SITE_URL || "https://www.pondiriorivercottagesja.com",
  ),
  title: "Pon Di Rio",
  description: "Luxury River Cottages in Jamaica",
  icons: {
    icon: "/logotransparent.png",
    apple: "/logotransparent.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${cinzel.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
