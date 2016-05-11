// import { AbstractControl, ValidatorFn } from '@angular/common';
// import { Observable } from 'rxjs';


module Front {

  // global

  // export type Spec = Object | any[];
  // export type Spec = swagger_io.v2.SchemaJson;
  export type Spec = swagger_io.v2.Schema;

  export type Path = string[];

  export interface IPathSpec {
    path: Path,
    spec: Spec,
  }

  // input

  export type CtrlFactory = () => AbstractControl;

  // export type IValResult = {[key: string]: boolean};

  // export type ValidatorFn = (c: AbstractControl) => IValResult;

  export interface IStringAttributes {
    maxlength?: number,
    minlength?: number,
    pattern?: string,
    title?: string,
    'data-tooltip'?: string,
    autocomplete?: string,
  }

  export interface INumberAttributes {
    max?: number,
    min?: number,
    step?: number,
  }

  export interface IAttributes extends IStringAttributes, INumberAttributes {
    id: string,
    required: boolean,
    suggestions?: string[],
  }

  export interface IVldtrDef {
    val: any,
    vldtr: ValidatorFn,
  }

  export interface IObjectSpec<T> {
    properties: {[key: string]: T},
    patternProperties: {[key: string]: T},
    additionalProperties: T,
  }

  // test

  export interface ICompTest {
    comp: Component,
    el: any,  //nativeelement
    fixture: ComponentFixture,
    debugEl: DebugElement,
    test_cmp: Component,
  }

  // input/form

  export interface IInput extends IPathSpec {
    ctrl: AbstractControl,
    named?: boolean,
  }

  // schema

  // function to merge a certain values of two schemas
  export type ValSpecMergeFn = (vals: any[], spec: Spec[]) => Spec;

  // settings for generating schemas from example values
  export interface IGenSchemaSettings {
    verbose: boolean;
  }

  // output

  export interface ICompMeta { // extends IPathSpec
    id: string,
    path: Path,
    val: any,
    schema: Spec,
  }

  // output/table

  export type Rows = Array<{
    id: string,
    cells: {
      path: string[],
      val: any,
    }
  }>;

  export interface IColor {
    r: number,
    g: number,
    b: number,
    a?: number,
  }

  // output/object

  type IObjectCollection = Array<{
    path: string[],
    val: any,
    schema: Front.Spec,
    type: string,
  }>; 

  // js

  // a function mapping objects to objects using an object of transformation functions
  export type ObjectMapper = (mapping: {[key: string]: (v: any) => any}) => ({}) => {};

  export interface ILogLevels<T> {
    debug: T,
    info: T,
    success: T,
    warn: T,
    error: T,
  }

  // app
  export type Data = any;

  // ui
  export type Submitter = (v: any) => { obs: Observable, start?: string, next?: string, done?: string };

  // config
  export interface Config {
    endpoint: string,
    chan_name: string,
  }

  // decorators
  type PropertyDescriptor = {
    configurable: boolean,
    enumerable: boolean,
    writable: boolean,
    value: any
  };

}
