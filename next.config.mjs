const backendUrl = process.env.BACKEND_INTERNAL_URL ?? process.env.BACKEND_URL ?? "http://localhost:4000";
const repoName = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "";
const isStaticExport = process.env.STATIC_EXPORT === "true";
const pagesBasePath = isStaticExport && repoName ? `/${repoName}` : "";

const nextConfig = {
  ...(isStaticExport
    ? {
        output: "export",
        trailingSlash: true,
        images: { unoptimized: true },
        basePath: pagesBasePath,
        assetPrefix: `${pagesBasePath}/`,
      }
    : {}),
  ...(!isStaticExport
    ? {
        async rewrites() {
          if (process.env.VERCEL) {
            return [];
          }
          return [
            {
              source: "/api/:path*",
              destination: `${backendUrl}/api/:path*`,
            },
            {
              source: "/uploads/:path*",
              destination: `${backendUrl}/uploads/:path*`,
            },
          ];
        },
      }
    : {}),
};

export default nextConfig;
