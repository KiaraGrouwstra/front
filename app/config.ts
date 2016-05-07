import { OpaqueToken } from '@angular/core';

export let APP_CONFIG = new OpaqueToken('app.config');

// export interface Config {
//   endpoint: string,
//   chan_name: string,
// }

export const CONFIG: Config = {
  endpoint: 'ws://127.0.0.1:8080/socket',
  chan_name: 'rooms:lobby',
};
