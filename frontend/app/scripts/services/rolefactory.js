'use strict';
/*
 * $resource: The default set contains these actions:

 { 'get':    {method:'GET'},
 'save':   {method:'POST'},
 'query':  {method:'GET', isArray:true},
 'remove': {method:'DELETE'},
 'delete': {method:'DELETE'}
 };
 */

angular.module('frontendApp')
  .factory('RoleFactory', ['$resource', function ($resource) {
    // Public API here
    return $resource('/roles/:id', {id:'@id'}, {
        update: {method: 'PUT'}
    });
  }]);
