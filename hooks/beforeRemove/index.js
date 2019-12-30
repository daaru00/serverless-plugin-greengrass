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
      this.logger.warn('Auto deploy disabled, run "serverless greengrass reset" at the end of remove')
      return
    }

    // Execute reset command
    this.logger.debug('Triggering reset command..')
    await commands.reset.controller.execute.apply(this)
  }
}
