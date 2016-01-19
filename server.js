var express = require('express');
// import * as express from 'express';
var app = express();

// import {ng2engine} from 'angular2-universal-preview';
// import {App} from './app/js/app.ts';
// app.engine('.ng2.html', ng2engine);
// app.set('views', __dirname);
// app.set('view engine', 'ng2.html');
// https://github.com/angular/universal-starter
// http://fullstackangular2.com/

app.use(express.static('dist'));  //__dirname

///*
app.get('*', function (req, res) {  //'/'
  //res.redirect('/index.html');
  res.sendfile(__dirname + '/dist/index.html'); //res.render('index', {})
});
//*/

var s = app.listen(8090, () => {
  console.log(`listening on http://localhost:${s.address().port}`);
});
