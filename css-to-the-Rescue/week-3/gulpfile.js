var gulp = require('gulp'),
    gulpPostcss = require('gulp-postcss'),
    cssdeclsort = require('css-declaration-sorter'),
    cssPrefix = require('gulp-css-prefix'),
    concat = require('gulp-concat');


gulp.task('default', ['shortCSS']);

gulp.task('shortCSS', function () {
    return gulp.src(['src/css/**/**.css', 'src/css/**.css'])
        .pipe(gulpPostcss([cssdeclsort({
            order: 'smacss'
        })]))
        .pipe(gulp.dest('./dist/css/'));
});
