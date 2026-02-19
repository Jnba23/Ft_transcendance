import { Request, Response, NextFunction } from 'express';
import { ZodType, ZodError } from 'zod';

export const validateResource =
  (schema: ZodType) => (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          status: 'fail',
          errors: error.issues.map((err) => ({
            code: err.code,
            message: err.message,
            path: err.path,
          })),
        });
      }
      return res.status(400).send(error);
    }
  };
