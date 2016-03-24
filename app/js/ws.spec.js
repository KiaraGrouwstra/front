import { it, fit, xit, expect, afterEach, beforeEach, fdescribe, xdescribe, } from "angular2/testing";
import { WS } from './ws';
import { Observable } from '@reactivex/rxjs';

describe('WebSocket', () => {
  var ws;

  beforeEach(() => {
    ws = new WS();
    spyOn(ws.chan, 'push');
  })

  // it('should test', () => {
  //   throw 'ws';
  // })

  it('should not call functions by itself', () => {
    expect(ws.chan.push).not.toHaveBeenCalled();
  })

  it('should allow calling functions', () => {
    ws.ask();
    expect(ws.chan.push).toHaveBeenCalled();
  })

  it('should expose an Observable', () => {
    expect(ws.out).toBeAnInstanceOf(Observable)
  })

  it('should allow making requests', () => {
    ws.ask('/', {});
    expect(ws.chan.push).toHaveBeenCalledWith('/', { body: {}, id: 0 });
  })

  // it('should enable request-response', () => {}
  // it('should enable request - multiple response', () => {}

})
