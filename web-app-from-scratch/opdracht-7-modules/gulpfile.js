const gulp = require('gulp');
const babel = require('gulp-babel');
var concat = require('gulp-concat');

gulp.task('default', ['combineJS', 'worker', 'combineCSS']);

// takes in a callback so the engine knows when it'll be done
gulp.task('combineJS', function (cb) {
    gulp.src(['./src/js/weatherAppStart.js', './src/js/weatherAppLauncher.js', './src/js/weatherAppData.js', './src/js/weatherAppPage.js', './src/js/weatherAppTemplate.js', './src/js/weatherAppUx.js', './src/js/weatherAppRoutes.js', './src/js/weatherAppSupport.js', './src/js/weatherAppEnd.js'])
        .pipe(concat('all.js'))
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(gulp.dest('dist/js/'))
});

gulp.task('worker', () =>
    gulp.src('src/js/templateWorker.js')
    .pipe(babel({
        presets: ['es2015']
    }))
    .pipe(gulp.dest('dist'))
);

gulp.task('combineCSS', function (cb) {
    gulp.src(['./src/css/reset.css', './src/css/main.css', './src/css/nav.css', './src/css/citys.css', './src/css/loading.css', './src/css/search.css'])
        .pipe(concat('main.css'))
        .pipe(gulp.dest('dist/css/'))
});
