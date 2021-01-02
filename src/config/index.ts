import { ConfigModuleOptions } from '@nestjs/config/dist/interfaces';
import { appConfigsFactory } from './app.config';
import { githubConfigsFactory } from './github.config';

export const configModuleOptions: ConfigModuleOptions = {
  load: [appConfigsFactory, githubConfigsFactory],
  isGlobal: true,
};
