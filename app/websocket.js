// import {Socket, LongPoller} from "phoenix"
//Phoenix = require('phoenix-js-derp');
import {Socket, LongPoller} from "phoenix-js-derp";

// return a channel exposing .on() and .push()
class WS {
  static init(url = "http://127.0.0.1:8080/socket", chan_name = "rooms:lobby"){
    let logger = ((kind, msg, data) => { console.log(`${kind}: ${msg}`, data) });
    // let socket =
    return
    new Socket(url, {logger: logger})
      .connect({user_id: "123"})
      // .onOpen( e => console.log("socket opened", e) )
      // .onError( e => console.log("error, retrying", e) )
      // .onClose( e => console.log("socket closed", e))
    // var chan = socket
    .channel(chan_name, {}).join()
      // .receive("ignore", () => console.log("auth error"))
      // .receive("ok", () => console.log("join ok"))
      // .after(10000, () => console.log("interrupted"))
      // .onError(e => console.log("error", e))
      // .onClose(e => console.log("channel closed", e))

    // JSON.stringify(obj)
    // chan.push("post:/urls", {user: "tycho", data: $input.val()})

    // chan.on("post:/urls", msg => {
    //   //var obj = JSON.parse(event.data);
    //   console.log("result post:/urls: " + msg)
    // })
    //
    // return chan
  }
}

// $( () => WS.init() )

export default WS
