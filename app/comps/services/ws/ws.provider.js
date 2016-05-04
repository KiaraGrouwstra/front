import { provide } from '@angular/core';
import { WsService } from './ws';
import { APP_CONFIG } from '../../../config';

export let wsServiceProvider = provide(WsService, {
  deps: [APP_CONFIG],
  useFactory: (cfg) => new WsService(cfg.endpoint, cfg.chan_name),
});
