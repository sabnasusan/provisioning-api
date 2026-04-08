import { WorkloadName } from '../../../src/domain/value-objects/WorkloadName';
import { ValidationError } from '../../../src/domain/errors/DomainError';

describe('WorkloadName Value Object', () => {
  describe('create', () => {
    it('should create a valid workload name in kebab-case', () => {
      const workloadName = WorkloadName.create('my-service');
      expect(workloadName.getValue()).toBe('my-service');
    });

    it('should throw ValidationError for names shorter than 3 characters', () => {
      expect(() => WorkloadName.create('ab')).toThrow(ValidationError);
      expect(() => WorkloadName.create('ab')).toThrow(/3 characters/);
    });

    it('should throw ValidationError for names longer than 30 characters', () => {
      expect(() =>
        WorkloadName.create('this-is-a-very-long-workload-name'),
      ).toThrow(ValidationError);
      expect(() =>
        WorkloadName.create('this-is-a-very-long-workload-name'),
      ).toThrow(/30 characters/);
    });

    it('should throw ValidationError for names not in kebab-case', () => {
      const invalidNames = [
        'MyService', // PascalCase
        'my_service', // snake_case
        'myService', // camelCase
        '123-service', // starts with number
      ];

      for (const name of invalidNames) {
        expect(() => WorkloadName.create(name)).toThrow(ValidationError);
      }
    });

    it('should throw ValidationError for empty names', () => {
      expect(() => WorkloadName.create('')).toThrow(ValidationError);
    });
  });
});
