import { ConfigModuleOptions } from '@nestjs/config/dist/interfaces';
import { appConfigsFactory } from './app.config';

export const configModuleOptions: ConfigModuleOptions = {
  load: [appConfigsFactory],
  isGlobal: true,
};
