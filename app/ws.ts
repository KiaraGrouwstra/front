var Q = require('q');
var Phoenix = require('phoenix-js-derp');

export class WS {
  promises: any;
  currentId: number;
  ws: any;
  chan: any;

  constructor(url = "ws://127.0.0.1:8080/socket", chan_name = "rooms:lobby") {
    this.promises = {};
    this.currentId = 0;
    let logger = ((kind, msg, data) => { console.log(`${kind}: ${msg}`, data) });
    this.ws = new Phoenix.Socket(url, {logger: logger});
    //console.log(this.ws);
    this.ws.connect({});
    this.chan = this.ws.channel(chan_name, {user: "tycho"});
    this.chan.join();
    this.chan.on(msg => {
      //console.log('Received: ', msg);
      let data = JSON.parse(msg.data);
      var id = data.cb_id;
      if(this.promises.hasOwnProperty(id)) {
        // check status?
        this.promises[id].promise.resolve(data.body);  //$rootScope.$apply()
        delete this.promises[id];
      }
    });
  }

  // createConnection // JSON.parse(req.text())
  // { method: "POST", url: "/urls", body: "http://www.baidu.com/" }
  send(req) {
    var id = ++this.currentId;
    var route = `${req.method}:${req.url}`;
    let payload = { body: req.body, cb_id: id };
    this.chan.push(route, payload);
    return this.promises[id] = Q.defer();
  }

}

export default WS
