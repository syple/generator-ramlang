var path = require('path');
var _ = require('lodash');
var generatorUtil = require('./utils');

module.exports = {};

/**
 * Returns the method function parameters for the provided HTTP verb
 *
 * @param {String} method - The HTTP verb
 * @returns {string}
 */
var getQueryParametersForMethod = function(method) {
  switch (method) {
    case 'query':
      return 'query';
    case 'get':
      return 'id';
    case 'post':
      return 'entity';
    case 'put':
      return 'entity';
    case 'delete':
      return 'id';
  }

  return '';
};

/**
 * Returns the api function parameters for the provided HTTP verb
 *
 * @param {String} method - The HTTP verb
 * @returns {string}
 */
var getApiQueryParametersForMethod = function(method) {
  switch (method) {
    case 'query':
      return 'resourceName, null, query';
    case 'get':
      return 'resourceName, id';
    case 'post':
      return 'resourceName, entity';
    case 'put':
      return 'resourceName, entity.id, entity';
    case 'delete':
      return 'resourceName, id';
  }

  return '';
};

/**
 * Generates the service methods for the provided RAML resource object
 *
 * @param {Object} ramlResource - The RAML resource object to get the methods it supports
 * @returns {String} The compiled template string
 */
module.exports.generate = function(ramlResource) {
  var templatePath = path.resolve(__dirname, '../templates', 'method.js');
  var methodTemplateText = generatorUtil.readFileAsString(templatePath);
  var isCollection = ramlResource.type.toLowerCase() == 'collection';
  var methodData = [];

  ramlResource.methods.forEach(function(item, index) {
    var transformedMethodName = isCollection && item.method == 'get' ? 'query' : item.method;
    methodData.push({
      description: item.description,
      factoryMethodName: transformedMethodName,
      name: item.method,
      queryParameters: getQueryParametersForMethod(transformedMethodName),
      apiQueryParameters: getApiQueryParametersForMethod(transformedMethodName),
      separator: index != ramlResource.methods.length - 1 ? ',' : ''
    });
  });

  return _.template(methodTemplateText, {
    methods: methodData
  });
};
