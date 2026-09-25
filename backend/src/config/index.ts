import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'cargopulse_dev_jwt_secret_token_123456789',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:cargopulse_password@localhost:5432/cargopulse_db?schema=public',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
};
