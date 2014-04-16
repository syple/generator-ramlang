module.exports = {};

/**
 * Transforms a sentence into an array of sentences limited to the a length of 70 characters.
 * This will not cut words.
 *
 * @param {String} sentence - The line a text to transform
 * @returns {[String]}
 */
module.exports.wrapSentence = function(sentence) {
  var maxSentenceLength = 70;
  var lines = [];
  var words = sentence.trim().split(' ');
  var lineLength = 0;
  var line = "";

  words.forEach(function(word) {
    lineLength += word.trim().length;

    if (lineLength > maxSentenceLength) {
      lines.push(line.trim());
      line = "";
      lineLength = 0;
    }

    line += ' ' + word;
  });

  if (line) {
    lines.push(line.trim());
  }

  return lines;
};

/**
 * Formats the RAML description into javascript documentation
 *
 * @param {String} description -  The description to format
 * @param {Boolean} isForComments - True if the description is for comments, otherwise false
 * @returns {string} The formatted string
 */
module.exports.formatDescription = function(description, isForComments) {
  description = description || '';
  description = description.trim();
  var self = this;
  var result = '';
  var docPrefix = isForComments ? ' * ' : '';
  var lines = description.trim()
                         .replace(/\r/img, '')
                         .replace(/<br \/>/img, '\n')
                         .split('\n');

  if (isForComments) {
    result += '/**\n';
  }

  var append = function(array) {
    array.forEach(function(sentence) {
      result += docPrefix + sentence.trim() + '\n'
    });
  };

  lines.forEach(function(line) {
    append(self.wrapSentence(line));
  });

  if (isForComments) {
    result += ' */';
  }

  return result;
};