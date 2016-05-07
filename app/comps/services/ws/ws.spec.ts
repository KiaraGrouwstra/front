import { it, fit, xit, expect, afterEach, beforeEach, fdescribe, xdescribe, } from '@angular/core/testing';
import { ReflectiveInjector, provide } from '@angular/core';
import { Subject } from 'rxjs';
import { WsService } from './ws';
import { wsServiceProvider } from './ws.provider';
import { CONFIG, APP_CONFIG } from '../../../config';

describe('WebSocket', () => {
  let injector: ReflectiveInjector;
  let ws;

  beforeEach(() => {
    injector = ReflectiveInjector.resolveAndCreate([
      wsServiceProvider,
      provide(APP_CONFIG, { useValue: CONFIG }),
    ]);
    ws = injector.get(WsService);
    ws.connect();
    spyOn(ws.chan, 'push');
  })

  // it('should test', () => {
  //   throw "works"
  // })

  it('should be able to create the service', () => {
    expect(ws).toBeDefined();
  });

  it('should not call functions by itself', () => {
    expect(ws.chan.push).not.toHaveBeenCalled();
  })

  it('should allow calling functions', () => {
    ws.ask();
    expect(ws.chan.push).toHaveBeenCalled();
  })

  it('should expose an Observable', () => {
    expect(ws.out).toBeAnInstanceOf(Subject)
  })

  it('should allow making requests', () => {
    ws.ask('/', {});
    expect(ws.chan.push).toHaveBeenCalledWith('/', { body: {}, id: 0 });
  })

  // it('should enable request-response', () => {}
  // it('should enable request - multiple response', () => {}

})
