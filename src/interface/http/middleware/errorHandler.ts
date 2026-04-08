import { Request, Response, NextFunction } from 'express';
import {
  DomainError,
  ValidationError,
  IdempotencyConflictError,
  NotFoundError,
} from '../../../domain/errors/DomainError';

export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (error instanceof ValidationError) {
    res.status(400).json({
      error: 'Validation Error',
      message: error.message,
      code: error.code,
    });
    return;
  }

  if (error instanceof IdempotencyConflictError) {
    res.status(409).json({
      error: 'Conflict',
      message: error.message,
      code: error.code,
    });
    return;
  }

  if (error instanceof NotFoundError) {
    res.status(404).json({
      error: 'Not Found',
      message: error.message,
      code: error.code,
    });
    return;
  }

  if (error instanceof DomainError) {
    res.status(400).json({
      error: 'Domain Error',
      message: error.message,
      code: error.code,
    });
    return;
  }

  // Generic error - don't expose stack traces
  console.error('Unhandled error:', error);
  res.status(500).json({
    error: 'Internal Server Error',
    message: 'An unexpected error occurred',
  });
}
