/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  experimental: {
    serverComponentsExternalPackages: ["better-sqlite3"],
    // 영상 업로드 — Server Action 또는 multipart route 최대 body 크기
    serverActions: {
      bodySizeLimit: "60mb",
    },
  },
};
export default nextConfig;
