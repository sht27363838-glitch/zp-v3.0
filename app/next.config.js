/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  // experimental: { typedRoutes: true }, // HOTFIX: disable typedRoutes so Link href can be a string
}
module.exports = nextConfig
