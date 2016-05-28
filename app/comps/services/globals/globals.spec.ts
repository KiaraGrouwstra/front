import { it, fit, xit, expect, afterEach, beforeEach, fdescribe, xdescribe, } from '@angular/core/testing';
import { ReflectiveInjector } from '@angular/core';
import { GlobalsService } from './globals';
import { globalsServiceProvider } from './globals.provider';

describe('Globals', () => {
  let injector: ReflectiveInjector;
  let globals;

  beforeEach(() => {
    injector = ReflectiveInjector.resolveAndCreate([
      globalsServiceProvider,
    ]);
    globals = injector.get(GlobalsService);
  })

  // it('should test', () => {
  //   throw "works"
  // })

  it('should be able to create the service', () => {
    expect(globals).toBeDefined();
  });

  it('should expose stuff', () => {
    expect(globals._).toBeDefined();
    expect(globals.R).toBeDefined();
    expect(globals.Object).toBeDefined();
    expect(globals.Array).toBeDefined();
    expect(globals.JSON).toBeDefined();
    expect(globals.console).toBeDefined();
  })

})
