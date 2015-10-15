var Q = require('q');
var Phoenix = require('phoenix-js-derp');

class Request {
  constructor(
    method = "POST", url = "/urls", body: string, headers = {}
  ) {}
}

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

  // createConnection // JSON.parse(req.text())
  // { method: "POST", url: "/urls", body: "http://www.baidu.com/" }
  send(method = "POST", url = "/urls", body: string, headers = {}) {
    var id = ++this.currentId;
    var route = `${method}:${url}`;
    let payload = { body: body, cb_id: id, headers: headers };
    this.chan.push(route, payload);
    return this.promises[id] = Q.defer();
  }

  ask(req: Request) {
    let id = send(req);
    return this.promises[id] = Q.defer();
  }

  handle_send(data) {
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

}

export default WS
