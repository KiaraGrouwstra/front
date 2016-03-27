// // ditch as a component? move Event check to handler like for curl's input-form.
//
// import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild } from 'angular2/core'; //, forwardRef
// import { input_specs } from './input';
// import { notify } from './rx_helpers';
// import { BehaviorSubject } from 'rxjs/subject/BehaviorSubject';
// import { FormComp } from './comps/input-form';
//
// @Component({
//   selector: 'scrape-ui',
//   changeDetection: ChangeDetectionStrategy.OnPush,
//   template: `<input-form [inputs]="pars" [desc]="desc" (submit)="handler.emit($event)"></input-form>`,
//   directives: [
//     FormComp,
//   ],
// })
// export class ScrapeUiComp {
//   @Output() handler = new EventEmitter(false);
//
//   constructor(cdr: ChangeDetectorRef) {
//     this.cdr = cdr;
//     this.desc = 'scraper desc';
//     let spec = [
//       {
//         name: 'url',
//         type: 'string',
//         format: 'url',
//         required: true,
//         description: 'the URL to scrape and extract',
//       },
//       {
//         // type: 'array',
//         // items: {
//         type: 'object',
//         additionalProperties: {
//           type: 'string',
//           // format: 'json',
//
//           required: true,
//           name: 'floki selector',
//           description: "use CSS selectors, use e.g. `a@src` to get a URL's `src` attribute, `a` to get its text, or `a@` to get its outer html",
//           // in: 'path',
//         },
//         minItems: 1,
//
//         // required: true,
//         name: 'parselet',
//         description: 'json parselet',
//         // in: 'path',
//       },
//     ];
//     this.pars$ = new BehaviorSubject(spec.map(input_specs()));
//     // notify('scrape-ui:handler', this.handler);
//   }
//
//   // submit(form_val) {
//   //   // if(form_val.constructor == Event) return;
//   //   // console.log('scrape_ui:submit', form_val);
//   //   this.handler.emit(form_val);
//   // };
//
// }
//
// ScrapeUiComp.parameters = [
//   [ChangeDetectorRef],
// ]
//
// Reflect.decorate([ViewChild(FormComp)], ScrapeUiComp.prototype, 'form');
