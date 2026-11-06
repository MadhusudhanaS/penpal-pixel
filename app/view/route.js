import template from "./template.json";
import { basePath } from "../base-path";

export const dynamic = "force-static";

function prepareViewerTemplate() {
  const fontLink =
    '<link href="https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@400;500;600;700&amp;display=swap" rel="stylesheet">';

  return template
    .replace(
      /<link href="https:\/\/fonts\.googleapis\.com\/css2\?family=[^"]*" rel="stylesheet">/,
      fontLink,
    )
    .replace(
      "</body>",
      `<script src="${basePath}/letter-viewer-effects.js"></script>\n</body>`,
    );
}

export function GET() {
  return new Response(prepareViewerTemplate(), {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}
