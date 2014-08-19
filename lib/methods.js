var path = require('path');
var _ = require('lodash');
var inflect = require('inflection');
var endOfLine = require('os').EOL;
var util = require('util');

var generatorUtil = require('./utils');
var documentation = require('./documentation');

var methodTemplatePath = path.resolve(__dirname, '../templates', 'method.js');
var subResourceTemplatePath = path.resolve(__dirname, '../templates', 'sub-resource.js');
var methodTemplateText = null;
var subResourceTemplateText = null;
var indentAmount = 2;
var mediaTypeExtension = null;

module.exports = {};

/**
 * Returns the api function parameters for the provided HTTP verb
 *
 * @param {object} ramlResource - The RAML Resource object.
 * @param {string} method - The HTTP verb
 * @param {string} relativeUri - The uri to set as the first parameter.
 * @returns {Object}
 */
var getParametersForMethod = function(ramlResource, method, relativeUri) {
  var result = {
    method: '',
    api: '',
    rawMethod: [],
    rawApi: []
  };

  var getArgName = function(segment, count, suffix) {
    count = count || 0;
    var result = generatorUtil.cleanDisplayName(segment);
    result = inflect.singularize(result) + (count > 0 ? count : '') + suffix;

    if (params.indexOf(result) != -1) {
      return getArgName(segment, count + 1, suffix);
    }

    return result;
  };
  var startsWithIdParam = function(paramText) {
    return /^{id}/ig.test(paramText);
  };

  var uriParams       = ramlResource.uriParameters;
  var segments        = relativeUri.split('/');
  var uriSegments     = [];
  var apiParams       = [];
  var params          = [];
  var manuallyResolve = {};

  // exclude the first and last 2 entries
  segments = segments.splice(1, segments.length);

  segments.forEach(function(segment, index) {

    _.forEach(uriParams, function(paramValue, paramName) {
      if (paramValue.required === true || paramValue.required == 'true') {
        var macro = util.format('{%s}', paramName);
        var regex = new RegExp(macro, 'ig');
        var val;

        if (paramName.toLowerCase() == 'mediatypeextension') {
          val = mediaTypeExtension;
        } else {
          val = generatorUtil.getUriParameterValue(paramValue);
        }

        if (!_.isEmpty(val)) {
          segment = segment.replace(regex, val);
        }
        // Ignore the 'id' uri param because we handle it later on.
        else if (paramName.toLowerCase() != 'id') {
          manuallyResolve[paramName] = regex;
        }
      }
    });

    if (startsWithIdParam(segment)) {
      if (index != segments.length - 1) {
        var arg = getArgName(segments[index - 1], 0, 'Id');
        params.push(arg);
        segment = '\' + ' + arg + ' + \'';
      } else {
        // Return because we don't need to add {id} to the uri.
        return;
      }
    }

    uriSegments.push(segment);
  });

  var apiUri = '\'/' + uriSegments.join('/') + '\'';

  // Resolve any left over bindings by adding a param to the api function
  // This can happen when we can't find a value for a uri parameters.
  if (!_.isEmpty(manuallyResolve)) {
    _.forEach(manuallyResolve, function(regex, name) {
      var arg = getArgName(name, 0, '');
      params.push(arg);
      apiUri = apiUri.replace(regex, '\' + ' + arg + ' + \'');
    });
  }

  apiParams.push(apiUri);

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
 * Determines if the RAML resource is a collection resource. This is done by checking the type of the resource.
 * If the resource is defined as a schema object then it will look (lower case comparison) for a property which
 * contains the word 'collection'.
 *
 * @param {Object} ramlResource - The RAML resource to check
 */
var isCollection = function(ramlResource) {
  return (!_.isEmpty(ramlResource) &&
             (_.isEmpty(ramlResource.uriParameters) ||
              _.isUndefined(ramlResource.uriParameters.id))) ||
          !/^\/{id}/ig.test(ramlResource.relativeUri);
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

  (ramlResource.methods || []).forEach(function(item, index) {
    var transformedMethodName = isCol && item.method == 'get' ? 'query' : item.method;
    var parameters = getParametersForMethod(ramlResource, transformedMethodName, relativeUri);
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
 * A helper method for generating a resource within a resource.
 *
 * Note: Will not render a sub method if the name or list of methods is empty.
 *
 * @param ramlResource - The RAML resource to generate the sub resource for
 * @param relativeUri The relative uri of the resource
 * @returns {string} The compiled sub resource
 */
var generateSubResource = function(ramlResource, relativeUri) {
  var subMethodName = generatorUtil.cleanSubMethodName(ramlResource.relativeUri);
  var hasMethods    = (ramlResource.methods || []).length !== 0;

  if (subMethodName && hasMethods) {
    return _.template(subResourceTemplateText, {
      resource: {
        name: generatorUtil.cleanSubMethodName(ramlResource.relativeUri),
        description: documentation.formatDescription(ramlResource.description, true),
        methods: generateMethods(ramlResource, relativeUri)
      }
    });
  }

  if (!subMethodName) {
    console.log('Failed to generate sub method:', relativeUri, '\nbecause the sub method name could not be resolved');
  } else if (!hasMethods) {
    console.log('Failed to generate sub method:', relativeUri, '\nbecause this sub method has no sub methods');
  }

  return '';
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
  var compiledResource = '';
  var uri = relativeUri + ramlResource.relativeUri;
  if (level !== 0) {
    if (isCollection(ramlResource)) {
      compiledResource += generateSubResource(ramlResource, uri);
    } else {
      compiledResource += generateMethods(ramlResource, uri);
    }

    if (compiledResource) {
      compiledResource = generatorUtil.indentText(indentAmount * level, compiledResource);
    }
  } else {
    compiledResource = generateMethods(ramlResource, uri);
  }

  var hasResources = ramlResource.resources && ramlResource.resources.length > 0;

  if (hasResources && compiledResource) {
    ramlResource.resources.forEach(function(resource) {
      var isCol = isCollection(resource);
      var incrementer = isCol ? 1 : 0;
      var recursResult = recursResources(resource, level + incrementer, uri);
      recursResult = recursResult.trimRight();

      if (recursResult) {
        compiledResource = compiledResource.trimRight();

        if (compiledResource) {
          compiledResource += ',' + endOfLine;
        }

        compiledResource += recursResult;

        if (isCol) {
          compiledResource += endOfLine;
          compiledResource += generatorUtil.indentText(indentAmount * (level + 1), '}');
        }
      }
    });
  } else if (!hasResources && !compiledResource) {
    console.log('Failed to generate resources for uri:', uri, '\nbecause this route doesn\'t have any methods or sub resources');
  }

  return compiledResource;
};

/**
 * Generates the service methods for the provided RAML resource object
 *
 * @param {Object} ramlResource - The RAML resource to generate the methods and sub resources for
 * @param {Object} selectedMediaTypeExtension - The selected media type extension to use when generating resource.
 * @returns {string} The compiled template string
 */
module.exports.generate = function(ramlResource, selectedMediaTypeExtension) {
  // Get all of the required templates
  methodTemplateText = generatorUtil.readFileAsString(methodTemplatePath);
  subResourceTemplateText = generatorUtil.readFileAsString(subResourceTemplatePath);
  mediaTypeExtension = selectedMediaTypeExtension;
  var compiledTemplate = recursResources(ramlResource, 0, '');
  compiledTemplate = generatorUtil.indentText(indentAmount, compiledTemplate);
  return compiledTemplate;
};
