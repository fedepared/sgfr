import mongoose from 'mongoose';
import { CustomerModel, Customer } from '../data/customer';
import { AppError } from '../utils/AppError';
import { getPaginationParams, PaginatedResponse } from '../utils/pagination';
import { CustomerFilterQuery, CreateCustomerDTO, UpdateCustomerDTO, CustomerAddressDTO } from '../utils/DTOs/Customer';

export class CustomerService {
  async getAll(query: CustomerFilterQuery): Promise<PaginatedResponse<any>> {
    const { page, limit, skip } = getPaginationParams(query);
    const filter: Record<string, any> = {};

    if (query.search && query.search.trim()) {
      const searchTerm = query.search.trim();

      // Buscamos coincidencia parcial en nombre, apellido, calle o DNI/CUIT (como string)
      filter.$or = [
        { name: { $regex: searchTerm, $options: 'i' } },
        { lastName: { $regex: searchTerm, $options: 'i' } },
        { 'addresses.street': { $regex: searchTerm, $options: 'i' } },
        {
          $expr: {
            $regexMatch: {
              input: { $toString: '$idCard' },
              regex: searchTerm,
              options: 'i',
            },
          },
        },
      ];
    }

    const [totalItems, customers] = await Promise.all([
      CustomerModel.countDocuments(filter),
      CustomerModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    return {
      data: customers,
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
      throw new AppError('Identificador de cliente inválido.', 400);
    }

    const customer = await CustomerModel.findById(id);
    if (!customer) {
      throw new AppError('Cliente no encontrado.', 404);
    }

    return customer;
  }

  async create(data: CreateCustomerDTO) {
    const { name, lastName, idCard, addresses } = data;

    if (!name || !name.trim()) {
      throw new AppError('El nombre del cliente es obligatorio.', 400);
    }

    if (!lastName || !lastName.trim()) {
      throw new AppError('El apellido del cliente es obligatorio.', 400);
    }

    if (idCard === undefined || idCard === null || isNaN(Number(idCard)) || Number(idCard) <= 0) {
      throw new AppError('El número de identificación (DNI/CUIT) debe ser un número positivo.', 400);
    }

    const numericIdCard = Number(idCard);
    const existing = await CustomerModel.findOne({ idCard: numericIdCard });
    if (existing) {
      throw new AppError(`Ya existe un cliente registrado con el DNI/CUIT ${numericIdCard}.`, 409);
    }

    if (!addresses || !Array.isArray(addresses) || addresses.length === 0) {
      throw new AppError('Debe ingresar al menos una dirección para el cliente.', 400);
    }

    const sanitizedAddresses: CustomerAddressDTO[] = addresses.map((addr, index) => {
      if (!addr.street || !addr.street.trim()) {
        throw new AppError(`La dirección #${index + 1} debe contener una calle válida.`, 400);
      }
      return {
        street: addr.street.trim(),
        zipCode: addr.zipCode ? addr.zipCode.trim() : '',
        floor: addr.floor !== undefined && addr.floor !== null ? Number(addr.floor) : 0,
        dept: addr.dept ? addr.dept.trim() : '',
      };
    });

    const newCustomer = await CustomerModel.create({
      name: name.trim(),
      lastName: lastName.trim(),
      idCard: numericIdCard,
      addresses: sanitizedAddresses,
    });

    return newCustomer;
  }

  async update(id: string, data: UpdateCustomerDTO) {
    if (!mongoose.isValidObjectId(id)) {
      throw new AppError('Identificador de cliente inválido.', 400);
    }

    const customer = await CustomerModel.findById(id);
    if (!customer) {
      throw new AppError('Cliente no encontrado.', 404);
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
        throw new AppError('El DNI/CUIT debe ser un número positivo.', 400);
      }
      const duplicate = await CustomerModel.findOne({ idCard: numericIdCard, _id: { $ne: id } });
      if (duplicate) {
        throw new AppError(`El DNI/CUIT ${numericIdCard} ya pertenece a otro cliente.`, 409);
      }
      updateFields.idCard = numericIdCard;
    }

    if (data.addresses !== undefined) {
      if (!Array.isArray(data.addresses) || data.addresses.length === 0) {
        throw new AppError('Debe proporcionar al menos una dirección.', 400);
      }
      updateFields.addresses = data.addresses.map((addr, index) => {
        if (!addr.street || !addr.street.trim()) {
          throw new AppError(`La dirección #${index + 1} debe contener una calle válida.`, 400);
        }
        return {
          street: addr.street.trim(),
          zipCode: addr.zipCode ? addr.zipCode.trim() : '',
          floor: addr.floor !== undefined && addr.floor !== null ? Number(addr.floor) : 0,
          dept: addr.dept ? addr.dept.trim() : '',
        };
      });
    }

    const updatedCustomer = await CustomerModel.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true }
    );

    return updatedCustomer;
  }

  async delete(id: string) {
    if (!mongoose.isValidObjectId(id)) {
      throw new AppError('Identificador de cliente inválido.', 400);
    }

    const customer = await CustomerModel.findByIdAndDelete(id);
    if (!customer) {
      throw new AppError('Cliente no encontrado.', 404);
    }

    return {
      message: 'Cliente eliminado con éxito.',
      id,
    };
  }
}

export const customerService = new CustomerService();
