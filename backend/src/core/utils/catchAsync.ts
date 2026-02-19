import { Request, Response, NextFunction } from 'express';

export const catchAsync = (
  fun: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fun(req, res, next).catch(next);
  };
};
