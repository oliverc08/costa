import type { Metadata, Viewport } from "next";
import { Noto_Sans } from "next/font/google";
import "./globals.css";

const noto = Noto_Sans({
  variable: "--font-noto",
  subsets: ["latin", "latin-ext", "vietnamese"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Costa: Benefits help in your language",
  description:
    "Call, text, or ask Costa about Medi-Cal, CalFresh, WIC, tax credits, and disaster aid in English, Spanish, Mandarin, Tagalog, or Vietnamese. Answers come from official sources.",
};

export const viewport: Viewport = {
  themeColor: "#0f766e",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${noto.variable} h-full antialiased`}>
      <body className="min-h-full bg-[#fbfaf7] text-stone-900">{children}</body>
    </html>
  );
}
