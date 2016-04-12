import { Injectable } from 'angular2/core';
import { elemToArr } from '../../lib/rx_helpers';

@Injectable()
export class RequestService {

  constructor(ws) {
    this.ws = ws;
    ws.connect();
  }

  // fetch URL content
  addUrl(pars) {
    // { urls, headers, verb, body }
    let n = [].concat(pars.urls).length;
    return this.ws.ask('/urls', pars, n);
  }

  // fetch URL content (and Parsley parse)
  parsley(urls, json) {
    let pars = {urls, parselet: json};
    let n = [].concat(urls).length;
    return this.ws.ask('/parse', pars, n);
  }

  // try variations of a CURL command by skipping different headers
  toCurl(str) {
    let found = str.match(/-H '([^']+)'/g);
    let url = /'[^']+(?=')/.exec(str)[0].substr(1);
    let headers = _.fromPairs(found.map(x =>
      /-H '([^:]+): ([^']+)'/.exec(x).slice(1)
    ));
    let n = Object.keys(headers).length + 2;  // current server implementation 'try without each + all/none'
    return this.ws.ask('/check', {urls: url, headers}, n); //.scan(elemToArr, []);
  }

}
