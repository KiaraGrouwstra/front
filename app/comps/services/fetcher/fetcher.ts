let _ = require('lodash/fp');
import { Subject, Observable } from 'rxjs'; //, BehaviorSubject
import { Injectable } from '@angular/core';

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

  // ReqMeta = { urls: string[], headers: {}, method?: string, body?: string, parselet?: string }
  // fetch URL content (and optionally Parsley parse)
  addUrls(pars: Front.ReqMeta): Observable<any> { // reqs: Request[]
    let form_init = {
      headers: new Headers(pars.headers || {}),
      method: pars.method || 'GET',
      body: ['POST', 'PUT', 'PATCH', 'DELETE'].includes(pars.method) ? pars.body : null,
    };
    let init = _.assign(BASE_INIT, form_init);
    let reqs = pars.urls.map(url => new Request(url, init));
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

  ask(reqs: Request[]): Observable {
    return Observable.from(reqs)
      // .debounce(500) //, scheduler
      .debounce(x => Observable.timer(500))
      .flatMap(req => fetch(req))
      .flatMap(decode);
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
