const GreengrassGroup = require('../../helpers/greengrassGroup')
const GroupVersion = require('../../helpers/resources/groupVersion')
const FunctionDefinition = require('../../helpers/resources/functionDefinition')

module.exports = {
  /**
   * Execute hook
   */
  async execute () {
    // Init properties
    this.cloudFormationTemplate = this.serverless.service.provider.compiledCloudFormationTemplate    

    // Create functions definition for core
    const functionDefinition = new FunctionDefinition({
      name: `${this.service.service}-${this.providerConfig.stage}-${this.config.coreName}`
    })

    // Add all functions
    const accountInfo = await this.provider.getAccountInfo()
    const defaultConfig = this.config.defaults || {}
    this.serverless.service.getAllFunctions().forEach(functionName => {
      const functionObject = this.serverless.service.getFunction(functionName)
      const greengrassConfig = functionObject.greengrass || {}

      // Add function
      functionDefinition.addFunction({
        id: functionName,
        functionArn: `arn:${accountInfo.partition}:lambda:${this.service.provider.region}:${accountInfo.accountId}:function:${functionObject.name}`,
        pinned: greengrassConfig.pinned || defaultConfig.pinned,
        executable: greengrassConfig.handler || functionObject.handler,
        memorySize: greengrassConfig.memory || defaultConfig.memory || functionObject.memory,
        timeout: greengrassConfig.timeout || defaultConfig.timeout || functionObject.timeout,
        encodingType: greengrassConfig.encodingType || defaultConfig.encodingType,
        environment: Object.assign(
          greengrassConfig.environment || {},
          defaultConfig.environment || {},
          functionObject.environment || {}
        ),
        accessSysfs: greengrassConfig.accessSysfs || defaultConfig.accessSysfs,
      })
    })

    // Add Greengrass Function Definition to CloudFormation template
    this.cloudFormationTemplate.Resources['GreengrassFunctionDefinition' + this.config.coreName ] = functionDefinition.toCloudFormationObject()

    // Get current definition version
    const greengrassGroup = new GreengrassGroup({ provider: this.provider, groupId: this.config.groupId })
    const currentDefinition = await greengrassGroup.getCurrentDefinition()

    // Create new definition versions (updating only function definition version AN)
    const groupVersion = new GroupVersion({
      ...currentDefinition,
      groupId: this.config.groupId,
      functionDefinitionVersionArn: {
        Ref: 'GreengrassFunctionDefinition' + this.config.coreName
      },
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
