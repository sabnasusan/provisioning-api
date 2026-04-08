import { z } from 'zod';

export const createProvisioningRequestSchema = z.object({
  idempotencyKey: z.string().min(1, 'Idempotency key is required'),
  requestor: z.string().email('Invalid email format'),
  environment: z.enum(['dev', 'staging', 'prod'], {
    message: 'Environment must be one of: dev, staging, prod',
  }),
  workloadName: z
    .string()
    .min(3, 'Workload name must be at least 3 characters')
    .max(30, 'Workload name must be at most 30 characters')
    .regex(
      /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/,
      'Workload name must be in kebab-case format',
    ),
  components: z
    .array(z.string().min(1, 'Component must not be empty'))
    .min(1, 'At least one component is required'),
});

export type CreateProvisioningRequestInput = z.infer<
  typeof createProvisioningRequestSchema
>;
