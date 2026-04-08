import { ProvisioningRequest } from '../entities/ProvisioningRequest';

export interface IProvisioningRequestRepository {
  save(request: ProvisioningRequest): Promise<void>;
  findById(requestId: string): Promise<ProvisioningRequest | null>;
  findByIdempotencyKey(
    idempotencyKey: string,
  ): Promise<ProvisioningRequest | null>;
}
