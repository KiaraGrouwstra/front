// // make this a RequestService between App and Socket with `this` Socket injected?
// let _ = require('lodash/fp');
//
// // fetch a URL
// function addUrl(url) {
//   return this.ask("/urls", {urls: url}); //, headers: []
// }
//
// // fetch a URL and extract its contents based on a json parselet, with a callback to insert it into the view.
// function parsley(url, json) {
//   let pars = {url: url, parselet: json};
//   return this.ask("/parse", pars);
// }
//
// // given a curl command, try out different combinations of headers to see which work, putting results in a table.
// function toCurl(str) { //: string
//   let found = str.match(/-H '([^']+)'/g);
//   let url = /'[^']+(?=')/.exec(str)[0].substr(1);
//   let headers = _.fromPairs(found.map(x =>
//     /-H '([^:]+): ([^']+)'/.exec(x).slice(1)
//   ));
//   let n = Object.keys(headers).length + 2;  // current server implementation 'try without each + all/none'
//   return this.ask("/check", {urls: url, headers: headers}, n);
// }
//
// export { addUrl, parsley, toCurl };
