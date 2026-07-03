import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Alongsyd",
    short_name: "Alongsyd",
    description:
      "A companion for the whole special-needs parenting journey — ask, answer, and check what you're entitled to.",
    start_url: "/",
    display: "standalone",
    background_color: "#f6f5f1",
    theme_color: "#2c6f78",
    orientation: "portrait",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
