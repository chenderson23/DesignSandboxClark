/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@Allegion/phoenix-react'],
  experimental: {
    esmExternals: true,
  },
  sassOptions: {
    includePaths: ['./node_modules'],
  },
};

export default nextConfig;
