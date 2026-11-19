import { Request, Response, NextFunction } from 'express';
import { roadMapService } from '../services/roadMap.service';
import { AuthRequest } from '../middlewares/auth';

const getParamId = (param: string | string[]): string => {
  return Array.isArray(param) ? param[0] : param;
};

export class RoadMapController {
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await roadMapService.getAll(req.query as any);
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
      const roadMap = await roadMapService.getById(id);
      res.status(200).json({
        status: 'success',
        data: roadMap,
      });
    } catch (error) {
      next(error);
    }
  }

  async getToday(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const roadMap = await roadMapService.getTodayRoadMapForDriver(req.user!.id);
      res.status(200).json({
        status: 'success',
        data: roadMap,
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const roadMap = await roadMapService.create(req.body);
      res.status(201).json({
        status: 'success',
        message: 'Hoja de ruta creada exitosamente.',
        data: roadMap,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = getParamId(req.params.id);
      const roadMap = await roadMapService.update(id, req.body);
      res.status(200).json({
        status: 'success',
        message: 'Hoja de ruta actualizada exitosamente.',
        data: roadMap,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = getParamId(req.params.id);
      const result = await roadMapService.delete(id);
      res.status(200).json({
        status: 'success',
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  async addDelivery(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const roadMapId = getParamId(req.params.id);
      const deliveryId = req.body.deliveryId;
      const roadMap = await roadMapService.addDelivery(roadMapId, deliveryId);
      res.status(200).json({
        status: 'success',
        message: 'Entrega vinculada exitosamente a la hoja de ruta.',
        data: roadMap,
      });
    } catch (error) {
      next(error);
    }
  }

  async removeDelivery(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const roadMapId = getParamId(req.params.id);
      const deliveryId = getParamId(req.params.deliveryId);
      const roadMap = await roadMapService.removeDelivery(roadMapId, deliveryId);
      res.status(200).json({
        status: 'success',
        message: 'Entrega desvinculada de la hoja de ruta.',
        data: roadMap,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const roadMapController = new RoadMapController();
