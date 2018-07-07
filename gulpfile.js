const babel = require('gulp-babel');
const browserify = require('browserify');
const buffer = require('vinyl-buffer');
const gulp = require('gulp');
const jestCli = require('jest-cli');
const path = require('path');
const sass = require('gulp-sass');
const source = require('vinyl-source-stream');
const sourcemaps = require('gulp-sourcemaps');
const ts = require('gulp-typescript');
const uglify = require('gulp-uglify');

const TASKS = {
    BUILD_DEV: 'build-dev',
    BUILD_PROD: 'build-prod',
    COMPILE_TYPESCRIPT_SRC: 'compile-typescript-src',
    COMPILE_TYPESCRIPT_TEST: 'compile-typescript-test',
    COMPILE_SASS: 'compile-sass',
    TEST: 'jest',
    WATCH_DEV: 'watch-dev',
};

const PATHS = {
    BROWSERIFY_ENTRY: 'dist/js/tmp/main.js',
    BUNDLE_DEV: 'bundle.dev.js',
    BUNDLE_PROD: 'bundle.js',
    CSS_DESTINATION_FOLDER: 'dist/css',
    JS_DESTINATION_FOLDER: 'dist/js',
    SASS_ENTRY: 'styles/sass/sora.scss',
    SASS_DOMAIN: 'styles/sass/**/*.scss',
    TEST_COVERAGE_DOMAIN: 'test/tmp/src/**/*.js',
    TEST_REGEX: 'test/tmp/test/.*\\.test.js',
    TS_SRC_CONFIG_FILE: 'src.tsconfig.json',
    TS_SRC_DOMAIN: ['src/**/*.ts'],
    TS_SRC_TEMP_FOLDER: 'dist/js/tmp',
    TS_TEST_CONFIG_FILE: 'test.tsconfig.json',
    TS_TEST_TEMP_FOLDER: 'test/tmp',
};

const MODULE_NAME = 'sora';

var tsProjectSrc = ts.createProject(PATHS.TS_SRC_CONFIG_FILE, { noResolve: true });

gulp.task(TASKS.COMPILE_TYPESCRIPT_SRC, function () {
    var tsResult = tsProjectSrc.src().pipe(sourcemaps.init()).pipe(tsProjectSrc());
    return tsResult.js.pipe(sourcemaps.write('', { debug: false, includeContent: true, sourceRoot: '' })).pipe(gulp.dest(PATHS.TS_SRC_TEMP_FOLDER));
});

var tsProjectTest = ts.createProject(PATHS.TS_TEST_CONFIG_FILE, { noResolve: true });

gulp.task(TASKS.COMPILE_TYPESCRIPT_TEST, function () {
    var tsResult = tsProjectTest.src().pipe(sourcemaps.init()).pipe(tsProjectTest());
    return tsResult
        .js
        .pipe(babel({
            presets: ['es2015'],
        }))
        .pipe(sourcemaps.write('', { debug: false, includeContent: true, sourceRoot: '' }))
        .pipe(gulp.dest(PATHS.TS_TEST_TEMP_FOLDER))
    ;
});

gulp.task(TASKS.BUILD_DEV, gulp.series(TASKS.COMPILE_TYPESCRIPT_SRC, function() {

    return browserify(
        { 
            entries: PATHS.BROWSERIFY_ENTRY, 
            debug: true,
            standalone: MODULE_NAME,
        })
        .transform('babelify', { presets: ['es2015'] })
        .bundle()
        .pipe(source(path.join(PATHS.JS_DESTINATION_FOLDER, PATHS.BUNDLE_DEV)))
        .pipe(buffer())
        // Gulp Plugins Here
        .pipe(gulp.dest('./'));
}));

gulp.task(TASKS.BUILD_PROD, gulp.series(TASKS.COMPILE_TYPESCRIPT_SRC, function() {
    process.env.NODE_ENV = 'production';

    return browserify(
        { 
            entries: PATHS.BROWSERIFY_ENTRY, 
            debug: false,
            standalone: MODULE_NAME,
        })
        .transform('babelify', { presets: ['es2015'] })
        .bundle()
        .pipe(source(path.join(PATHS.JS_DESTINATION_FOLDER, PATHS.BUNDLE_PROD)))
        .pipe(buffer())
        // Gulp Plugins Here
        .pipe(uglify())
        .pipe(gulp.dest('./'));
}));

gulp.task(TASKS.COMPILE_SASS, function () {
    return gulp.src(PATHS.SASS_ENTRY)
        .pipe(sass().on(
            'error', 
            function(error) {
                console.log(error.toString());
            }
            
        ))
        .pipe(gulp.dest(PATHS.CSS_DESTINATION_FOLDER))
        .on('error', function(error) {
            console.log(error.toString());
        })
    ;
});

gulp.task(TASKS.TEST, gulp.series(TASKS.COMPILE_TYPESCRIPT_TEST, function (cb) {
    process.env.NODE_ENV = 'test';
    var JEST_OPTIONS = {
        collectCoverage: true,
        collectCoverageFrom: [
            PATHS.TEST_COVERAGE_DOMAIN,
        ],
        coverageDirectory: PATHS.TS_TEST_TEMP_FOLDER + '/output',
        moduleFileExtensions: ['js', 'jsx', 'json', 'ts', 'tsx'],
        testRegex: [
            PATHS.TEST_REGEX,
        ],
        scriptPreprocessor: './node_modules/babel-jest',
        unmockedModulePathPatterns: [
            './node_modules/*'
        ],
    };

    jestCli.runCLI(JEST_OPTIONS, '.').then(function (_ref) {
        var results = _ref.results;

        console.log('\n');
        console.log('\x1b[33m%s\x1b[0m','Discovering tests ...\n');
  
        for (var i = 0; i < results.testResults.length; ++i) {
            var testResult = results.testResults[i];
            var innerTestsResults = testResult.testResults;

            console.log('\x1b[33m%s\x1b[0m', '    ' + innerTestsResults.length + ' Tests were found at ' + testResult.testFilePath + '.\n');
            
            for(var j = 0; j < innerTestsResults.length; ++j) {
                var innerTestsResult = innerTestsResults[j];
                var testDuration = innerTestsResult.duration;
                var testName = innerTestsResult.fullName;
                var testStatus = innerTestsResult.status;
                var errorMesages = innerTestsResult.failureMessages;

                console.log('\x1b[33m%s\x1b[0m', '        Name: ' + testName);
                console.log('\x1b[33m%s\x1b[0m', '        Duration: ' + testDuration);

                if (errorMesages.length == 0)
                    console.log('\x1b[33m        Status: \x1b[0m\x1b[32m%s\x1b[0m', testStatus);
                else
                    console.log('\x1b[33m        Status: \x1b[0m\x1b[31m%s\x1b[0m', testStatus);

                if (errorMesages.length > 0) {
                    console.log('\x1b[33m%s\x1b[0m', '        Errors found:');

                    for (var k = 0; k < errorMesages.length; ++k) {
                        console.log('\x1b[33m            \x1b[31m%s\x1b[0m', errorMesages[i]);
                    }
                }
                console.log('\n');
            }
        }

        if (results.numFailedTests || results.numFailedTestSuites) {
            console.log('\x1b[31mTests Failed!\x1b[0m');
        } else {
            console.log('\x1b[32mTests Succeded!\x1b[0m');
        }
        console.log('\n');
        cb();
    });
}));

// Rerun the dev task when a file changes
gulp.task(TASKS.WATCH_DEV, function() {
    gulp.watch(PATHS.TS_SRC_DOMAIN, gulp.series(TASKS.BUILD_DEV));
    gulp.watch(PATHS.SASS_DOMAIN, gulp.series(TASKS.COMPILE_SASS))
});

// By default run all the tasks
gulp.task('default', gulp.parallel(TASKS.COMPILE_SASS, gulp.series(TASKS.BUILD_DEV, TASKS.BUILD_PROD)));