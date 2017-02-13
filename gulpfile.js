var browserify = require("browserify");
var browserSync = require('browser-sync').create();
var buffer = require("vinyl-buffer");
var cleanCSS = require('gulp-clean-css');
var del = require("del");
var gulp = require("gulp");
var htmlhint = require("gulp-htmlhint");
var htmlmin = require('gulp-htmlmin');
var sass = require("gulp-sass");
var sassLint = require("gulp-sass-lint");
var source = require("vinyl-source-stream");
var sourcemaps = require("gulp-sourcemaps");
var tsify = require("tsify");
var tslint = require("gulp-tslint");
var uglify = require("gulp-uglify");
var util = require("gulp-util");

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

var isProductionBuild = !!util.env.isProductionBuild;
console.log(isProductionBuild);

gulp.task("build", gulp.series(
    cleanBuild,
    gulp.parallel(lintHtml, lintScss, lintTypeScript),
    gulp.parallel(buildHtml, buildCss, buildJavaScript)
));
gulp.task("test", gulp.series("build"));
gulp.task("default", gulp.series("build", watch));

function cleanBuild() {
    util.log("isProductionBuild: " + isProductionBuild);
    return del([paths.destinations.application]);
}

function buildHtml() {
    return gulp.src(paths.sources.html)
        .pipe(isProductionBuild ? htmlmin({collapseWhitespace: true}) : util.noop())
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
        .pipe(isProductionBuild ? util.noop() : sourcemaps.init())
        .pipe(sass().on("error", sass.logError))
        .pipe(isProductionBuild ? cleanCSS() : util.noop())
        .pipe(isProductionBuild ? util.noop() : sourcemaps.write("./"))
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
        .pipe(tslint.report({
            emitError: isProductionBuild
        }));
}

function buildJavaScript(done) {
    return browserify()
        .add(paths.entrypoints.typeScript)
        .plugin(tsify)
        .bundle()
        .on("error", function (error) {
            util.log(error);

            if (!isProductionBuild) {
                done();
            }
        })
        .pipe(source("application.js"))
        .pipe(buffer())
        .pipe(isProductionBuild ? util.noop() : sourcemaps.init({loadMaps: true}))
        .pipe(isProductionBuild ? uglify() : util.noop())
        .pipe(isProductionBuild ? util.noop() : sourcemaps.write("./"))
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

    gulp.watch(paths.sources.html, gulp.series(lintHtml, buildHtml, reload));
    gulp.watch(paths.sources.scss, gulp.series(lintScss, buildCss, reload));
    gulp.watch(paths.sources.typeScript, gulp.series(lintTypeScript, buildJavaScript, reload));
}
