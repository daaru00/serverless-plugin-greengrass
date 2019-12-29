module.exports = class CloudFormationStack {
  /**
   * Constructor
   *
   * @param {object} opts
   */
  constructor({ provider }) {
    this.provider = provider
  }

  /**
   * Get stack outputs
   * 
   * @returns {string|bool}
   */
  async getOutputValue ({ key }) {
    let response
    try {
      response = await this.provider.request(
        'CloudFormation',
        'describeStacks',
        { StackName: this.provider.naming.getStackName() }
      )  
    }catch(exception){
      return false
    }
    
    if (response.Stacks.length === 0) {
      return false
    }

    const stack = response.Stacks[0]
    if (stack !== undefined) {
      const output = stack.Outputs.find((output) => output.OutputKey === key)
      if (output !== undefined) {
        return output.OutputValue
      }
    }

    return false
  }
}
