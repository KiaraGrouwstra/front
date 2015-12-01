var Phoenix = require('phoenix-js-derp');
import { Subject, Observable, Subscriber, Subscription } from '@reactivex/rxjs';

// class Request {
//   constructor(
//     url = "/urls", body: string, headers = {}
//   ) {}
// }

export class WS {
  requests: any;
  id: number;
  ws: any;
  chan: any;
  _out: Observable<any>;

  constructor() {
  //constructor(url = "ws://127.0.0.1:8080/socket", chan_name = "rooms:lobby") {
    // url = "ws://127.0.0.1:8080/socket", chan_name = "rooms:lobby"
    // temporarily taking these out of the constructor as a temp workaround to TypeScript error NoAnnotationError...
    // why am I even getting this while the default values already imply the types?
    // http://www.typescriptlang.org/Handbook#functions-optional-and-default-parameters
    let url = "ws://127.0.0.1:8080/socket";
    let chan_name = "rooms:lobby";
    this.requests = {};
    this.id = 0;
    let logger = ((kind, msg, data) => { console.log(`${kind}: ${msg}`, data) });
    this.ws = new Phoenix.Socket(url, {logger: logger});
    this.ws.connect({});
    this.chan = this.ws.channel(chan_name, {user: "tycho"});
    this.chan.join();
    this.chan.on("msg", this.handle_stored);
  }

  // taken from https://github.com/robwormald/aim/, example at TickerService.ts (also exposed `in` Observer).
  // should soon be made into a RxJS 5 compatible Subject at https://github.com/blesh/RxSocketSubject/
  get out(): Observable<any> {
    if(!this._out) {
      this._out = Observable.create(sub => {
        let chan = this.chan;
        chan.onClose(() => sub.complete());
        chan.onError(e => sub.error(e));
		    chan.on("msg", e => sub.next(e));
        return () => {
          chan.leave();
          this._out = null;
        };
      }).share();
    }
    return this._out;
  }

  request = (url, pars: any, info = {cb: (data, info) => {}}) => {
    let id = this.id++;
    this.chan.push(url, {body: pars, id: id});
    this.requests[id] = info;
  }

  // Could I like expose websocket results in an Rx Observable so I could do .map()s and stuff?
  // This would enable convenient post-processing like using JSON-Path to extract the meat...
  // I think the tough part was their websocket to Observable wouldn't work with Phoenix WS.
  // The hard part about making an Observable is normally they could only be operated by code running from the inside...
  handle_stored = (data) => {
    let id = data.id;
    let info = this.requests[id];
    info.cb(data, info);
  }

  // callbacks to use within handle_stored

  handle_part = (data, info) => {
    info.data.push(data.body);
  }

  handle_table = (data, info) => {
    Object.keys(data.body).forEach((k) => info.cols.add(k));
    info.rows.push(data.body);
  }

}

export default WS
