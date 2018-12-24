##
<p align="center">
    <img src="./docs/assets/img/sora-big.svg" width="50%">
    <h3 align="center">Sora</h3>
    <p align="center">
        Highly customizable carousel.
        <br>
    </p>
</p>

## Status

![Build status](https://travis-ci.com/notaphplover/sora-js.svg?branch=master)

Just in alpha, so please don´t use it for now.

## Acknowledgements

We'd like to thank the following individuals and organizations who contribute to this project.

- Paula Ortega (<http://www.paula-ortega.es>) for designing awesome assets, like the header image of this document.

## First steps

The setup of this project is simple:

1. Install the npm dependencies of the project

```
npm i
```

2. Install the npm dependencies of the samples.

```
cd samples
npm i
```

## Build process

This library uses Gulp to perform the build task.

This task can be performed calling the task 'build' defined in the gulpfile.js of the project:

```
node ./node_modules/gulp/bin/gulp.js build
```

## Running tests

Tests can be run using the run task defined in the gulpfile of the project:

```
node ./node_modules/gulp/bin/gulp.js test
```

This library uses puppeteer to run tests and istambul.js to generate a coverage report. The report will be generated at the coverage folder of the project.
