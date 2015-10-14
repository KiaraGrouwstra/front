// import WS from './websocket';
import WS from './ws.ts';
// WS = require('./ws.ts');
global.ws = new WS();

var App = ng
.Component({
  selector: 'app'
})
.View({
  styles: [ require('./style.less') ],
  template: require('./header.jade')
})
.Class({
  constructor: function () {
    this.name = 'Alice';
  },
  addUrl: function(url) {
    // this.urls.push(url);
    console.log(url);
    chan.push("post:/urls", {user: "tycho", data: url})
  }
});

document.addEventListener('DOMContentLoaded', () => {
  ng.bootstrap(App);
});
