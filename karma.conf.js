module.exports = function(config) {
    config.set({

        // base path, that will be used to resolve files and exclude
        basePath: '',

        // frameworks to use
        frameworks: ['jasmine'],

        // list of files / patterns to load in the browser
        files: [
            'refs/angular.js',
            'refs/angular-mocks.js',
            'src/services.js',
            'src/match.js',
            'src/tournament.js',
            'test/*.js',
            'partials/*.html'
        ],

        // list of files to exclude
        exclude: [],

        // test results reporter to use
        reporters: ['progress'],

        // web server port
        port: 9999,

        // enable / disable colors in the output (reporters and logs)
        colors: true,

        // level of logging
        logLevel: config.LOG_INFO,

        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: false,

        // Start these browsers
        browsers: ['PhantomJS'],

        plugins: ['karma-jasmine', 'karma-phantomjs-launcher', 'karma-ng-html2js-preprocessor'],

        // If browser does not capture in given timeout [ms], kill it
        captureTimeout: 60000,

        // Continuous Integration mode
        // if true, it capture browsers, run tests and exit
        singleRun: true,

        preprocessors: {
            "partials/*.html": "ng-html2js"
        },

        ngHtml2JsPreprocessor: {
            // If your build process changes the path to your templates,
            // use stripPrefix and prependPrefix to adjust it.
            // stripPrefix: "source/path/to/templates/.*/",
            // prependPrefix: "web/path/to/templates/",

            // the name of the Angular module to create
            moduleName: "templates"
        }

    });
};
