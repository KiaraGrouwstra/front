import { getPaths } from './slim';
import { id_cleanse } from '../lib/js';

describe('slim', () => {

  // it('should test', () => {
  //   throw "works"
  // })

  it('getPaths returns some info based on a json path (as an id-cleansed string array)', () => {
    expect(getPaths(['paths','/heroes/{id}/'].map(x => id_cleanse(x)))).toEqual({k: 'heroes-id', id: 'paths-heroes-id', model: 'paths?.heroes-id', variable: 'paths_heroes_id'});
  })

})
