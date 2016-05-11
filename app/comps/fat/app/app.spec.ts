import { ComponentFixture, NgMatchers, inject, injectAsync, beforeEachProviders, it, fit, xit, expect, afterEach, beforeEach, } from '@angular/core/testing';
import { ReflectiveInjector, provide } from '@angular/core';
import { RequestService } from '../../services/request/request';
import { WsService } from '../../services/ws/ws';
import { requestServiceProvider } from '../../services/request/request.provider';
import { wsServiceProvider } from '../../services/ws/ws.provider';
import { CONFIG, APP_CONFIG } from '../../../config';
import { ROUTER_PROVIDERS } from '@angular/router';
import { Router } from '@angular/router';
import { Http } from '@angular/http'; //Headers
import { HTTP_BINDINGS } from '@angular/http';
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

xdescribe('App', () => {
  let injector: ReflectiveInjector;
  let app;

  beforeEach(() => {
    injector = ReflectiveInjector.resolveAndCreate([
      appProvider,
      HTTP_BINDINGS, ROUTER_PROVIDERS,
      requestServiceProvider,
      wsServiceProvider,
      provide(APP_CONFIG, { useValue: CONFIG }),
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
