var gulp = require('gulp');
var sass = require('gulp-sass');
var sassGlob = require('gulp-sass-glob');
var browserSync = require('browser-sync').create();
var postcss      = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var cssvariables = require('postcss-css-variables'); 
var calc = require('postcss-calc');  
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var handlebars = require('gulp-compile-handlebars');
var del = require('del');

// js file paths
var utilJsPath = 'main/assets/js'; // util.js path - you may need to update this if including the framework as external node module
var componentsJsPath = 'main/assets/js/components/*.js'; // component js files
var scriptsJsPath = 'dist/assets/js'; //folder for final scripts.js/scripts.min.js files

// css file paths
var cssFolder = 'dist/assets/css'; // folder for final style.css/style-custom-prop-fallbac.css files
var scssFilesPath = 'main/assets/css/**/*.scss'; // scss files to watch

// img file path
var dstImgFolder = 'dist/assets/img';
var imgPath = 'main/assets/img/*';

// hbs file paths
var pagesFolder = 'main/pages'; 
var partialsFolder = 'main/partials';

// build folder
var buildFolder = 'dist'

function reload(done) {
  browserSync.reload();
  done();
} 

gulp.task('sass', function() {
  return gulp.src(scssFilesPath)
  .pipe(sassGlob())
  .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
  .pipe(postcss([autoprefixer()]))
  .pipe(gulp.dest(cssFolder))
  .pipe(browserSync.reload({
    stream: true
  }))
  .pipe(rename('style-fallback.css'))
  .pipe(postcss([cssvariables(), calc()]))
  .pipe(gulp.dest(cssFolder));
});

gulp.task('scripts', function() {
  return gulp.src([utilJsPath+'/util.js', componentsJsPath])
  .pipe(concat('scripts.js'))
  .pipe(gulp.dest(scriptsJsPath))
  .pipe(browserSync.reload({
    stream: true
  }))
  .pipe(rename('scripts.min.js'))
  .pipe(uglify())
  .pipe(gulp.dest(scriptsJsPath))
  .pipe(browserSync.reload({
    stream: true
  }));
});

gulp.task('img', function () {
  return gulp.src(imgPath)
    .pipe(gulp.dest(dstImgFolder))
});

gulp.task('handlebars', function () {
  return gulp.src(pagesFolder + `/*.hbs`)
    .pipe(handlebars({}, {
      ignorePartials: true,
      batch: [partialsFolder]
    }))
    .pipe(rename({
      extname: '.html'
    }))
    .pipe(gulp.dest(buildFolder));
});

gulp.task('browserSync', gulp.series(function (done) {
  browserSync.init({
    server: {
      baseDir: buildFolder
    },
    notify: false
  })
  done();
}));

gulp.task('watch', gulp.series(['sass', 'scripts', 'img', 'handlebars', 'browserSync'], function () {
  gulp.watch('main/assets/css/**/*.scss', gulp.series(['sass']));
  gulp.watch('main/pages/*.hbs', gulp.series(['handlebars']));
  gulp.watch('main/partials/**/*.hbs', gulp.series(['handlebars', reload]));
  gulp.watch(componentsJsPath, gulp.series(['scripts']));
  gulp.watch(imgPath, gulp.series(['img']));
}));

gulp.task('clean', function () {
  return del(buildFolder);
});

gulp.task('build', gulp.series(['clean', 'sass', 'scripts', 'img', 'handlebars']));
