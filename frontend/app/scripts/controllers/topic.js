'use strict';

angular.module('frontendApp')
    .controller('TopicCtrl', ['$scope', '$state', '$stateParams', 'topics', function ($scope,$state, $stateParams, topics) {
        $scope.page = $stateParams.page;
        $scope.data = {};
        $scope.conditions = {};


        $scope.pageChanged = function() {
            $scope.searchTopics();
            //$state.go('admin.user.home',{page: $scope.page});
            //$location.path('/users/page/'+$scope.page);
        };

        $scope.sticky = function(item){
            item.sticky = true;
            topics.setSticky(item, function(err, data){

            });
            $state.go('forums.topics.list', {forum_id: item.forum_id}, {reload: true});
        };
        $scope.unsticky = function(item){
            item.sticky = false;
            topics.setSticky(item, function(err, data){

            });
            $state.go('forums.topics.list', {forum_id: item.forum_id}, {reload: true});
        };

        $scope.locked = function(item, isLocked){
          item.locked = isLocked;
          topics.setLocked(item, function(err, data){

          });
          $state.go('forums.topics.list', {forum_id: item.forum_id}, {reload: true});
        };

        $scope.delete = function(item){
            topics.remove({forum_id: item.forum_id, id: item.id});
            $state.go('forums.topics.list', {forum_id: item.forum_id}, {reload: true});
        };
        $scope.searchTopics = function(form){
            topics.searchTopics({
                forum_id: $stateParams.forum_id,
                name: $scope.conditions.name,
                email: $scope.conditions.email,
                page: $scope.page
            }, function(err, data){
                //console.log('>> data:'+ JSON.stringify(data));
                if(!err && err === null) {
                    $scope.data.forums = data.forums;
                    data.child_forums.shift();
                    $scope.data.child_forums = data.child_forums;
                    $scope.data.sticky_topics = data.sticky_topics;
                    $scope.data.topics = data.topics;
                    $scope.totalItems = data.count;
                    $scope.page = data.page;
                }
            });
        };

        $scope.searchTopics();
    }])
    .controller('NewTopicCtrl', ['$scope', '$state', '$stateParams', '$timeout', '$window', '$upload', 'topics',
    function ($scope, $state, $stateParams, $timeout, $window, $upload, topics) {
        $scope.newTopic = {};
        $scope.files = [];

        //console.log($scope.currentUser);
        if(!$scope.currentUser || !$scope.currentUser.email){
          //$window.alert('Login Required');
          return $state.go('anon.login');
        }
        //listen for the file selected event
        $scope.$on("fileSelected", function (event, args) {
            $scope.$apply(function () {
                //add the file object to the scope's files collectionU
                $scope.files.push(args.file);
            });
        });

        // create topic without file attachment
        $scope.addTopic = function(form){
            $scope.newTopic.forum_id = $stateParams.forum_id;
            topics.save($scope.newTopic, function(err, data){
                //console.log('>> data:'+ JSON.stringify(data));
                if(err) {
                    $scope.error = err;
                } else {
                    //$state.go('forums.topics.list', {forum_id: $stateParams.forum_id});
                    $state.go('forums.topics.view', {forum_id: $stateParams.forum_id, id: data.id});
                }
            });
        };

        // Create topic with file attachment
        $scope.uploadTopic = function(myform) {
            $scope.newTopic.forum_id = $stateParams.forum_id;
            $scope.progress = 0;
            $scope.error = null;
            //console.log($scope.files);
            $scope.upload = $upload.upload({
                url: '/forums/topics/upload',
                method: 'POST',
                 data : {
                    topic : $scope.newTopic
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
                $state.go('forums.topics.view',{forum_id: $stateParams.forum_id, id: data.id}, {reload: true});
            });
        };
        $scope.cancelEdit = function(){
            $state.go('forums.topics.list', {forum_id: $stateParams.forum_id});
        };

    }])
    .controller('ViewTopicCtrl', ['$scope', '$state', '$stateParams', '$modal', '$upload', 'topics', '$rootScope',
        function ($scope, $state, $stateParams, $modal, $upload, topics, $rootScope) {
        $scope.data = {};

        $scope.delete = function(topic){
            console.log('call delete');
//            topics.remove(topic);
//            $state.go('forums.topics.list', {forum_id: topic.forum_id}, {reload: true});
            topics.remove({forum_id: topic.forum_id, id: topic.id}, function(err){
                if(err) {
                    console.log(err);
                    $scope.error = err;

                }
                console.log('remove called');
                $state.go('forums.topics.list', {forum_id: topic.forum_id}, {reload: true});
            });
        };
        $scope.viewTopic = function(form){
            console.log($rootScope.currentUser);
            //console.log(routingConfig);
            topics.get({
                forum_id: $stateParams.forum_id,
                id: $stateParams.id
            }, function(err, data){
                //console.log(data);
                if(err) {
                    $scope.error = err;
                } else {
                    $scope.data = data;
                }
                var topic = data.topic;
                if(topic.locked){
                  if(!$rootScope.currentUser || ($rootScope.currentUser.id != topic.user_id
                    && $rootScope.currentUser.role.title != 'admin')) {
                    $scope.error = 'Locked Page!';
                    $state.go('forums.topics.list', {forum_id: $stateParams.forum_id});
                  }
                }
            });
        };

        $scope.replyPost = function(form){
            topics.replyPost({
                forum_id: $stateParams.forum_id,
                topic_id: $stateParams.id,
                name: $scope.newPost.name,
                content: $scope.newPost.content
            }, function(err, data){
                //console.log('>> data:'+ JSON.stringify(data));
                if(err) {
                    $scope.error = err;
                } else {
                    $scope.data = data;
                    $state.go('forums.topics.view',{forum_id: $stateParams.forum_id, id: $stateParams.id}, {reload:true});
                }
            });
        };
        $scope.deletePost = function(item){
            topics.deletePost( item, function(err, data){
                //console.log('>> data:'+ JSON.stringify(data));
                if(err) {
                    $scope.error = err;
                } else {
                    $scope.data.posts.splice($scope.data.posts.indexOf(item),1);
                }

                $state.go('forums.topics.view',{forum_id: $stateParams.forum_id, id: $stateParams.id}, {reload:true});
            });
        };
        $scope.editPost = function(post){
            $scope.data.post = post;
            console.log(">>post:");console.log($scope.data.post);
            var modalInstance = $modal.open({
                templateUrl: 'views/partials/forums/topics/topics.edit.html',
                controller: 'EditTopicCtrl',
                resolve: {
                    post: function(){
                        return $scope.data.post;
                    }
                }
            });
            modalInstance.result.then(function(editedPost){
                console.log(editedPost);
                //topics.updatePost(editedPost); //update post without file attachment
                savePost(editedPost); //update post with file attachment
            });

            //$state.go('forums.topics.edit', {forum_id: $stateParams.forum_id, id: $stateParams.id});
        };

        $scope.cancelEdit = function(){
            $state.go('forums.topics.list', {forum_id: $stateParams.forum_id});
        };
        // Update topic with file attachment
        var savePost = function(post) {
            post.forum_id = $stateParams.forum_id;
            post.topic_id = $stateParams.id;
            $scope.progress = 0;
            $scope.error = null;
            //console.log($scope.files);
            $scope.upload = $upload.upload({
                url: '/forums/topics/save_post',
                method: 'POST',
                data : {
                    post : post
                },
                file: (post.files != null)? post.files: null,
                fileFormDataName: 'file'
            }).progress(function (evt) {
                // Math.min is to fix IE which reports 200% sometimes
                $scope.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
            }).success(function (data, status, headers, config) {
                //console.log(config);
                console.log('>>success data')
                console.log(data); //post with assets
                $state.go('forums.topics.view',{forum_id: $stateParams.forum_id, id: $stateParams.id}, {reload: true});
            });
        };

        $scope.viewTopic();
    }])
    .controller('EditTopicCtrl', ['$scope', '$state', 'assets', '$modalInstance', 'post', function ($scope, $state, assets, $modalInstance, post) {
        $scope.data = {};
        var origin = angular.copy(post);
        $scope.data.post = post;
        $scope.files = [];

        //listen for the file selected event
        $scope.$on("fileSelected", function (event, args) {
            $scope.$apply(function () {
                //add the file object to the scope's files collection
                $scope.files.push(args.file);
            });
        });

        $scope.save = function(){
            $scope.data.post.files = $scope.files;
            $modalInstance.close($scope.data.post);
        };
        $scope.cancel = function(){
            $scope.data.post.name = origin.name;
            $scope.data.post.content = origin.content;
            $modalInstance.dismiss('cancel');
        };
        $scope.removeFile = function(file){
            var files = $scope.data.post.assets;
            if(files){
                assets.remove({id: file.id}, function(err, asset){
                    if(!err) files.splice(files.indexOf(file),1);
                });
             }
        };

    }]);
