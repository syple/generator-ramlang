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

module.exports.toCamelCase = function(str) {
  return inflect.camelize(str.replace(' ', '_'), true);
};

module.exports.getIndent = function(amount) {
  var indent = '';
  for (var i = 0; i < amount; i++) {
    indent += ' ';
  }

  return indent;
};

module.exports.indentText = function(amount, text) {
  var indent = this.getIndent(amount);
  return indent + text.replace(/^/mg, indent);
};
