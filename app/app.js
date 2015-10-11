// import "./fetch";
// import * as request from "./fetch";
// import "./content";
// import lol from "./content";
// document.write(lol);

// var req = require('request');
var rp = require('request-promise');
var options = {
  uri: 'http://www.google.com',
  transform: (data) => { return data; },
  method: 'GET'
};

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
    rp(options)
      .then(console.log)
      .catch(console.log);
      // .then("then: " + x => console.log(x))
      // .catch("catch: " + x => console.log(x));
  }
});

document.addEventListener('DOMContentLoaded', () => {
  ng.bootstrap(App);
});
