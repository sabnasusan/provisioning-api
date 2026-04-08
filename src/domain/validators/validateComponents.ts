import { ValidationError } from '../errors/DomainError';

export function validateComponents(value: string[]): readonly string[] {
  if (!value || value.length === 0) {
    throw new ValidationError('Components array must not be empty');
  }

  const invalid = value.filter(
    (c) => !c || typeof c !== 'string' || c.trim() === '',
  );
  if (invalid.length > 0) {
    throw new ValidationError('All components must be non-empty strings');
  }

  return value;
}
