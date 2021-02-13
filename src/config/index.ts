import { ConfigModuleOptions } from '@nestjs/config/dist/interfaces';
import { appConfigsFactory } from './app.config';
import { githubConfigsFactory } from './github.config';
import { jwtConfigFactory } from './jwt.config';
import { messembedConfig } from './messembed';
import { mongodbConfig } from './mongodb.config';

export const configModuleOptions: ConfigModuleOptions = {
  load: [
    appConfigsFactory,
    githubConfigsFactory,
    mongodbConfig,
    messembedConfig,
    jwtConfigFactory,
  ],
  isGlobal: true,
};
