window.customJasmineBoot = (function() {

    /**
     * ## Require &amp; Instantiate
     *
     * Require Jasmine's core files. Specifically, this requires and attaches all of Jasmine's code to the `jasmine` reference.
     */
    window.jasmine = jasmineRequire.core(jasmineRequire);

    /**
     * Since this is being run in a browser and the results should populate to an HTML page, require the HTML-specific Jasmine code, injecting the same reference.
     */
    jasmineRequire.html(jasmine);

    /**
     * Create the Jasmine environment. This is used to run all specs in a project.
     */
    var env = jasmine.getEnv();

    /**
     * ## The Global Interface
     *
     * Build up the functions that will be exposed as the Jasmine public interface. A project can customize, rename or alias any of these functions as desired, provided the implementation remains unchanged.
     */
    var jasmineInterface = jasmineRequire.interface(jasmine, env);

    /**
     * Add all of the Jasmine global/public interface to the global scope, so a project can use the public interface directly. For example, calling `describe` in specs instead of `jasmine.getEnv().describe`.
     */
    extend(window, jasmineInterface);

    /**
     * ## Runner Parameters
     *
     * More browser specific code - wrap the query string in an object and to allow for getting/setting parameters from the runner user interface.
     */

    var queryString = new jasmine.QueryString({
        getWindowLocation: function() { return window.location; }
    });

    var filterSpecs = !!queryString.getParam("spec");

    var stoppingOnSpecFailure = queryString.getParam("failFast");
    env.stopOnSpecFailure(stoppingOnSpecFailure);

    var throwingExpectationFailures = queryString.getParam("throwFailures");
    env.throwOnExpectationFailure(throwingExpectationFailures);

    var random = queryString.getParam("random");

    if (random !== undefined && random !== "") {
      env.randomizeTests(random);
    }

    var seed = queryString.getParam("seed");
    if (seed) {
      env.seed(seed);
    }

    /**
     * ## Reporters
     * The `HtmlReporter` builds all of the HTML UI for the runner page. This reporter paints the dots, stars, and x's for specs, as well as all spec names and all failures (if any).
     */
    var htmlReporter = new jasmine.HtmlReporter({
      env: env,
      navigateWithNewParam: function(key, value) { return queryString.navigateWithNewParam(key, value); },
      addToExistingQueryString: function(key, value) { return queryString.fullStringWithNewParam(key, value); },
      getContainer: function() { return document.body; },
      createElement: function() { return document.createElement.apply(document, arguments); },
      createTextNode: function() { return document.createTextNode.apply(document, arguments); },
      timer: new jasmine.Timer(),
      filterSpecs: filterSpecs
    });

    /**
     * The `jsApiReporter` also receives spec results, and is used by any environment that needs to extract the results  from JavaScript.
     */
    env.addReporter(jasmineInterface.jsApiReporter);
    env.addReporter(htmlReporter);

    /**
     * Filter which specs will be run by matching the start of the full name against the `spec` query param.
     */
    var specFilter = new jasmine.HtmlSpecFilter({
      filterString: function() { return queryString.getParam("spec"); }
    });

    env.specFilter = function(spec) {
      return specFilter.matches(spec.getFullName());
    };

    /**
     * Setting up timing functions to be able to be overridden. Certain browsers (Safari, IE 8, phantomjs) require this hack.
     */
    window.setTimeout = window.setTimeout;
    window.setInterval = window.setInterval;
    window.clearTimeout = window.clearTimeout;
    window.clearInterval = window.clearInterval;

    /**
     * Initialize the HTML reporter and run all the test declared.
     */
    function initialize() {
        var oldJasmineDone = htmlReporter.jasmineDone;
        var donePromise = new Promise(function(resolve, reject) {
            htmlReporter.jasmineDone = function(doneResult) {
                oldJasmineDone(doneResult);
                resolve();
            };
        });
        htmlReporter.initialize();
        env.execute();
        return donePromise;
    }

    /**
     * Helper function for readability above.
     */
    function extend(destination, source) {
      for (var property in source) destination[property] = source[property];
      return destination;
    }

    return {
        initialize : initialize,
    };
}());