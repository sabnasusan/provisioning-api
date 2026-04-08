import { RequestStatus } from '../../domain/enums/RequestStatus';
import { ProvisioningRequest } from '../../domain/entities/ProvisioningRequest';

export interface ProvisioningRequestResponseDTO {
  requestId: string;
  idempotencyKey: string;
  requestor: string;
  environment: string;
  workloadName: string;
  components: readonly string[];
  status: RequestStatus;
  createdAt: string;
}

export function toProvisioningRequestResponseDTO(
  request: ProvisioningRequest,
): ProvisioningRequestResponseDTO {
  return {
    requestId: request.requestId,
    idempotencyKey: request.idempotencyKey,
    requestor: request.requestor,
    environment: request.environment,
    workloadName: request.workloadName,
    components: request.components,
    status: request.status,
    createdAt: request.createdAt.toISOString(),
  };
}
