const nextConfig = {
  async redirects() {
    return [{ source: '/todo', destination: '/', permanent: false }];
  },
};
export default nextConfig;
