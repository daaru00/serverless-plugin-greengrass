const GreengrassGroup = require('../../helpers/greengrassGroup')

class Controller {
  /**
   * Constructor
   */
  constructor() {
    this.description = {
      usage: 'Redeploy Greengrass deployment.',
      lifecycleEvents: [
        'execute'
      ]
    }
  }

  /**
     * Execute hook
     */
  async execute () {
    if (this.serverless.service.getAllFunctions().length === 0) {
      return
    }

    // Load latest deployments
    const greengrassGroup = new GreengrassGroup({ provider: this.provider, groupId: this.config.groupId })
    const latestDeploy = await greengrassGroup.getLatestDeploy()
    if (!latestDeploy) {
      this.logger.warn('No deployment found for Greengrass Group, re-deploy aborted.')
      return
    }

    // Execute redeploy
    this.logger.log(`Execute redeployment for deploy ${latestDeploy.id}...`)
    await greengrassGroup.executeRedeploy(latestDeploy.id)

    // Wait until deploy ends
    const success = await greengrassGroup.waitDeployComplete()
    if (success === false) {
      const error = await greengrassGroup.getDeployError()
      if (error === false) {
        this.logger.error('Deploy timeout')
      } else {
        this.logger.error('Deploy error: ' + error)
      }
      return
    }

    this.logger.log(`Redeploy of deploy ${latestDeploy.id} successfully executed!`)
  }
}

module.exports = new Controller()
