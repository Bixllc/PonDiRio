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
  title: "Pon Di Rio",
  description: "Luxury airbnb homes in Jamaica",
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
