const GreengrassGroup = require('../../helpers/greengrassGroup')

class Controller {
  /**
   * Constructor
   */
  constructor() {
    this.description = {
      usage: 'Reset Greengrass deployments.',
      lifecycleEvents: [
        'execute'
      ]
    }
  }

  /**
     * Execute hook
     */
  async execute () {
    if (this.validator.check() === false) {
      return
    }

    // Load latest deployments
    const greengrassGroup = new GreengrassGroup({ provider: this.provider, groupId: this.config.groupId, logger: this.logger })

    // Execute reset
    this.logger.log(`Execute reset for group id ${this.config.groupId}...`)
    await greengrassGroup.resetDeployment()

    // Wait until deploy ends
    this.logger.log('Checking reset progress...')
    const success = await greengrassGroup.waitUntilDeployComplete(this.config.deployTimeout)
    if (success === false) {
      const error = await greengrassGroup.getDeployError()
      if (error === false) {
        this.logger.error('Deploy timeout')
      } else {
        this.logger.error('Deploy error: ' + error)
      }
      return
    }

    this.logger.log('Reset successfully executed.')
  }
}

module.exports = new Controller()
