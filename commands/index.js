const deployController = require('./deploy')
const redeployController = require('./redeploy')
const resetController = require('./reset')

module.exports = {
  deploy: {
    command: deployController.description,
    controller: deployController
  },
  redeploy: {
    command: redeployController.description,
    controller: redeployController
  },
  reset: {
    command: resetController.description,
    controller: resetController
  }
}
