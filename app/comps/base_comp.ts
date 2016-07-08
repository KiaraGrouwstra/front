import { Component, ChangeDetectionStrategy, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { COMMON_DIRECTIVES } from '@angular/common';
import { GlobalsService } from './services';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  directives: [
    COMMON_DIRECTIVES,
  ],
})
export abstract class BaseComp {

  // constructor(
  //   // BaseComp
  //   public cdr: ChangeDetectorRef,
  //   public g: GlobalsService,
  // ) {
  //   super();
  // }

}
