import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 4000,
  databaseUrl: process.env.DATABASE_URL || 'mongodb://127.0.0.1:27017/sgfr',
  jwtSecret: process.env.JWT_SECRET || 'sgfr_secret_key_change_in_production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
};
