<% _.forEach(methods, function(method) {%>
<%= method.description %>
<%= method.factoryMethodName %>: function(<%= method.queryParameters %>) {
  return Api.<%= method.name %>(<%= method.apiQueryParameters %>);
}<%= method.separator %>
<% }); %>