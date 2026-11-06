import { mkdir, rename } from "node:fs/promises";
import path from "node:path";

const outputDirectory = path.resolve("out");
const routeFile = path.join(outputDirectory, "view");
const temporaryFile = path.join(outputDirectory, "view-route.html");
const viewDirectory = path.join(outputDirectory, "view");

await rename(routeFile, temporaryFile);
await mkdir(viewDirectory);
await rename(temporaryFile, path.join(viewDirectory, "index.html"));
