import "./globals.css";
import { basePath } from "./base-path";
import { siteUrl } from "./site-url";

const title = "Penpal Pixel: slow, kind letters";
const description = "A cozy pixel-art letter writing and photo scrapbook experience.";

export const metadata = {
  metadataBase: siteUrl,
  title,
  description,
  alternates: {
    canonical: siteUrl.href,
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title,
    description,
    url: siteUrl.href,
    siteName: "Penpal Pixel",
    locale: "en_US",
    type: "website",
  },
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
