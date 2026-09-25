const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

module.exports = function withCustomWebView(config) {
  return withDangerousMod(config, [
    'android',
    async (config) => {
      const sourceFile = path.join(
        config.modRequest.projectRoot,
        'native-src',
        'android',
        'CustomWebViewManager.kt'
      );

      const destDir = path.join(
        config.modRequest.platformProjectRoot,
        'app',
        'src',
        'main',
        'java',
        'com',
        'm2br',
        'assim',
        'webview'
      );

      fs.mkdirSync(destDir, { recursive: true });
      fs.copyFileSync(sourceFile, path.join(destDir, 'CustomWebViewManager.kt'));

      return config;
    },
  ]);
};