import { Request, Response, NextFunction } from 'express';
import { customerService } from '../services/customer.service';

const getParamId = (param: string | string[]): string => {
  return Array.isArray(param) ? param[0] : param;
};

export class CustomerController {
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await customerService.getAll(req.query as any);
      res.status(200).json({
        status: 'success',
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = getParamId(req.params.id);
      const customer = await customerService.getById(id);
      res.status(200).json({
        status: 'success',
        data: customer,
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const customer = await customerService.create(req.body);
      res.status(201).json({
        status: 'success',
        message: 'Cliente registrado exitosamente.',
        data: customer,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = getParamId(req.params.id);
      const customer = await customerService.update(id, req.body);
      res.status(200).json({
        status: 'success',
        message: 'Cliente actualizado exitosamente.',
        data: customer,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = getParamId(req.params.id);
      const result = await customerService.delete(id);
      res.status(200).json({
        status: 'success',
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const customerController = new CustomerController();
