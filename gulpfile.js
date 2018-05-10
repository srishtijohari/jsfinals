'use strict';

var gulp = require('gulp');
var sass = require('gulp-sass');
var cssnano = require('gulp-cssnano');
var sourcemaps = require('gulp-sourcemaps');
var autoprefixer = require('gulp-autoprefixer');

var browserSync = require('browser-sync').create();

var jshint = require('gulp-jshint');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
gulp.task('lint', function() {
  return gulp.src('src/js/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
}); // Concatenate & Minify JSgulp.task('scripts', function() {    return gulp.src('./src/js/*.js')        .pipe(concat('scripts.js'))        .pipe(gulp.dest('./dist/js'))        .pipe(rename('scripts.min.js'))        .pipe(uglify())        .pipe(gulp.dest('./dist/js'));});gulp.task('default', function() {    gulp.watch('./src/js/*.js', ['lint', 'scripts']);    gulp.watch('./src/sass/**/*.scss', ['sassworkflow']);})

// Concatenate & Minify JS
gulp.task('scripts', function() {
  return gulp.src('./src/js/*.js')
    .pipe(concat('scripts.js'))
    .pipe(gulp.dest('./dist/js'))
    .pipe(rename('scripts.min.js'))
    //.pipe(uglify())
    .pipe(gulp.dest('./dist/js'));
});

gulp.task('workflow', function() {
  gulp.src('./src/sass/**/*.scss') //conversion of sass to css
    .pipe(sourcemaps.init()) //pipe the previous thing into the latter - concatination function
    .pipe(sass().on('error', sass.logError)) //error logging
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe(cssnano()) //compresses everything
    .pipe(sourcemaps.write('./')) //build sourcemaps in root //sourcemaps is used to map back to source from console

    .pipe(gulp.dest('./dist/css/')) //puts in dist css folder
});

// gulp.task('default', function () { //to initialize
//   gulp.watch('./src/sass/**/*.scss', ['workflow']); //tell what to watch to initialize - first thing is what to watch, second is what to initialize
// });

gulp.task('default', ['browserSync', 'sassworkflow'], function() {
  gulp.watch('./src/js/*.js', ['lint', 'scripts']);
  gulp.watch('./src/sass/**/*.scss', ['sassworkflow']);
})

gulp.task('browserSync', function() {
  browserSync.init({
    server: {
      baseDir: './',
      index: "index.html"
    },
  })
})
gulp.task('sassworkflow', function() {
  gulp.src('./src/sass/**/*.scss')
    // tasks go here
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe(cssnano())
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./dist/css/'))
    .pipe(browserSync.reload({
      stream: true
    }));
});
