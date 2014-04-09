var path = require('path');
var _ = require('lodash');
var generatorUtil = require('./utils');

module.exports = {};

/**
 * Generates the angular application module.
 *
 * @param {String} moduleName = The name of the angular module.
 * @param {Object} [ramlObj] The RAML object to get additional details from.
 */
module.exports.generate = function(moduleName, ramlObj) {
  var templatePath = path.resolve(__dirname, '../templates', 'app.js');
  var appModuleTemplateText = generatorUtil.readFileAsString(templatePath);

  return _.template(appModuleTemplateText, {
    app: {
      name: moduleName || 'api'
    }
  });
};