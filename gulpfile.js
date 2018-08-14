var gulp = require('gulp');
var sass = require('gulp-sass');
var header = require('gulp-header');
var cleanCSS = require('gulp-clean-css');
var rename = require("gulp-rename");
var uglify = require('gulp-uglify');
var pkg = require('./package.json');
var browserSync = require('browser-sync').create();

// Set the banner content
var banner = ['/*!\n',
  ' * Start Bootstrap - <%= pkg.title %> v<%= pkg.version %> (<%= pkg.homepage %>)\n',
  ' * Copyright 2013-' + (new Date()).getFullYear(), ' <%= pkg.author %>\n',
  ' * Licensed under <%= pkg.license %> (https://github.com/BlackrockDigital/<%= pkg.name %>/blob/master/LICENSE)\n',
  ' */\n',
  ''
].join('');

// Copy third party libraries from /node_modules into /vendor
gulp.task('vendor', function() {

  // Axios
  gulp.src(['./node_modules/axios/dist/axios.min.js'])
    .pipe(gulp.dest('./vendor/axios'))

  // Accounting
  gulp.src(['./node_modules/accounting/accounting.min.js'])
    .pipe(gulp.dest('./vendor/accounting'))    

});

// Compile SCSS
gulp.task('css:compile', function() {
  return gulp.src('./scss/**/*.scss')
    .pipe(sass.sync({
      outputStyle: 'expanded'
    }).on('error', sass.logError))
    .pipe(gulp.dest('./css'))
});

// Minify CSS
gulp.task('css:minify', ['css:compile'], function() {
  return gulp.src([
      './css/*.css',
      '!./css/*.min.css'
    ])
    .pipe(cleanCSS())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest('./css'))
    .pipe(browserSync.stream());
});

// CSS
gulp.task('css', ['css:compile', 'css:minify']);

// Minify JavaScript
gulp.task('js:minify', function() {
  return gulp.src([
      './js/product.js'
    ])
    // .pipe(uglify())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest('./js'))
    .pipe(browserSync.stream());
});

// JS
gulp.task('js', ['js:minify']);

// Default task
gulp.task('default', ['js']);

// Configure the browserSync task
gulp.task('browserSync', function() {
  browserSync.init({
    server: {
      baseDir: "./"
    }
  });
});

// Dev task
gulp.task('dev', ['js', 'vendor', 'browserSync'], function() {
  gulp.watch('./scss/*.scss', ['css']);
  gulp.watch('./js/*.js', ['js']);
  gulp.watch('./*.html', browserSync.reload);
});
