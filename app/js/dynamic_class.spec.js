import { gen_comp, form_comp } from './dynamic_class';
import { ChangeDetectorRef } from 'angular2/core';
import { FormBuilder, Control, Validators } from 'angular2/common';

describe('dynamic classes', () => {

it('can make classes', () => {
  let cls = gen_comp({a: 1});
  let comp = new cls(ChangeDetectorRef);
  expect(comp.a).toEqual(1);
})

//it('should run oninit', () => {
//
//})

it('can make form components', () => {
  let cls = form_comp({ params: { b: { val: new Control('default', Validators.required) } } });
  let comp = new cls(ChangeDetectorRef, new FormBuilder);
  //console.log(comp.form);
  expect(comp.form.controls.b.value).toEqual('default');
})

})
