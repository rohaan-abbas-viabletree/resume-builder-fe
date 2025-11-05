/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@react-pdf/renderer"],
  experimental: {
    esmExternals: "loose",
  },
  images: {
    domains: [
      "rpl.digitaleggheads.com",
      "res.cloudinary.com",
      "rpladmin.digitaleggheads.com",
      "erp.redpearllogistics.com",
    ],
    deviceSizes: [320, 420, 768, 1024, 1200],
    loader: "default",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
