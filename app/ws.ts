// Merge Phoenix.js with ng2/Rx (e.g. `Rx.DOM.fromWebSocket()`, RxSocketSubject)
// then filter by `id`? meh, no onComplete()?; performance, effort.

var Q = require('q');
var Phoenix = require('phoenix-js-derp');

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

  constructor() {
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

  request = (url = "/urls", pars: any, info = {cb: (data, info) => {}}) => {
    let id = this.id++;
    this.chan.push(url, {body: pars, id: id});
    this.requests[id] = info;
  }

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
