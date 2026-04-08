export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  apiKeys: (process.env.API_KEYS || 'dev-api-key')
    .split(',')
    .map((k) => k.trim())
    .filter(Boolean),
  nodeEnv: process.env.NODE_ENV || 'dev',
};
