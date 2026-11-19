import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { DriverModel, Driver } from '../data/driver';
import { UserModel } from '../data/user';
import { RoleModel } from '../data/role';
import { LicenseTypeModel } from '../data/licenseType';
import { AppError } from '../utils/AppError';
import { getPaginationParams, PaginatedResponse } from '../utils/pagination';
import { DriverFilterQuery, CreateDriverDTO, UpdateDriverDTO } from '../utils/DTOs/Driver';

export class DriverService {
  async getAll(query: DriverFilterQuery): Promise<PaginatedResponse<any>> {
    const { page, limit, skip } = getPaginationParams(query);
    const filter: Record<string, any> = {};

    if (query.search && query.search.trim()) {
      const searchTerm = query.search.trim();
      const asNumber = Number(searchTerm);

      if (!isNaN(asNumber)) {
        filter.$or = [
          { idCard: asNumber },
          { name: { $regex: searchTerm, $options: 'i' } },
          { lastName: { $regex: searchTerm, $options: 'i' } },
        ];
      } else {
        filter.$or = [
          { name: { $regex: searchTerm, $options: 'i' } },
          { lastName: { $regex: searchTerm, $options: 'i' } },
        ];
      }
    }

    if (query.licenseType && query.licenseType.trim()) {
      if (mongoose.isValidObjectId(query.licenseType)) {
        filter.licenseType = query.licenseType;
      }
    }

    const [totalItems, drivers] = await Promise.all([
      DriverModel.countDocuments(filter),
      DriverModel.find(filter)
        .populate('licenseType')
        .populate('user', 'userName roleType')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    return {
      data: drivers,
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        limit,
      },
    };
  }

  async getById(id: string) {
    if (!mongoose.isValidObjectId(id)) {
      throw new AppError('Identificador de chofer inválido.', 400);
    }

    const driver = await DriverModel.findById(id)
      .populate('licenseType')
      .populate('user', 'userName roleType');

    if (!driver) {
      throw new AppError('Chofer no encontrado.', 404);
    }

    return driver;
  }

  async create(data: CreateDriverDTO) {
    const { name, lastName, idCard, licenseType, user, createAccount } = data;

    if (!name || !name.trim()) {
      throw new AppError('El nombre del chofer es obligatorio.', 400);
    }

    if (!lastName || !lastName.trim()) {
      throw new AppError('El apellido del chofer es obligatorio.', 400);
    }

    if (idCard === undefined || idCard === null || isNaN(Number(idCard)) || Number(idCard) <= 0) {
      throw new AppError('El número de documento (DNI) debe ser un número positivo.', 400);
    }

    const numericIdCard = Number(idCard);
    const existingDriver = await DriverModel.findOne({ idCard: numericIdCard });
    if (existingDriver) {
      throw new AppError(`Ya existe un chofer registrado con el DNI ${numericIdCard}.`, 409);
    }

    if (!licenseType || !mongoose.isValidObjectId(licenseType)) {
      throw new AppError('Identificador de tipo de licencia inválido.', 400);
    }

    const licenseExists = await LicenseTypeModel.findById(licenseType);
    if (!licenseExists) {
      throw new AppError('El tipo de licencia especificado no existe.', 404);
    }

    let linkedUserId: mongoose.Types.ObjectId | null = null;

    // Caso 1: Se solicita crear una cuenta de usuario nueva para el chofer
    if (createAccount && createAccount.userName && createAccount.password) {
      const cleanUserName = createAccount.userName.trim();
      const existingUser = await UserModel.findOne({ userName: cleanUserName });
      if (existingUser) {
        throw new AppError(`El nombre de usuario "${cleanUserName}" ya está en uso.`, 409);
      }

      if (createAccount.password.trim().length < 6) {
        throw new AppError('La contraseña para la cuenta del chofer debe tener al menos 6 caracteres.', 400);
      }

      const roleChofer = await RoleModel.findOne({ roleName: 'chofer' });
      if (!roleChofer) {
        throw new AppError('El rol "chofer" no está configurado en el sistema.', 500);
      }

      const passwordHash = await bcrypt.hash(createAccount.password.trim(), 10);
      const newUser = await UserModel.create({
        userName: cleanUserName,
        passwordHash,
        roleType: roleChofer._id,
      });

      linkedUserId = newUser._id as mongoose.Types.ObjectId;
    }
    // Caso 2: Se provee un ID de usuario ya existente
    else if (user) {
      if (!mongoose.isValidObjectId(user)) {
        throw new AppError('Identificador de usuario inválido.', 400);
      }
      const existingUser = await UserModel.findById(user);
      if (!existingUser) {
        throw new AppError('El usuario especificado no existe.', 404);
      }

      // Validar que ese usuario no esté asignado ya a otro chofer
      const userAlreadyAssigned = await DriverModel.findOne({ user });
      if (userAlreadyAssigned) {
        throw new AppError('Este usuario ya se encuentra vinculado a otro chofer.', 409);
      }

      linkedUserId = existingUser._id as mongoose.Types.ObjectId;
    }

    const newDriver = await DriverModel.create({
      name: name.trim(),
      lastName: lastName.trim(),
      idCard: numericIdCard,
      licenseType,
      user: linkedUserId,
    });

    return await DriverModel.findById(newDriver._id)
      .populate('licenseType')
      .populate('user', 'userName roleType');
  }

  async update(id: string, data: UpdateDriverDTO) {
    if (!mongoose.isValidObjectId(id)) {
      throw new AppError('Identificador de chofer inválido.', 400);
    }

    const driver = await DriverModel.findById(id);
    if (!driver) {
      throw new AppError('Chofer no encontrado.', 404);
    }

    const updateFields: Record<string, any> = {};

    if (data.name !== undefined) {
      if (!data.name.trim()) throw new AppError('El nombre no puede estar vacío.', 400);
      updateFields.name = data.name.trim();
    }

    if (data.lastName !== undefined) {
      if (!data.lastName.trim()) throw new AppError('El apellido no puede estar vacío.', 400);
      updateFields.lastName = data.lastName.trim();
    }

    if (data.idCard !== undefined) {
      const numericIdCard = Number(data.idCard);
      if (isNaN(numericIdCard) || numericIdCard <= 0) {
        throw new AppError('El DNI debe ser un número positivo.', 400);
      }
      const duplicate = await DriverModel.findOne({ idCard: numericIdCard, _id: { $ne: id } });
      if (duplicate) {
        throw new AppError(`El DNI ${numericIdCard} ya pertenece a otro chofer.`, 409);
      }
      updateFields.idCard = numericIdCard;
    }

    if (data.licenseType !== undefined) {
      if (!mongoose.isValidObjectId(data.licenseType)) {
        throw new AppError('Identificador de tipo de licencia inválido.', 400);
      }
      const licenseExists = await LicenseTypeModel.findById(data.licenseType);
      if (!licenseExists) {
        throw new AppError('El tipo de licencia especificado no existe.', 404);
      }
      updateFields.licenseType = data.licenseType;
    }

    if (data.user !== undefined) {
      if (data.user === null) {
        updateFields.user = null;
      } else {
        if (!mongoose.isValidObjectId(data.user)) {
          throw new AppError('Identificador de usuario inválido.', 400);
        }
        const userExists = await UserModel.findById(data.user);
        if (!userExists) {
          throw new AppError('El usuario especificado no existe.', 404);
        }
        const userAssigned = await DriverModel.findOne({ user: data.user, _id: { $ne: id } });
        if (userAssigned) {
          throw new AppError('El usuario ya está vinculado a otro chofer.', 409);
        }
        updateFields.user = data.user;
      }
    }

    const updatedDriver = await DriverModel.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true }
    )
      .populate('licenseType')
      .populate('user', 'userName roleType');

    return updatedDriver;
  }

  async delete(id: string) {
    if (!mongoose.isValidObjectId(id)) {
      throw new AppError('Identificador de chofer inválido.', 400);
    }

    const driver = await DriverModel.findByIdAndDelete(id);
    if (!driver) {
      throw new AppError('Chofer no encontrado.', 404);
    }

    return {
      message: 'Chofer eliminado con éxito.',
      id,
    };
  }

  async getAllLicenseTypes() {
    return await LicenseTypeModel.find().sort({ licenseTypeLetter: 1, licenseTypeNumber: 1 });
  }
}

export const driverService = new DriverService();
