var gulp = require('gulp');
var gulpPostcss = require('gulp-postcss');
var cssdeclsort = require('css-declaration-sorter');

gulp.task('default', function () {
    return gulp.src('css/components/profile.css')
        .pipe(gulpPostcss([cssdeclsort({
            order: 'smacss'
        })]))
        .pipe(gulp.dest('./'));
});
