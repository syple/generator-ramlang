var linewrap = require('linewrap');
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
  var wrappedDescription = wrap(description || '').trim();

  if (isForComments) {
    wrappedDescription = wrappedDescription.replace(/^/mg, ' * ');
    wrappedDescription = '/**\n' + wrappedDescription;
    wrappedDescription += '\n */';
  }

  return wrappedDescription;
};