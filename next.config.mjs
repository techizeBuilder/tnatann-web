const nextConfig = {
  reactStrictMode: false,
  htmlLimitedBots: /.*/,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "eclassify.thewrteam.in",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;