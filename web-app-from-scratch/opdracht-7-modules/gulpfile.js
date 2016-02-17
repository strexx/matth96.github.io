// Load plugins
var gulp = require('gulp'),
    babel = require('gulp-babel'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    notify = require('gulp-notify'),
    minifyCss = require('gulp-minify-css'),
    livereload = require('gulp-livereload');

// Styles
gulp.task('styles', function (cb) {
    gulp.src(['./src/css/reset.css', './src/css/loading.css', './src/css/main.css', './src/css/nav.css', './src/css/citys.css', './src/css/search.css'])
        .pipe(concat('main.css'))
        .pipe(minifyCss({
            compatibility: 'ie8'
        }))
        .pipe(gulp.dest('dist/css/'))
});

// Scripts
gulp.task('scripts', function (cb) {
    gulp.src(['./src/js/weatherAppStart.js', './src/js/weatherAppLauncher.js', './src/js/weatherAppData.js', './src/js/weatherAppPage.js', './src/js/weatherAppTemplate.js', './src/js/weatherAppUx.js', './src/js/weatherAppRoutes.js', './src/js/weatherAppSupport.js', './src/js/weatherAppEnd.js'])
        .pipe(concat('all.js'))
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(uglify())
        .pipe(gulp.dest('dist/js/'))
        .pipe(notify({
            message: 'Scripts task complete'
        }));
});

gulp.task('worker', () =>
    gulp.src('src/js/templateWorker.js')
    .pipe(babel({
        presets: ['es2015']
    }))
    .pipe(uglify())
    .pipe(gulp.dest('dist/js/'))
);



// Default task
gulp.task('default', function () {
    gulp.start('styles', 'scripts', 'worker', 'watch');
});

// Watch
gulp.task('watch', function () {
    // Watch .scss files
    gulp.watch('src/css/*.css', ['styles']);
    // Watch .js files
    gulp.watch('src/js/*.js', ['scripts']);
    // Create LiveReload server
    livereload.listen();
    // Watch any files in dist/, reload on change
    gulp.watch(['dist/**']).on('change', livereload.changed);
});
