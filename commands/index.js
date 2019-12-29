const deployController = require('./deploy')
const redeployController = require('./re-deploy')
const resetController = require('./reset')

module.exports = {
  deploy: {
    command: deployController.description,
    controller: deployController
  },
  reDeploy: {
    command: redeployController.description,
    controller: redeployController
  },
  reset: {
    command: resetController.description,
    controller: resetController
  }
}
