import { defineConfig } from "cypress";
import registerCodeCoverageTasks from '@cypress/code-coverage/task'

export default defineConfig({
  allowCypressEnv: false,

  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
      registerCodeCoverageTasks(on, config)
      // It's IMPORTANT to return the config object
      // with any changed environment variables
      return config
    },
    baseUrl: "http://localhost:3000/"
  }
});

