import { inject, injectAsync, expect, it, fit, xit, describe, xdescribe, fdescribe, beforeEach, beforeEachProviders, afterEach } from '@angular/core/testing';
let _ = require('lodash/fp');
import { parse } from './parsing';

let url = 'https://www.baidu.com/';
let html = `<html><head><title>hi</title></head><body><p class="text">foo</p></body></html>`;
// let parselet = `{"header":"title"}`;
let simple = `{ "header": "title" }`;
let parselet = `{ "header": "title", "p": "p" }`;
let will_throw = `{ "header": "title", "p": "p", "img": "not_there" }`;
let optional = `{ "header": "title", "p": "p", "img?": "not_there"}`;
let table_global = `{ "words": [ { "p": "p" } ] }`;
let table = `{ "words(body)": [ { "p": "p" } ] }`;
let table_optional = `{ "words(body)": [ { "p": "p", "img?": ".not_there" } ] }`;
let table_empty = `{ "words(body)": [ { "pic?": "img" } ] }`;
let html_sel = `<html><body><table><td>foo</td><tr><td>bar</td><td>baz</td></tr><tr><td>cow</td></tr><tr></tr></table></body></html>`;
let json_sel = `{ "words(tr)": [ { "item?": "td" } ] }`;
let outer = `{ "header": "title@@" }`;
let inner = `{ "header": "head@" }`;
let attr = `{ "attr": "p@class" }`;
// let tb_items = `{ "items(.item)": [ { "price?": ".price", "bought?": ".deal-cnt", "desc?": ".J_ClickStat" } ] }`;
let tb_items = `{ "items(.item)": [ { "price": ".price" } ] }`;

describe('parsing', () => {

  // beforeEach(() => {
  // })

  // xit('parse - css-select', () => {
  //   let html = `<div id='foo'><a href='#'>Link</a><span></span></div>`;
  //   let doc = new DOMParser().parseFromString(html, 'text/xml');
  //   let select = require('css-select');
  //   let out = select('a', doc);
  //   expect(out.length).toEqual(1);
  // })

  it('parse - simple', () => {
    let out = parse(simple)(html);
    expect(out).toEqual({ header: 'hi' });
  })

  it('parse - failure', () => {
    expect(() => parse(will_throw)(html)).toThrowErrorWith(`floki selector`); //SelectorError
  })

  it('parse - optional', () => {
    let out = parse(optional)(html);
    expect(out).toEqual({ header: 'hi', p: 'foo' });
  })

  it('parse - table', () => {
    let out = parse(table)(html);
    expect(out).toEqual({ words: [ { p: 'foo' } ] });
  })

  it('parse - table (array not pinned to body)', () => {
    let out = parse(table_global)(html);
    expect(out).toEqual({ words: [ { p: 'foo' } ] });
  })

  it('parse - table with optional entry', () => {
    let out = parse(table_optional)(html);
    expect(out).toEqual({ words: [ { p: 'foo' } ] });
  })

  it('parse - table with empty entry', () => {
    let out = parse(table_empty)(html);
    expect(out).toEqual({ words: [ {} ] });
  })

  it('parse - complex', () => {
    let out = parse(json_sel)(html_sel);
    expect(out).toEqual({ words: [ { item: 'bar' }, { item: 'cow' }, {} ] });
  })

  it('parse - outer', () => {
    let out = parse(outer)(html);
    expect(out).toEqual({ header: '<title>hi</title>' });
  })

  it('parse - inner', () => {
    let out = parse(inner)(html);
    expect(out).toEqual({ header: '<title>hi</title>' });
  })

  it('parse - attr', () => {
    let out = parse(attr)(html);
    expect(out).toEqual({ attr: 'text' });
  })

  // it('', () => {
  //   expect().toEqual();
  // })

})
