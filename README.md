# Serverless Greengrass

[![npm](https://img.shields.io/npm/v/serverless-plugin-greengrass.svg)](https://www.npmjs.com/package/serverless-plugin-greengrass)

A [serverless](https://serverless.com) plugin to deploy functions to Greengrass Group.

This plugin will create a new [AWS::Greengrass::FunctionDefinition](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-greengrass-functiondefinition-function.html) with project's Lambdas declared. It will also create a new [AWS::Greengrass::GroupVersion](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-greengrass-groupversion.html) to associate the new Function Definition with your existing Greengrass Group. Deploy phase will trigger a new deployment with the new Group Version declared.

## Requirements

Create a Greengrass Group and a Core and configure your device to connect to it.

## Usage

### Installation

```bash
$ npm install serverless-plugin-greengrass --save-dev
```
or using yarn
```bash
$ yarn add serverless-plugin-greengrass
```

Add this plugin to your `serverless.yml` file:
```yaml
plugins:
  - serverless-plugin-greengrass
```

### Configuration

Minimal required configuration:
```yaml
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

Include only specific functions:
```yaml
custom:
  greengrass:
    coreName: MyCoreThingName
    groupId: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
    include:
      - myfunctionA # Only function "myfunctionA" will be deployed to Greengrass

functions:
  myfunctionA:
    handler: tasks/door.handler
  myfunctionB:
    handler: tasks/door.handler
  myfunctionC:
    handler: tasks/door.handler
```

Exclude functions:
```yaml
custom:
  greengrass:
    coreName: MyCoreThingName
    groupId: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
    exclude:
      - myfunctionB # Only function "myfunctionA" and "myfunctionC" will be deployed to Greengrass

functions:
  myfunctionA:
    handler: tasks/door.handler
  myfunctionB:
    handler: tasks/door.handler
  myfunctionC:
    handler: tasks/door.handler
```

### Deploy

Execute a simple Serverless deploy, with `autoDeploy` enabled:
```bash
serverless deploy
```

Manually execute deploy, with `autoDeploy` disabled: 
```bash
serverless deploy
serverless greengrass deploy
```

### Redeploy

To redeploy latest version run:
```bash
serverless greengrass redeploy
```

### Delete/Reset

Execute a simple Serverless remove, with `autoDeploy` enabled:
```bash
serverless remove
```
this will also run a reset deployment operations against Greengrass group.

Manually execute reset, with `autoDeploy` disabled: 
```bash
serverless remove
serverless greengrass reset
```

## Extra tips

### Setup RaspberryPI

1. Download latest version of Raspbian Lite version from [official download page](https://www.raspberrypi.org/downloads/raspbian/)
2. Extract `.img` file from previously download zip archive
3. Build SD card using [Etcher](https://www.balena.io/etcher/), selecting previously extracted `.img` file
4. Mount `boot` partition created on SD card
5. Create a new file `wpa_supplicant.conf` with you WiFi credentials (edit info between `«`):
```
ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev
update_config=1
country=«your_ISO-3166-1_two-letter_country_code»

network={
    ssid="«your_SSID»"
    psk="«your_PSK»"
    key_mgmt=WPA-PSK
}
```
[source](https://raspberrypi.stackexchange.com/questions/10251/prepare-sd-card-for-wifi-on-headless-pi)

6. Create a new empty file `ssh` without extensions in order to enable SSH service
7. Insert SD card into RaspberryPI and boot it up
8. Check into your modem info page a WiFi newly connected device called "raspberry" and get the IP
9. Connect to Raspberry from your computer using SSH
```bash
ssh pi@<raspberry ip>
```
10. Login using `raspberry` default password
11. Install and setup Greengrass:
```bash
export AWS_ACCESS_KEY_ID=«your_access_key»
export AWS_SECRET_ACCESS_KEY=«your_secret_access_key»

sudo su
wget -q -O ./gg-device-setup-latest.sh https://d1onfpft10uf5o.cloudfront.net/greengrass-device-setup/downloads/gg-device-setup-latest.sh && chmod +x ./gg-device-setup-latest.sh && sudo -E ./gg-device-setup-latest.sh bootstrap-greengrass-interactive
```
[source](https://docs.aws.amazon.com/greengrass/latest/developerguide/quick-start.html)

12. Automatically starting AWS Greengrass on a Raspberry Pi on system boot using [this guide](http://www.andyfrench.info/2018/08/automatically-starting-aws-greengrass.html)
