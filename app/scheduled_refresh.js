//various failed attempts...

[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15].forEach((x) => setTimeout(() => { cdr.detectChanges(); }, x * 1000));
//this.scheduleRefresh(cdr);
//this.scheduleRefresh();
//scheduleRefresh();
//function scheduleRefresh(cdr: ChangeDetectorRef) {
/*
let scheduleRefresh = (cdr: ChangeDetectorRef) => {
  cdr.detectChanges();
  setTimeout(() => scheduleRefresh(cdr), 1000);
}
*/
/*
let scheduleRefresh = (function recursive(cdr: ChangeDetectorRef) {
  cdr.detectChanges();
  setTimeout(() => recursive(cdr), 1000);
})();
scheduleRefresh(cdr);
*/
/*
(function recursive(cdr: ChangeDetectorRef) {
  cdr.detectChanges();
  setTimeout(() => recursive(cdr), 1000);
})(cdr);
*/

}

/*
scheduleRefresh(cdr: ChangeDetectorRef) {
cdr.detectChanges();
setTimeout(() => this.scheduleRefresh(cdr), 1000);
}
*/

/*
scheduleRefresh() {
this.deps.cdr.detectChanges();
setTimeout(() => this.scheduleRefresh(), 1000);
}
*/

/*
scheduleRefresh: () => void = (function foo() {
this.deps.cdr.detectChanges();
setTimeout(() => foo(), 1000);
})();
*/
