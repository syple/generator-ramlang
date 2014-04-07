angular.module('<%= app.name %>')

/**
 * <%= resource.description %>
 */
.factory('<%= resource.displayName %>', ['Api', function(Api) {
  var resourceName = '<%= resource.relativeUri %>';
  var expand = 'expand(<%= resource.expand %>)';

  return {
    query: function(query) {
      return Api.get(resourceName, null, query);
    },
    get: function(id) {
      return Api.get(resourceName, id);
    },
    post: function(entity) {
      return Api.create(resourceName, entity);
    },
    put: function(entity) {
      return Api.update(resourceName, entity.id, entity);
    },
    delete: function(id) {
      return Api.remove(resourceName, id);
    }
  };
}])