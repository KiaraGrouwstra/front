import { OpaqueToken } from '@angular/core';
import { credentials } from './secret';

export let APP_CONFIG = new OpaqueToken('app.config');

export const CONFIG: Front.Config = {
  endpoint: 'ws://127.0.0.1:8080/socket',
  chan_name: 'rooms:lobby',
  cipher_key: 'change_me',
  credentials,
  app_url: 'http://127.0.0.1:8090',
};
