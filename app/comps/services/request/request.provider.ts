import { provide } from '@angular/core';
import { RequestService } from './request';
import { WsService } from '../ws/ws';

export let requestServiceProvider = provide(RequestService, {
  deps: [WsService],
  useFactory: (ws) => new RequestService(ws),
});
