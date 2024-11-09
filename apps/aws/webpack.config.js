const { composePlugins, withNx } = require('@nx/webpack');
const webpack = require('webpack');

// Nx plugins for webpack.
module.exports = composePlugins(withNx(), (config) => {
  // Update the webpack config as needed here.
  // e.g. `config.plugins.push(new MyPlugin())`
  config.plugins.push(
    new webpack.EnvironmentPlugin([
      'AWS_ACCOUNT_ID',
      'AWS_STACK_NAME',
      'NX_AWS_DEFAULT_REGION',
      'NX_ENV',
    ]),
  );
  return config;
});
