import { it, fit, xit, expect, afterEach, beforeEach, fdescribe, xdescribe, } from "angular2/testing";
import { Injector, provide } from 'angular2/core';
import { RequestService } from './request';
import { requestServiceProvider } from './request.provider';
import { WsService } from '../ws/ws';
import { wsServiceProvider } from '../ws/ws.provider';
import { CONFIG, APP_CONFIG } from '../../../config';

describe('RequestService', () => {
  let injector: Injector;
  var req;

  beforeEach(() => {
    injector = Injector.resolveAndCreate([
      requestServiceProvider,
      wsServiceProvider,
      provide(APP_CONFIG, { useValue: CONFIG }),
    ]);
    req = injector.get(RequestService);
    spyOn(req.ws.chan, 'push');
  })

  // it('should test', () => {
  //   throw "works"
  // })

  it('should be able to create the service', () => {
    expect(req).toBeDefined();
  });

  it('should not call functions by itself', () => {
    expect(req.ws.chan.push).not.toHaveBeenCalled();
  })

  it('addUrl', () => {
    let urls = 'https://baidu.com/';
    let verb = 'GET';
    let headers = [];
    let body = {};
    req.addUrl({ urls, headers, verb, body });
    expect(req.ws.chan.push).toHaveBeenCalledWith('/urls', { body: { urls, headers, verb, body }, id: 0 });
  })

  it('parsley', () => {
    let url = 'https://baidu.com/';
    let parselet = '{}';
    req.parsley(url, parselet);
    expect(req.ws.chan.push).toHaveBeenCalledWith('/parse', { body: {url, parselet}, id: 0 });
  })

  it('toCurl', () => {
    let curl = "curl 'url' -H 'a: b'";
    req.toCurl(curl);
    let urls = 'url';
    let headers = { a: 'b' };
    expect(req.ws.chan.push).toHaveBeenCalledWith('/check', { body: {urls, headers}, id: 0 });
  })

})
