import { Router } from 'express';
import { ProvisioningController } from '../controllers/ProvisioningController';
import { apiKeyAuth, requestValidator } from '../middleware';
import { createProvisioningRequestSchema } from '../validators/provisioningRequestSchema';

export function createProvisioningRoutes(
  controller: ProvisioningController,
): Router {
  const router = Router();

  router.post(
    '/',
    apiKeyAuth,
    requestValidator(createProvisioningRequestSchema),
    controller.create,
  );

  router.get('/:requestId', apiKeyAuth, controller.getById);

  return router;
}
