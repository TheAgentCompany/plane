/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  output: "export",
  images: {
    unoptimized: true,
  },
  basePath: process.env.NEXT_PUBLIC_DEPLOY_WITH_NGINX === "1" ? "/god-mode" : "",
};

module.exports = nextConfig;
