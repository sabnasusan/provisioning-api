require('dotenv').config();
import { createApp } from './app';
import { config } from './infrastructure/config';
import { logger } from './infrastructure/logging/logger';

const app = createApp();
const { port, nodeEnv } = config;

app.listen(config.port, () => {
  logger.info(`Provisioning-API server running on port ${port}`);
  logger.info(`Environment: ${nodeEnv}`);
});
