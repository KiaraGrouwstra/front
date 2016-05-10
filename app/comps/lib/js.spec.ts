let _ = require('lodash/fp');
import { handle_auth, popup, toast, setKV, getKV, arr2obj, arr2map, mapBoth, id_cleanse, typed, fallback, ng2comp, combine, findTables, key_spec, findIndexSet, editValsOriginal, editValsBoth, editValsLambda, evalExpr } from './js';
import { getSchema } from './schema';

describe('js', () => {

  let fail = (e) => expect(e).toBeUndefined();
  let do_prom = (done, prom, test) => prom.then(test, fail).then(done, done);

  // beforeEach(() => {
  // })

  // it('should test', () => {
  //   throw "works"
  // })

  it('arr2obj maps an array to an object', () => {
    expect(arr2obj([1,2,3], y => y * 2)).toEqual({ 1: 2, 2: 4, 3: 6 })
  })

  it('arr2map maps an array to a Map', () => {
    expect(_.fromPairs(arr2map([1,2,3], y => y * 2).toJSON())).toEqual({ 1: 2, 2: 4, 3: 6 })
  })

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

  it('mapBoth does a _.mapValues showing keys as well', () => {
    expect(mapBoth({a: 1}, (v, k) => k)).toEqual({a: 'a'})
  })

  it('id_cleanse strips strings to to make valid HTML element IDs (i.e. just alphanumeric characters and dashes)', () => {
    expect(id_cleanse('/heroes/{id}/')).toEqual('heroes-id');
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

  it('findTables', () => {
    let data = { foo: [ { bar: 1 } ] };
    let spec = getSchema(data);
    expect(findTables(spec)).toEqual([['foo']]);
  })

  describe('key_spec', () => {
    it('does fixed', () => {
      expect(key_spec('a', { properties: { a: 1 } })).toEqual(1);
    })
    it('does patts', () => {
      expect(key_spec('c', { patternProperties: { '^c$': 3 } })).toEqual(3);
    })
    it('does additional', () => {
      expect(key_spec('z', { additionalProperties: 5 })).toEqual(5);
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

  // it('', () => {
  //   expect().toEqual();
  // })

})
