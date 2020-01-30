const GreengrassGroup = require('../../helpers/greengrassGroup')
const GroupVersion = require('../../helpers/resources/groupVersion')
const FunctionDefinition = require('../../helpers/resources/functionDefinition')
const SubscriptionDefinition = require('../../helpers/resources/subscriptionDefinition')

module.exports = {
  /**
   * Execute hook
   */
  async execute () {
    if (this.validator.check() === false) {
      return
    }

    // Init properties
    this.cloudFormationTemplate = this.serverless.service.provider.compiledCloudFormationTemplate

    // Create functions and subscription definition for core
    const providerConfig = this.providerConfig || {}
    const functionDefinition = new FunctionDefinition({
      name: `${this.service.service}-${providerConfig.stage}`
    })
    const subscriptionDefinition = new SubscriptionDefinition({
      name: `${this.service.service}-${providerConfig.stage}`
    })

    // Add global subscriptions
    if (this.config.subscriptions && Array.isArray(this.config.subscriptions)) {
      this.config.subscriptions.forEach((subscription, index) => {
        this.logger.log('Adding global subscriptions...')
        subscriptionDefinition.addSubscription({
          id: this.config.groupId+index,
          sourceArn: subscription.source, 
          targetArn: subscription.target, 
          subject: subscription.subject
        })
      })
    }

    // Add all functions
    const defaultConfig = this.config.defaults || {}
    this.logger.log('Loading functions...')
    this.serverless.service.getAllFunctions().forEach(functionName => {
      // Load function data
      const functionObject = this.serverless.service.getFunction(functionName)
      const functionArn = {
        'Fn::Join': [
          ':',
          [
            { 'Fn::GetAtt': [this.provider.naming.getLambdaLogicalId(functionName), 'Arn'] },
            { 'Fn::GetAtt': [functionObject.versionLogicalId, 'Version'] }
          ]
        ]
      }
      const greengrassConfig = functionObject.greengrass || {}

      // Include functions
      if (this.config.includes && Array.isArray(this.config.includes) && this.config.includes.includes(functionName) === false) {
        this.logger.log(`Function ${functionName} excluded by include`)
        return
      }

      // Exclude functions
      if (this.config.exclude && Array.isArray(this.config.exclude) && this.config.exclude.includes(functionName) === true) {
        this.logger.log(`Function ${functionName} excluded by exclude`)
        return
      }

      // Add subscription
      if (greengrassConfig.subscriptions && Array.isArray(greengrassConfig.subscriptions)) {
        greengrassConfig.subscriptions.forEach((subscription, index) => {
          if (!subscription.target) {
            subscription.target = functionArn
          } else if (!subscription.source) {
            subscription.source = functionArn
          }
          subscriptionDefinition.addSubscription({
            id: functionName+index,
            sourceArn: subscription.source, 
            targetArn: subscription.target, 
            subject: subscription.subject
          })
        })
      }

      // Add function
      let memorySize = greengrassConfig.memorySize || defaultConfig.memorySize || (functionObject.memory * 1024)
      if (memorySize < 2048) {
        this.logger.warn(`Function ${functionName} has an invalid memorySize value (${memorySize}), must be expressed in KB and greater or equal to 2048 (2MB)`)
        memorySize = null // empty variable, will use default value
      }
      functionDefinition.addFunction({
        id: functionName,
        functionArn,
        pinned: greengrassConfig.pinned || defaultConfig.pinned,
        executable: greengrassConfig.handler || functionObject.handler,
        memorySize,
        timeout: greengrassConfig.timeout || defaultConfig.timeout || functionObject.timeout,
        encodingType: greengrassConfig.encodingType || defaultConfig.encodingType,
        environment: Object.assign(
          greengrassConfig.environment || {},
          defaultConfig.environment || {}
        ),
        accessSysfs: greengrassConfig.accessSysfs || defaultConfig.accessSysfs,
        resources: [...(defaultConfig.resources || []), ...(greengrassConfig.resources || [])]
      })
    })

    // Add Greengrass Function Definition to CloudFormation template
    this.cloudFormationTemplate.Resources['GreengrassFunctionDefinition'] = functionDefinition.toCloudFormationObject()
    this.logger.log('Creating new Function Definition Version...')

    // Add Greengrass Subscription Definition to CloudFormation template
    this.cloudFormationTemplate.Resources['GreengrassSubscriptionDefinition'] = subscriptionDefinition.toCloudFormationObject()
    this.logger.log('Creating new Subscription Definition Version...')

    // Get current definition version
    const greengrassGroup = new GreengrassGroup({ provider: this.provider, groupId: this.config.groupId, logger: this.logger })
    const currentDefinition = await greengrassGroup.getCurrentDefinition()

    // Create new definition versions (updating only function definition version ARN and subscriptions)
    this.logger.log('Creating new Group Version...')
    const groupVersion = new GroupVersion({
      ...currentDefinition,
      groupId: this.config.groupId,
      functionDefinitionVersionArn: {
        'Fn::GetAtt': ['GreengrassFunctionDefinition', 'LatestVersionArn']
      },
      subscriptionDefinitionVersionArn: {
        'Fn::GetAtt': ['GreengrassSubscriptionDefinition', 'LatestVersionArn']
      }
    })
    this.cloudFormationTemplate.Resources['GreengrassGroupVersion'] = groupVersion.toCloudFormationObject()
    this.cloudFormationTemplate.Outputs['GreengrassGroupVersionArn'] = {
      'Description': 'Greengrass Group Version ARN',
      'Value': {
        'Ref': 'GreengrassGroupVersion'
      }
    }
  }
}
