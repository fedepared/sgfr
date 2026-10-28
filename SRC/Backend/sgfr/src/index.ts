import mongoose from 'mongoose';
import app from './app';
import { config } from './config';

const startServer = async () => {
  try {
    console.log('Conectando a MongoDB');
    await mongoose.connect(config.databaseUrl);
    console.log('Conexión a MongoDB exitosa.');

    app.listen(config.port, () => {
      console.log(`Servidor escuchando en http://localhost:${config.port}`);
      console.log(`Documentación Swagger en http://localhost:${config.port}/api-docs`);
    });
  } catch (error) {
    console.error('Error al conectar a MongoDB o iniciar el servidor:');
    console.error(error);
    process.exit(1);
  }
};

startServer();
