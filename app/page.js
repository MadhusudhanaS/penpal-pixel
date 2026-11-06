import Script from "next/script";
import { basePath } from "./base-path";
import markup from "./site-markup.json";
import ScrollEnhancements from "./scroll-enhancements";
import UIEnhancements from "./ui-enhancements";

const displayMarkup = markup
  .replace(
    /<span class="ptlabel" style="margin-right:8px;">Handwriting<\/span>\s*(?:<button type="button" class="fbtn[^"]*"[^>]*>A<\/button>\s*){3}<span style="width:12px;"><\/span>/,
    "",
  )
  .replace(
    "no one's grading your handwriting.",
    "every kind word finds its place.",
  )
  .replace(
    /and let your words sit in a warm handwriting style\./,
    "and let your words sit in a crisp, readable pixel typeface.",
  )
  .replace("A hand, not a font", "Warm words, pixel type")
  .replace(
    /Letters are set in a warm, slightly imperfect handwriting style &#x2014; closer\s+to ink than to type\./,
    "Every letter uses the same crisp pixel typeface. Soft paper lines and tiny pixel details keep the page warm and easy to read.",
  );

export default function Home() {
  return (
    <>
      <div className="min-h-screen" dangerouslySetInnerHTML={{ __html: displayMarkup }} />
      <ScrollEnhancements />
      <UIEnhancements />
      <Script src={`${basePath}/site-interactions.js`} strategy="afterInteractive" />
    </>
  );
}
