module.exports = class Logger {
  /**
   * Constructor
   *
   * @param {object} sls
   * @param {string} serviceName
   */
  constructor (sls, serviceName) {
    this.sls = sls
    this.serviceName = serviceName || 'Greengrass'
    this.debugEnabled = process.env.DEBUG === 'yes'
  }

  /**
   * Log message
   *
   * @param {string} msg
   */
  log (msg, opts) {
    this.sls.cli.log(msg, this.serviceName, {
      color: 'yellow',
      bold: false,
      ...opts
    })
  }

  /**
   * Debug message
   *
   * @param {string} msg
   */
  debug (msg) {
    if (this.debugEnabled !== true) return

    this.log(msg, {
      bold: false,
      color: 'white'
    })
  }

  /**
   * Warn message
   *
   * @param {string} msg
   */
  warn (msg) {
    this.log(msg, {
      bold: true,
      color: 'orange'
    })
  }

  /**
   * Error message
   *
   * @param {string} msg
   */
  error (msg) {
    this.log(msg, {
      bold: true,
      color: 'red'
    })
  }
}
