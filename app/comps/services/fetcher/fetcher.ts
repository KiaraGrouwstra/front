import { Subject, Observable } from 'rxjs'; //, BehaviorSubject
import { Injectable } from '@angular/core';

// no-cors fetch Subject: directly scrape pages from browser using Chrome startup flag `--disable-web-security` or by making this into an extension
@Injectable()
export class FetcherService {
  // add default init?

  // fetch URL content (and optionally Parsley parse)
  addUrls(pars: Front.ReqMeta): Observable<any> { // reqs: Request[]
    let init = {
      headers: new Headers(pars.headers || {}),
      method: pars.verb || 'GET',
      body: pars.body,
    }
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
      let resp = await this.ask(new Request(url, { headers: new Headers(hdrs) })).toPromise();
      let v = { status: resp.status, length: resp.body.length };
      return [k, v];
    })
    // merge back
    .scan(setter, {});
  }

  // ReqMeta = { urls: string[], headers: {}, verb?: string, body?: string, parselet?: string }
  // Request init: { method = 'GET', headers = new Headers({}), body, mode, credentials, cache, redirect = follow ? 'follow' : 'manual', referrer, integrity }
  // https://developer.mozilla.org/en-US/docs/Web/API/GlobalFetch/fetch
  ask(reqs: Request[]): Observable {
    return Observable.from(reqs)
      // .debounce(500) //, scheduler
      .debounce(x => Observable.timer(500))
      .flatMap(fetchRequest)
      .flatMap(decode);
  }

}

function fetchRequest(req: Request): Response {
  console.log('fetching:', req.url);
  return fetch(req).catch(e => {
    console.log('catch:', e);
    if (e instanceof TypeError && e.message == 'Failed to fetch') {
      return fetchRequest(req: Request);
    } else {
      throw e;
    }
  });
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
    return /charset=(.*)/.exec(resp.headers.get('content-type'))[1];
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
