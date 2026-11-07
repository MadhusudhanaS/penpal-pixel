import { siteUrl } from "./site-url";

export const dynamic = "force-static";

export default function sitemap() {
  return [{ url: siteUrl.href }];
}
