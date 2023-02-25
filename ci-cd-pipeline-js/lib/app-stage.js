const cdk = require('aws-cdk-lib');
const { AppStack } = require('./app-stack');

const { getContextValues } = require('../lib/helpers');

class AppStage extends cdk.Stage {
  constructor(scope, id, props) {
    super(scope, id, props);

    const { appName } = getContextValues(this.node);

    // Place your app stacks in the stage
    this.AppStack = new AppStack(this, appName);
  }
}

module.exports = { AppStage };
