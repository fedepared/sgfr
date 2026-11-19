import { Router } from 'express';
import authRoutes from './auth.routes';
import vehicleRoutes from './vehicle.routes';
import customerRoutes from './customer.routes';
import driverRoutes from './driver.routes';
import deliveryRoutes from './delivery.routes';
import roadMapRoutes from './roadMap.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/vehicles', vehicleRoutes);
router.use('/customers', customerRoutes);
router.use('/drivers', driverRoutes);
router.use('/deliveries', deliveryRoutes);
router.use('/roadmaps', roadMapRoutes);

export default router;
