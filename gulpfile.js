var browserify = require("browserify");
var browserSync = require('browser-sync').create();
var buffer = require("vinyl-buffer");
var cleanCSS = require('gulp-clean-css');
var del = require("del");
var gulp = require("gulp");
var htmlhint = require("gulp-htmlhint");
var sass = require("gulp-sass");
var sassLint = require("gulp-sass-lint");
var source = require("vinyl-source-stream");
var sourcemaps = require("gulp-sourcemaps");
var tsify = require("tsify");
var tslint = require("gulp-tslint");
var uglify = require("gulp-uglify");

var paths = {
    sources: {
        application: "application/**/*",
        html: ["src/*.html"],
        scss: ["src/scss/**/*"],
        typeScript: "src/typescript/**/*"
    },
    entrypoints: {
        scss: "src/scss/application.scss",
        typeScript: "src/typescript/application.ts"
    },
    destinations: {
        application: "application"
    }
};

gulp.task("build", gulp.series(
    cleanBuild,
    gulp.parallel(lintHtml, lintScss, lintTypeScript),
    gulp.parallel(copyHtml, buildCss, buildJavaScript)
));
gulp.task("default", gulp.series("build", watch));
gulp.task("test", gulp.series("build"));

function cleanBuild() {
    return del([paths.destinations.application]);
}

function copyHtml() {
    return gulp.src(paths.sources.html)
        .pipe(gulp.dest(paths.destinations.application));
}

function lintScss() {
    return gulp.src(paths.entrypoints.scss)
        .pipe(sassLint())
        .pipe(sassLint.format())
        .pipe(sassLint.failOnError());
}

function buildCss() {
    return gulp.src(paths.entrypoints.scss)
        .pipe(sourcemaps.init())
        .pipe(sass().on("error", sass.logError))
        .pipe(cleanCSS())
        .pipe(sourcemaps.write("./"))
        .pipe(gulp.dest(paths.destinations.application));
}

function lintHtml() {
    return gulp.src(paths.sources.html)
        .pipe(htmlhint())
        .pipe(htmlhint.failReporter());
}

function lintTypeScript() {
    return gulp.src(paths.sources.typeScript)
        .pipe(tslint())
        .pipe(tslint.report());
}

function buildJavaScript() {
    return browserify()
        .add(paths.entrypoints.typeScript)
        .plugin(tsify)
        .bundle()
        .on("error", function (error) {
            console.error(error.toString());
        })
        .pipe(source("application.js"))
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(uglify())
        .pipe(sourcemaps.write("./"))
        .pipe(gulp.dest(paths.destinations.application));
}

function reload(done) {
    browserSync.reload();
    done();
}

function watch() {
    browserSync.init({
        server: "./application"
    });

    gulp.watch(paths.sources.html, gulp.series(lintHtml, copyHtml, reload));
    gulp.watch(paths.sources.scss, gulp.series(lintScss, buildCss, reload));
    gulp.watch(paths.sources.typeScript, gulp.series(lintTypeScript, buildJavaScript, reload));
}
