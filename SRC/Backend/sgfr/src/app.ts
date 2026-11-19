import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { config } from './config';
import { errorHandler } from './middlewares/errorHandler';
import apiRoutes from './routes';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './swagger';

const app: Application = express();

// Conexión a MongoDB para cuando está en local y cuando está deployado
const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  try {
    console.log('Conectando a MongoDB...');
    await mongoose.connect(config.databaseUrl);
    console.log('Conexión a MongoDB exitosa.');
  } catch (error) {
    console.error('Error al conectar a MongoDB:', error);
  }
};

connectDB();

// Middlewares globales
app.use(
  cors({
    origin: config.clientUrl,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Ruta base de prueba
app.get('/', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    message: 'SGFR Backend API funcionando correctamente',
    timestamp: new Date().toISOString(),
  });
});

// Rutas de la API
app.use('/api', apiRoutes);

// Middleware de manejo de errores
app.use(errorHandler);

export default app;