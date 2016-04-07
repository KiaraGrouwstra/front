import { it, fit, xit, expect, afterEach, beforeEach, fdescribe, xdescribe, } from "angular2/testing";
import { Injector, provide } from 'angular2/core';
import { RequestService } from '../../services/request/request';
import { WsService } from '../../services/ws/ws';
import { requestServiceProvider } from '../../services/request/request.provider';
import { wsServiceProvider } from '../../services/ws/ws.provider';
import { CONFIG, APP_CONFIG } from '../../../config';
import { ROUTER_PROVIDERS } from 'angular2/router';
import { Router } from 'angular2/router'; //, RouteParams
import { Http } from 'angular2/http'; //Headers
import { HTTP_BINDINGS } from 'angular2/http';
import { ChangeDetectorGenConfig } from 'angular2/src/core/change_detection/change_detection';
import { App } from './app';

export let appProvider = provide(App, {
  deps: [
    Router,
    Http,
    RequestService,
    WsService,
    APP_CONFIG,
  ],
  useFactory: (
    router,
    http,
    req,
    ws,
    config,
  ) => new App(
    router,
    http,
    req,
    ws,
    config,
  ),
});

describe('App', () => {
  let injector: Injector;
  var app;

  beforeEach(() => {
    injector = Injector.resolveAndCreate([
      appProvider,
      HTTP_BINDINGS, ROUTER_PROVIDERS,
      requestServiceProvider,
      wsServiceProvider,
      provide(APP_CONFIG, { useValue: CONFIG }),
      provide(ChangeDetectorGenConfig, { useValue: new ChangeDetectorGenConfig(false, false, false) }),
    ]);
    app = injector.get(App);
  })

  // it('should test', () => {
  //   throw "works"
  // })

  it('should be able to create the app', () => {
    expect(app).toBeDefined();
  });

})
