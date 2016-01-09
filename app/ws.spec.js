import { WS } from './ws';

describe('WebSocket', () => {

  var ws;

  beforeEach(() => {
    ws = new WS();
  })

  it('should expose an Observable', () =>
    expect(ws.out.subscribe).not.toEqual(null)
  )

  // it('should enable request-response', () =>
  //   expect(ws.ask())
  // )
  //
  // it('should enable request - multiple response', () =>
  //   expect(ws.ask_n())
  // )

})
