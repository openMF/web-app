// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

process.env.CHROME_BIN = require('puppeteer').executablePath();
const path = require('path');

module.exports = function(config) {
  config.set({
    basePath: '..',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-junit-reporter'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage-istanbul-reporter'),
      require('@angular-devkit/build-angular/plugins/karma')
    ],
    client: {
      clearContext: true, // leave Jasmine Spec Runner output visible in browser
      captureConsole: Boolean(process.env.KARMA_ENABLE_CONSOLE)
    },
    junitReporter: {
      outputDir: path.join(__dirname, '../reports/junit/'),
      outputFile: 'TESTS-xunit.xml',
      useBrowserName: false,
      suite: '' // Will become the package name attribute in xml testsuite element
    },
    jasmineHtmlReporter: {
      suppressAll: true, // Suppress all messages (overrides other suppress settings)
      suppressFailed: true // Suppress failed messages
    },
    coverageIstanbulReporter: {
      reports: ['html', 'lcovonly', 'text-summary'],
      dir: path.join(__dirname, '../reports/coverage'),
      fixWebpackSourcePaths: true
    },
    angularCli: {
      environment: 'dev'
    },
    // Specify 'junit' for report results in junit XML format.
    // Specify 'coverage-istanbul' for code coverage report.
    reporters: ['progress', 'kjhtml'], 
    port: 9876,
    colors: true,
    // Level of logging, can be: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['ChromeHeadless'],
    singleRun: false
  });
};
