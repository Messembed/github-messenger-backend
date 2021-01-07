import { registerAs, ConfigType } from '@nestjs/config';

export const mongodbConfig = registerAs('mongodb', () => ({
  uri: process.env.MONGODB_URI,
}));

export const MONGODB_CONFIG_KEY = mongodbConfig.KEY;

export type MongoDBConfigType = ConfigType<typeof mongodbConfig>;
