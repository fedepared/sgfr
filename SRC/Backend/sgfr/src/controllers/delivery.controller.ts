import { Request, Response, NextFunction } from 'express';
import { deliveryService } from '../services/delivery.service';

const getParamId = (param: string | string[]): string => {
  return Array.isArray(param) ? param[0] : param;
};

export class DeliveryController {
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await deliveryService.getAll(req.query as any);
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
      const delivery = await deliveryService.getById(id);
      res.status(200).json({
        status: 'success',
        data: delivery,
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const delivery = await deliveryService.create(req.body);
      res.status(201).json({
        status: 'success',
        message: 'Entrega creada exitosamente.',
        data: delivery,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = getParamId(req.params.id);
      const delivery = await deliveryService.update(id, req.body);
      res.status(200).json({
        status: 'success',
        message: 'Entrega actualizada exitosamente.',
        data: delivery,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = getParamId(req.params.id);
      const delivery = await deliveryService.updateStatus(id, req.body);
      res.status(200).json({
        status: 'success',
        message: 'Estado de la entrega actualizado.',
        data: delivery,
      });
    } catch (error) {
      next(error);
    }
  }

  async addAnnotation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = getParamId(req.params.id);
      const delivery = await deliveryService.addAnnotation(id, req.body);
      res.status(201).json({
        status: 'success',
        message: 'Observación agregada exitosamente.',
        data: delivery,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = getParamId(req.params.id);
      const result = await deliveryService.delete(id);
      res.status(200).json({
        status: 'success',
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const deliveryController = new DeliveryController();
