npm i <pkg> --save
npm i angular2@latest --save
npm i angular2@2.0.0-alpha.45 --save
npm update

tsd install angular2/
tsd update

# ./node_modules/karma/bin/karma start
# npm install -g karma-cli
karma start &
# karma run -- --grep=<pattern>
live-server --port=8070
http://127.0.0.1:8070/app/unit-tests.html

gulp index && webpack --watch
gulp index
webpack --watch

cd dist
live-server --port=8090
