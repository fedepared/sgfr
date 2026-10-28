import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { AppError } from '../utils/AppError';
import { UserModel } from '../data/user';
import { AuthenticatedUser } from '../utils/Interfaces/AuthenticatedUser';


//Sino genero la interface acá, me tira error en la linea 16
export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Acceso denegado. Token no proporcionado.', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwtSecret) as { id: string; userName: string; role: string };

    const user = await UserModel.findById(decoded.id).populate('roleType');
    if (!user) {
      throw new AppError('Usuario no encontrado o dado de baja.', 401);
    }

    req.user = {
      id: user._id.toString(),
      userName: user.userName,
      role: (user.roleType as any)?.roleName || decoded.role,
    };

    next();
  } catch (err: any) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      next(new AppError('Token inválido o expirado.', 401));
    } else {
      next(err);
    }
  }
};

export const authorize = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError('No autenticado.', 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError('No tienes permisos suficientes para realizar esta acción.', 403));
    }

    next();
  };
};
