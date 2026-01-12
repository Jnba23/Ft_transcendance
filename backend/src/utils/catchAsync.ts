import { Request, Response, NextFunction } from 'express';

export const catchAsync = (
  fun: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fun(req, res, next).catch(next);
  };
};

// export const catchAsync = (fun: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
//     return (req: Request, res: Response, next: NextFunction) => {
//         const warpPromise = new Promise((resolve, reject) => {
//             fun(req, res, next)
//                 .then(result => {
//                     resolve(result);
//                 })
//                 .catch(error => {
//                     reject(error);
//                 })
//         });

//         warpPromise.catch(error => {
//             next(error);
//         });
//     }
// }
