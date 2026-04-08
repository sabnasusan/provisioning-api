import { ValidationError } from '../errors/DomainError';

export class WorkloadName {
  private static readonly KEBAB_CASE_REGEX = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;
  private static readonly MIN_LENGTH = 3;
  private static readonly MAX_LENGTH = 30;

  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(value: string): WorkloadName {
    if (!value || value.length < WorkloadName.MIN_LENGTH) {
      throw new ValidationError(
        `Workload name must be at least ${WorkloadName.MIN_LENGTH} characters`,
      );
    }

    if (value.length > WorkloadName.MAX_LENGTH) {
      throw new ValidationError(
        `Workload name must be at most ${WorkloadName.MAX_LENGTH} characters`,
      );
    }

    if (!WorkloadName.KEBAB_CASE_REGEX.test(value)) {
      throw new ValidationError(
        'Workload name must be in kebab-case format (e.g., my-workload-name)',
      );
    }

    return new WorkloadName(value);
  }

  getValue(): string {
    return this.value;
  }
}
