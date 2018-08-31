environmentApp.controller('PublishController', ['$scope', 'FxpFactory', '$filter', '$state', 'fxpMessage', 'fxpConstants', 'fxpModel', 'fxpContext', 'FxpPublishFactory', '$rootScope',
function ($scope, FxpFactory, $filter, $state, fxpMessage, fxpConstants, fxpModel, fxpContext, FxpPublishFactory, $rootScope) {

    $rootScope.$on("onPublish", function () {
        angular.element(document.querySelector('#publishWizard')).modal('show');
        pageInt();
    });
    $scope.enableEdit = function () {
        $scope.isEnableStorage = true;
        $("#txtName").focus();
        //angular.element(document.querySelector('#txtName')).focus();
    }
    function pageInt() {
        try {
            $scope.isEnableStorage = false;
            $scope.submitted = false;
            $scope.errorMessage = '';
            $scope.wizard = 'storageDetailsWizard';
            $scope.Environment = fxpContext.getCurrentEnvironment();
            $scope.Files = FxpPublishFactory.getFileNames(fxpContext.getCurrentDirectroryPath());
            $scope.FileOptions = getFileOptions();
            $scope.Storage = angular.copy($scope.Environment);
        } catch (error) {
            console.log(error);
        }
    }
    function getFileOptions() {
        $scope.selected = true;
        var options = [];
        for (var file in $scope.Files) {
            options.push({
                value: $scope.Files[file].split('.')[0],
                selected: true
            })
        }
        return options;
    }
    pageInt();
    $scope.nextFromStorage = function (model, form) {
        $scope.submitted = true;
        if (form.$valid) {
            FxpPublishFactory.verifyConnection($scope.Storage).then(function (response) {
                $scope.wizard = 'publishFilesWizard';
                $scope.errorMessage = ''
                $scope.submitted = false;
            }, function (error) {
                $scope.errorMessage = fxpConstants.AzureStorageError;
            });
        }
    }
    $scope.publish = function (model, form) {
        try { 
            $scope.submitted = true;
            if (form.$valid) {
                FxpPublishFactory.verifyConnection($scope.Storage).then(function (response) {
                    var publishFiles = [];
                    //for (var file in $scope.FileOptions) {
                    //    if ($scope.FileOptions[file].selected === true) {
                    //        publishFiles.push($scope.FileOptions[file].value);
                    //    }
                    //}
                    for (var file in $scope.Files) {
                        publishFiles.push($scope.Files[file].split('.')[0]);
                    }
                    if (publishFiles.length > 0) {
                        FxpPublishFactory.publish(publishFiles, $scope.Storage).then(function () {
                            angular.element(document.querySelector('#publishWizard')).modal('hide');
                            fxpMessage.addMessage(fxpConstants.Publish, "success");
                            $state.reload();
                        }, function (error) {
                            $scope.errorMessage = fxpConstants.Error;
                        });
                    }
                }, function (error) {
                    $scope.errorMessage = fxpConstants.AzureStorageError;
                });
            }
        } catch (error) {
            $scope.errorMessage = fxpConstants.Error;
        }
    }


    $scope.toggleAll = function ($event) {
        $scope.selected = $event.target.checked;
        var toggleStatus = $scope.selected;
        angular.forEach($scope.FileOptions, function (itm) { itm.selected = toggleStatus; });

    }

    $scope.optionToggled = function (selected) {
        $scope.selected = $scope.FileOptions.every(function (itm) { return itm.selected; });
    }
    $scope.modelClose = function () {
        angular.element(document.querySelector('#publishWizard')).modal('hide');
        $scope.isEnableStorage = false;
    }
}]);