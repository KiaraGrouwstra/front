import { Array_clean, Array_flatten, Object_filter, RegExp_escape, handle_auth, popup, toast, setKV, getKV, Prom_do, Prom_finally, spawn_n, arr2obj, mapBoth, do_return, String_stripOuter, getPaths, id_cleanse, typed, fallback } from './js';
import {Observable} from 'rxjs/Observable';
Promise.prototype.do = Prom_do;
Promise.prototype.finally = Prom_finally;
// Array.prototype.last = Array_last;
// Array.prototype.has = Array_has;
Array.prototype.clean = Array_clean;
Array.prototype.flatten = Array_flatten;
String.prototype.stripOuter = String_stripOuter;

describe('js', () => {

  let fail = (e) => expect(e).toBeUndefined();
  let fn = (x) => {} //console.log(x)
  let do_prom = (done, prom, test) => prom.then(test, fail).then(done, done);
  // let prom_it = (desc, promise, test) => it(desc, (done) => promise.then(test, fail).then(done, done));  // beforeEach fails
  var prom;

  beforeEach(() => {
    prom = new Promise((res, rej) => res('prince'));
    // console.log('initialized promise', prom)
  })

  // it('Array.last gets the last item of an array', () => {
  //   expect(['a','b'].last()).toEqual('b')
  //   // expect([].last()).toEqual(undefined)
  // })

  // it('Array.has checks for containment', () => {
  //   expect([1,2,3].has(2)).toEqual(true)
  //   expect([1,2,3].has(4)).toEqual(false)
  // })

  it('Array.clean removes any null values from an array', () => {
    expect([1,null,2].clean()).toEqual([1,2])
    // expect([0,1,2].clean()).toEqual([0,1,2])
  })

  it('Array.flatten flattens a nested array (not recursive)', () => {
    expect([[1,2],[3,4]].flatten()).toEqual([1,2,3,4])
  })

  it('Object_filter allows filtering an object by values', () => {
    expect(Object_filter({a: 1, b: 2}, (v) => v > 1)).toEqual({b: 2})
  })

  it('RegExp_escape escapes regex characters with backslashes', () => {
    expect(RegExp_escape('a+b[]')).toEqual('a\\+b\\[\\]')
  })

  it('arr2obj maps an array to an object', () => {
    expect(arr2obj([1,2,3], x => 2 * x)).toEqual({ 1: 2, 2: 4, 3: 6 })
  })

  it('do_return returns its input (and calls a fn)', () => {
    expect(do_return(fn)('a')).toEqual('a')
  })

  it('the promise is a prince', (d) => do_prom(d,
    prom,
    (v) => expect(v).toEqual('prince')
  ))

  it('Promise.do returns its input (and calls a fn)', (d) => do_prom(d,
    prom.do(fn, fn),
    (v) => expect(v).toEqual('prince')
  ))

  it('Promise.finally does something for both happy/error paths (and returns itself)', (d) => do_prom(d,
    prom.finally(fn),
    (v) => expect(v).toEqual('prince')
  ))

  // it('Promise.toast_result makes a popup toast', (d) => do_prom(d,
  //   prom,
  //   (v) => expect(v).toEqual()
  // ))

  it('handle_auth extracts get/hash params and triggers a callback for ?callback=<name> urls', () => {
    let loc = { search: '?callback=test', hash: '#access_token=foo' }
    handle_auth(loc, (get, hash) => expect(hash.access_token).toEqual('foo'))
    handle_auth({ search: '', hash: '' }, () => {})
    handle_auth({ search: '?error=foo', hash: '' }, () => {})
  })

  // it('popup checks when a tab reaches a given url (left part)', (d) => do_prom(d,
  //   // popup gets blocked this way due to browser security...
  //   popup('https://baidu.com/', 'https://www.baidu.com/'),
  //   (v) => expect(v.href).toEqual(jasmine.stringMatching(new RegExp(RegExp_escape('https://www.baidu.com/'))))
  // ))

  it('toast creates popup toasts with a message', () => {
    toast.success('foo')
    expect($('.toast').length).toEqual(1)
  })

  it('getKV cannot load from non-existing keys', (d) => do_prom(d,
    getKV('doesnt_exist'),
    () => {} //(v) => expect(v).toEqual(null)
  ))

  it('setKV can save to keys', () => {
    setKV('foo', 'foo')
  })

  it('getKV can retrieve existing keys', (d) => do_prom(d,
    getKV('foo'),
    (v) => expect(v).toEqual('foo')
  ))

  // it('spawn_n', () => {
  //   // spawn_n(fn)
  //   // expect().toEqual(null)
  // })

  it('mapBoth does a _.mapValues showing keys as well', () => {
    expect(mapBoth({a: 1}, (v, k) => k)).toEqual({a: 'a'})
  })

  it('String.stripOuter strips outer html tags from a string', () => {
    expect('foo'.stripOuter()).toEqual('foo');
    expect('<p>foo</p>'.stripOuter()).toEqual('foo');
  })

  it('getPaths returns some info based on a json path (as an id-cleansed string array)', () => {
    expect(getPaths(['paths','/heroes/{id}/'].map(x => id_cleanse(x)))).toEqual({k: 'heroes-id', id: 'paths-heroes-id', model: 'paths?.heroes-id', variable: 'paths_heroes_id'});
  })

  it('id_cleanse strips strings to to make valid HTML element IDs (i.e. just alphanumeric characters and dashes)', () => {
    expect(id_cleanse('/heroes/{id}/')).toEqual('heroes-id');
  })

  describe('typed', () => {

    it('strLen', () => {
      let strLen = s => s.length;
      expect(strLen ('lol')).toEqual(3);
      expect(strLen (123)).toEqual(undefined);
      let strLen_ = typed([String], Number, strLen);
      expect(strLen_('lol')).toEqual(3);
      expect(strLen_(123)).toEqual(0);
    })

    it('arrObjNoop', () => {
      let arrObjNoop = (arr, obj) => {};
      expect(arrObjNoop ([], {})).toEqual(undefined);
      expect(arrObjNoop ('lol', 123)).toEqual(undefined);
      let arrObjNoop_ = typed([Array, Object], Array, arrObjNoop);
      expect(arrObjNoop_([], {})).toEqual(undefined);
      expect(arrObjNoop_('lol', 123)).toEqual([]);
    })

  })

  it('fallback', () => {
    let thrower = (v) => { throw new Error('boom'); };  //throw 'boom';
    // expect(thrower('hi')).toThrowError('boom');  // dunno why this fails :(
    let safe = fallback(123, thrower);
    expect(safe('hi')).toEqual(123);
  })

  // it('', () => {
  //   expect().toEqual();
  // })

})
