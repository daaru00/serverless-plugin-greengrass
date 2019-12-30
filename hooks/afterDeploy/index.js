const commands = require('../../commands')

module.exports = {
  /**
   * Execute hook
   */
  async execute () {
    if (this.validator.check() === false) {
      return
    }
    if (this.config.autoDeploy === false) {
      this.logger.warn('Auto deploy disabled, run "serverless greengrass deploy" at the end of deploy')
      return
    }

    // Execute deploy command
    this.logger.debug('Triggering deploy command..')
    await commands.deploy.controller.execute.apply(this)
  }
}
