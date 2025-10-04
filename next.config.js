/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // 타입 엄격 라우팅 비활성화 → Link href에 문자열 사용 가능
    typedRoutes: false
  },
  reactStrictMode: true,
  trailingSlash: false
};
module.exports = nextConfig;
