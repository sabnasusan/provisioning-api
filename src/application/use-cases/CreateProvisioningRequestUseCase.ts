import { ProvisioningRequest } from '../../domain/entities/ProvisioningRequest';
import { IProvisioningRequestRepository } from '../../domain/repositories/IProvisioningRequestRepository';
import { IdempotencyService } from '../services/IdempotencyService';
import {
  CreateProvisioningRequestDTO,
  ProvisioningRequestResponseDTO,
  toProvisioningRequestResponseDTO,
} from '../dtos';

export class CreateProvisioningRequestUseCase {
  constructor(
    private readonly repository: IProvisioningRequestRepository,
    private readonly idempotencyService: IdempotencyService,
  ) {}

  async execute(
    dto: CreateProvisioningRequestDTO,
  ): Promise<ProvisioningRequestResponseDTO> {
    // 1. Check idempotency
    const idempotencyResult = await this.idempotencyService.check(dto);

    if (idempotencyResult.status === 'existing') {
      return toProvisioningRequestResponseDTO(idempotencyResult.request);
    }

    if (idempotencyResult.status === 'conflict') {
      throw idempotencyResult.error;
    }

    // 2. Create domain entity (validates and enforces domain rules)
    const request = ProvisioningRequest.create({
      idempotencyKey: dto.idempotencyKey,
      requestor: dto.requestor,
      environment: dto.environment,
      workloadName: dto.workloadName,
      components: dto.components,
    });

    // 3. Save to repository
    await this.repository.save(request);

    // 4. Store idempotency entry
    await this.idempotencyService.store(dto.idempotencyKey, dto, request);

    // 5. Return response DTO
    return toProvisioningRequestResponseDTO(request);
  }
}
