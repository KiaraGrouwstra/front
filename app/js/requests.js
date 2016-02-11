// call from ws rather than app? so here .ws would be ditched, though it'd be required upon call?

// fetch a URL
let addUrl = (url) => {
  return this.ws.ask("/urls", {urls: url}, "url"); //, headers: []
}

// fetch a URL and extract its contents based on a json parselet, with a callback to insert it into the view.
let parsley = (url, json) => {
  let pars = {url: url, parselet: json};
  return this.ws.ask("/parse", pars, "parsley");
}

// given a curl command, try out different combinations of headers to see which work, putting results in a table.
let toCurl = (str) => { //: string
  let found = str.match(/-H '([^']+)'/g);
  let url = /'[^']+(?=')/.exec(str)[0].substr(1);
  let headers = _.zipObject(_.zip(...found.map(x =>
    /-H '([^:]+): ([^']+)'/.exec(x).slice(1)
  )));
  let n = Object.keys(headers).length + 2;  // based on the current server implementation of 'try without each + all/none'
  return this.ws.ask_n(n, "/check", {urls: url, headers: headers}, "curl");
}

export { addUrl, parsley, toCurl };
