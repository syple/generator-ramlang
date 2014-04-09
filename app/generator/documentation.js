module.exports = {};

/**
 * Formats the RAML description into javascript documentation.
 *
 * @param description The description to format.
 * @param isForComments True if the description is for comments, otherwise false.
 * @returns {string} The formatted string.
 */
module.exports.formatDescription = function(description, isForComments) {
  description = description || '';
  description = description.trim();
  var result = '';
  var words = description.replace(/[\r\n]/g, ' ').split(' ');
  var totalWordsInRow = 14;
  var wordCount = 0;
  words.forEach(function(word) {

    if (wordCount == totalWordsInRow) {
      result += '\n' + (isForComments ? ' *' : '');
      wordCount = 1;
    }

    if (wordCount == 0) {
      result += word;
    } else {
      result += ' ' + word;
    }

    wordCount++;
  });

  return result;
};