// Merge Phoenix.js with ng2/Rx (e.g. `Rx.DOM.fromWebSocket()`, RxSocketSubject)
// then filter by `cb_id`? meh, no onComplete()?; performance, effort.

var Q = require('q');
var Phoenix = require('phoenix-js-derp');

// class Request {
//   constructor(
//     method = "POST", url = "/urls", body: string, headers = {}
//   ) {}
// }

export class WS {
  promises: any;
  currentId: number;
  ws: any;
  chan: any;

  constructor() {
    // url = "ws://127.0.0.1:8080/socket", chan_name = "rooms:lobby"
    // temporarily taking these out of the constructor as a temp workaround to TypeScript error NoAnnotationError...
    // why am I even getting this while the default values already imply the types?
    // http://www.typescriptlang.org/Handbook#functions-optional-and-default-parameters
    let url = "ws://127.0.0.1:8080/socket";
    let chan_name = "rooms:lobby";
    this.promises = {};
    this.currentId = 0;
    let logger = ((kind, msg, data) => { console.log(`${kind}: ${msg}`, data) });
    this.ws = new Phoenix.Socket(url, {logger: logger});
    //console.log(this.ws);
    this.ws.connect({});
    this.chan = this.ws.channel(chan_name, {user: "tycho"});
    this.chan.join();
    this.chan.on("RESP", this.handle_send);
    this.chan.on("PART", this.handle_part);
    this.chan.on("DONE", this.handle_done);
  }

  // createConnection // JSON.parse(req.text()) // req: Request
  send = (method = "POST", url = "/urls", body: string, headers = {}) => {
    var id = ++this.currentId;
    var route = `${method}:${url}`;
    let payload = { body: body, cb_id: id, headers: headers };
    this.chan.push(route, payload);
    return id;
  }

  ask = (method = "POST", url = "/urls", body: string, headers = {}) => {
    let id = this.send(method, url, body, headers);
    return this.promises[id] = Q.defer();
  }

  ask_array = (arr: any[], method = "POST", url = "/urls", body: string, headers = {}) => {
    let id = this.send(method, url, body, headers);
    this.promises[id] = arr;  // ref, not a promise
  }

  // ^ make these into methods of send's result to prevent duplicate code here?
  // or just rely on ng2's Rx/Request/Connection/ConnectionBackend wrapping?

  handle_send = (data) => {
    var id = data.cb_id;
    var status = data.status || 200;
    if(this.promises.hasOwnProperty(id)) {
      if(status == 200) {
        this.promises[id].resolve(data.body);
      } else {
        this.promises[id].reject(data.body);
      }
      delete this.promises[id];
    }
  }

  handle_part = (data) => {
    var id = data.cb_id;
    this.promises[id].push(data.body);
  }

  handle_done = (data) => {
    var id = data.cb_id;
    delete this.promises[id];
  }

}

export default WS
