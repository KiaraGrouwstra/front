import { method_form } from './input';
// let _ = require('lodash/fp');

describe('output', () => {

  // let swagger = require('../swagger/swagger.json');
  let api_spec = require('../swagger/instagram.json');
  let fn_path = '/geographies/{geo-id}/media/recent';

  it('method_form gets the form template for a given API function', () => {
    let { html: html, obj: obj } = method_form(api_spec, fn_path);
    expect(html).toEqual(jasmine.stringMatching(/<input/))
    expect(obj.uri_scheme.val._value).toEqual('https')  //Control
  })

  // it('', () => {
  //   expect().toEqual()
  // })

})
