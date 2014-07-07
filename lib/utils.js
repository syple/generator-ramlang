var fs = require('fs');
var path = require('path');
var inflect = require('inflection');

module.exports = {};

/**
 * Removes the 'angular.module' declaration from a template.
 *
 * @param templateText The template text to remove the declaration from.
 * @returns {String}
 */
module.exports.stripModuleDeclaration = function(templateText) {
  return templateText.replace(/angular.module\(.*\)/, '');
};

/**
 * Gets a file and returns the contents as string 'utf-8'.
 *
 * @param filePath The path of the file to read.
 * @returns {String} The contents of the file as string.
 */
module.exports.readFileAsString = function(filePath) {
  return fs.readFileSync(path.resolve(filePath), 'utf8');
};

/**
 * Uses inflection to camel case the provided string.
 *
 * @param {String} str - The string to camel case.
 * @param {Boolean} [startWithCapital] - True to return the string starting with a capital, otherwise false
 * @returns {String}
 */
module.exports.toCamelCase = function(str, startWithCapital) {
  return inflect.camelize(str.trim().replace(/ /g, '_').replace(/-/g, '_'), !startWithCapital);
};

/**
 * Returns a string of spaces.
 *
 * @param {Number} amount - The amount of spaces.
 * @returns {string}
 */
module.exports.getIndent = function(amount) {
  var indent = '';
  for (var i = 0; i < amount; i++) {
    indent += ' ';
  }

  return indent;
};

/**
 * Indents to provided string value by the provided amount.
 *
 * @param {Number} amount - The amount of spaces to indent.
 * @param {String} text - The paragraph or single line to intent.
 * @returns {String}
 */
module.exports.indentText = function(amount, text) {
  var indent = this.getIndent(amount);
  return text.replace(/^/mg, indent);
};

/**
 * Returns the display name of a RAML resource.
 * If the display name is defined then it will be returned otherwise,
 * the relative path will be formatted into a humanized display name camel cased.
 *
 * @param {Object} ramlResource - The raml resource to get the display name from.
 * @returns {String}
 */
module.exports.getResourceDisplayName = function(ramlResource) {
  var name = "";
  if (!ramlResource) {
    name = "";
  } else if (ramlResource.displayName) {
    name = ramlResource.displayName;
  } else if (ramlResource.relativeUri) {
    name = ramlResource.relativeUri.substr(1, ramlResource.relativeUri.length);
    name = name.replace(/\//, "_");
  }

  return this.toCamelCase(name, true);
};

/**
 * Recursively sets the display name of a RAML resource and it's children.
 *
 * @param {Object} ramlResource - The RAML resource
 */
module.exports.formatResourceDisplayName = function(ramlResource) {
  if (!ramlResource) { return; }

  (ramlResource.resources || []).forEach(function(item) {
    item.displayName = this.getResourceDisplayName(item);

    this.formatResourceDisplayName(item);
  }, this);
};
