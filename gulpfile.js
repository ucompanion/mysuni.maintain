/************************* gulp 4.x ********************************

https://nodejs.org/ko/download/

npm install gulp-cli -g
npm install gulp -g
npm install gulp --save-dev

npm install gulp-concat --save-dev
npm install gulp-uglify --save-dev
npm install gulp-sourcemaps --save-dev
npm install node-sass gulp-sass --save-dev
npm install gulp-autoprefixer --save-dev
npm install gulp-file-include --save-dev
npm install gulp-pretty-html --save-dev
npm install browser-sync --save-dev
npm install gulp del --save-dev

npm install gulp-wait --save-dev

**************************************************************/
var gulp = require('gulp')
  , concat = require('gulp-concat')
  , fileinclude = require('gulp-file-include')
  , prettyHtml = require('gulp-pretty-html')
  , sass = require('gulp-sass')
  , sourcemaps = require('gulp-sourcemaps')
  , autoprefixer = require('gulp-autoprefixer')
  , minJs = require('gulp-uglify')
  , server = require('browser-sync').create()
  , clean = require('del')
  , wait = require('gulp-wait');

var paths = {
  srcHtml : ['./src/html/**/*.*', '!./src/html/include/**/*.*'],
  srcInclude : './src/html/include',
  srcScss : ['./src/scss/style.scss', './src/scss/semantic.min.css', './src/scss/calendar.min.css', './src/scss/swiper.min.css'],
  srcJs : ['./src/js/**/*.*'],
  srcMinJs : ['./src/js/jquery-1.12.4.js', './src/js/ui.js'],
  srcImg : ['./src/img/**/*.*'],
  srcFont : ['./src/font/**/*.*'],
  srcIncluder : './src/html/include',
  distHtml : './dist/html/',
  distCss : './dist/css/',
  distJs : './dist/js/',
  distImg : './dist/img/',
  distFont : './dist/font/',
  // min
  minScss : 'style.min.css',
  minJs : 'script.min.js',
  // watch
  watchIndex : './index.html',
  watchHtml : './src/html/**/*.*',
  watchJs : './src/js/**/*.*',
  watchScss : './src/scss/**/*.*',
  watchImg : './src/img/**/*.*',
  // clean
  cleanAll : ['./dist/**/*.*', '!./dist/video/**/*.*', '!./dist/font/**/*.*']
}

function cleanFile(done){
  console.log('clean file');
  clean(paths.cleanAll);
  done();
}
function htmlBuild(done){
  gulp.src(paths.srcHtml)
    .pipe(fileinclude({
      prefix: '@@',
      basepath: paths.srcIncluder
    }))
    .pipe(prettyHtml())
    .pipe(gulp.dest(paths.distHtml));
  done();
}
function scssBuild(done){
  gulp.src(paths.srcScss, {allowEmpty:true})
    .pipe(wait(200))
    .pipe(sourcemaps.init())
    .pipe(sass({ outputStyle: "compact" }))
    // .pipe(autoprefixer())
    .pipe(sourcemaps.write('../maps'))
    .pipe(gulp.dest(paths.distCss));
  done();
}

function autoprefixerPatch(done){
  gulp.src('./dist/css/style.css', {allowEmpty:true})
    .pipe(wait(200))
    .pipe(autoprefixer({
      cascade: false
    }))
    .pipe(concat('./style.min.css'))
    .pipe(gulp.dest(paths.distCss));
  done();
}

function jsBuild(done){
  gulp.src(paths.srcMinJs)
    .pipe(gulp.dest(paths.distJs))
    .pipe(minJs())
    .pipe(concat(paths.minJs))
    .pipe(gulp.dest(paths.distJs));
  gulp.src(paths.srcJs)
    .pipe(gulp.dest(paths.distJs));

  done();
}
function imageBuild(done){
  gulp.src(paths.srcImg)
    .pipe(gulp.dest(paths.distImg));
  done();
}
function fontBuild(done){
  gulp.src(paths.srcFont)
    .pipe(gulp.dest(paths.distFont))
  done();
}
function watchFile(done){
  gulp.watch(paths.watchIndex, gulp.series(reload));
  gulp.watch(paths.watchHtml, gulp.series(htmlBuild, gulp.parallel(reload)));
  gulp.watch(paths.watchScss, gulp.series(scssBuild, gulp.parallel(reload)));
  gulp.watch(paths.watchJs, gulp.series(jsBuild, gulp.parallel(reload)));
  gulp.watch(paths.watchImg, gulp.series(imageBuild, gulp.parallel(reload)));
  done();
}
function reload(done){
  setTimeout(function(){
    server.reload();
  },500);
  done();
}
function serve(done){
  server.init({
    server: {
      baseDir: './'
    }
  });
  done();
}
gulp.task('default', gulp.series(cleanFile, gulp.parallel(htmlBuild, imageBuild, jsBuild, scssBuild, fontBuild), autoprefixerPatch, serve, watchFile));