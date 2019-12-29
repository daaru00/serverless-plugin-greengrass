module.exports = class GroupVersion {
  /**
   * Constructor
   * 
   * @param {object} opts
   */
  constructor({ 
    groupId, 
    connectorDefinitionVersionArn,
    coreDefinitionVersionArn,
    deviceDefinitionVersionArn,
    functionDefinitionVersionArn,
    loggerDefinitionVersionArn,
    resourceDefinitionVersionArn,
    subscriptionDefinitionVersionArn
  }) {
    this.groupId = groupId
    this.connectorDefinitionVersionArn = connectorDefinitionVersionArn
    this.coreDefinitionVersionArn = coreDefinitionVersionArn
    this.deviceDefinitionVersionArn = deviceDefinitionVersionArn
    this.functionDefinitionVersionArn = functionDefinitionVersionArn
    this.loggerDefinitionVersionArn = loggerDefinitionVersionArn
    this.resourceDefinitionVersionArn = resourceDefinitionVersionArn
    this.subscriptionDefinitionVersionArn = subscriptionDefinitionVersionArn
  }

  /**
   * Generate CloudFormation JSON
   */
  toCloudFormationObject() {
    return {
      'Type': 'AWS::Greengrass::GroupVersion',
      'Properties': {
        'GroupId': this.groupId,
        'ConnectorDefinitionVersionArn': this.connectorDefinitionVersionArn,
        'CoreDefinitionVersionArn': this.coreDefinitionVersionArn,
        'DeviceDefinitionVersionArn': this.deviceDefinitionVersionArn,
        'FunctionDefinitionVersionArn': this.functionDefinitionVersionArn,
        'LoggerDefinitionVersionArn': this.loggerDefinitionVersionArn,
        'ResourceDefinitionVersionArn': this.resourceDefinitionVersionArn,
        'SubscriptionDefinitionVersionArn': this.subscriptionDefinitionVersionArn,
      }
    }
  }
}
