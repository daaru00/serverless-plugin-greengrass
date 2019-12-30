module.exports = class Logger {
  /**
   * Constructor
   *
   * @param {object} serverless
   * @param {string} serviceName
   */
  constructor (serverless, serviceName) {
    this.serverless = serverless
    this.serviceName = serviceName || 'Greengrass'
    this.debugEnabled = process.env.DEBUG === 'yes'
  }

  /**
   * Log message
   *
   * @param {string} msg
   */
  log (msg, opts) {
    this.serverless.cli.log(msg, this.serviceName, {
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

  /**
   * Show progress
   */
  progress () {
    if (this.debugEnabled === true) return
    
    process.stdout.write('.')
  }

  /**
   * Print newline
   */
  newLine () {
    if (this.debugEnabled === true) return
    
    this.serverless.cli.consoleLog('')
  }
}
