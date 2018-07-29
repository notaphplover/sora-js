const babel = require('gulp-babel');
const browserify = require('browserify');
const buffer = require('vinyl-buffer');
const gulp = require('gulp');
const path = require('path');
const sass = require('gulp-sass');
const source = require('vinyl-source-stream');
const sourcemaps = require('gulp-sourcemaps');
const ts = require('gulp-typescript');
const uglify = require('gulp-uglify');

const BABEL_OPTIONS = {
    presets: [
        ['env', {
            targets: {
                browsers: [
                    'ie >= 11',
                    'last 2 versions',
                    'safari >= 11',
                ],
            }
        }]
    ],
    plugins: [
        'transform-runtime',
    ],
    sourceMaps: true,
};

const TASKS = {
    BUILD: 'build',
    BUNDLE_DEV: 'bundle-dev',
    BUNDLE_PROD: 'bundle-prod',
    BUNDLE_TEST: 'bundle-test',
    COMPILE_TYPESCRIPT_SRC: 'compile-typescript-src',
    COMPILE_TYPESCRIPT_TEST: 'compile-typescript-test',
    COMPILE_SASS: 'compile-sass',
    DEFAULT: 'default',
    TEST: 'jest',
    WATCH_DEV: 'watch-dev',
};

//#region OPTIONS

var OPTIONS = {};

OPTIONS[TASKS.BUNDLE_DEV] = {
    BROWSERIFY_ENTRY: 'dist/js/tmp/src/main.js',
    BUNDLE_NAME: 'bundle.dev.js',
    DESTINATION_FOLDER: 'dist/js',
    MODULE_NAME: 'sora',
};

OPTIONS[TASKS.BUNDLE_PROD] = {
    BROWSERIFY_ENTRY: OPTIONS[TASKS.BUNDLE_DEV].BROWSERIFY_ENTRY,
    BUNDLE_NAME: 'bundle.js',
    DESTINATION_FOLDER: OPTIONS[TASKS.BUNDLE_DEV].DESTINATION_FOLDER,
    MODULE_NAME: OPTIONS[TASKS.BUNDLE_DEV].MODULE_NAME,
};

OPTIONS[TASKS.BUNDLE_TEST] = {
    BROWSERIFY_ENTRY: 'dist/js/tmp/src/main.test.js',
    BUNDLE_NAME: 'bundle.test.js',
    DESTINATION_FOLDER: OPTIONS[TASKS.BUNDLE_DEV].DESTINATION_FOLDER,
    MODULE_NAME: 'soraTest',
};

OPTIONS[TASKS.COMPILE_SASS] = {
    ENTRY: 'styles/sass/sora.scss',
    DESTINATION: 'dist/css',
};

OPTIONS[TASKS.COMPILE_TYPESCRIPT_SRC] = {
    CONFIG_FILE: 'src.tsconfig.json',
    TEMP_FOLDER: 'dist/js/tmp/src',
};

//#endregion

//#region BUILD

function bundleDev() {
    return browserify(
    {
        entries: OPTIONS[TASKS.BUNDLE_DEV].BROWSERIFY_ENTRY,
        debug: true,
        standalone: OPTIONS[TASKS.BUNDLE_DEV].MODULE_NAME,
    })
        .transform('babelify', BABEL_OPTIONS)
        .bundle()
        .pipe(source(path.join(OPTIONS[TASKS.BUNDLE_DEV].DESTINATION_FOLDER, OPTIONS[TASKS.BUNDLE_DEV].BUNDLE_NAME)))
        .pipe(buffer())
        // Gulp Plugins Here
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('./'));
}

function bundleProd() {
    process.env.NODE_ENV = 'production';

    return browserify(
    {
        entries: OPTIONS[TASKS.BUNDLE_PROD].BROWSERIFY_ENTRY,
        debug: false,
        standalone: OPTIONS[TASKS.BUNDLE_PROD].MODULE_NAME,
    })
        .transform('babelify', BABEL_OPTIONS)
        .bundle()
        .pipe(source(path.join(OPTIONS[TASKS.BUNDLE_PROD].DESTINATION_FOLDER, OPTIONS[TASKS.BUNDLE_PROD].BUNDLE_NAME)))
        .pipe(buffer())
        // Gulp Plugins Here
        .pipe(uglify())
        .pipe(gulp.dest('./'));
}

function bundleTest() {
    process.env.NODE_ENV = 'production';

    return browserify(
    {
        entries: OPTIONS[TASKS.BUNDLE_TEST].BROWSERIFY_ENTRY,
        debug: true,
        standalone: OPTIONS[TASKS.BUNDLE_TEST].MODULE_NAME,
    })
        .transform('babelify', BABEL_OPTIONS)
        .bundle()
        .pipe(source(path.join(OPTIONS[TASKS.BUNDLE_TEST].DESTINATION_FOLDER, OPTIONS[TASKS.BUNDLE_TEST].BUNDLE_NAME)))
        .pipe(buffer())
        // Gulp Plugins Here
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('./'));
}

gulp.task(TASKS.COMPILE_TYPESCRIPT_SRC, function () {
    var tsProjectSrc = ts.createProject(OPTIONS[TASKS.COMPILE_TYPESCRIPT_SRC].CONFIG_FILE, { noResolve: true });
    var tsResult = tsProjectSrc.src().pipe(sourcemaps.init()).pipe(tsProjectSrc());
    return tsResult.js.pipe(sourcemaps.write('', { debug: false, includeContent: true, sourceRoot: '' })).pipe(gulp.dest(OPTIONS[TASKS.COMPILE_TYPESCRIPT_SRC].TEMP_FOLDER));
});

//#region SASS

gulp.task(TASKS.COMPILE_SASS, function () {
    return gulp.src(OPTIONS[TASKS.COMPILE_SASS].ENTRY)
        .pipe(sass().on(
            'error',
            function(error) {
                console.log(error.toString());
            }

        ))
        .pipe(gulp.dest(OPTIONS[TASKS.COMPILE_SASS].DESTINATION))
        .on('error', function(error) {
            console.log(error.toString());
        })
    ;
});

//#endregion

gulp.task(
    TASKS.BUILD,
    gulp.parallel(
        TASKS.COMPILE_SASS,
        gulp.series(
            TASKS.COMPILE_TYPESCRIPT_SRC,
            gulp.parallel(
                bundleDev,
                bundleProd,
                bundleTest
            )
        )
    )
);

//#endregion

gulp.task(TASKS.DEFAULT, gulp.series(TASKS.BUILD));