import { ValidationError } from '../errors/DomainError';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(value: string): string {
  if (!value || !EMAIL_REGEX.test(value)) {
    throw new ValidationError('Invalid email format');
  }
  return value.toLowerCase();
}
