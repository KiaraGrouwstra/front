import { inject, addProviders } from '@angular/core/testing';
let _ = require('lodash/fp');
import { handleAuth, popup, toast, setKV, getKV, arr2obj, arr2map, mapBoth, idCleanse, typed, fallback, ng2comp, combine, findTables, keySchema, findIndexSet, editValsOriginal, editValsBoth, editValsLambda, evalExpr, cartesian, extractIterables, parameterizeStructure, encrypt, decrypt, toQuery, fromQuery } from './js';
import { getSchema } from './schema';
let map_iterator = require('map-iterator');

describe('js', () => {

  let fail = (e) => expect(e).toBeUndefined();
  let do_prom = (done, prom, test) => prom.then(test, fail).then(done, done);

  // beforeEach(() => {
  // })

  // it('should test', () => {
  //   throw "works"
  // })

  it('arr2obj maps an array to an object', () => {
    expect(arr2obj([1,2,3], y => y * 2)).toEqual({ 1: 2, 2: 4, 3: 6 });
  })

  it('arr2map maps an array to a Map', () => {
    expect(_.fromPairs(arr2map([1,2,3], y => y * 2).toJSON())).toEqual({ 1: 2, 2: 4, 3: 6 });
  })

  it('handleAuth extracts get/hash params and triggers a callback for ?callback=<name> urls', () => {
    let loc = { search: '?callback=test', hash: '#access_token=foo' };
    handleAuth(loc, (get, hash) => expect(hash.access_token).toEqual('foo'));
    handleAuth({ search: '', hash: '' }, () => {});
    handleAuth({ search: '?error=foo', hash: '' }, () => {});
  })

  // it('popup checks when a tab reaches a given url (left part)', (d) => do_prom(d,
  //   // popup gets blocked this way due to browser security...
  //   popup('https://baidu.com/', 'https://www.baidu.com/'),
  //   (v) => expect(v.href).toEqual(jasmine.stringMatching(new RegExp(RegExp_escape('https://www.baidu.com/'))))
  // ))

  it('toast creates popup toasts with a message', () => {
    toast.success('foo');
    expect($('.toast').length).toEqual(1);
    // expect(toast.success('foo').constructor).toEqual(Notification);
  })

  it('setKV can save to keys', () => {
    setKV('foo', 'foo');
  })

  it('getKV can retrieve existing keys', () => {
    expect(getKV('foo').getOrElse(false)).toEqual('foo');
  })

  it('getKV cannot load from non-existing keys', () => {
    expect(getKV('doesnt_exist').getOrElse(false)).toEqual(false);
  })

  it('mapBoth does a _.mapValues showing keys as well', () => {
    expect(mapBoth((v, k) => k)({a: 1})).toEqual({a: 'a'});
  })

  it('idCleanse strips strings to to make valid HTML element IDs (i.e. just alphanumeric characters and dashes)', () => {
    expect(idCleanse('/heroes/{id}/')).toEqual('heroes-id');
  })

  describe('typed', () => {

    it('strLen', () => {
      let strLen = s => s.length; //_.size;
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

  // it('ng2comp', () => {
  //   let cmp_cls = ng2comp({
  //     component: {
  //       selector: 'value',
  //     },
  //     decorators: {
  //       // array: ViewChild(ArrayComp),
  //     },
  //     parameters: [],
  //     class: class tmp {},
  //   });
  //   expect().toEqual();
  // })

  it('combine', () => {
    let cls = class tmp {
      get a() { return this._a; }
      get b() { return this._b; }
      set a(x) {
        this._a = x; this.combInputs();
      }
      set b(x) {
        this._b = x; this.combInputs();
      }
      combInputs = () => combine((a, b) => {
        this.c = a + b;
      })(this.a, this.b);
    }
    let obj = new cls();
    obj.a = 1;
    obj.b = 1;
    expect(obj.c).toEqual(2);
  })

  it('combine with optional undefined values', () => {
    let cls = class tmp {
      get a() { return this._a; }
      get b() { return this._b; }
      set a(x) {
        this._a = x; this.combInputs();
      }
      set b(x) {
        this._b = x; this.combInputs();
      }
      combInputs = () => combine((a, b) => {
        this.c = a + b;
      }, { b: true })(this.a, this.b);
    }
    let obj = new cls();
    obj.a = 1;
    expect(obj.c).toEqual(NaN);
  })

  describe('findTables', () => {

    it('finds all tables', () => {
      let data = { foo: [ { bar: 1 } ], baz: [ {} ] };
      let schema = getSchema(data);
      expect(findTables(schema)).toEqual([['foo'], ['baz']]);
    })

    it('returns empty if none', () => {
      let data = { foo: { bar: 1 } };
      let schema = getSchema(data);
      expect(findTables(schema)).toEqual([]);
    })

  })

  describe('keySchema', () => {
    it('does fixed', () => {
      expect(keySchema('a', { properties: { a: 1 } })).toEqual(1);
    })
    it('does patts', () => {
      expect(keySchema('c', { patternProperties: { '^c$': 3 } })).toEqual(3);
    })
    it('does additional', () => {
      expect(keySchema('z', { additionalProperties: 5 })).toEqual(5);
    })
  })

  it('findIndexSet', () => {
    expect(findIndexSet('b', new Set(['a','b','c']))).toEqual(1);
  })

  describe('editVals', () => {

    it('editValsOriginal', () => {
      expect(editValsOriginal({ a: y => y * 2, b: y => y * y, d: y => y ? y : 'nope' })({ a: 3, b: 5, c: 7 })).toEqual({ a: 6, b: 25, c: 7 });
    })

    it('editValsBoth', () => {
      expect(editValsBoth({ a: y => y * 2, b: y => y * y, d: y => y ? y : 'nope' })({ a: 3, b: 5, c: 7 })).toEqual({ a: 6, b: 25, c: 7, d: 'nope' });
    })

    it('editValsLambda', () => {
      expect(editValsLambda({ a: y => y * 2, b: y => y * y, d: y => y ? y : 'nope' })({ a: 3, b: 5, c: 7 })).toEqual({ a: 6, b: 25, d: 'nope' });
    })

  });

  it('evalExpr', () => {
    expect(evalExpr({ a: 1 })('a')).toEqual(1);
  })

  describe('polyable iteration', () => {

    it('extractIterables', () => {
      let v = { foo: () => [1], bar: [0, { baz: () => [2] }], hi: 'bye' };
      let res = [
        [['foo'], [1]],
        [['bar', 1, 'baz'], [2]],
      ];
      expect(extractIterables(v)).toEqual(res);
    })

    it('parameterizeStructure', () => {
      let v = { foo: () => [1], bar: [0, { baz: () => [2] }], hi: 'bye' };
      let coll = extractIterables(v);
      let out = { foo: 1, bar: [0, { baz: 2 }], hi: 'bye' };
      expect(parameterizeStructure(v, coll)(1, 2)).toEqual(out);
    })

    it('cartesian generator', () => {
      let cp = cartesian([0], [0, 10], [0, 100, 200]);
      expect(Array.from(cp)).toEqual([
        [0, 0, 0],
        [0, 0, 100],
        [0, 0, 200],
        [0, 10, 0],
        [0, 10, 100],
        [0, 10, 200],
      ]);
    })

    it('cartesian iteration', () => {
      let v = { foo: () => [1], bar: [0, { baz: () => [2] }], hi: 'bye' };
      let coll = extractIterables(v);
      let fn = parameterizeStructure(v, coll);
      let iterables = coll.map(([path, arr]) => arr);
      let cp = cartesian(...iterables);
      // let res = cp.map(pars => fn(...pars));
      let res = map_iterator(cp, pars => fn(...pars));
      let out = { foo: 1, bar: [0, { baz: 2 }], hi: 'bye' };
      expect(Array.from(res)).toEqual([out]);
    })

  })

  it('crypto cyphers', () => {
    let key = "i'm a key";
    let msg = 'TOP SECRET';
    let cipher = encrypt(msg, key);
    let plain = decrypt(cipher, key);
    expect(plain).toEqual(msg);
  })

  it('query conversion', () => {
    let obj = { foo: 'bar' };
    let query = toQuery(obj);
    expect(fromQuery(query)).toEqual(obj);
  })

  // it('', () => {
  //   expect().toEqual();
  // })

})
