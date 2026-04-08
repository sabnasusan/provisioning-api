export interface CreateProvisioningRequestDTO {
  idempotencyKey: string;
  requestor: string;
  environment: string;
  workloadName: string;
  components: string[];
}
