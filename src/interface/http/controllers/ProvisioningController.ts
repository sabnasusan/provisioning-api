import { Request, Response, NextFunction } from 'express';
import { CreateProvisioningRequestUseCase } from '../../../application/use-cases/CreateProvisioningRequestUseCase';
import { GetProvisioningRequestUseCase } from '../../../application/use-cases/GetProvisioningRequestUseCase';
import { CreateProvisioningRequestDTO } from '../../../application/dtos/CreateProvisioningRequestDTO';

export class ProvisioningController {
  constructor(
    private readonly createUseCase: CreateProvisioningRequestUseCase,
    private readonly getUseCase: GetProvisioningRequestUseCase
  ) {}

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto: CreateProvisioningRequestDTO = {
        idempotencyKey: req.body.idempotencyKey,
        requestor: req.body.requestor,
        environment: req.body.environment,
        workloadName: req.body.workloadName,
        components: req.body.components,
      };
      const result = await this.createUseCase.execute(dto);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const requestId = req.params.requestId as string;
      const result = await this.getUseCase.execute(requestId);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}