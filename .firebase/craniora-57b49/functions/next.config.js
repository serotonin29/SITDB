"use strict";

// next.config.js
var nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["localhost"]
  },
  // Enable standalone output for Docker
  output: "standalone"
};
module.exports = nextConfig;
