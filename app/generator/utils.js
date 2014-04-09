var fs = require('fs');
var path = require('path');

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
