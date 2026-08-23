const path = require("path");
const { webpack } = require("next/dist/compiled/webpack/webpack");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Dev uses `.next-dev` (set in scripts/run-next.js) so build never clobber dev cache.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  transpilePackages: ["react-globe.gl"],
  outputFileTracingRoot: path.join(__dirname),
  webpack: (config, { isServer, dev }) => {
    if (!isServer) {
      config.resolve = {
        ...config.resolve,
        fallback: {
          net: false,
          dns: false,
          tls: false,
          assert: false,
          path: false,
          fs: false,
          events: false,
          process: false,
        },
      };
    }

    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(/node:/, (resource) => {
        resource.request = resource.request.replace(/^node:/, "");
      })
    );

    // More resilient filesystem cache in dev (production builds stay default).
    if (dev && config.cache && typeof config.cache === "object") {
      config.cache = {
        ...config.cache,
        type: "filesystem",
        buildDependencies: {
          config: [__filename],
        },
      };
    }

    return config;
  },
};

module.exports = nextConfig;
