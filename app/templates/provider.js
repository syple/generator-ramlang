angular.module('<%= app.name %>')

/**
 * This provider is used as the main interface for communicating with RESTful web resources.
 */
.provider('Api', function() {
  var self = this;
  var baseApiUrl = null;
  var suffix = '';

  /**
   * Sets the base api url. This value must lead with a '/'
   *
   * @param {String} url The value to set as the base api url
   */
  self.setApiBaseUrl = function(url) {

    if (angular.isString(url)) {
      var cleanUrl = angular.copy(url);
      var match = cleanUrl.match(/(http|https):\/\//i);
      var httpPrefix = 'http://';

      if (match && match.length > 0) {
        httpPrefix = match[0];
      }

      cleanUrl = cleanUrl.replace(httpPrefix, '');
      cleanUrl = cleanUrl.replace(/\/+/g, '/');
      cleanUrl = cleanUrl.split('/');

      // remove all of the last entries if they are empty string.
      while(cleanUrl.length > 0 && cleanUrl[cleanUrl.length - 1] === "") {
        cleanUrl.pop();
      }

      baseApiUrl = httpPrefix + cleanUrl.join('/');
    }
  };

  /**
   * Sets the value of the suffix to append to the end of the url before making the request.
   *
   * @param {String} value The value the set the suffix of the request url.
   */
  self.setRequestSuffix = function(value) {
    suffix = value;
  };

  self.$get = ['$http', function($http) {

    /**
     * Main method that calls the api
     *
     * @param {String} type The HTTP verb to use. eg: GET, POST, PUT, DELETE
     * @param {String} resourceName The name of the resource to calls
     * @param {Number=} [id] The id of the resource.
     * @param {String=} [query] The query string to append.
     * @param {Object=} [data] The data to post with the request.
     * @returns {*}
     */
    var callApi = function(type, resourceName, id, query, data) {
      return $http({
        method: type,
        url: buildUrl(resourceName, id, query),
        data: data
      });
    };

    /**
     * Constructs the request url to call using the base api url and resource data provided.
     *
     * @param {String} resourcePath The relative path of the resource.
     * @param {Number=} [id] The id of the resource.
     * @param {String=} [query] The query string to append.
     * @returns {string} The complete url to request.
     */
    var buildUrl = function(resourcePath, id, query) {

      // If the resource path doesn't start with a '/' then prefix it.
      if (resourcePath.indexOf('/') != 0) {
        resourcePath = '/' + resourcePath;
      }

      var parts = [resourcePath];

      if (angular.isDefined(id) && id != null) {
        parts.push(id);
      }

      return baseApiUrl + parts.join('/') + suffix + (query ? query : '');
    };

    return {
      /**
       * Calls the api with the get http verb.
       *
       * @param {String} resourceName The name of the resource to call.
       * @param {Number=} [id] The id of the resource.
       * @param {String=} [query] The query string to append.
       * @returns {Object} The promise object which made the request.
       */
      get: function(resourceName, id, query) {
        console.info('going to call resource', resourceName, 'using http verb GET with id', id || 'NONE');
        return callApi('GET', resourceName, id, query);
      },

      /**
       * Calls the api with the post http verb sending the data object provided with the request.
       *
       * @param {String} resourceName The name of the resource to call.
       * @param {Object} data The object to post with the request.
       * @returns {Object} The promise object which made the request.
       */
      post: function(resourceName, data) {
        console.info('going to call resource', resourceName, 'using http verb POST with data', data);
        return callApi('POST', resourceName, null, null, data);
      },

      /**
       * Calls the api with the put http verb sending the data object provided with the request.
       *
       * @param {String} resourceName The name of the resource to call.
       * @param {Number} id The id of the resource.
       * @param {Object} data The object to post with the request.
       * @returns {Object} The promise object which made the request.
       */
      put: function(resourceName, id, data) {
        console.info('going to call resource', resourceName, 'using http verb PUT with data', data, 'and id', id);
        return callApi('PUT', resourceName, id, null, data);
      },

      /**
       * Calls the api with the delete http verb.
       *
       * @param {String} resourceName The name of the resource to call.
       * @param {Number=} id The id of the resource.
       * @returns {Object} The promise object which made the request.
       */
      delete: function(resourceName, id) {
        console.info('going to call resource', resourceName, 'using http verb DELETE with id', id || 'NONE');
        return callApi('DELETE', resourceName, id);
      }
    };
  }];

  return self;
})<% if (!_.isUndefined(app.baseUri) && !_.isNull(app.baseUri)) { %>

/**
 * Sets up the api base url.
 */
.config(['ApiProvider', function(ApiProvider) {
  ApiProvider.setApiBaseUrl('<%= app.baseUri %>');
}])<% } %>