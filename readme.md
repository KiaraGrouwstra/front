npm i <pkg> --save
npm i angular2@latest --save
npm i angular2@2.0.0-alpha.45 --save
npm update

tsd install angular2/
tsd update
// patch `./node_modules/angular2/typings/node/node.d.ts`: types of global/module/require -> `: any` to prevent clash with `./typings/webpack.d.ts`.

patch materialize js: https://github.com/Dogfalo/materialize/issues/1537
patch karma-jasmine: make lib/adapter.js using /src/ version wrapped in wrapper: https://github.com/karma-runner/karma-jasmine/blob/master/tasks/build.js

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
