import { ReflectiveInjector } from '@angular/core';
import { RequestService } from './request';
import { requestServiceProvider } from './request.provider';
import { WsService } from '../ws/ws';
import { wsServiceProvider } from '../ws/ws.provider';
import { CONFIG, APP_CONFIG } from '../../../config';

const urls = ['https://baidu.com/'];

describe('RequestService', () => {
  let injector: ReflectiveInjector;
  let req;

  beforeEach(() => {
    injector = ReflectiveInjector.resolveAndCreate([
      requestServiceProvider,
      wsServiceProvider,
      { provide: APP_CONFIG, useValue: CONFIG },
    ]);
    req = injector.get(RequestService);
    spyOn(req._ws.chan, 'push');
  })

  // it('should test', () => {
  //   throw "works"
  // })

  it('should be able to create the service', () => {
    expect(req).toBeDefined();
  });

  it('should not call functions by itself', () => {
    expect(req._ws.chan.push).not.toHaveBeenCalled();
  })

  it('addUrls', () => {
    let method = 'GET';
    let headers = [];
    let body = {};
    req.addUrls({ urls, headers, method, body });
    expect(req._ws.chan.push).toHaveBeenCalledWith('/urls', { body: { urls, headers, method, body }, id: 0 });
  })

  it('parsley', () => {
    let parselet = '{}';
    req.addUrls({ urls, parselet });
    expect(req._ws.chan.push).toHaveBeenCalledWith('/parse', { body: {urls, parselet}, id: 0 });
  })

  it('toCurl', () => {
    let curl = "curl 'url' -H 'a: b'";
    req.toCurl(curl);
    let headers = { a: 'b' };
    expect(req._ws.chan.push).toHaveBeenCalledWith('/check', { body: { urls: 'url', headers}, id: 0 });
  })

})
