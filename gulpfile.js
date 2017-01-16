var browserify = require("browserify");
var buffer = require("vinyl-buffer");
var del = require("del");
var gulp = require("gulp");
var sass = require("gulp-sass");
var sassLint = require("gulp-sass-lint");
var sassModuleImporter = require("sass-module-importer");
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
    lintTypeScript,
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

function buildCss() {
    return gulp.src(paths.entrypoints.scss)
        .pipe(sassLint())
        .pipe(sassLint.format())
        .pipe(sassLint.failOnError())
        .pipe(sourcemaps.init())
        .pipe(sass({importer: sassModuleImporter()}).on("error", sass.logError))
        .pipe(sourcemaps.write("./"))
        .pipe(gulp.dest(paths.destinations.application));
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

function watch() {
    gulp.watch(paths.sources.html, copyHtml);
    gulp.watch(paths.sources.scss, buildCss);
    gulp.watch(paths.sources.typeScript, gulp.series(lintTypeScript, buildJavaScript));
}
