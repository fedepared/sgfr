import { Request, Response, NextFunction } from 'express';
import { driverService } from '../services/driver.service';

const getParamId = (param: string | string[]): string => {
  return Array.isArray(param) ? param[0] : param;
};

export class DriverController {
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await driverService.getAll(req.query as any);
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
      const driver = await driverService.getById(id);
      res.status(200).json({
        status: 'success',
        data: driver,
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const driver = await driverService.create(req.body);
      res.status(201).json({
        status: 'success',
        message: 'Chofer registrado exitosamente.',
        data: driver,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = getParamId(req.params.id);
      const driver = await driverService.update(id, req.body);
      res.status(200).json({
        status: 'success',
        message: 'Chofer actualizado exitosamente.',
        data: driver,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = getParamId(req.params.id);
      const result = await driverService.delete(id);
      res.status(200).json({
        status: 'success',
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getLicenseTypes(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const licenseTypes = await driverService.getAllLicenseTypes();
      res.status(200).json({
        status: 'success',
        data: licenseTypes,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const driverController = new DriverController();
