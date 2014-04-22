<% _.forEach(methods, function(method) {%>
<%= method.description %>
<%= method.factoryMethodName %>: function(<%= method.queryParameters %>) {
  return Api.<%= method.apiMethodName %>(<%= method.apiQueryParameters %>);
}<%= method.separator %>
<% }); %>