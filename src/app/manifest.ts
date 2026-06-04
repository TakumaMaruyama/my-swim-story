import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "私の競泳物語",
    short_name: "私の競泳物語",
    description: "目標を物語に変える、競泳選手のための成長シート",
    start_url: "/",
    display: "standalone",
    background_color: "#f4fbff",
    theme_color: "#0f172a",
    lang: "ja",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
