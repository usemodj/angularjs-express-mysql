'use strict';

angular.module('frontendApp')
    .controller('TopicCtrl', ['$scope', '$state', '$stateParams', 'topics', function ($scope,$state, $stateParams, topics) {
        $scope.page = $stateParams.page;
        $scope.data = {};
        $scope.conditions = {};


        $scope.pageChanged = function() {
            $scope.searchForums();
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
            topics.remove(item);
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
    .controller('NewTopicCtrl', ['$scope', '$state', '$stateParams', '$timeout', '$upload', 'topics', function ($scope, $state, $stateParams, $timeout, $upload, topics) {
        $scope.newTopic = {};
        $scope.files = [];

        //listen for the file selected event
        $scope.$on("fileSelected", function (event, args) {
            $scope.$apply(function () {
                //add the file object to the scope's files collection
                $scope.files.push(args.file);
            });
        });

        $scope.addTopic = function(form){
            $scope.newTopic.forum_id = $stateParams.forum_id;
            topics.save($scope.newTopic, function(err, data){
                console.log('>> data:'+ JSON.stringify(data));
                if(err) {
                    $scope.error = err;
                } else {
                    //$state.go('forums.topics.list', {forum_id: $stateParams.forum_id});
                    $state.go('forums.topics.view', {forum_id: $stateParams.forum_id, id: data.id});
                }
            });
        };

        $scope.uploadTopic = function(myform) {
            $scope.newTopic.forum_id = $stateParams.forum_id;
            $scope.progress = 0;
            $scope.error = null;
            console.log($scope.files);
            console.log('>>selectedFiles:');
            console.log($scope.selectedFiles = $scope.files);
            $scope.upload = $upload.upload({
                url: '/forums/topics/upload',
                method: 'POST',
                 data : {
                    topic : $scope.newTopic
                },
                file: ($scope.selectedFiles != null)? $scope.selectedFiles: null,
                fileFormDataName: 'file'
            }).progress(function (evt) {
                // Math.min is to fix IE which reports 200% sometimes
                $scope.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
            }).success(function (data, status, headers, config) {
                //console.log(config); console.log(data);
                //console.log('file ' + config.file.name + 'uploaded. Response: ' + data);
                $state.go('forums.topics.view',{forum_id: $stateParams.forum_id, id: data.id}, {reload: true});
            });
        };


    }])
    .controller('ViewTopicCtrl', ['$scope', '$state', '$stateParams', '$modal', 'topics', '$rootScope', function ($scope,$state, $stateParams, $modal, topics, $rootScope) {
        $scope.data = {};

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
                topics.updatePost(editedPost);
            });

            //$state.go('forums.topics.edit', {forum_id: $stateParams.forum_id, id: $stateParams.id});
        };

        $scope.cancelEdit = function(){
            $state.go('forums.topics.list', {forum_id: $stateParams.forum_id});
        };

        $scope.viewTopic();
    }])
    .controller('EditTopicCtrl', ['$scope', '$state', '$modalInstance', 'post', function ($scope,$state, $modalInstance, post) {
        $scope.data = {};
        var origin = angular.copy(post);
        $scope.data.post = post;
        $scope.save = function(){
            $modalInstance.close($scope.data.post);
        };
        $scope.cancel = function(){
            $scope.data.post.name = origin.name;
            $scope.data.post.content = origin.content;
            $modalInstance.dismiss('cancel');
        };



    }]);
