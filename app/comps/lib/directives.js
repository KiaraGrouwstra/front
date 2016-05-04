import { Directive, Renderer, ElementRef, ViewContainerRef, EmbeddedViewRef, ViewRef, TemplateRef } from '@angular/core'; //, Input
import { DomElementSchemaRegistry } from '@angular/compiler';
import { evalExpr } from './js';

// [HTML attribute vs. DOM property](https://angular.io/docs/ts/latest/guide/template-syntax.html#!#html-attribute-vs-dom-property)
// [HTML attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes)
// [properties / IDL attributes](https://www.w3.org/TR/DOM-Level-2-HTML/idl-definitions.html)
// PropertyBindingType: Property, Attribute, Class, Style -- https://github.com/angular/angular/blob/master/modules/angular2/src/compiler/template_ast.ts
// [prefix definitions](https://github.com/angular/angular/blob/master/modules/angular2/src/compiler/template_parser.ts)
// each calls a respective `setElement*` -- https://github.com/angular/angular/blob/master/modules/angular2/src/compiler/view_compiler/property_binder.ts
const setMethod = {
  property: 'setElementProperty',
  attribute: 'setElementAttribute',
  class: 'setElementClass',
  style: 'setElementStyle',
  // directive: 'setElementDirective',  // <-- nope, doesn't exist :(
  // ^ compiled components instantiate directives (names numbered!), then in
  // `detectChangesInternal` feeds the expression results into their inputs,
  // and finally saves the result to detect changes on the next check.
};
// https://github.com/angular/angular/blob/master/modules/%40angular/platform-browser/src/web_workers/worker/renderer.ts
// setText, invokeElementMethod, listen, listenGlobal
// this.el.style.backgroundColor = color;

// set multiple properties/attributes from an object without knowing which is which.
// TODO: use `Differ`s to improve performance; see [NgClass](https://github.com/angular/angular/blob/master/modules/%40angular/common/src/directives/ng_class.ts)
// named after attributes rather than properties so my json-schema could go with
// that without causing confusing with its existing `properties` attribute.
@Directive({
  selector: '[setAttrs]',
  inputs: [
    'attributes: setAttrs',
  ],
})
export class SetAttrs {
  // private el: HTMLElement;
  // @Input('setAttrs') attributes; // Object of any
  constructor(el: ElementRef, viewContainer: ViewContainerRef, renderer: Renderer, schemaRegistry: DomElementSchemaRegistry) {
    // console.log('setAttrs:ctor');
    this.el = el;
    this.viewContainer = viewContainer;
    this.renderer = renderer;
    this.schemaRegistry = schemaRegistry;
    // console.log('schemaRegistry', schemaRegistry);
  }
  set attributes(obj) {
    // console.log('setAttrs', obj);
    // console.log('this.el', this.el);
    // console.log('obj', obj);
    // console.log('this.el', this.el, Object.keys(this.el));
    // console.log('this.el.nativeElement', this.el.nativeElement, Object.keys(this.el.nativeElement));
    // let elName = this.el.parentElement.tagName;
    let elName = this.el.nativeElement.tagName;
    // console.log('elName', elName);
    _.each((v, k) => {
      // console.log(k, v);
      let hasIt = this.schemaRegistry.hasProperty(elName, k);
      // console.log('hasIt', hasIt);
      let method = setMethod[hasIt ? 'property' : 'attribute'];
      // console.log('method', method);
      // console.log('this.el', this.el);
      this.renderer[method](this.el, k, v);
      console.log('this.el', this.el);
    })(obj);
  }
}
SetAttrs.parameters = [
  [ElementRef],
  [ViewContainerRef],
  [Renderer],
  [DomElementSchemaRegistry],
];

// dynamically bind things: properties, attributes //, styles, classes, directives
// intended as a `[[prop]]="evalStr"`, if now `[setDynamic]="{ prop: evalStr }"`
// hint toward original: `bindAndWriteToRenderer` @ `compiler/view_compiler/property_binder.ts`.
// alternative: `[prop]="eval(evalStr)"` for `eval = evalExpr(this)` on class.
// ^ try that for directives! but can't dynamically bind to different things like this.
// challenge: even if I extract rules from JSON, how do I generate these bindings?...
// unless I could dynamically bind to directives, that was the problem, so use this.
// TODO: use `Differ`s to improve performance; more challenging cuz double...
@Directive({
  selector: '[setDynamic]',
  inputs: [
    'attributes: setDynamic',
  ],
})
export class SetDynamic {
  // @Input('setDynamic') attributes; // Object of any
  constructor(el: ElementRef, viewContainer: ViewContainerRef, renderer: Renderer, schemaRegistry: DomElementSchemaRegistry) {
    this.el = el.nativeElement;
    this.viewContainer = viewContainer;
    this.renderer = renderer;
    this.schemaRegistry = schemaRegistry;
  }
  set attributes(obj) {
    _.each((evalStr, k) => {
      // console.log(`setting ${k} to ${evalStr}.`);
      let context = this.viewContainerRef._element.parentView.context;
      let v = evalExpr(context)(evalStr);
      let hasIt = this.schemaRegistry.hasProperty(elName, k);
      let method = setMethod[hasIt ? 'property' : 'attribute'];
      this.renderer[method](this.el, k, v);
      // what of style, class, directive?
    })(obj);
  }
}
SetDynamic.parameters = [
  [ElementRef],
  [ViewContainerRef],
  [Renderer],
  [DomElementSchemaRegistry],
];

// set local template variables from an object.
// see https://github.com/angular/angular/issues/2451
// not working yet, but must refactor `setLocal` to `createEmbeddedView` after this lands anyway!
// https://github.com/angular/angular/commit/cacdead96dcfbb80dff899b5f5143b7c28c4d6dd
@Directive({
  selector: '[assignLocal]',
  inputs: [
    'localVariable: assignLocal',
  ],
})
export class AssignLocal {
  // private el: HTMLElement;
  // @Input('assignLocal') localVariable; // Object of any
  constructor(elementRef: ElementRef, viewContainer: ViewContainerRef, renderer: Renderer) {
    // console.log('assignLocal:ctor');
    // , embeddedViewRef: EmbeddedViewRef, viewRef: ViewRef
    this.elementRef = elementRef;
    this.el = elementRef.nativeElement;
    this.viewContainer = viewContainer;
    this.renderer = renderer;
    // viewContainer: temp1._element.parentView.detectChangesInternal  // <-- internal
    // this.templateRef = templateRef;
    // this.embeddedViewRef = EmbeddedViewRef;
    // this.viewRef = viewRef;
  }
  set localVariable(obj) {
    // console.log('assignLocal', obj);
    // console.log('set:this.el', this.el);
    // console.log('obj', obj);
    _.each((v, k) => {
      // console.log(v, k);
      // this.view.internalView.setLocal(k, v);
      // console.log('this.viewContainer._element.parentView', this.viewContainer._element.parentView);
      // console.log('this.el', this.el);
      // this.viewContainer._element.parentView.setLocal(k, v);
      console.log('this.viewContainer', this.viewContainer.constructor.name, Object.keys(this.viewContainer), this.viewContainer);
      console.log('this.viewContainer._element', this.viewContainer._element.constructor.name, Object.keys(this.viewContainer._element), this.viewContainer._element);
      // console.log('this.viewContainer._element.parentView', this.viewContainer._element.parentView.constructor.name, Object.keys(this.viewContainer._element.parentView));
      console.log('this.viewContainer._element.parentView.locals', this.viewContainer._element.parentView.locals);
      // console.log('this.viewContainer._element.parentView.references', this.viewContainer._element.parentView.references);
      // console.log('this.viewContainer._element.parentView.context', this.viewContainer._element.parentView.context);
      // this.viewContainer._element.parentView.context[k] = v;
      this.viewContainer._element.parentView.locals[k] = v;
      // console.log('this.viewContainer._element.parentView.context', this.viewContainer._element.parentView.context);
      console.log('this.viewContainer._element.parentView.locals', this.viewContainer._element.parentView.locals);
      // this.el
      // this.view = this.viewContainer.create(this.EmbeddedViewRef);
      // this.view.internalView.setLocal('$implicit', exp);
    })(obj);
    // this.viewContainer.createEmbeddedView(this.templateRef, exp); // what `this.templateRef`?
    // ^ wait, does this really give me my local variables in the old view?
  }
}
AssignLocal.parameters = [
  [ElementRef],
  [ViewContainerRef],
  // [EmbeddedViewRef],
  // [ViewRef],
];

// // see https://github.com/angular/angular/issues/2451
// // can't get this to work
// @Directive({
//   selector: '[assignLocal]',
//   properties: ['localVariable: assignLocalTo'],
// })
// export class LocalVariable {
//   viewContainer: ViewContainerRef;
//   EmbeddedViewRef: EmbeddedViewRef;
//   view: any;
//
//   constructor(viewContainer: ViewContainerRef, EmbeddedViewRef: EmbeddedViewRef) {
//     this.viewContainer = viewContainer;
//     this.EmbeddedViewRef = EmbeddedViewRef;
//   }
//
//   set localVariable(exp) {
//     if (!this.viewContainer.length) {
//       this.view = this.viewContainer.create(this.EmbeddedViewRef);
//     }
//     this.view.setLocal(assignLocalTo || '$implicit', exp);
//   }
// }
// LocalVariable.parameters = [
//   [ViewContainerRef],
//   [EmbeddedViewRef],
// ];

// binding to [multiple events](https://github.com/angular/angular/issues/6675)
// https://developer.mozilla.org/en-US/docs/Web/Events
