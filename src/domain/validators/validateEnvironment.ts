import { ValidationError } from '../errors/DomainError';

const VALID_ENVIRONMENTS = ['dev', 'staging', 'prod'] as const;

export type Environment = (typeof VALID_ENVIRONMENTS)[number];

export function validateEnvironment(value: string): Environment {
  if (!VALID_ENVIRONMENTS.includes(value as Environment)) {
    throw new ValidationError(
      `Environment must be one of: ${VALID_ENVIRONMENTS.join(', ')}`,
    );
  }
  return value as Environment;
}
