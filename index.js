const _ = require('lodash')
const hooks = require('./hooks')
const commands = require('./commands')
const Logger = require('./helpers/logger')

class ServerlessPlugin {
  constructor (serverless, options) {
    this.serverless = serverless
    this.options = options
    this.provider = this.serverless.getProvider('aws')
    this.config = _.get(this.serverless.service, 'custom.greengrass', {})
    this.providerConfig = this.serverless.service.provider
    this.service = this.serverless.service
    this.logger = new Logger(this.serverless)
    
    this.commands = {
      greengrass: {
        commands: {
          deploy: commands.deploy.command,
          reDeploy: commands.reDeploy.command,
          reset: commands.reset.command,
        }
      }
    }

    this.hooks = {
      'before:package:finalize': hooks.beforePackageFinalize.execute.bind(this),
      'before:remove:remove': hooks.beforeRemove.execute.bind(this),
      'after:deploy:deploy': hooks.afterDeploy.execute.bind(this),

      'greengrass:deploy:execute': commands.deploy.controller.execute.bind(this),
      'greengrass:reDeploy:execute': commands.reDeploy.controller.execute.bind(this),
      'greengrass:reset:execute': commands.reset.controller.execute.bind(this),
    }
  }
}

module.exports = ServerlessPlugin
