module.exports = class Validator {
  /**
   * Constructor
   *
   * @param {object} serverless
   * @param {object} config
   * @param {object} logger
   */
  constructor (serverless, config, logger) {
    this.serverless = serverless
    this.config = config
    this.logger = logger
  }

  /**
   * Execute validation
   * 
   * @returns {boolean}
   */
  check () {
    if (!this.serverless || !this.serverless.service) {
      this.logger.debug('No service bootstrapped, skipping..')
      return false
    }
    if (this.serverless.service.getAllFunctions().length === 0) {
      this.logger.debug('No functions defined, skipping..')
      return false
    }
    if (!this.config.groupId){
      this.logger.debug('No Group ID defined, skipping..')
      return false
    }
    return true
  }
}
