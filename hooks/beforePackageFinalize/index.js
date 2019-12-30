const GreengrassGroup = require('../../helpers/greengrassGroup')
const GroupVersion = require('../../helpers/resources/groupVersion')
const FunctionDefinition = require('../../helpers/resources/functionDefinition')

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

    // Create functions definition for core
    const providerConfig = this.providerConfig || {}
    const functionDefinition = new FunctionDefinition({
      name: `${this.service.service}-${providerConfig.stage}`
    })

    // Add all functions
    const defaultConfig = this.config.defaults || {}

    this.logger.log('Loading functions...')
    this.serverless.service.getAllFunctions().forEach(functionName => {
      const functionObject = this.serverless.service.getFunction(functionName)
      const greengrassConfig = functionObject.greengrass || {}

      // Include functions
      if (this.config.includes && Array.isArray(this.config.includes) && this.config.includes.includes(functionName) === false ) {
        this.logger.log(`Function ${functionName} excluded by include`)
        return
      }
      
      // Exclude functions
      if (this.config.exclude && Array.isArray(this.config.exclude) && this.config.exclude.includes(functionName) === true ) {
        this.logger.log(`Function ${functionName} excluded by exclude`)
        return
      }

      // Add function
      functionDefinition.addFunction({
        id: functionName,
        functionArn: {
          'Fn::Join': [
            ':',
            [
              {'Fn::GetAtt': [ this.provider.naming.getLambdaLogicalId(functionName), 'Arn' ]},
              {'Fn::GetAtt': [ functionObject.versionLogicalId, 'Version' ]}
            ]
          ]
        },
        pinned: greengrassConfig.pinned || defaultConfig.pinned,
        executable: greengrassConfig.handler || functionObject.handler,
        memorySize: greengrassConfig.memorySize || defaultConfig.memorySize || functionObject.memory,
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

    // Get current definition version
    const greengrassGroup = new GreengrassGroup({ provider: this.provider, groupId: this.config.groupId, logger: this.logger })
    const currentDefinition = await greengrassGroup.getCurrentDefinition()

    // Create new definition versions (updating only function definition version ARN)
    this.logger.log('Creating new Group Version...')
    const groupVersion = new GroupVersion({
      ...currentDefinition,
      groupId: this.config.groupId,
      functionDefinitionVersionArn: {
        'Fn::GetAtt': [ 'GreengrassFunctionDefinition', 'LatestVersionArn' ]
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
