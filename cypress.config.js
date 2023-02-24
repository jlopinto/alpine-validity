import { defineConfig } from 'cypress'
import vitePreprocessor from 'cypress-vite'

export default defineConfig({
  downloadsFolder: 'tests/cypress/downloads',
  fixturesFolder: 'tests/cypress/fixtures',
  screenshotsFolder: 'tests/cypress/screenshots',
  videosFolder: 'tests/cypress/videos',
  e2e: {
    supportFile: 'tests/cypress/support/e2e.js',
    specPattern: 'tests/cypress/e2e',
    setupNodeEvents (on) {
      on('before:browser:launch', (browser, launchOptions) => {
        if (browser.name === 'chrome') {
          launchOptions.env.LANGUAGE = 'en-US'

          return launchOptions
        }
      })
      on('file:preprocessor', vitePreprocessor('./vite.config.js'))
    },
    video: false
  }
})
