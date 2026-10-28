import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { logErrorToDB } from '../utils/logger';
import { AuthRequest } from './auth';


export const errorHandler = async (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Error interno del servidor';

  // Manejo de errores de Mongoose / MongoDB
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const details = Object.values(err.errors).map((e: any) => e.message);
    message = `Error de validación: ${details.join(', ')}`;
  } else if (err.code === 11000) {
    statusCode = 409;
    const duplicatedField = Object.keys(err.keyValue || {})[0] || 'campo';
    message = `Valor duplicado para el campo: ${duplicatedField}`;
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = `Identificador o formato inválido para el campo: ${err.path}`;
  }

  // Registrar en la colección ErrorLog de MongoDB
  const authReq = req as AuthRequest;
  await logErrorToDB({
    level: statusCode >= 500 ? 'error' : 'warn',
    message,
    stack: err.stack,
    endpoint: req.originalUrl,
    method: req.method,
    statusCode,
    userId: authReq.user?.id || null,
  });

  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
