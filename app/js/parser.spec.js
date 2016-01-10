import { parseVal, getPaths, method_form, get_submit, Templates } from './parser';
let _ = require('lodash');

describe('parser', () => {

  let swagger = require('../swagger/swagger.json');
  let api_spec = require('../swagger/instagram.json');
  let fn_path = '/geographies/{geo-id}/media/recent';

  it('parseVal turns JSON plus its spec into html', () => {
    let html = parseVal([], api_spec, swagger)
    expect(html).toEqual(jasmine.stringMatching(/instagram/))
  })

  it('method_form gets the form template for a given API function', () => {
    let { html: html, obj: obj } = method_form(api_spec, fn_path);
    expect(html).toEqual(jasmine.stringMatching(/<input/))
    expect(obj.uri_scheme.val._value).toEqual('https')  //Control
  })

  it('get_submit returns the form submit function for an API function', () => {
    let submit = get_submit(api_spec, fn_path, 'fake_token')
    expect(_.isFunction(submit)).toEqual(true)
  })

  // it('', () => {
  //   expect().toEqual()
  // })

})
