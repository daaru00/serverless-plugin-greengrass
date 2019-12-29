# Serverless Greengrass

[![npm](https://img.shields.io/npm/v/serverless-plugin-greengrass.svg)](https://www.npmjs.com/package/serverless-plugin-greengrass)

A [serverless](https://serverless.com) plugin to deploy functions to Greengrass Group.

## Usage

### Installation

```bash
$ npm install serverless-plugin-greengrass --save-dev
```
or using yarn
```bash
$ yarn add serverless-plugin-greengrass
```

### Configuration

Minimal required configuration:
```yaml
plugins:
  - serverless-plugin-greengrass

custom:
  greengrass:
    coreName: MyCoreThingName # name of the Core's Thing
    groupId: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx # Greengrass Group id

functions:
  myfunction:
    handler: tasks/door.handler
```

Advanced configuration:
```yaml
plugins:
  - serverless-plugin-greengrass

custom:
  greengrass:
    autoDeploy: true # set to "false" to disable automatic deploy after "sls deploy"
    coreName: MyCoreThingName
    groupId: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
    defaults:
      pinned: false # check if is a long running or on-demand
      memory: 16384,  # 16 MB expressed in KB
      timeout: 6 # function timeout
      encodingType: json # The expected encoding type of the input payload, can be binary or json.
      accessSysfs: false # allowed to access the host's /sys folder
      environment: 
        myVarA: 'myValueA' # deployed for all Greengrass functions
    
functions:
  myfunction:
    handler: tasks/door.handler
    environment: 
      myVarB: 'myValueB' # only deployed for this function (even for Greengrass)
    greengrass:
      handler: tasks/door.handlerIot # override handler for Greengrass deployed function
      pinned: true # override default values
      environment: 
        myVarC: 'myValueC' # only deployed to Greengrass
```

### Deploy

Execute a simple Serverless deploy, with `autoDeploy` enabled:
```bash
sls deploy
```

Manually execute deploy, with `autoDeploy` disabled: 
```bash
sls deploy
sls greengrass deploy
```

### Redeploy

To redeploy latest version run:
```bash
sls greengrass re-deploy
```

### Delete/Reset

Execute a simple Serverless remove, with `autoDeploy` enabled:
```bash
sls remove
```
this will also run a reset deployment operations against Greengrass group.

Manually execute reset, with `autoDeploy` disabled: 
```bash
sls remove
sls greengrass reset
```
