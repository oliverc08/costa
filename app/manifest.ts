import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Costa: benefits help in your language",
    short_name: "Costa",
    description: "Free help with Medi-Cal, CalFresh, WIC, tax credits, and disaster aid.",
    start_url: "/",
    display: "standalone",
    background_color: "#f7f4ed",
    theme_color: "#233e32",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
