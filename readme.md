npm-windows-upgrade
npm i <pkg> --save
npm i angular2@2.0.0-alpha.45 --save
npm update

tsd install angular2/
tsd update
// patch `./node_modules/angular2/typings/node/node.d.ts`: types of global/module/require -> `: any` to prevent clash with `./typings/webpack.d.ts`.

- patch `babel-plugin-transform-runtime/lib/definitions.js`: comment `defineProperty: "object/define-property"`
- patch materialize js: https://github.com/Dogfalo/materialize/issues/1537
- patch karma-jasmine: make lib/adapter.js using /src/ version wrapped in wrapper: https://github.com/karma-runner/karma-jasmine/blob/master/tasks/build.js
//- patch [toHaveText](https://github.com/angular/angular/blob/master/modules/angular2/src/testing/matchers.ts#L159-L169):
//  - `var show = function(str) { return JSON.stringify(str.split('').map(x => x.charCodeAt(0))); }`
//  - `get message() { return 'Expected ' + actualText + ' ' + show(actualText) + ' to be equal to ' + expectedText + ' ' + show(expectedText); }`
- copy over materialize.css as .less, cuz Less never realized you might wanna import css from a Sass project.

```
# ./node_modules/karma/bin/karma start
# npm install -g karma-cli
webpack --entry karma-test-shim.js --output-filename foo.js --verbose
node dist/foo.js
karma start
# karma start --help
# karma start my.conf.js --log-level debug --single-run
# karma run -- --grep=<pattern>
# file:///C:/Users/T/Desktop/ng2/app/unit-tests.html
# C:\Users\T\Desktop\ng2
# live-server --port=8070
# http://127.0.0.1:8070/app/unit-tests.html
http://127.0.0.1:8090/tests.html

gulp index && webpack --watch
gulp index
webpack --watch

# cd dist
# live-server --port=8090
node server.js
# node-ts server.ts
# apache: https://gist.github.com/leocaseiro/4305e06948aa97e77c93
```

file:///C:/Users/T/Desktop/ng2/coverage/
