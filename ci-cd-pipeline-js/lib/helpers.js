exports.getContextValues = function (node) {
  let account, region, branch, appName;
  account = node.tryGetContext('account');
  region = node.tryGetContext('region');
  branch = node.tryGetContext('branch');
  appName = node.tryGetContext('appName');

  if (!branch) branch = 'prod';
  return {
    account,
    region,
    branch,
    appName,
  };
};
