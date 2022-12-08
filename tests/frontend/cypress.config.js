const { defineConfig } = require('cypress')

module.exports = defineConfig({
  defaultCommandTimeout: 60000,
  pageLoadTimeout: 60000,
  viewportHeight: 900,
  viewportWidth: 1400,
  watchForFileChanges: false,
  chromeWebSecurity: false,
  trashAssetsBeforeRuns: true,
  video: false,
  e2e: {
    setupNodeEvents() {
      // implement node event listeners here
    }
  },
  reporter: 'junit',
  reporterOptions: {
    mochaFile: 'results/results-[hash].xml'
  },
})