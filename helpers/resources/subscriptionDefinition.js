module.exports = class SubscriptionDefinition {
  /**
   * Constructor
   * 
   * @param {object} opts
   */
  constructor({ name }) {
    this.name = name
    this.subscriptions = []
  }

  /**
   * Add subscription
   * 
   * @param {string} opts
   */
  addSubscription({id, sourceArn, targetArn, subject}) {
    if (sourceArn === 'local') {
      sourceArn = 'GGShadowService'
    }
    if (targetArn === 'local') {
      targetArn = 'GGShadowService'
    }
    this.subscriptions.push({
      'Id': `${this.name}-${id}`,
      'Source': sourceArn,
      'Target': targetArn,
      'Subject': subject,
    })
  }

  /**
   * Generate CloudFormation JSON
   */
  toCloudFormationObject() {
    return {
      'Type': 'AWS::Greengrass::SubscriptionDefinition',
      'Properties': {
        'Name': this.name,
        'InitialVersion': {
          'Subscriptions': this.subscriptions
        }
      }
    }
  }
}
