let _ = require('lodash/fp');
import { Injectable } from '@angular/core';
import { elemToArr } from '../../lib/rx_helpers';
import { WsService } from '../ws/ws';
import { Observable } from 'rxjs';

@Injectable()
export class RequestService {

  constructor(
    private _ws: WsService,
  ) {
    _ws.connect();
  }

  // fetch URL content
  addUrl(pars: {}): Observable<any> {
    // { urls: string|string[], headers: {}, verb: string, body: string }
    let n = [].concat(pars.urls).length;
    return this._ws.ask('/urls', pars, n);
  }

  // fetch URL content (and Parsley parse)
  parsley(urls: string|string[], json: string): Observable<any> {
    let pars = {urls, parselet: json};
    let n = [].concat(urls).length;
    return this._ws.ask('/parse', pars, n);
  }

  // try variations of a CURL command by skipping different headers
  toCurl(str: string): Observable<any> {
    let found = str.match(/-H '([^']+)'/g);
    let url = /'[^']+(?=')/.exec(str)[0].substr(1);
    let headers = _.fromPairs(found.map(x =>
      /-H '([^:]+): ([^']+)'/.exec(x).slice(1)
    ));
    let n = _.size(headers) + 2;  // current server implementation 'try without each + all/none'
    return this._ws.ask('/check', {urls: url, headers}, n); //.scan(elemToArr, []);
  }

}
