import { ValidationError } from '../errors/DomainError';

export function validateIdempotencyKey(value: string): string {
  if (!value || value.trim() === '') {
    throw new ValidationError('Idempotency key must not be empty');
  }
  return value.trim();
}
