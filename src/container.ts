import { InMemoryProvisioningRequestRepository } from './infrastructure/repositories/InMemoryProvisioningRequestRepository';
import { InMemoryIdempotencyStore } from './infrastructure/persistence/InMemoryIdempotencyStore';
import { IdempotencyService } from './application/services/IdempotencyService';
import { CreateProvisioningRequestUseCase } from './application/use-cases/CreateProvisioningRequestUseCase';
import { GetProvisioningRequestUseCase } from './application/use-cases/GetProvisioningRequestUseCase';
import { ProvisioningController } from './interface/http/controllers/ProvisioningController';
import { HealthController } from './interface/http/controllers/HealthController';

// Infrastructure
const provisioningRequestRepository =
  new InMemoryProvisioningRequestRepository();
const idempotencyStore = new InMemoryIdempotencyStore();

// Application Services
const idempotencyService = new IdempotencyService(idempotencyStore);

// Use Cases
const createProvisioningRequestUseCase = new CreateProvisioningRequestUseCase(
  provisioningRequestRepository,
  idempotencyService,
);
const getProvisioningRequestUseCase = new GetProvisioningRequestUseCase(
  provisioningRequestRepository,
);

// Controllers
const provisioningController = new ProvisioningController(
  createProvisioningRequestUseCase,
  getProvisioningRequestUseCase,
);

const healthController = new HealthController();

export const container = {
  // Infrastructure
  provisioningRequestRepository,
  idempotencyStore,

  // Services
  idempotencyService,

  // Use Cases
  createProvisioningRequestUseCase,
  getProvisioningRequestUseCase,

  // Controllers
  provisioningController,
  healthController,

  // Helper for testing - resets all stores
  reset(): void {
    provisioningRequestRepository.clear();
    idempotencyStore.clear();
  },
};
