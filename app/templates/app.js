/**
 * <%= app.title %> <%= app.version %>
 */
angular.module('<%= app.name %>', [])

/**
 * Sets up the api base url
 */
.config(['ApiProvider', function(ApiProvider) {
    ApiProvider.setBaseUrl('<%= app.baseUri %>');
}])