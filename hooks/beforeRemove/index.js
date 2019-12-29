const commands = require('../../commands')

module.exports = {
  /**
   * Execute hook
   */
  async execute () {
    if (this.serverless.service.getAllFunctions().length === 0) {
      return
    }

    // Execute reset command
    await commands.reset.controller.execute()
  }
}
