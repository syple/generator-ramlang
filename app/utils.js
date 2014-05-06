var fs = require('fs');
var path = require('path');

module.exports = {};

/**
 * Returns the path where the generator should save the files.
 * It will determine if the user is using Bower and return a parent path to where the Bower components are.
 * If Bower is used then first it will try an get the directory path from the '.bowerrc' file. If that doesn't exist
 * then it will check if the bower components are in the default location (app/bower_components). If that doesn't exist
 * then the current path will be returned.
 *
 * @returns {String} - The path where the files should be saved.
 */
module.exports.getDistPath = function() {
  var pathStructure = 'scripts/services/api';
  var appPath = null;
  var bowerCustomConfPath = './.bowerrc';
  var bowerContentsFolderName = 'bower_components';

  if (fs.existsSync(bowerCustomConfPath)) {
    var contents = readJSONFile(bowerCustomConfPath, true);
    if (contents.directory) {
      appPath = contents.directory.replace(bowerContentsFolderName, '');

      if (appPath.lastIndexOf('/') == appPath.length - 1) {
        appPath = appPath.substring(0, appPath.lastIndexOf('/'));
      }
    }
  }

  if (appPath == null && fs.existsSync(path.join('./app', bowerContentsFolderName))) {
    appPath = 'app';
  }

  if (appPath == null) {
    return '.';
  } else {
    return path.join(appPath, pathStructure);
  }
};

/**
 * Removes resources that where not selected.
 *
 * @param {[String]} selectedResourceNames - The list of selected resources to filter by.
 * @param {[Object]} resources - The list of resources to filter.
 * @returns {[Object]} The filtered list of RAML resources.
 */
module.exports.filterResources = function(selectedResourceNames, resources) {
  return resources.filter(function(resource) {
    return selectedResourceNames.indexOf(resource.displayName) > -1;
  });
};

/**
 * A helper method for reading a json file and returning the contents as string or an object.
 *
 * @param {String} path - The path of the file to read.
 * @param {Boolean} returnAsObj - True to return the contents of the file as an object,
 *                                otherwise false to return as string.
 * @returns {String|Object}
 */
module.exports.readJSONFile = function(path, returnAsObj) {
  var jsonString = fs.readFileSync(path, 'utf-8');
  if (returnAsObj) {
    return JSON.parse(jsonString);
  } else {
    return jsonString;
  }
};