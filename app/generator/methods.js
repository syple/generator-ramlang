var path = require('path');
var _ = require('lodash');
var inflect = require('inflection');
var generatorUtil = require('./utils');
var documentation = require('./documentation');
var endOfLine = require('os').EOL;

var methodTemplatePath = path.resolve(__dirname, '../templates', 'method.js');
var subResourceTemplatePath = path.resolve(__dirname, '../templates', 'sub-resource.js');
var methodTemplateText = null;
var subResourceTemplateText = null;
var indentAmount = 2;

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

var generateMethods = function(ramlResource) {
  var isCollection = ramlResource.type.toLowerCase() == 'collection';
  var methodData = [];

  ramlResource.methods.forEach(function(item, index) {
    var transformedMethodName = isCollection && item.method == 'get' ? 'query' : item.method;
    methodData.push({
      description: documentation.formatDescription(item.description, true),
      factoryMethodName: transformedMethodName,
      name: inflect.camelize((item.displayName || item.method).replace(' ', '_'), true),
      queryParameters: getQueryParametersForMethod(transformedMethodName),
      apiQueryParameters: getApiQueryParametersForMethod(transformedMethodName),
      separator: index != ramlResource.methods.length - 1 ? ',' : ''
    });
  });

  var compiledMethod = _.template(methodTemplateText, {
    methods: methodData
  });

  return generatorUtil.indentText(indentAmount, compiledMethod);
};

var generateSubResource = function(ramlResource) {
  return _.template(subResourceTemplateText, {
    resource: {
      name: ramlResource.relativeUri.replace('/', ''),
      description: documentation.formatDescription(ramlResource.description, true),
      methods: generateMethods(ramlResource)
    }
  });
};

var recursResources = function(ramlResource, level) {
  var compiledResource = "";
  if (level != 0) {
    if (ramlResource.type == 'collection') {
      compiledResource += generateSubResource(ramlResource);
    } else {
      compiledResource += generateMethods(ramlResource);
    }

    compiledResource = generatorUtil.indentText(indentAmount * level, compiledResource);
  } else {
    compiledResource = generateMethods(ramlResource);
  }

  if (ramlResource.resources && ramlResource.resources.length > 0) {
    ramlResource.resources.forEach(function(resource) {
      var incrementer = resource.type == 'collection' ? 1 : 0;
      compiledResource = compiledResource.trim() + ',' + endOfLine + endOfLine;
      compiledResource += recursResources(resource, level + incrementer);

      if (resource.type == 'collection') {
        compiledResource += '}';
      }
    });
  }

  return compiledResource;
};

/**
 * Generates the service methods for the provided RAML resource object
 *
 * @param {Object} ramlResource - The RAML resource object to get the methods it supports
 * @returns {String} The compiled template string
 */
module.exports.generate = function(ramlResource) {
  // Get all of the required templates
  methodTemplateText = generatorUtil.readFileAsString(methodTemplatePath);
  subResourceTemplateText = generatorUtil.readFileAsString(subResourceTemplatePath);
  var compiledTemplate = recursResources(ramlResource, 0);
  return generatorUtil.indentText(indentAmount, compiledTemplate);
};
