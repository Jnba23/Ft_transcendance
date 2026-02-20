import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { AppError } from '../utils/AppError.js';

export const globalErrorHandler = (
    err: AppError | Error,
    req: Request,
    res: Response,
    _next: NextFunction
) => {
    const errorResponse: { status: string; message: string; stack?: string } = {
        status: err instanceof AppError ? err.status : 'error',
        message: err.message,
    };

    if (err instanceof multer.MulterError) {
        let message = 'File upload error';

        switch (err.code) {
            case 'LIMIT_FILE_SIZE':
                message = 'File too large. Maximum size is 5MB';
                break;
            case 'LIMIT_FILE_COUNT':
                message = 'Only one file allowed per request';
                break;
            case 'LIMIT_FIELD_COUNT':
                message = 'Too many form fields submitted';
                break;
            case 'LIMIT_UNEXPECTED_FILE':
                message = 'Invalid field name. Use "avatar" for file upload';
                break;
        }

        res.status(400).json({
            status: 'fail',
            message,
        });
        return;
    }

    if (err.message.includes('Multipart: Boundary not found')) {
        res.status(400).json({
            status: 'fail',
            message: 'Invalid multipart request: Boundary not found',
        });
        return;
    }

    if (process.env.NODE_ENV === 'development') {
        errorResponse.stack = err.stack;
    }

    if (err instanceof AppError && err.isOperational) {
        // Trusted error: Send the response we built
        res.status(err.statusCode).json(errorResponse);
    } else {
        // Log error for debugging (disabled in production)
        // console.log('ERROR 💥', err);

        // IN DEVELOPMENT: You usually want to see the crash details anyway
        if (process.env.NODE_ENV === 'development') {
            res.status(500).json(errorResponse);
        }
        // IN PRODUCTION: Send generic message (Hide details)
        else {
            res.status(500).json({
                status: 'error',
                message: 'Something went wrong!',
            });
        }
    }
};
