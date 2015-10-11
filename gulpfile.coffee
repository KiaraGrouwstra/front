gulp = require('gulp')
path = require('path')
gutil = require("gulp-util")
# webpack = require("webpack")
# WebpackDevServer = require("webpack-dev-server")
# less = require('gulp-less')
jade = require('jade')
gulpJade = require('gulp-jade')

paths =
  src: './app/'
  dist: './dist/'
  vendor: './app/vendor/**/*.*'
  # less: './app/**/*.less'
  # ts: './app/**/*.ts'
  # js: './app/*.js'
  # jade: './app/**/*.jade'
  index: './app/index.jade'
  # ^ skipping sub-folders due to overlap with vendor/ for a sec.

gulp.task('default', [
  # 'watch'
  'index'
  'vendor'
])

gulp.task 'watch', ->
  gulp.watch(paths.vendor, ['vendor'])
  # gulp.watch(paths.js, ['js'])
  # gulp.watch(paths.less, ['less'])
  # gulp.watch(paths.jade, ['jade'])
  gulp.watch(paths.index, ['index'])
  # gulp.watch(paths.ts, ['webpack'])
  # ^ this should be handled by webpack-dev-server...

copy = (glob, op = gutil.noop()) ->
  gulp.src(glob, base: paths.src)
      .pipe(op)
      .pipe(gulp.dest(paths.dist))

gulp.task 'vendor', -> copy(paths.vendor)
# gulp.task 'js',     -> copy(paths.js)
# gulp.task 'less',   -> copy(paths.less, less())
# gulp.task 'jade',   -> copy(paths.jade, gulpJade({jade: jade, pretty: true}))
gulp.task 'index',   -> copy(paths.index, gulpJade({jade: jade, pretty: true}))

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
