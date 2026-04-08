import express, { Application } from 'express';
import { container } from './container';
import {
  createProvisioningRoutes,
  createHealthRoutes,
} from './interface/http/routes';

import { errorHandler } from './interface/http/middleware';

export function createApp(): Application {
  const app = express();

  // Middleware
  app.use(express.json());

  // Routes
  app.use(
    '/provision',
    createProvisioningRoutes(container.provisioningController),
  );
  app.use('/health', createHealthRoutes(container.healthController));

  // Error handler (must be last)
  app.use(errorHandler);

  return app;
}
