var path = require('path');
var _ = require('lodash');
var chalk = require('chalk');
var inflect = require('inflection');
var log = require('yeoman-generator/lib/util/log')();

var generatorUtil = require('./utils');
var documentation = require('./documentation');
var methods = require('./methods');

module.exports = {};

/**
 * Generates the angular service based on the provided RAML spec object.
 *
 * @param {String} moduleName - The name of the application module.
 * @param {Object} ramlResourceObj - The parsed RAML object to generate the resource
 * @param {Boolean} withModule - True to generate with the angular module declaration, otherwise false.
 */
module.exports.generate = function(moduleName, ramlResourceObj, withModule) {
  var templatePath = path.resolve(__dirname, '../templates', 'service.js');
  var appModuleTemplateText = generatorUtil.readFileAsString(templatePath);
  ramlResourceObj.displayName = inflect.singularize(ramlResourceObj.displayName).replace(' ', '') + 'Api';
  ramlResourceObj.description = documentation.formatDescription(ramlResourceObj.description, true);
  ramlResourceObj.methods = methods.generate(ramlResourceObj);

  var resolvedTemplate = _.template(appModuleTemplateText, {
    app: {
      name: moduleName || 'api'
    },
    resource: ramlResourceObj
  });

  if (!withModule) {
    resolvedTemplate = generatorUtil.stripModuleDeclaration(resolvedTemplate);
  }

  log.ok(ramlResourceObj.displayName);

  return resolvedTemplate;
};