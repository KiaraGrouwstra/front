let _ = require('lodash/fp');
import { Subject, Observable } from 'rxjs'; //, BehaviorSubject
import { Injectable } from '@angular/core';
// import { makeBody } from '../../lib/js';

const FOLLOW = true;
// https://developer.mozilla.org/en-US/docs/Web/API/GlobalFetch/fetch
const BASE_INIT = {
  method: 'GET',
  headers: new Headers({}),
  redirect: FOLLOW ? 'follow' : 'manual',
  // body,
  // mode,
  // cache,
  // referrer,
  // integrity,
  // credentials,
};

// no-cors fetch Subject: directly scrape pages from browser using Chrome startup flag `--disable-web-security` or by making this into an extension
@Injectable()
export class FetcherService {
  // add default init?
  delay: integer = 500;

  // make a Request body from an object
  makeBody(pars: {}): FormData {
    return _.toPairs(pars).reduce((acc, pair) => {
      acc.append(...pair);
      return acc;
    }, new FormData);
  }

  _meta2init(pars: Front.ReqMeta): Request.Init {
    let { body, method, headers } = pars;
    let useBody = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase());
    if(_.isPlainObject(body)) body = this.makeBody(body);
    let form_init = {
      headers: new Headers(headers || {}),
      method: method || 'GET',
      body: useBody ? body : null,
    };
    return _.assign(BASE_INIT, form_init);
  }

  // ReqMeta = { urls: string[], headers: {}, method?: string, body?: string, parselet?: string }
  // fetch URL content from ReqMeta with potentially multiple URLs
  addUrls(pars: Front.ReqMeta): Observable<any> {
    let init = this._meta2init(pars);
    let reqs = pars.urls.map(url => new Request(url, init));
    return this.ask(reqs);
  }

  // fetch URLs from multiple ReqMeta
  addReqs(metas: Front.ReqMeta[]): Observable<any> { // reqs: Request[]
    let reqs = metas.map(meta => {
      let init = this._meta2init(meta);
      return new Request(meta.urls, init);
    });
    return this.ask(reqs);
    // pars.parselet ? .map(parse(pars.parselet))
  }

  // try variations of a CURL command by skipping different headers to analyze which affect results
  toCurl(str: string): Observable<any> {
    let found = str.match(/-H '([^']+)'/g);
    let url = /'[^']+(?=')/.exec(str)[0].substr(1);
    let headers = _.fromPairs(found.map(x =>
      /-H '([^:]+): ([^']+)'/.exec(x).slice(1)
    ));
    let headers_without = _.fromPairs(_.keys(headers).map(k => [`without ${k}`, _.omit([k])(headers)]));
    let header_combs = { all: headers, none: [], ...headers_without };
    let setter = (obj, [k, v]) =>
    // _.set(k, v)(obj);
    // faster but mutates:
    {
      obj[k] = v;
      return obj;
    };
    // _.mapValues
    Observable.pairs(header_combs).map(async function([k, hdrs]) {
      let init = _.assign(BASE_INIT, { headers: new Headers(hdrs) });
      let resp = await this.ask(new Request(url, init)).toPromise();
      let v = { status: resp.status, length: resp.body.length, description: resp.statusText };
      return [k, v];
    })
    // merge back
    .scan(setter, {});
  }

  // make a series of requests
  ask(reqs: Request[]): Observable {
    let delay = this.delay;
    return Observable.from(reqs)
      // .debounce(delay) //, scheduler
      // .debounce(x => Observable.timer(delay))
      .map(v => Rx.Observable.from([v]).delay(delay)).concatAll()
      .flatMap(req => fetch(req))
      .flatMap(decode);
  }

  // make a single request
  askReq(req: Request): Promise {
    // return decode(fetch(req));
    return this.ask([req]).toPromise();
  }

}

// decode a response to string
async function decode(resp: Response): Promise<string> {
  let encoding = getEncoding(resp);
  let blob = await resp.blob();
  let reader = new FileReader();
  return new Promise((resolve, reject) => {
    try {
      reader.addEventListener('loadend', function() {
          resolve(reader.result);
        });
      reader.readAsText(blob, encoding);
    } catch(e) {
      reject(e);
    }
  });
}

// get the response encoding
function getEncoding(resp: Response): string {
  try {
    return /charset=(.*)/i.exec(resp.headers.get('content-type'))[1];
  } catch(e) {
    return 'utf8';
  }
}

// extract JSON from a JSONP formatted response body string
function de_jsonp(str: string): any {
  let match = /^\s*([\w_]*)\s*\((.*)\)\;?\s*$/.test(str);
  let json = match[2];
  return JSON.parse(json);
}
