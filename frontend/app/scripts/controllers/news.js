'use strict';

/**
 * @ngdoc function
 * @name frontendApp.controller:NewsCtrl
 * @description
 * # NewsCtrl
 * Controller of the frontendApp
 */
angular.module('frontendApp')
  .controller('NewsCtrl', ['$scope', '$state', '$stateParams', 'articles', function ($scope,$state, $stateParams, articles) {
    $scope.page = $stateParams.page;
    $scope.data = {};
    $scope.conditions = {};


    $scope.pageChanged = function() {
      $scope.searchArticles();
      //$state.go('admin.user.home',{page: $scope.page});
      //$location.path('/users/page/'+$scope.page);
    };

    $scope.delete = function(item){
      articles.remove({id: item.id});
      $state.go('news.list',{}, {reload: true});
    };
    $scope.searchArticles = function(form){
      $scope.conditions.page = $scope.page;
      articles.searchArticles( $scope.conditions, function(err, data){
        //console.log('>> data:'+ JSON.stringify(data));
        if(!err && err === null) {
        //  angular.forEach(data.articles, function(article, idx){
        //    var url = article.img_url;
        //    if(url){
        //      var dot = url.lastIndexOf('.');
        //      data.articles[idx].th_img_url = (dot != -1)? url.substring(0, dot)+'-th'+ url.substring(dot)
        //        : url + '-th';
        //    }
        //  });
          $scope.data.rows = (data.articles && data.articles.length > 0)? Math.ceil(data.articles.length / 3): 1;
          $scope.data.articles = data.articles;
          $scope.totalItems = data.count;
          $scope.page = data.page;

        }
      });
    };

    $scope.searchArticles();
  }])
  .controller('NewNewsCtrl', ['$scope', '$state', '$stateParams', '$timeout', '$window', '$upload', 'articles',
    function ($scope, $state, $stateParams, $timeout, $window, $upload, articles) {
      $scope.article = {};
      $scope.files = [];

      //console.log($scope.currentUser);
      if(!$scope.currentUser || $scope.currentUser.role.title != 'admin'){
        //$window.alert('Login Required');
        return $state.go('anon.login');
      }
      //listen for the file selected event
      $scope.$on("fileSelected", function (event, args) {
        $scope.$apply(function () {
          //add the file object to the scope's files collection
          $scope.files.push(args.file);
        });
      });

      // Create article with file attachment
      $scope.uploadArticle = function(myform) {
        $scope.progress = 0;
        $scope.error = null;
        //console.log($scope.files);
        $scope.upload = $upload.upload({
          url: '/articles/upload',
          method: 'POST',
          data : {
            article : $scope.article
          },
          file: ($scope.files != null)? $scope.files: null,
          fileFormDataName: 'file'
        }).progress(function (evt) {
          // Math.min is to fix IE which reports 200% sometimes
          $scope.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
        }).success(function (data, status, headers, config) {
          //console.log(config);
          console.log('>>success data')
          console.log(data);
          $state.go('news.view',{id: data.id}, {reload: true});
        });
      };
      $scope.cancelEdit = function(){
        $state.go('news.list');
      };

    }])
  .controller('ViewNewsCtrl', ['$scope', '$state', '$stateParams', '$modal', '$upload', 'articles',
    function ($scope, $state, $stateParams, $modal, $upload, articles) {
      $scope.data = {};

      $scope.delete = function(article){
        articles.remove({id: article.id}, function(err){
          if(err) {
            console.log(err);
            $scope.error = err;
          }
          console.log('deleted');
          $state.go('news.list',{},{reload:true});
        });
      };

      $scope.viewArticle = function(form){
        //console.log($scope.currentUser);
        //console.log('>> article id: '+ $stateParams.id);
        articles.get({
          id: $stateParams.id
        }, function(err, data){
          console.log(data);
          if(err) {
            $scope.error = err;
          } else {
            $scope.data.article = data;
          }
        });
      };

      $scope.editArticle = function(){
        console.log(">>article:");console.log($scope.data.article);
        var modalInstance = $modal.open({
          templateUrl: 'views/partials/news/news.edit.html',
          controller: 'EditNewsCtrl',
          resolve: {
            article: function(){
              return $scope.data.article;
            }
          }
        });
        modalInstance.result.then(function(editedArticle){
          console.log(editedArticle);
          saveArticle(editedArticle); //update article with file attachment
        }, function(){
          console.log('Caneled');
        });

      };

      $scope.cancelEdit = function(){
        $state.go('news.list');
      };

      // Update article with file attachment
      var saveArticle = function(article) {
        $scope.progress = 0;
        $scope.error = null;
        //console.log($scope.files);
        $scope.upload = $upload.upload({
          url: '/articles/save_article',
          method: 'POST',
          data : {
            article: article
          },
          file: (article.files != null)? article.files: null,
          fileFormDataName: 'file'
        }).progress(function (evt) {
          // Math.min is to fix IE which reports 200% sometimes
          $scope.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
        }).success(function (data, status, headers, config) {
          //console.log(config);
          console.log('>>success data')
          console.log(data); //article with assets
          $state.go('news.view',{id: $stateParams.id}, {reload: true});
        });
      };

      $scope.viewArticle();
    }])
  .controller('EditNewsCtrl', ['$scope', '$state', 'assets', '$modalInstance', 'article', function ($scope, $state, assets, $modalInstance, article) {
    $scope.data = {};
    var origin = angular.copy(article);
    $scope.data.article = article;
    $scope.files = [];

    //listen for the file selected event
    $scope.$on("fileSelected", function (event, args) {
      $scope.$apply(function () {
        //add the file object to the scope's files collection
        $scope.files.push(args.file);
      });
    });

    $scope.save = function(){
      $scope.data.article.files = $scope.files;
      $modalInstance.close($scope.data.article);
    };
    $scope.cancel = function(){
      $scope.data.article.name = origin.name;
      $scope.data.article.img_url = origin.img_url;
      $scope.data.article.summary = origin.summary;
      $scope.data.article.content = origin.content;
      $modalInstance.dismiss('cancel');
    };
    $scope.removeFile = function(file){
      var files = $scope.data.article.assets;
      if(files){
        assets.remove({id: file.id}, function(err, asset){
          if(!err) files.splice(files.indexOf(file),1);
        });
      }
    };

  }]);
