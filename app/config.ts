import { OpaqueToken } from '@angular/core';

export let APP_CONFIG = new OpaqueToken('app.config');

export const CONFIG: Front.Config = {
  endpoint: 'ws://127.0.0.1:8080/socket',
  chan_name: 'rooms:lobby',
};
