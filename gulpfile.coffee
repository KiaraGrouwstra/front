gulp = require('gulp')
path = require('path')
gutil = require("gulp-util")
# webpack = require("webpack")
# WebpackDevServer = require("webpack-dev-server")
# less = require('gulp-less')
jade = require('jade')
gulpJade = require('gulp-jade')
Server = require('karma').Server

paths =
  src: './app/'
  dist: './dist/'
  vendor: './app/vendor/**/*.*'
  swagger: './app/swagger/**/*.*'
  # less: './app/**/*.less'
  # ts: './app/**/*.ts'
  # js: './app/*.js'
  # ^ skipping sub-folders due to overlap with vendor/ for a sec.
  # jade: './app/**/*.jade'
  index: './app/index.jade'
  config: './app/config.js'
  tests: './app/unit-tests.jade'
  # router: './node_modules/angular2/bundles/router.dev.js'

gulp.task('default', [
  # 'watch'
  'index'
  'tests'
  'config'
  # 'vendor'
])

gulp.task 'watch', ->
  gulp.watch(paths.vendor, ['vendor'])
  gulp.watch(paths.swagger, ['swagger'])
  # gulp.watch(paths.js, ['js'])
  # gulp.watch(paths.less, ['less'])
  # gulp.watch(paths.jade, ['jade'])
  gulp.watch(paths.index, ['index'])
  gulp.watch(paths.tests, ['tests'])
  gulp.watch(paths.config, ['config'])
  # gulp.watch(paths.ts, ['webpack'])
  # ^ this should be handled by webpack-dev-server...

copy = (glob, op = gutil.noop(), to = paths.dist) ->
  gulp.src(glob, base: paths.src)
      .pipe(op)
      .pipe(gulp.dest(to))

gulp.task 'vendor', -> copy(paths.vendor)
gulp.task 'swagger', -> copy(paths.swagger)
gulp.task 'config', -> copy(paths.config)
# gulp.task 'root', -> copy(paths.router)
# gulp.task 'js',     -> copy(paths.js)
# gulp.task 'less',   -> copy(paths.less, less())
# gulp.task 'jade',   -> copy(paths.jade, gulpJade({jade: jade, pretty: true}))
gulp.task 'index',   -> copy(paths.index, gulpJade({jade: jade, pretty: true}))
gulp.task 'tests',   -> copy(paths.tests, gulpJade({jade: jade, pretty: true}), paths.src)

# gulp.task 'webpack', (callback) ->
#   webpack {}, (err, stats) ->
#     if err
#       throw new (gutil.PluginError)('webpack', err)
#     gutil.log '[webpack]', stats.toString({})
#     callback()
#
# gulp.task 'webpack-dev-server', (callback) ->
#   compiler = webpack({})
#   new WebpackDevServer(compiler, {}).listen 8080, 'localhost', (err) ->
#     if err
#       throw new (gutil.PluginError)('webpack-dev-server', err)
#     gutil.log '[webpack-dev-server]', 'http://localhost:8080/webpack-dev-server/index.html'
#     # keep the server alive or continue?
#     callback()

karma_conf = __dirname + '/karma.conf.js'

gulp.task 'test', (done) ->
  new Server({configFile: karma_conf, singleRun: true }, done).start()

gulp.task 'tdd', (done) ->
  new Server({ configFile: karma_conf }, done).start()
