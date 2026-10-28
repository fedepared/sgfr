import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import { config } from './config';
import { errorHandler } from './middlewares/errorHandler';
import apiRoutes from './routes';
import swaggerUi from 'swagger-ui-express';
import {swaggerSpec} from './swagger';

const app: Application = express();

// Middlewares globales
app.use(
  cors({
    origin: config.clientUrl,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Ruta base de prueba
app.get('/', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    message: 'SGFR Backend API funcionando correctamente',
    timestamp: new Date().toISOString(),
  });
});

// Utilización de
app.use('/api', apiRoutes);

// Middleware de manejo de errores
app.use(errorHandler);

export default app;
