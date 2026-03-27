/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://intern-backend:5001/api/:path*",   // ← ใช้ IP แทน localhost
      },
    ]
  },
}

module.exports = nextConfig