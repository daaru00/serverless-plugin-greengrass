module.exports = class FunctionDefinition {
  /**
   * Constructor
   * 
   * @param {object} opts
   */
  constructor({ name }) {
    this.name = name
    this.functions = []
  }

  /**
   * Add function
   */
  addFunction({id, functionArn, pinned, executable, memorySize, timeout, encodingType, environment, accessSysfs, resources}) {
    resources = resources || []
    resources = resources.map(resource => {
      const permissionSuffix = resource.substring(resource.length - 3)
      let permission = 'ro'
      switch (permissionSuffix) {
      case ':ro':
      case ':rw':
        permission = resource.substring(resource.length - 2)
        resource = resource.substring(0, resource.length - 3)
        break
      }
      return {
        'ResourceId': resource,
        'Permission': permission
      }
    })
    this.functions.push({
      'Id': `${this.name}-${id}`,
      'FunctionArn': functionArn,
      'FunctionConfiguration': {
        'Pinned': pinned || false,
        'Executable': executable,
        'MemorySize': memorySize || 131072,  // default 128 MB, expressed in KB
        'Timeout': timeout || 6, // 6 seconds
        'EncodingType': encodingType || 'json', // binary | json
        'Environment': {
          'Variables': environment || {},
          'AccessSysfs': accessSysfs || false,
          'ResourceAccessPolicies': resources
        }
      }
    })
  }

  /**
   * Generate CloudFormation JSON
   */
  toCloudFormationObject() {
    return {
      'Type': 'AWS::Greengrass::FunctionDefinition',
      'Properties': {
        'Name': this.name,
        'InitialVersion': {
          'DefaultConfig': {
            'Execution': {
              'IsolationMode': 'GreengrassContainer',
              'RunAs': {
                'Uid': '1',
                'Gid': '10'
              }
            }
          },
          'Functions': this.functions
        }
      }
    }
  }
}
