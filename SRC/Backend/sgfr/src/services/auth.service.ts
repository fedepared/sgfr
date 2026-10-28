import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserModel } from '../data/user';
import { RoleModel } from '../data/role';
import { AppError } from '../utils/AppError';
import { config } from '../config';

export interface RegisterDTO {
  userName?: string;
  password?: string;
  roleName?: string;
}

export interface LoginDTO {
  userName?: string;
  password?: string;
}

export interface AuthResponse {
  user: {
    id: string;
    userName: string;
    role: string;
  };
  token: string;
}

export class AuthService {
  async register(data: RegisterDTO): Promise<AuthResponse> {
    const { userName, password, roleName = 'chofer' } = data;

    if (!userName || !userName.trim()) {
      throw new AppError('El nombre de usuario es obligatorio.', 400);
    }

    if (!password || password.trim().length < 6) {
      throw new AppError('La contraseña es obligatoria y debe tener al menos 6 caracteres.', 400);
    }

    const cleanUserName = userName.trim();

    const existingUser = await UserModel.findOne({ userName: cleanUserName });
    if (existingUser) {
      throw new AppError('El nombre de usuario ya se encuentra registrado.', 409);
    }

    const role = await RoleModel.findOne({ roleName });
    if (!role) {
      throw new AppError(`El rol "${roleName}" no existe en el sistema.`, 400);
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await UserModel.create({
      userName: cleanUserName,
      passwordHash,
      roleType: role._id,
    });

    const token = jwt.sign(
      {
        id: newUser._id.toString(),
        userName: newUser.userName,
        role: role.roleName,
      },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn as any }
    );

    return {
      user: {
        id: newUser._id.toString(),
        userName: newUser.userName,
        role: role.roleName,
      },
      token,
    };
  }

  async login(data: LoginDTO): Promise<AuthResponse> {
    const { userName, password } = data;

    if (!userName || !userName.trim() || !password) {
      throw new AppError('Debe ingresar nombre de usuario y contraseña.', 400);
    }

    const user = await UserModel.findOne({ userName: userName.trim() }).populate('roleType');
    if (!user) {
      throw new AppError('Credenciales inválidas.', 401);
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new AppError('Credenciales inválidas.', 401);
    }

    const roleName = (user.roleType as any)?.roleName || 'chofer';

    const token = jwt.sign(
      {
        id: user._id.toString(),
        userName: user.userName,
        role: roleName,
      },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn as any }
    );

    return {
      user: {
        id: user._id.toString(),
        userName: user.userName,
        role: roleName,
      },
      token,
    };
  }

  async getProfile(userId: string) {
    if (!userId) {
      throw new AppError('Identificador de usuario inválido.', 400);
    }

    const user = await UserModel.findById(userId).populate('roleType', 'roleName');
    if (!user) {
      throw new AppError('Usuario no encontrado.', 404);
    }

    return {
      id: user._id.toString(),
      userName: user.userName,
      role: (user.roleType as any)?.roleName || null,
      createdAt: (user as any).createdAt,
      updatedAt: (user as any).updatedAt,
    };
  }
}

export const authService = new AuthService();
