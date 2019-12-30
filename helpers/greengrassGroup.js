// Sleep helper
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms || 1000))

module.exports = class GreengrassGroup {
  /**
   * Constructor
   *
   * @param {object} opts
   */
  constructor({ provider, logger, groupId }) {
    this.provider = provider
    this.logger = logger
    this.groupId = groupId
  }

  /**
   * Retrieves current definition version ID
   * 
   * @returns {string}
   */
  async getCurrentVersionId() {
    if (this.currentVersionId) {
      return this.currentVersionId
    }
    const response = await this.provider.request('Greengrass', 'getGroup', {
      GroupId: this.groupId
    })
    this.currentVersionId = response.LatestVersion
    if (this.logger) this.logger.debug(`Version ID ${this.currentVersionId} loaded`)
    return this.currentVersionId
  }

  /**
   * Retrieves current definition version details
   * 
   * @returns {string}
   */
  async getCurrentVersionDetails() {
    if (!this.currentVersionId) {
      await this.getCurrentVersionId()
    }
    if (this.currentVersionDetails) {
      return this.currentVersionDetails
    }
    const responseDetails = await this.provider.request('Greengrass', 'getGroupVersion', {
      GroupId: this.groupId,
      GroupVersionId: this.currentVersionId
    })
    this.currentVersionDetails = responseDetails
    if (this.logger) this.logger.debug('Version details loaded')
    return this.currentVersionDetails
  }

  /**
   * Retrieves current definition version ARN
   * 
   * @returns {string}
   */
  async getCurrentVersionArn() {
    if (!this.currentVersionDetails) {
      await this.getCurrentVersionDetails()
    }
    if (this.logger) this.logger.debug('Version ARN loaded')
    return this.currentVersionDetails.Arn
  }

  /**
   * Retrieves current definition
   * 
   * @returns {object}
   */
  async getCurrentDefinition() {
    if (!this.currentVersionDetails) {
      await this.getCurrentVersionDetails()
    }
    const currentDefinition = this.currentVersionDetails.Definition
    if (this.logger) this.logger.debug('Current definition loaded')
    return {
      connectorDefinitionVersionArn: currentDefinition.ConnectorDefinitionVersionArn,
      coreDefinitionVersionArn: currentDefinition.CoreDefinitionVersionArn,
      deviceDefinitionVersionArn: currentDefinition.DeviceDefinitionVersionArn,
      functionDefinitionVersionArn: currentDefinition.FunctionDefinitionVersionArn,
      loggerDefinitionVersionArn: currentDefinition.LoggerDefinitionVersionArn,
      resourceDefinitionVersionArn: currentDefinition.ResourceDefinitionVersionArn,
      subscriptionDefinitionVersionArn: currentDefinition.SubscriptionDefinitionVersionArn,
    }
  }

  /**
   * List recent deployments
   * 
   * @returns {array}
   */
  async listDeployments() {
    if (this.deployments) {
      return this.deployments
    }
    const response = await this.provider.request('Greengrass', 'listDeployments', {
      GroupId: this.groupId
    })
    this.deployments = response.Deployments
    if (this.logger) this.logger.debug(`${this.deployments.length} deployments loaded`)
    return this.deployments
  }

  /**
   * List recent deployments
   * 
   * @returns {object}
   */
  async getLatestDeploy() {
    if (this.latestDeploy) {
      return this.latestDeploy
    }
    if (!this.deployments) {
      await this.listDeployments()
    }
    if (this.deployments.length === 0) {
      return false
    }
    this.latestDeploy = this.deployments[0]
    if (this.logger) this.logger.debug(`Latest deploy ${this.latestDeploy.DeploymentId} loaded`)
    return {
      id: this.latestDeploy.DeploymentId
    }
  }

  /**
   * Create new deployment
   * 
   * @param {*} versionId 
   */
  async createDeployment(versionId) {
    const response = await this.provider.request('Greengrass', 'createDeployment', {
      DeploymentType: 'NewDeployment',
      GroupId: this.groupId,
      GroupVersionId: versionId
    })
    this.currentDeployment = {
      id: response.DeploymentId,
      arn: response.DeploymentArn
    }
    if (this.logger) this.logger.debug(`Created deploy with id ${response.DeploymentId}`)
    return this.currentDeployment
  }

  /**
   * Execute redeploy
   * 
   * @param {*} deploymentId 
   */
  async executeRedeploy(deploymentId) {
    const response = await this.provider.request('Greengrass', 'createDeployment', {
      DeploymentType: 'Redeployment',
      GroupId: this.groupId,
      DeploymentId: deploymentId
    })
    this.currentDeployment = {
      id: response.DeploymentId,
      arn: response.DeploymentArn
    }
    if (this.logger) this.logger.debug(`Created re-deploy with id ${response.DeploymentId}`)
    return this.currentDeployment
  }

  /**
   * Start deploy
   * 
   * @returns {string} 'InProgress', 'Building', 'Success', or 'Failure'
   */
  async getDeployStatus() {
    const deployment = await this.provider.request('Greengrass', 'getDeploymentStatus', {
      DeploymentId: this.currentDeployment.id,
      GroupId: this.groupId
    })
    if (this.logger) this.logger.debug(`Deploy ${this.currentDeployment.id} is in status ${deployment.DeploymentStatus}`)
    return deployment.DeploymentStatus
  }

  /**
   * Wait until deploy is successfully completed
   * 
   * @param {number} timeout default 30
   */
  async waitUntilDeployComplete(timeout) {
    timeout = timeout || 30
    let currentStatus = null
    for (let wait = 0; wait < timeout; wait++) {
      await sleep()
      if (this.logger) this.logger.progress()
      currentStatus = await this.getDeployStatus()
      if (currentStatus === 'Failure') {
        if (this.logger) this.logger.newLine()
        return false
      }
      if (currentStatus === 'Success') {
        if (this.logger) this.logger.newLine()
        return true
      }
    }
    if (this.logger) this.logger.newLine()
    return false
  }

  /**
   * Get deploy error
   * 
   * @param {string}
   */
  async getDeployError() {
    const deployment = await this.provider.request('Greengrass', 'getDeploymentStatus', {
      DeploymentId: this.currentDeployment.id,
      GroupId: this.groupId
    })

    // Check for message error
    if (deployment.ErrorMessage) {
      return deployment.ErrorMessage
    }

    // Check for error details
    const details = deployment.ErrorDetails
    if (details && details.DetailedErrorMessage) {
      return details.DetailedErrorMessage
    }
    if (details && details.DetailedErrorCode) {
      return details.DetailedErrorCode
    }

    // No error found
    return false
  }

  /**
   * Reset deployments
   */
  async resetDeployment() {
    const response = await this.provider.request('Greengrass', 'createDeployment', {
      DeploymentType: 'ForceResetDeployment',
      GroupId: this.groupId
    })
    this.currentDeployment = {
      id: response.DeploymentId,
      arn: response.DeploymentArn
    }
    return this.currentDeployment
  }

}
