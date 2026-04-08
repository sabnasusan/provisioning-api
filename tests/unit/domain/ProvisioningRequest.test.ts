import { ProvisioningRequest } from '../../../src/domain/entities/ProvisioningRequest';
import { RequestStatus } from '../../../src/domain/enums/RequestStatus';
import { ValidationError } from '../../../src/domain/errors/DomainError';

describe('ProvisioningRequest Entity', () => {
  const validInput = {
    idempotencyKey: 'test-key',
    requestor: 'user@example.com',
    environment: 'dev',
    workloadName: 'my-service',
    components: ['app-service'],
  };

  describe('create', () => {
    it('should create a valid provisioning request', () => {
      const request = ProvisioningRequest.create(validInput);

      expect(request.idempotencyKey).toBe(validInput.idempotencyKey);
      expect(request.requestor).toBe(validInput.requestor);
      expect(request.environment).toBe(validInput.environment);
      expect(request.workloadName).toBe(validInput.workloadName);
      expect(request.components).toEqual(validInput.components);
      expect(request.status).toBe(RequestStatus.RECEIVED);
      expect(request.requestId).toBeDefined();
      expect(request.createdAt).toBeInstanceOf(Date);
    });

    it('should throw ValidationError for invalid email', () => {
      expect(() => {
        ProvisioningRequest.create({
          ...validInput,
          requestor: 'invalid-email',
        });
      }).toThrow(ValidationError);

      expect(() => {
        ProvisioningRequest.create({
          ...validInput,
          requestor: 'invalid-email',
        });
      }).toThrow(/email/i);
    });

    it('should throw ValidationError for invalid workload name', () => {
      expect(() => {
        ProvisioningRequest.create({
          ...validInput,
          workloadName: 'Invalid_Name',
        });
      }).toThrow(ValidationError);

      expect(() => {
        ProvisioningRequest.create({
          ...validInput,
          workloadName: 'Invalid_Name',
        });
      }).toThrow(/kebab-case/i);
    });

    it('should throw ValidationError for empty components array', () => {
      expect(() => {
        ProvisioningRequest.create({
          ...validInput,
          components: [],
        });
      }).toThrow(ValidationError);

      expect(() => {
        ProvisioningRequest.create({
          ...validInput,
          components: [],
        });
      }).toThrow(/empty/i);
    });

    it('should throw ValidationError for invalid environment', () => {
      expect(() => {
        ProvisioningRequest.create({
          ...validInput,
          environment: 'invalid',
        });
      }).toThrow(ValidationError);

      expect(() => {
        ProvisioningRequest.create({
          ...validInput,
          environment: 'invalid',
        });
      }).toThrow(/Environment/);
    });

    describe('Production environment rule', () => {
      it('should throw ValidationError for prod environment without key-vault', () => {
        expect(() => {
          ProvisioningRequest.create({
            ...validInput,
            environment: 'prod',
            components: ['app-service'],
          });
        }).toThrow(ValidationError);

        expect(() => {
          ProvisioningRequest.create({
            ...validInput,
            environment: 'prod',
            components: ['app-service'],
          });
        }).toThrow(/key-vault/i);
      });

      it('should accept prod environment with key-vault', () => {
        const request = ProvisioningRequest.create({
          ...validInput,
          environment: 'prod',
          components: ['app-service', 'key-vault'],
        });

        expect(request).toBeDefined();
        expect(request.environment).toBe('prod');
      });

      it('should accept dev environment without key-vault', () => {
        const request = ProvisioningRequest.create({
          ...validInput,
          environment: 'dev',
          components: ['app-service'],
        });

        expect(request).toBeDefined();
        expect(request.environment).toBe('dev');
      });
    });

    it('should normalize email to lowercase', () => {
      const request = ProvisioningRequest.create({
        ...validInput,
        requestor: 'USER@EXAMPLE.COM',
      });

      expect(request.requestor).toBe('user@example.com');
    });

    it('should trim idempotency key', () => {
      const request = ProvisioningRequest.create({
        ...validInput,
        idempotencyKey: '  test-key  ',
      });

      expect(request.idempotencyKey).toBe('test-key');
    });
  });

  describe('status transitions', () => {
    it('should allow transitioning to different statuses', () => {
      const request = ProvisioningRequest.create(validInput);

      expect(request.status).toBe(RequestStatus.RECEIVED);

      request.transitionTo(RequestStatus.VALIDATED);
      expect(request.status).toBe(RequestStatus.VALIDATED);

      request.transitionTo(RequestStatus.QUEUED);
      expect(request.status).toBe(RequestStatus.QUEUED);
    });
  });
});
