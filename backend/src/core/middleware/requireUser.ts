import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError.js';

export const requireUser = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = res.locals.user;

  if (!user) {
    return next(
      new AppError('You must be logged in to access this resource', 401)
    );
  }
  return next();
};
