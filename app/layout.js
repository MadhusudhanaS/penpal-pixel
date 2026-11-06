import "./globals.css";
import { basePath } from "./base-path";

export const metadata = {
  title: "Penpal Pixel: slow, kind letters",
  description: "A cozy pixel-art letter writing and photo scrapbook experience.",
};

export const viewport = { themeColor: "#FFF8F0" };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body data-base-path={basePath}>{children}</body>
    </html>
  );
}
