let _ = require('lodash/fp');
import { ComponentFixture, NgMatchers, inject, injectAsync, beforeEachProviders, it, fit, xit, expect, afterEach, beforeEach, } from '@angular/core/testing';
import { TestComponentBuilder } from '@angular/compiler/testing';
import { dispatchEvent, fakeAsync, tick, flushMicrotasks } from '@angular/core/testing';
import { COMMON_DIRECTIVES } from '@angular/common';
import { test_comp, asyncTest, setInput, sendEvent, genClass } from '../test';
import { SetDynamic, SetAttrs, AssignLocal } from './directives';
import { ng2comp } from './js';

describe('directives', () => {
  let tcb;
  let test = (props, fn) => (done) => asyncTest(tcb, ng2comp)(props, fn)(done);

  beforeEach(inject([TestComponentBuilder], (builder) => {
    tcb = builder;
  }));

  let component = {
    selector: 'test-cmp',
    directives: [COMMON_DIRECTIVES, SetDynamic, SetAttrs, AssignLocal],
    template: '',
  };

  class TestComponent {
    foo: number = 'bar';
    color: string = 'red';
    baz: string = 'color';
    condition: boolean = true;
    // items: any[];
    strExpr = 'foo';
    // arrExpr: string[] = ['foo'];
    // objExpr = {'foo': true, 'bar': false};
    // setExpr: Set<string> = new Set<string>();
    // constructor() { this.setExpr.add('foo'); }
  }

  let tmplt = (str) => ({ component: _.set('template', str)(component), class: TestComponent });

  // it('control group directive:set', test(tmplt(`<div [ngClass]="{ foo: true }"></div>`), ({ comp, debugEl: el, fixture }) => {
  //   expect(el.nativeElement).toEqual('foo');
  // }));

  it('AssignLocal', test(tmplt(`<div [assignLocal]="{ hello: strExpr }" [id]="hello">{{ hello }}</div>`), ({ comp, debugEl: el, fixture }) => {
    expect(el).toHaveText('foo');
    // Object.keys()
    // JSON.stringify()
    // expect(el.nativeElement).toEqual('foo');
  }));

  describe('SetAttrs', () => {

    // // uh, ngStyle already allows setting multiple of these
    // it('sets styles', test(tmplt(`<div [setAttrs]="{ 'style.color': color }"></div>`), ({ comp, debugEl: el, fixture }) => {
    //   expect(el).toEqual('red');
    //   // .style
    // }));

    // // uh, ngClass already allows setting multiple of these
    // it('sets classes', test(tmplt(`<div [setAttrs]="{ class: strExpr }"></div>`), ({ comp, debugEl: el, fixture }) => {
    //   expect(el).toEqual('foo');
    //   // .class
    // }));

    it('sets properties', test(tmplt(`<div [setAttrs]="{ id: strExpr }"></div>`), ({ comp, debugEl: el, fixture }) => {
      console.log('fixture.elementRef', fixture.elementRef.constructor.name, fixture.elementRef, Object.keys(fixture.elementRef));
      console.log('el.nativeElement', el.nativeElement.constructor.name, el.nativeElement, Object.keys(el.nativeElement), el.nativeElement.id);
      expect(el.nativeElement.id).toEqual('foo'); // .properties
    }));

    // syntax the same as for properties, no `attr.` needed :)
    it('sets attributes', test(tmplt(`<div [setAttrs]="{ 'pattern': strExpr }"></div>`), ({ comp, debugEl: el, fixture }) => {
      expect(el.nativeElement.attributes.pattern).toEqual('foo');
    }));

    // // uh, should be split off anyway, but I don't think there is a `setElementDirective()`...
    // it('sets directives', test(tmplt(`<div [setAttrs]="{ ngClass: { strExpr: condition } }"></div>`), ({ comp, debugEl: el, fixture }) => {
    //   expect(el).toEqual('foo');
    //   // .class
    // }));

  })

  xdescribe('SetDynamic', () => {

    // // better if I could split this off, or dynamically bind to ngStyle...
    // it('sets styles', test(tmplt(`<div [setDynamic]="{ 'style.color': baz }"></div>`), ({ comp, debugEl: el, fixture }) => {
    //   expect(
    //     // Object.keys(el)
    //     el.nativeElement
    //     // JSON.stringify(
    //       // el.properties
    //       // el.attributes
    //     // )
    //   ).toEqual('red');
    //   // .style
    // }));

    // // clunky syntax, and better if I could split this off, or dynamically bind to ngClass...
    // it('sets classes', test(tmplt(`<div [setDynamic]="{ class: strExpr }"></div>`), ({ comp, debugEl: el, fixture }) => {
    //   expect(el).toEqual('bar');
    //   // .class
    // }));

    it('sets properties', test(tmplt(`<div [setDynamic]="{ id: strExpr }"></div>`), ({ comp, debugEl: el, fixture }) => {
      expect(el).toEqual('bar');
      // .id
    }));

    it('sets attributes', test(tmplt(`<div [setDynamic]="{ 'pattern': strExpr }"></div>`), ({ comp, debugEl: el, fixture }) => {
      expect(el).toEqual('bar');
      // .pattern
    }));

    // should be split off anyway, cuz I can't introspect available directives, but I don't think there is a `setElementDirective()`...
    // it('sets directives', test(tmplt(`<div [setDynamic]="{ ngClass: { strExpr: condition } }"></div>`), ({ comp, debugEl: el, fixture }) => {
    //   expect(el).toEqual('bar');
    //   // .class
    // }));

  })

  // it('', test({ component, class: TestComponent }, ({ comp, debugEl: el, fixture }) => {
  //   expect().toEqual();
  // }));

})
