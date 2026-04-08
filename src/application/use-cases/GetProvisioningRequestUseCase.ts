import { NotFoundError } from '../../domain/errors/DomainError';
import { IProvisioningRequestRepository } from '../../domain/repositories/IProvisioningRequestRepository';
import {
  ProvisioningRequestResponseDTO,
  toProvisioningRequestResponseDTO,
} from '../dtos';

export class GetProvisioningRequestUseCase {
  constructor(private readonly repository: IProvisioningRequestRepository) {}

  async execute(requestId: string): Promise<ProvisioningRequestResponseDTO> {
    const request = await this.repository.findById(requestId);

    if (!request) {
      throw new NotFoundError('ProvisioningRequest', requestId);
    }

    return toProvisioningRequestResponseDTO(request);
  }
}
