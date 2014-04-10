angular.module('<%= app.name %>')

/**
 * <%= resource.description %>
 */
.factory('<%= resource.displayName %>', ['Api', function(Api) {
  var resourceName = '<%= resource.relativeUri %>';
  var expand = 'expand(<%= resource.expand %>)';

  return {
<%= resource.methods %>
  };
}])