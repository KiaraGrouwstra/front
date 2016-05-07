let Phoenix = require('phoenix-js-derp');
import { Subject, BehaviorSubject } from 'rxjs';
// ^ this is an old version of BehaviorSubject, and should be replaced with the following, it it can pass:
// import { BehaviorSubject } from 'rxjs/subject/BehaviorSubject';
// using the old version can result in `n timer(s) still in the queue` errors!
import { Injectable } from '@angular/core';

// alt: [angular2-websocket](https://github.com/afrad/angular2-websocket)
// related: [angular2-rest](https://github.com/Paldom/angular2-rest)
@Injectable()
export class WsService {
  requests = {};
  id: number = 0;
  connected$ = new BehaviorSubject(false);
  ws: any;  //Phoenix.Socket
  chan: any;  //Phoenix.Channel
  out = new Subject();

  constructor(
    public url: string,
    public chan_name: string,
  ) {}

  connect() {
    let logger = (kind, msg, data) => {}; // console.log(`${kind}: ${msg}`, data)
    // this.ws = new Phoenix.Socket(this.url, {logger});
    let Socket = Phoenix.Socket;
    this.ws = new Socket(this.url, {logger});
    this.ws.connect({});
    this.ws.onOpen(() => this.connected$.next(true));
    this.ws.onClose(() => this.connected$.next(false));
    this.chan = this.ws.channel(this.chan_name, {user: 'tycho'});
    this.chan.join();
    this.chan.onClose(() => this.out.complete());
    this.chan.onError(e => this.out.error(e));
    this.chan.on('msg', e => this.out.next(e));
  }

  //url: string, pars: {}
  ask_many(url, pars = {}) {
    let id = this.id++;
    this.chan.push(url, {body: pars, id});
    return this.out
      .filter(y => y.id == id)
      .map(y => y.body);
  }
  // ^ the server doesn't currently send complete events. Rx operators definitely affected by this:
  // Last, SkipLast, TakeLast, To(Array/Map/Set), Sum, Reduce, Min, Max, Count, Concat, IgnoreElements
  // Average, SequenceEqual, DefaultIfEmpty, (Contains), All, (Using), (TimeInterval), Do
  // solution: use one of the below overrides which use pre-existing question-answer knowledge to complete.
  // (trying this server-sided would suck too due to having to guarantee order of client reception.)

  // request that completes after n responses
  ask(url, pars = {}, n = 1) {
    return this.ask_many(url, pars).take(n);
  }

  // alt: directly scrape pages from browser using Chrome startup flag `--disable-web-security` or by making this into an extension?

}
