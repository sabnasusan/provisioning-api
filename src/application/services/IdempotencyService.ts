import { IdempotencyConflictError } from '../../domain/errors/DomainError';
import { ProvisioningRequest } from '../../domain/entities/ProvisioningRequest';
import { CreateProvisioningRequestDTO } from '../dtos/CreateProvisioningRequestDTO';
import { validateEmail } from '../../domain/validators/validateEmail';
import { validateIdempotencyKey } from '../../domain/validators/validateIdempotencyKey';

export interface IdempotencyEntry {
  originalPayload: Omit<CreateProvisioningRequestDTO, 'idempotencyKey'>;
  request: ProvisioningRequest;
  createdAt: Date;
}

export interface IIdempotencyStore {
  get(key: string): Promise<IdempotencyEntry | null>;
  set(key: string, entry: IdempotencyEntry): Promise<void>;
  clear(): void;
}

export type IdempotencyCheckResult =
  | { status: 'new' }
  | { status: 'existing'; request: ProvisioningRequest }
  | { status: 'conflict'; error: IdempotencyConflictError };

export class IdempotencyService {
  private readonly idempotencyStore: IIdempotencyStore;

  constructor(store: IIdempotencyStore) {
    this.idempotencyStore = store;
  }

  async check(
    dto: CreateProvisioningRequestDTO,
  ): Promise<IdempotencyCheckResult> {
    // Normalize idempotency key (trim whitespace) for consistent lookup
    const normalizedKey = validateIdempotencyKey(dto.idempotencyKey);
    const entry = await this.idempotencyStore.get(normalizedKey);

    if (!entry) {
      return { status: 'new' };
    }

    // Compare payloads (excluding idempotencyKey)
    const currentPayload = this.extractPayload(dto);
    const storedPayload = entry.originalPayload;

    if (this.payloadsMatch(currentPayload, storedPayload)) {
      return { status: 'existing', request: entry.request };
    }

    return {
      status: 'conflict',
      error: new IdempotencyConflictError(),
    };
  }

  async store(
    key: string,
    dto: CreateProvisioningRequestDTO,
    request: ProvisioningRequest,
  ): Promise<void> {
    // Normalize idempotency key (trim whitespace) for consistent storage
    const normalizedKey = validateIdempotencyKey(key);

    const entry: IdempotencyEntry = {
      originalPayload: this.extractPayload(dto),
      request,
      createdAt: new Date(),
    };

    await this.idempotencyStore.set(normalizedKey, entry);
  }

  private extractPayload(
    dto: CreateProvisioningRequestDTO,
  ): Omit<CreateProvisioningRequestDTO, 'idempotencyKey'> {
    const { idempotencyKey, ...payload } = dto;
    return payload;
  }

  private payloadsMatch(
    a: Omit<CreateProvisioningRequestDTO, 'idempotencyKey'>,
    b: Omit<CreateProvisioningRequestDTO, 'idempotencyKey'>,
  ): boolean {
    // Normalize values before comparison (same as entity validation)
    // This ensures "USER@EXAMPLE.COM" matches "user@example.com"
    let normalizedEmailA: string;
    let normalizedEmailB: string;

    try {
      normalizedEmailA = validateEmail(a.requestor);
      normalizedEmailB = validateEmail(b.requestor);
    } catch {
      // If either email is invalid, fall back to direct comparison
      normalizedEmailA = a.requestor;
      normalizedEmailB = b.requestor;
    }

    return (
      normalizedEmailA === normalizedEmailB &&
      a.environment === b.environment &&
      a.workloadName === b.workloadName &&
      a.components.length === b.components.length &&
      a.components.every((c, i) => c === b.components[i])
    );
  }
}
