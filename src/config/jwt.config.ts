import { ConfigType, registerAs } from '@nestjs/config';

export const jwtConfigFactory = registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET,
}));

export const JWT_CONFIG_KEY = jwtConfigFactory.KEY;

export type TJwtConfig = ConfigType<typeof jwtConfigFactory>;
