var gulp = require('gulp')
  , livereload = require('gulp-livereload')
  , watch = require('gulp-watch');

gulp.task('watch', function() {
  livereload.listen();
  gulp.watch('index.*').on('change', livereload.changed);
});