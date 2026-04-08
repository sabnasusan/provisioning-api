import { v4 as uuidv4 } from 'uuid';
import { RequestStatus } from '../enums/RequestStatus';
import { WorkloadName } from '../value-objects/WorkloadName';
import { validateIdempotencyKey } from '../validators/validateIdempotencyKey';
import { validateEmail } from '../validators/validateEmail';
import { validateComponents } from '../validators/validateComponents';
import { ValidationError } from '../errors/DomainError';
import {
  validateEnvironment,
  type Environment,
} from '../validators/validateEnvironment';

export interface ProvisioningRequestProps {
  requestId: string;
  idempotencyKey: string;
  requestor: string;
  environment: Environment;
  workloadName: WorkloadName;
  components: readonly string[];
  status: RequestStatus;
  createdAt: Date;
}

export class ProvisioningRequest {
  private readonly props: ProvisioningRequestProps;

  private constructor(props: ProvisioningRequestProps) {
    this.props = props;
  }

  static create(input: {
    idempotencyKey: string;
    requestor: string;
    environment: string;
    workloadName: string;
    components: string[];
  }): ProvisioningRequest {
    // Validate and normalize inputs
    const idempotencyKey = validateIdempotencyKey(input.idempotencyKey);
    const requestor = validateEmail(input.requestor);
    const workloadName = WorkloadName.create(input.workloadName);
    const components = validateComponents(input.components);
    const environment = validateEnvironment(input.environment);

    // Domain rule: Production requires key-vault component
    if (environment === 'prod' && !components.includes('key-vault')) {
      throw new ValidationError(
        'Prod environment requires components to include key-vault',
      );
    }

    const request = new ProvisioningRequest({
      requestId: uuidv4(),
      idempotencyKey,
      requestor,
      environment,
      workloadName,
      components,
      status: RequestStatus.RECEIVED,
      createdAt: new Date(),
    });

    return request;
  }
  // loading existing info
  static reconstitute(props: ProvisioningRequestProps): ProvisioningRequest {
    return new ProvisioningRequest(props);
  }

  get requestId(): string {
    return this.props.requestId;
  }

  get idempotencyKey(): string {
    return this.props.idempotencyKey;
  }

  get requestor(): string {
    return this.props.requestor;
  }

  get environment(): Environment {
    return this.props.environment;
  }

  get workloadName(): string {
    return this.props.workloadName.getValue();
  }

  get components(): readonly string[] {
    return this.props.components;
  }

  get status(): RequestStatus {
    return this.props.status;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }
  // Update status of the request
  transitionTo(status: RequestStatus): void {
    (this.props as { status: RequestStatus }).status = status;
  }
}
