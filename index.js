const _ = require('lodash')
const hooks = require('./hooks')
const commands = require('./commands')
const Logger = require('./helpers/logger')
const Validator = require('./helpers/validator')

class ServerlessPlugin {
  constructor (serverless, options) {
    this.serverless = serverless
    this.options = options
    this.provider = this.serverless.getProvider('aws')
    this.config = _.get(this.serverless.service, 'custom.greengrass', {})
    this.providerConfig = this.serverless.service.provider
    this.service = this.serverless.service
    this.logger = new Logger(this.serverless)
    this.validator = new Validator(this.serverless, this.config, this.logger)
    
    this.commands = {
      greengrass: {
        commands: {
          deploy: commands.deploy.command,
          redeploy: commands.redeploy.command,
          reset: commands.reset.command,
        }
      }
    }

    this.hooks = {
      'before:package:finalize': hooks.beforePackageFinalize.execute.bind(this),
      'after:deploy:deploy': hooks.afterDeploy.execute.bind(this),
      'before:remove:remove': hooks.beforeRemove.execute.bind(this),

      'greengrass:deploy:execute': commands.deploy.controller.execute.bind(this),
      'greengrass:redeploy:execute': commands.redeploy.controller.execute.bind(this),
      'greengrass:reset:execute': commands.reset.controller.execute.bind(this),
    }
  }
}

module.exports = ServerlessPlugin
