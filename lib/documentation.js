var linewrap = require('linewrap'); // https://www.npmjs.org/package/linewrap
var markdown = require('markdown').markdown;
var Entities = require('html-entities').AllHtmlEntities;

var entities = new Entities();
var wrap = linewrap(110, {
  /**
   * Converts all <br /> and double \n line breaks into a single line break.
   */
  lineBreak: [/(<br ?\/>)+|\n\n/, '\n'],

  /**
   * Ensures that single words overflow the line wrap length.
   */
  mode: 'soft',
//  whitespace: 'collapse',
  wrapLineIndentBase: /(:|-)/,
  wrapLineIndent: '2'
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

  // Decode any html encoded values left over ie. &#39;
  finalDescription = entities.decode(finalDescription);

  finalDescription = finalDescription.replace(/<br ?\/>/mg, '\n\n');

  // Handle ul list formatting
  finalDescription = finalDescription.replace(/(<ul>|<\/li>)/mg, '$1\n\n');

  // Strip all HTML tags
  finalDescription = this.stripAllHTML(finalDescription);

  // Wrap description
  finalDescription = wrap(finalDescription).trim();

  // Apply comment format like so:
  //
  // /**
  //  * This is the comment format.
  //  */
  //
  if (isForComments && finalDescription) {
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
module.exports.stripAllHTML = function(str) {
  return str.replace(/(<([^>]+)>)/ig, '');
};