import { inject, addProviders } from '@angular/core/testing';
import { ReflectiveInjector } from '@angular/core';
import { WsService, RequestService, GlobalsService, wsServiceProvider, requestServiceProvider, globalsServiceProvider } from '../../services';
import { CONFIG, APP_CONFIG } from '../../../config';
// import { ROUTER_PROVIDERS } from '@angular/router';
import { provideRouter } from '@angular/router';
import { Router } from '@angular/router';
import { Http } from '@angular/http'; //Headers
import { HTTP_BINDINGS } from '@angular/http';
import { App } from './app';

export let appProvider = {
  provide: App,
  deps: [
    // Router,
    Http,
    RequestService,
    WsService,
    APP_CONFIG,
    GlobalsService,
  ],
  useFactory: (
    // router,
    http,
    req,
    ws,
    config,
    g,
  ) => new App(
    // router,
    http,
    req,
    ws,
    config,
    g,
  ),
};

describe('App', () => {
  let injector: ReflectiveInjector;
  let app;

  beforeEach(() => {
    injector = ReflectiveInjector.resolveAndCreate([
      appProvider,
      HTTP_BINDINGS,
      // ROUTER_PROVIDERS,
      // provideRouter(MyRoutes),
      requestServiceProvider,
      wsServiceProvider,
      { provide: APP_CONFIG, useValue: CONFIG },
      globalsServiceProvider,
    ]);
    app = injector.get(App);
  })

  // it('should test', () => {
  //   throw "works"
  // })

  it('should be able to create the app', () => {
    expect(app).toBeDefined();
  });

  it('should have properties', () => {
    expect(app.auto_meat).toEqual(true);
  });

})
