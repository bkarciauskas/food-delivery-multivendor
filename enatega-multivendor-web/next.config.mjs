import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();
const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "form-action 'self'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https:",
  "style-src 'self' 'unsafe-inline' https:",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:",
  "connect-src 'self' https: wss: ws:",
  "frame-src 'self' https:",
  "media-src 'self' data: blob: https:",
  "upgrade-insecure-requests",
].join("; ");

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(woff|woff2|eot|ttf|otf)$/i,
      type: "asset/resource",
      dependency: { not: ["url"] },
    });
    return config;
  },
  // Optional same-origin GraphQL proxy for local demo stubs (see DEMO_SETUP.md).
  // Enable with DEMO_GRAPHQL_PROXY=1 and point NEXT_PUBLIC_SERVER_URL at this app.
  async rewrites() {
    if (process.env.DEMO_GRAPHQL_PROXY === "1") {
      const target = (
        process.env.DEMO_GRAPHQL_PROXY_TARGET || "http://127.0.0.1:8001"
      ).replace(/\/$/, "");
      return [{ source: "/graphql", destination: `${target}/graphql` }];
    }
    return [];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: contentSecurityPolicy,
          },
          // Optional: Add other security headers
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },

  images: {
    // domains: ["storage.googleapis.com"],
    unoptimized: true,
    dangerouslyAllowSVG: false,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
      },
      // Dummy
      {
        protocol: "https",
        hostname: "images.ctfassets.net",
      },
      //////////
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      {
        protocol: "https",
        hostname: "plus.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "enatega.com",
      },
      {
        protocol: "https",
        hostname: "www.lifcobooks.com",
      },
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
      },
      {
        hostname: "example.com",
        protocol: "https",
      },
      {
        protocol: "https",
        hostname: "encrypted-tbn0.gstatic.com",
      },
      {
        protocol: "https",
        hostname: "t4.ftcdn.net",
      },
      {
        protocol: "https",
        hostname: "static.vecteezy.com",
      },
      {
        protocol: "https",
        hostname: "cdn-icons-png.flaticon.com",
      },
      {
        protocol: "https",
        hostname: "images.ctfassets.net",
      },
      {
        protocol: "https",
        hostname: "flagcdn.com",
      },
      {
        protocol: "https",
        hostname: "images.deliveryhero.io",
      },
      {
        protocol: "https",
        hostname: "enatega-backend.s3.eu-north-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "assets.enatega.com",
      },
      {
        protocol: "https",
        hostname: "*.s3.*.amazonaws.com",
      },
    ], // Add placehold.co as an allowed domain
  },
};
// export default withPWA(withNextIntl(nextConfig));
export default withNextIntl(nextConfig);
