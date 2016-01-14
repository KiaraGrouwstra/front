import { get_submit } from './ui';
let _ = require('lodash');

describe('ui', () => {

  // let swagger = require('../swagger/swagger.json');
  let api_spec = require('../swagger/instagram.json');
  let fn_path = '/geographies/{geo-id}/media/recent';

  it('get_submit returns the form submit function for an API function', () => {
    let submit = get_submit(api_spec, fn_path, 'fake_token')
    expect(_.isFunction(submit)).toEqual(true)
  })

  // it('', () => {
  //   expect().toEqual()
  // })

})
