import { Request, Response, NextFunction } from 'express';
import { config } from '../../../infrastructure/config';

export function apiKeyAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'API key is required',
    });
    return;
  }

  if (!config.apiKeys.includes(apiKey as string)) {
    res.status(403).json({
      error: 'Forbidden',
      message: 'Invalid API key',
    });
    return;
  }

  next();
}
