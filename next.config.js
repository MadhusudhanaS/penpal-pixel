const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

if (basePath && !/^\/[A-Za-z0-9._-]+$/.test(basePath)) {
  throw new Error("NEXT_PUBLIC_BASE_PATH must be a single safe path segment.");
}

module.exports = {
  output: "export",
  trailingSlash: true,
  basePath,
};
