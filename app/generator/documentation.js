var linewrap = require('linewrap');
var markdown = require('markdown').markdown;
var Entities = require('html-entities').AllHtmlEntities;

var entities = new Entities();
var wrap = linewrap(110, {
  lineBreak: [/\n|<br ?\/>/, '\n'],
  respectLineBreaks: 'multi',
  mode: 'hard'
});

module.exports = {};

/**
 * Formats the RAML description into javascript documentation
 *
 * @param {String} description -  The description to format
 * @param {Boolean} isForComments - True if the description is for comments, otherwise false
 * @returns {string} The formatted string
 */
module.exports.formatDescription = function(description, isForComments) {

  var finalDescription = markdown.toHTML(description || '');

  // Decode and html left over
  finalDescription = entities.decode(finalDescription);

  // Strip HTML tags
  finalDescription = stripHTML(finalDescription);

  // Wrap description
  finalDescription = wrap(finalDescription).trim();

  if (isForComments) {
    finalDescription = finalDescription.replace(/^/mg, ' * ');
    finalDescription = '/**\n' + finalDescription;
    finalDescription += '\n */';
  }

  return finalDescription;
};

/**
 * Removes any HTML tags from the provided string.
 *
 * @param {String} str - The string value to remove the HTML tags from.
 * @returns {String}
 */
var stripHTML = function(str) {
  return str.replace(/(<([^>]+)>)/ig,"");
};