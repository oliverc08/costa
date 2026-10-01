import type { Metadata, Viewport } from "next";
import { Fraunces, Nunito_Sans } from "next/font/google";
import { cookies } from "next/headers";
import { isLanguageCode } from "@/lib/languages";
import { UI_LANG_COOKIE } from "@/lib/ui-language";
import "./globals.css";

const body = Nunito_Sans({
  variable: "--font-body",
  subsets: ["latin", "latin-ext", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
});

const display = Fraunces({
  variable: "--font-display-face",
  subsets: ["latin", "latin-ext", "vietnamese"],
  weight: ["600", "700"],
});

export const metadata: Metadata = {
  title: "Costa: Benefits help in your language",
  description:
    "Free help with Medi-Cal, CalFresh, WIC, tax credits, and disaster aid in English, Spanish, Chinese, Tagalog, or Vietnamese. Answers come from official sources.",
  applicationName: "Costa",
  appleWebApp: { capable: true, title: "Costa", statusBarStyle: "default" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#f7f4ed",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const saved = (await cookies()).get(UI_LANG_COOKIE)?.value;
  return (
    <html lang={isLanguageCode(saved) ? saved : "en"} className={`${body.variable} ${display.variable} h-full antialiased`}>
      <body className="min-h-full bg-paper text-stone-900">{children}</body>
    </html>
  );
}
