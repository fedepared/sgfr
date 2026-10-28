import { Request, Response, NextFunction } from 'express';
import { vehicleService } from '../services/vehicle.service';

const getParamId = (param: string | string[]): string => {
  return Array.isArray(param) ? param[0] : param;
};

export class VehicleController {
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await vehicleService.getAll(req.query as any);
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
      const vehicle = await vehicleService.getById(id);
      res.status(200).json({
        status: 'success',
        data: vehicle,
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const vehicle = await vehicleService.create(req.body);
      res.status(201).json({
        status: 'success',
        message: 'Vehículo registrado exitosamente.',
        data: vehicle,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = getParamId(req.params.id);
      const vehicle = await vehicleService.update(id, req.body);
      res.status(200).json({
        status: 'success',
        message: 'Vehículo actualizado exitosamente.',
        data: vehicle,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = getParamId(req.params.id);
      const vehicle = await vehicleService.updateStatus(id, req.body.status);
      res.status(200).json({
        status: 'success',
        message: 'Estado del vehículo actualizado exitosamente.',
        data: vehicle,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = getParamId(req.params.id);
      const result = await vehicleService.delete(id);
      res.status(200).json({
        status: 'success',
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const vehicleController = new VehicleController();
