import { ErrorLogModel } from '../data/errorLog';
import { ErrorLogParams } from './Interfaces/ErrorLogParams';


export const logErrorToDB = async (params: ErrorLogParams): Promise<void> => {
  try {
    await ErrorLogModel.create({
      level: params.level || 'error',
      message: params.message,
      stack: params.stack || null,
      endpoint: params.endpoint || null,
      method: params.method || null,
      statusCode: params.statusCode || 500,
      userId: params.userId || null,
    });
  } catch (dbErr) {
    console.error('No se pudo guardar el error en MongoDB (fallback a consola):', dbErr);
    console.error('Error original:', params);
  }
};
