var path = require('path');
var _ = require('lodash');
var generatorUtil = require('./utils');

module.exports = {};

/**
 * Generates the angular api provider.
 *
 * @param {String} moduleName - The name of the application module.
 * @param {Object} ramlObj The RAML object to get additional details from.
 * @param {Boolean} withModule - True to generate with the angular module declaration, otherwise false.
 */
module.exports.generate = function(moduleName, ramlObj, withModule) {
  var templatePath = path.resolve(__dirname, '../templates', 'provider.js');
  var appModuleTemplateText = generatorUtil.readFileAsString(templatePath);
  var resolvedTemplate = _.template(appModuleTemplateText, {
    app: {
      name: moduleName || 'api',
      baseUri: ramlObj.baseUri
    }
  });

  if (!withModule) {
    resolvedTemplate = generatorUtil.stripModuleDeclaration(resolvedTemplate);
  }

  return resolvedTemplate;
};