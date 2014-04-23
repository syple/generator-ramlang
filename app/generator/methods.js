var path = require('path');
var _ = require('lodash');
var inflect = require('inflection');
var endOfLine = require('os').EOL;

var generatorUtil = require('./utils');
var documentation = require('./documentation');

var methodTemplatePath = path.resolve(__dirname, '../templates', 'method.js');
var subResourceTemplatePath = path.resolve(__dirname, '../templates', 'sub-resource.js');
var methodTemplateText = null;
var subResourceTemplateText = null;
var indentAmount = 2;

module.exports = {};

/**
 * Returns the api function parameters for the provided HTTP verb
 *
 * @param {string} method - The HTTP verb
 * @param {string} relativeUri - The uri to set as the first parameter.
 * @returns {Object}
 */
var getParametersForMethod = function(method, relativeUri) {
  var result = {
    method: '',
    api: '',
    rawMethod: [],
    rawApi: []
  };

  // Remove the last '/{id}' instance from the uri
  var uri = relativeUri.replace(/\/{id}$/i, '');
  var segments = uri.split('/');
  var uriSegments = [];
  var apiParams = [];
  var params = [];

  // exclude the first and last 2 entries
  segments = segments.splice(1, segments.length);

  segments.forEach(function(segment, index) {

    if (segment == '{id}') {
      // If the segment is an id parameter then retrieve it from the list of params.
      // the value will always exist because of the way the uri is constructed.
      uriSegments.push('/\' + ' + params[params.length - 1] + ' + \'');
    } else {
      // If the segment is not an if parameter then just add it to the uri segments
      uriSegments.push('/' + segment);

      var getArgName = function(segment, count) {
        count = count || 0;
        var result = inflect.singularize(segment) + (count > 0 ? count : '') + 'Id';

        if (params.indexOf(result) != -1) {
          return getArgName(segment, count + 1)
        }

        return result;
      };

      // Only add an id parameter if it's not the last resource in the uri.
      if (index < segments.length - 2) {
        params.push(getArgName(segment));
      }
    }
  });

  apiParams.push('\'' + uriSegments.join('') + '\'');

  // Add additional parameters
  switch (method) {
    case 'query':
      params.push('query');
      apiParams.push('null', 'query');
      break;
    case 'get':
      params.push('id');
      apiParams.push('id');
      break;
    case 'post':
      params.push('entity');
      apiParams.push('entity');
      break;
    case 'put':
      params.push('entity');
      apiParams.push('entity.id', 'entity');
      break;
    case 'delete':
      params.push('id');
      apiParams.push('id');
      break;
  }

  result.rawMethod = params;
  result.rawApi = apiParams;
  result.method = params.join(', ');
  result.api = apiParams.join(', ');

  return result;
};

/**
 * Determines if the RAML resource is a collection resource
 *
 * @param {Object} ramlResource - THe RAML resource to check
 */
var isCollection = function(ramlResource) {
  return ramlResource.type.toLowerCase() == 'collection';
};

/**
 * A helper method for generating RAML resource methods. eg. GET, POST, PUT and DELETE
 *
 * @param {Object} ramlResource - The RAML resource object to generate the methods for
 * @param {string} relativeUri - The uri of the resource
 * @returns {string} The compiled template string
 */
var generateMethods = function(ramlResource, relativeUri) {
  var isCol = isCollection(ramlResource);
  var methodData = [];

  ramlResource.methods.forEach(function(item, index) {
    var transformedMethodName = isCol && item.method == 'get' ? 'query' : item.method;
    var parameters = getParametersForMethod(transformedMethodName, relativeUri);
    methodData.push({
      description: documentation.formatDescription(item.description, true),
      factoryMethodName: generatorUtil.toCamelCase(item.displayName || transformedMethodName),
      apiMethodName: item.method,
      queryParameters: parameters.method,
      apiQueryParameters: parameters.api,
      separator: index != ramlResource.methods.length - 1 ? ',' : ''
    });
  });

  var compiledMethod = _.template(methodTemplateText, {
    methods: methodData
  });

  return generatorUtil.indentText(indentAmount, compiledMethod);
};

/**
 * A helper method for generating a resource within a resource
 *
 * @param ramlResource - The RAML resource to generate the sub resource for
 * @param relativeUri The relative uri of the resource
 * @returns {string} The compiled sub resource
 */
var generateSubResource = function(ramlResource, relativeUri) {
  return _.template(subResourceTemplateText, {
    resource: {
      name: ramlResource.relativeUri.replace('/', ''),
      description: documentation.formatDescription(ramlResource.description, true),
      methods: generateMethods(ramlResource, relativeUri)
    }
  });
};

/**
 * A recursive helper method for generating resources.
 *
 * @param {Object} ramlResource - The RAML resource to generate methods and sub resources for
 * @param {Number} level - The depth of recursion mainly used for indentation
 * @param {string} relativeUri - The uri of the resource
 * @returns {string} The compiled template string.
 */
var recursResources = function(ramlResource, level, relativeUri) {
  var compiledResource = "";
  var uri = relativeUri + ramlResource.relativeUri;
  if (level != 0) {
    if (isCollection(ramlResource) || ramlResource.relativeUri != '/{id}') {
      compiledResource += generateSubResource(ramlResource, uri);
    } else {
      compiledResource += generateMethods(ramlResource, uri);
    }

    compiledResource = generatorUtil.indentText(indentAmount * level, compiledResource);
  } else {
    compiledResource = generateMethods(ramlResource, uri);
  }

  if (ramlResource.resources && ramlResource.resources.length > 0) {
    ramlResource.resources.forEach(function(resource) {
      var isCol = isCollection(resource) || resource.relativeUri != '/{id}';
      var incrementer = isCol ? 1 : 0;
      compiledResource = compiledResource.trimRight() + ',' + endOfLine;
      compiledResource += recursResources(resource, level + incrementer, uri);

      if (isCol) {
        compiledResource = compiledResource.trimRight() + endOfLine;
        compiledResource += generatorUtil.indentText(indentAmount * (level + 1), '}');
      }
    });
  }

  return compiledResource;
};

/**
 * Generates the service methods for the provided RAML resource object
 *
 * @param {Object} ramlResource - The RAML resource to generate the methods and sub resources for
 * @returns {string} The compiled template string
 */
module.exports.generate = function(ramlResource) {
  // Get all of the required templates
  methodTemplateText = generatorUtil.readFileAsString(methodTemplatePath);
  subResourceTemplateText = generatorUtil.readFileAsString(subResourceTemplatePath);
  var compiledTemplate = recursResources(ramlResource, 0, '');
  compiledTemplate = generatorUtil.indentText(indentAmount, compiledTemplate);
  return compiledTemplate;
};
