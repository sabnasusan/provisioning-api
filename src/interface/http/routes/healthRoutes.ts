import { Router } from 'express';
import { HealthController } from '../controllers/HealthController';

export function createHealthRoutes(controller: HealthController): Router {
  const router = Router();

  router.get('/', controller.check);

  return router;
}
