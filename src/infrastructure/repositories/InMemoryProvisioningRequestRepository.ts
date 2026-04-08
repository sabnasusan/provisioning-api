import { ProvisioningRequest } from '../../domain/entities/ProvisioningRequest';
import { IProvisioningRequestRepository } from '../../domain/repositories/IProvisioningRequestRepository';

export class InMemoryProvisioningRequestRepository implements IProvisioningRequestRepository {
  private readonly storage = new Map<string, ProvisioningRequest>();
  private readonly idempotencyIndex = new Map<string, string>();

  async save(request: ProvisioningRequest): Promise<void> {
    this.storage.set(request.requestId, request);
    this.idempotencyIndex.set(request.idempotencyKey, request.requestId);
  }

  async findById(requestId: string): Promise<ProvisioningRequest | null> {
    return this.storage.get(requestId) || null;
  }

  async findByIdempotencyKey(
    idempotencyKey: string,
  ): Promise<ProvisioningRequest | null> {
    const requestId = this.idempotencyIndex.get(idempotencyKey);
    if (!requestId) return null;
    return this.storage.get(requestId) || null;
  }

  clear(): void {
    this.storage.clear();
    this.idempotencyIndex.clear();
  }
}
