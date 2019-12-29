module.exports = class GreengrassGroup {
  /**
   * Constructor
   *
   * @param {object} opts
   */
  constructor({ provider, coreName }) {
    this.provider = provider
    this.coreName = coreName
  }

  /**
   * List all cores definitions
   * 
   * @param {string} nextToken
   * @returns {string}
   */
  async listAllDefinitions (nextToken) {
    const response = await this.provider.request('Greengrass', 'listCoreDefinitions', {
      NextToken: nextToken
    })
    let nextResults = []
    if (response.NextToken) {
      nextResults = await this.listAllDefinitions(response.NextToken)
    }
    return [...response.Definitions, ...nextResults]
  }

  /**
   * Get core definition id
   * 
   * @returns {string}
   */
  async getCurrentDefinitionId () {
    if (!this.definitions) {
      this.definitions = await this.listAllDefinitions()
    }
    for (const definition of this.definitions) {
      const response = await this.provider.request('Greengrass', 'getCoreDefinitionVersion', {
        CoreDefinitionId: definition.Id,
        CoreDefinitionVersionId: definition.LatestVersion
      })
      const coreFound = response.Definition.Cores.find(core => core.Id === this.coreName)
      if (coreFound) {
        return definition.Id
      }
    }
    return false
  }

}
