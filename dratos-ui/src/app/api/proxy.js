import { createProxyMiddleware } from 'http-proxy-middleware';

export default createProxyMiddleware({
  target: 'https://api.taal.com',
  changeOrigin: true,
  pathRewrite: {
    '^/api/proxy': '/api/v1',
  },
});

export const config = {
  api: {
    bodyParser: false,
  },
};