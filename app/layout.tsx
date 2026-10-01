import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Fraunces, Noto_Sans_KR, Nunito_Sans } from "next/font/google";
import { cookies } from "next/headers";
import { RegisterSw } from "@/components/RegisterSw";
import { isLanguageCode } from "@/lib/languages";
import { UI_LANG_COOKIE } from "@/lib/ui-language";
import "./globals.css";

const body = Nunito_Sans({
  variable: "--font-body",
  subsets: ["latin", "latin-ext", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
});

const korean = Noto_Sans_KR({
  variable: "--font-ko",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const display = Fraunces({
  variable: "--font-display-face",
  subsets: ["latin", "latin-ext", "vietnamese"],
  weight: ["600", "700"],
});

export const metadata: Metadata = {
  title: "Costa: Benefits help in your language",
  description:
    "Free help with Medi-Cal, CalFresh, WIC, tax credits, and disaster aid in English, Spanish, Chinese, Tagalog, Vietnamese, Korean, or Portuguese. Answers come from official sources. Runs local-first — no cloud AI required.",
  applicationName: "Costa",
  appleWebApp: { capable: true, title: "Costa", statusBarStyle: "default" },
  formatDetection: { telephone: false },
  manifest: "/manifest.webmanifest",
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
    <html lang={isLanguageCode(saved) ? saved : "en"} className={`${body.variable} ${korean.variable} ${display.variable} h-full antialiased`}>
      <body className="min-h-full bg-paper text-stone-900">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-md focus:bg-pine-800 focus:px-3 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>
        {children}
        <RegisterSw />
        <Analytics />
      </body>
    </html>
  );
}
