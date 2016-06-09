// import { AbstractControl, ValidatorFn } from '@angular/common';
// import { Observable } from 'rxjs';


module Front {

  // global

  export type Schema = json_schema_org.draft_04.Schema;

  export type ApiSpec = swagger_io.v2.Schema; // SchemaJson

  export type Path = Array<string | number>;

  export interface IPathSchema {
    path: Path,
    schema: Schema,
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

  export interface IObjectSchema<T> {
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

  export interface IInput extends IPathSchema {
    ctrl: AbstractControl,
    named?: boolean,
  }

  // schema

  // function to merge a certain values of two schemas
  export type ValSchemaMergeFn = (vals: any[], schema: Schema[]) => Schema;

  // settings for generating schemas from example values
  export interface IGenSchemaSettings {
    verbose: boolean;
  }

  // output

  export interface ICompMeta { // extends IPathSchema
    id: string,
    path: Path,
    val: any,
    schema: Schema,
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

  export type CondFormat = { [key: string]: Front.IColor[] };

  // output/object

  type IObjectCollection = Array<{
    path: string[],
    val: any,
    schema: Schema,
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
  export type ObsInfo = { obs: Observable<any>, start?: string, next?: string, done?: string };
  export type Submitter = (v: any) => ObsInfo;
  export type Parselet = {[key: string]: { selector: string, type: string, attribute: string }};
  export type FetchForm = { urls: string, method: string, headers: {[key: string]: string}, body: string };
  export type ProcessForm = { processor: string, parselet: Parselet, transformer: string };

  // request
  export type ReqMeta = { urls: string[], headers: {}, method?: string, body?: string, parselet?: string, body?: string };

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
