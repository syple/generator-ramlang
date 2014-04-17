angular.module('<%= app.name %>')

<%= resource.description %>
.factory('<%= resource.displayName %>', ['Api', function(Api) {
  return {
<%= resource.methods %>
  };
}])