import { GlobalsService } from './globals';

export let globalsServiceProvider = {
  provide: GlobalsService,
  deps: [],
  useFactory: () => new GlobalsService(),
};
