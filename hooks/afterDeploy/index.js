const commands = require('../../commands')

module.exports = {
  /**
   * Execute hook
   */
  async execute () {
    if (this.serverless.service.getAllFunctions().length === 0) {
      return
    }
    if (this.config.autoDeploy === false) {
      this.logger.warn('Auto deploy disabled, run "sls deploy greengrass" at the end of deploy.')
      return
    }

    // Execute deploy command
    await commands.deploy.controller.execute()
  }
}
