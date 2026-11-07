import { basePath } from "./base-path";

export const siteUrl = new URL(
  `${basePath || ""}/`,
  "https://madhusudhanas.github.io",
);
