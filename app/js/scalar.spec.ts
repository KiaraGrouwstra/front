// https://angular.io/docs/ts/latest/api/testing/
import { TestComponentBuilder, ComponentFixture, NgMatchers, inject, injectAsync, beforeEachProviders, it, expect, afterEach, beforeEach, } from "angular2/testing";
import { ScalarTest } from './scalar_test';
// import { ChangeDetectorRef } from 'angular2/core';

 describe('after import', () => {
   it('needs testing', () => {
     expect(1).toEqual(0);
   })
 });

describe('Scalar', () => {

  //beforeEach(inject([Dependency], (dep) => {
  //  // code using `dep`
  //}));

  it('should work', injectAsync([TestComponentBuilder], //, ChangeDetectorRef  //No provider for ChangeDetectorRef!
      (tcb) => new Promise((pass, fail) => {
    // let tc = await tcb.createAsync(ScalarTest);
    return tcb.createAsync(ScalarTest)
    .then((tc) => {
      console.log('tc', tc);
      tc.detectChanges();
      console.log('DETECTED CHANGES');
      let test_comp = tc.componentInstance;
      console.log('test_comp', test_comp);
      let scalar_comp = test_comp.comp;
      console.log('scalar_comp', scalar_comp);
      //(<number[]>test_comp.items).push(3);
      // tc.detectChanges();
      // https://angular.io/docs/ts/latest/api/testing/ComponentFixture-class.html
      // https://angular.io/docs/ts/latest/api/testing/NgMatchers-interface.html
      console.log('html', scalar_comp.html);
      scalar_comp.html.subscribe(html => {
        expect(html).toEqual('<em>bar</em>');
        pass();
      })
    })
  })
  ));

});
