import { registerAs } from '@nestjs/config';

export const appConfigsFactory = registerAs('app', () => ({
  port: parseInt(process.env.PORT || '3000'),
  host: process.env.HOST || 'localhost',
}));
