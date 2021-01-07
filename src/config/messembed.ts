import { registerAs, ConfigType } from '@nestjs/config';

export const messembedConfig = registerAs('messembed', () => ({
  uri: process.env.MESSEMBED_URI,
  username: process.env.MESSEMBED_USERNAME,
  password: process.env.MESSEMBED_PASSWORD,
}));

export const MESSEMBED_CONFIG_KEY = messembedConfig.KEY;

export type MessembedConfigType = ConfigType<typeof messembedConfig>;
