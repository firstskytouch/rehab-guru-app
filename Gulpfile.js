var gulp = require('gulp'),
  connect = require('gulp-connect-php');

gulp.task('connect', function() {
  connect.server({
    base: './app/',
    port: 8000,
    ini:'./php.ini'
  });
});

gulp.task('default', ['connect']);
