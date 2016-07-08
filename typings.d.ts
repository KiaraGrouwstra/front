// import { AbstractControl, ValidatorFn } from '@angular/forms';
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

  export interface Auth {
    name: string,
    token: string,
    scopes_have: string[],
    expires_at: number,
  }

  export interface Hash {
    access_token?: string, // actual token needed to make requests, flow: implicit
    token_type?: string, // Bearer
    expires_in?: string<number>, // optional validity in seconds, e.g. 3600
    code?: string, // code to be exchange for an access token, flow: accessCode
    state: string,  // encrypted meta
  }

  export interface TokenResponse {
    access_token: string,
    token_type: string,
    expires_in?: string<number>, // also in?
    scope: string,  // space-delimited, indicates scopes granted (cf. requested)
  }

  export type FnPath = Array<endpoint: string, method: string>;

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

  export type CondFormat = { [col: string]: Front.IColor[] };

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

  // fn_ui
  Methods = string[];
  MethodsT<T> = {
    get: T,
    put: T,
    post: T,
    delete: T,
    options: T,
    head: T,
    patch: T,
  };
  Endpoints = {[key: string]: Methods};
  EndpointsT<T> = {[key: string]: MethodsT<T>};

  // request
  export type ReqMeta = { urls: string[], headers: {}, method?: string, body?: string, parselet?: string };

  // config
  export interface Config {
    endpoint: string,
    chan_name: string,
    cipher_key: string,
    credentials: {[api_name: string]: {
      client_id: string,
      client_secret: string,
    }},
    app_url: string,
  }

  // decorators
  type PropertyDescriptor = {
    configurable: boolean,
    enumerable: boolean,
    writable: boolean,
    value: any
  };

}
