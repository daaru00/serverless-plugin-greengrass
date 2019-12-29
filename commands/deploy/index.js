const CloudFormationStack = require('../../helpers/cloudFormationStack')
const GreengrassGroup = require('../../helpers/greengrassGroup')

class Controller {
  /**
   * Constructor
   */
  constructor() {
    this.description = {
      usage: 'Deploy new Greengrass function version.',
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

    // Get deployed Group Version's Arn
    const stack = new CloudFormationStack({ provider: this.provider })
    const deployedGroupVersionArn = await stack.getOutputValue('GreengrassGroupVersionArn')
    if (deployedGroupVersionArn === false) {
      this.logger.warn('Something goes wrong during Greengrass Group Version creation, cannot find ARN from CloudFormation Stack, deploy aborted.')
      return
    }
    const greengrassGroup = new GreengrassGroup({ provider: this.provider, groupId: this.config.groupId, logger: this.logger })

    // Check for version mismatch
    const currentGreoupVersionArn = await greengrassGroup.getCurrentVersionArn()
    if (currentGreoupVersionArn !== deployedGroupVersionArn) {
      this.logger.warn('Latest Greengrass Group Version and deploy version from CloudFormation Stack did not match, deploy aborted.')
      return
    }

    // Create new deployment
    const versionToDeploy = await greengrassGroup.getCurrentVersionId()
    this.logger.log(`Creating new deployment for version ${versionToDeploy.id}...`)
    await greengrassGroup.createDeployment(versionToDeploy.id)

    // Wait until deploy ends
    this.logger.log(`Checking deploy ${versionToDeploy.id} progress...`)
    const success = await greengrassGroup.waitUntilDeployComplete()
    if (success === false) {
      const error = await greengrassGroup.getDeployError()
      if (error === false) {
        this.logger.error('Deploy timeout')
      } else {
        this.logger.error('Deploy error: ' + error)
      }
      return
    }
  }
}

module.exports = new Controller()
