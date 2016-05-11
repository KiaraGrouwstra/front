let _ = require('lodash/fp');
import { ComponentFixture, NgMatchers, inject, injectAsync, beforeEachProviders, it, fit, xit, expect, afterEach, beforeEach, } from '@angular/core/testing';
import { TestComponentBuilder } from '@angular/compiler/testing';
import { fakeAsync, tick, flushMicrotasks } from '@angular/core/testing';
import { dispatchEvent } from '@angular/platform-browser/testing';
import { COMMON_DIRECTIVES } from '@angular/common';
import { test_comp, asyncTest, setInput, sendEvent, genClass } from '../test';
import { SetAttrs, DynamicAttrs, DynamicStyle, DynamicClass, AssignLocal } from './directives';
import { ng2comp, print } from './js';
import { Component, Input, forwardRef, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';

describe('directives', () => {
  let tcb;
  let test = (props, fn) => (done) => asyncTest(tcb, ng2comp)(props, fn)(done);

  beforeEach(inject([TestComponentBuilder], (builder) => {
    tcb = builder;
  }));

  let component = {
    selector: 'test-cmp',
    directives: [COMMON_DIRECTIVES, DynamicAttrs, SetAttrs, AssignLocal, DynamicStyle, DynamicClass],
    template: '',
  };

  class TestComponent {
    foo: string = 'bar';
    color: string = 'red';
    baz: string = 'color';
    condition: boolean = true;
    condExpr: string = 'condition';
    // items: any[];
    strExpr = 'foo';
    arrExpr: string[] = ['foo','bar','baz'];
    // objExpr = {'foo': true, 'bar': false};
    // setExpr: Set<string> = new Set<string>();
    constructor(
      public cdr: ChangeDetectorRef,
    ) {
      // this.setExpr.add('foo');
    }
  }

  let tmplt = (str) => ({ component: _.set('template', str)(component), class: TestComponent, parameters: [ChangeDetectorRef] });

  describe('SetAttrs', () => {

    it('sets properties', test(tmplt(`<div [setAttrs]="{ id: strExpr }"></div>`), ({ test_cmp: comp, debugEl, fixture }) => {
      let el = debugEl.nativeElement.firstElementChild;
      expect(el.id).toEqual('foo');
    }));

    // syntax the same as for properties, no `attr.` needed :)
    it('sets attributes', test(tmplt(`<div [setAttrs]="{ 'pattern': strExpr }"></div>`), ({ test_cmp: comp, debugEl, fixture }) => {
      let el = debugEl.nativeElement.firstElementChild;
      expect(el.attributes.getNamedItem('pattern').value).toEqual('foo');
    }));

  })

  describe('DynamicAttrs', () => {

    it('sets properties', test(tmplt(`<div [dynamicAttrs]="{ id: strExpr }"></div>`), ({ test_cmp: comp, debugEl, fixture }) => {
      let el = debugEl.nativeElement.firstElementChild;
      expect(el.id).toEqual('bar');
    }));

    it('sets attributes', test(tmplt(`<div [dynamicAttrs]="{ 'pattern': strExpr }"></div>`), ({ test_cmp: comp, debugEl, fixture }) => {
      let el = debugEl.nativeElement.firstElementChild;
      expect(el.attributes.getNamedItem('pattern').value).toEqual('bar');
    }));

  })

  describe('DynamicStyle', () => {

    it('sets styles', test(tmplt(`<div [dynamicStyle]="{ color: baz }"></div>`), ({ test_cmp: comp, debugEl, fixture }) => {
      let el = debugEl.nativeElement.firstElementChild;
      expect(el.style.color).toEqual('red');
    }));

  })

  describe('DynamicClass', () => {

    it('sets classes', test(tmplt(`<div [dynamicClass]="{ foo: condExpr }"></div>`), ({ test_cmp: comp, debugEl, fixture }) => {
      let el = debugEl.nativeElement.firstElementChild;
      expect(el.attributes.getNamedItem('class').value).toEqual('foo');
    }));

  })

  // // I don't think there is a `setElementDirective()`...
  // it('SetDirectives', test(tmplt(`<div [setAttrs]="{ ngClass: { strExpr: condition } }"></div>`), ({ test_cmp: comp, debugEl, fixture }) => {
  //   expect(el).toEqual('foo');
  // }));
  // it('DynamicDirectives', test(tmplt(`<div [dynamicAttrs]="{ ngClass: { strExpr: condition } }"></div>`), ({ test_cmp: comp, debugEl, fixture }) => {
  //   expect(el).toEqual('bar');
  // }));

  describe('AssignLocal', () => {

    it('should save a value and reuse it', test(
      tmplt(`<div
                [assignLocal]="{ hello: strExpr }"
                [id]="hello"
              >{{ hello }}</div>`),
      ({ test_cmp: comp, debugEl, fixture }) => {
        let el = debugEl.nativeElement.firstElementChild;
        expect(el).toHaveText('foo');
    }));

    xit('should work even in loops', test(
      tmplt(`<div
                *ngFor="let item of arrExpr; let idx = index"
                [assignLocal]="{ hello: item }"
                [id]="hello"
              >{{ idx }}: <!-- {{ item }} -->{{ hello }}</div>`),
      ({ test_cmp: comp, debugEl, fixture }) => {
        let el = debugEl.nativeElement.firstElementChild;
        console.log('TEST');
        print('comp', comp);
        print('el', el);
        print('fixture', fixture);
        print('comp.cdr', comp.cdr);
        print('comp.cdr._view', comp.cdr._view);
        print('fixture.elementRef', fixture.elementRef);
        print('fixture.componentRef', fixture.componentRef);
        print('fixture.componentRef._hostElement', fixture.componentRef._hostElement);
        print('comp.cdr._view.ref', comp.cdr._view.ref);
        print('comp.cdr._view.context', comp.cdr._view.context);
        print('comp.cdr._view._currentDebugContext', comp.cdr._view._currentDebugContext);
        print('comp.cdr._view._NgFor_0_6', comp.cdr._view._NgFor_0_6);
        print('comp.cdr._view._NgFor_0_6._ngForOf', comp.cdr._view._NgFor_0_6._ngForOf);
        expect(el).toHaveText('foobarbaz');
    }));

  });

  // it('', test({ component, class: TestComponent }, ({ test_cmp: comp, debugEl, fixture }) => {
  //   expect().toEqual();
  // }));

})
