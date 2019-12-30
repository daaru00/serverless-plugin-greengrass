module.exports = class CloudFormationStack {
  /**
   * Constructor
   *
   * @param {object} opts
   */
  constructor({ provider, logger }) {
    this.provider = provider
    this.logger = logger
  }

  /**
   * Get stack outputs
   * 
   * @param {string} key
   * @returns {string|bool}
   */
  async getOutputValue (key) {
    let response
    const stackName = this.provider.naming.getStackName()
    try {
      response = await this.provider.request(
        'CloudFormation',
        'describeStacks',
        { StackName: stackName }
      )  
    }catch(exception){
      if (this.logger) this.logger.debug(exception.message)
      return false
    }
    
    if (response.Stacks.length === 0) {
      if (this.logger) this.logger.debug(`Stack ${stackName} not found`)
      return false
    }

    const stack = response.Stacks[0]
    if (stack !== undefined) {
      const output = stack.Outputs.find((output) => output.OutputKey === key)
      if (output !== undefined) {
        return output.OutputValue
      }
    }
    if (this.logger) this.logger.debug(`Output ${key} not found in Stack ${stackName}`)
    return false
  }
}
