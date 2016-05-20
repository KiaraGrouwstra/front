import { inject, injectAsync, expect, it, fit, xit, describe, xdescribe, fdescribe, beforeEach, beforeEachProviders, afterEach } from '@angular/core/testing';
import { ExtComp } from './annotations';
import { Component, Input, ChangeDetectionStrategy, InputMetadata } from '@angular/core';
import { COMMON_DIRECTIVES, FORM_DIRECTIVES } from '@angular/common';

const Push = ChangeDetectionStrategy.OnPush;

@Component({
  changeDetection: Push,
  directives: [1],
})
class XComp {
  n: number = 1;
  @Input() inp: string;
}

@ExtComp({
  directives: [2],
})
class AComp extends XComp {}

@ExtComp({
  directives: [3],
})
class BComp extends AComp {}

let comp_meta = (cls: ComponentClass) => Reflect.getMetadata('annotations', cls)[0];

let meta_x = comp_meta(XComp);
let meta_a = comp_meta(AComp);
let meta_b = comp_meta(BComp);

let comp_x = new XComp;
let comp_a = new AComp;
let comp_b = new BComp;

describe('extends', () => {

  it('should inherit properties', () => {
    expect(comp_x.n).toEqual(1);
    expect(comp_a.n).toEqual(1);
    expect(comp_b.n).toEqual(1);
  })

  it('should inherit `@Input`s', () => {
    expect(Reflect.getMetadata('propMetadata', XComp)['inp'][0].constructor).toEqual(InputMetadata);
    expect(Reflect.getMetadata('propMetadata', AComp)['inp'][0].constructor).toEqual(InputMetadata);
    expect(Reflect.getMetadata('propMetadata', BComp)['inp'][0].constructor).toEqual(InputMetadata);
  })

})

describe('ExtComp', () => {

  it('should inherit values annotations', () => {
    expect(meta_x.changeDetection).toEqual(Push);
    expect(meta_a.changeDetection).toEqual(Push);
    expect(meta_b.changeDetection).toEqual(Push);
  })

  it('should allow extending arrays', () => {
    expect(meta_x.directives).toEqual([1]);
    expect(meta_a.directives).toEqual([1,2]);
    expect(meta_b.directives).toEqual([1,2,3]);
  })

})
