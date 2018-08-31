environmentApp.controller('ManageEnvironmentsController', ['$scope', 'FxpFactory', '$state', '$rootScope', 'fxpMessage', 'fxpConstants', 'fxpModel',
function ($scope, FxpFactory, $state, $rootScope, fxpMessage, fxpConstants, fxpModel) {
    PageInit();
    function PageInit() {
        $rootScope.$emit("enableBack", true);
        FxpFactory.getConfigDetails().then(function (response) {
            var data = JSON.parse(JSON.stringify(eval("(" + response + ")")));
            $scope.Environments = data;
            localStorage.removeItem('selectedEnv');
            $rootScope.$emit("environmentChange", '');
            $rootScope.$emit("enablePublish", false);
        });
    }
    $scope.selectFolder = function (e) {
        if (e.files.length != 0) {
            var files = e.files;
            $scope.$apply(function () {
                $scope.envEdiables.LocalPath = files[0].path;
            });
        }
        else {
            $scope.$apply(function () {
                $scope.envEdiables.LocalPath = "";
            });
        }
    }

    //Managing Environment
    $scope.editConfiguredEnvironments = function (model, action, index) {
        $scope.editIndex = index;
        $scope.submitted = false;
        $scope.envEdiables = {};
        if (action == fxpConstants.Action.Edit) {
            $scope.envEdiables = angular.copy(model);
            $scope.envEdiables.ButtonText = fxpConstants.Action.Update;
            $scope.envEdiables.Action = fxpConstants.Action.Update;
        } else {
            $scope.envEdiables.ButtonText = fxpConstants.Action.Save;
            $scope.envEdiables.Action = fxpConstants.Action.Add;
        }
        angular.element(document.querySelector('#editEnvironments')).modal('show');
    }
    $scope.updateConfiguredEnvironments = function (form) {
        $scope.submitted = true;
        if (form.$valid) {
            var envName = "";
            var isValid = true;
            var index = $scope.editIndex;
            var uDataModel = angular.copy($scope.Environments);
            if ($scope.envEdiables.Source === fxpConstants.Source.File) {
                var pathName = $scope.envEdiables.LocalPath.split(/\\/g);
                envName = pathName[pathName.length - 1];
                if ($scope.envEdiables.LocalPath != uDataModel[index].LocalPath) {
                    isValid = FxpFactory.verifyFilesinDirectory($scope.envEdiables.LocalPath, $scope.envEdiables.FileSourceType);
                    if (!isValid) {
                        fxpMessage.addMessage(fxpConstants.fileNotExists, "error");
                    }
                }


            }
            if (isValid) {
                envName = ($scope.envEdiables.Source === fxpConstants.Source.File) ? envName : $scope.envEdiables.EnvironmentName;
                fxpModel.configDetails.Source = $scope.envEdiables.Source;
                fxpModel.configDetails.LocalPath = $scope.envEdiables.LocalPath;
                fxpModel.configDetails.FileSourceType = $scope.envEdiables.FileSourceType;
                fxpModel.configDetails.StorageName = $scope.envEdiables.StorageName;
                fxpModel.configDetails.StorageKey = $scope.envEdiables.StorageKey;
                fxpModel.configDetails.EnvironmentName = envName;
                if ($scope.envEdiables.Action === fxpConstants.Action.Update) {
                    uDataModel[index] = fxpModel.configDetails;
                } else {
                    uDataModel.push(fxpModel.configDetails);
                }

                if ($scope.envEdiables.Source === fxpConstants.Source.File) {
                    FxpFactory.updateConfigData(uDataModel).then(function (response) {
                        angular.element(document.querySelector('#editEnvironments')).modal('hide');
                        fxpMessage.addMessage(fxpConstants.Success, "success");
                        $scope.Environments = angular.copy(uDataModel);
                    }, function (error) {
                        fxpMessage.addMessage(fxpConstants.Error, "error");
                    });
                } else {
                    FxpFactory.updateConfigWithBlobFiles(uDataModel, $scope.envEdiables).then(function (response) {
                        angular.element(document.querySelector('#editEnvironments')).modal('hide');
                        fxpMessage.addMessage(fxpConstants.Success, "success");
                        $scope.Environments = angular.copy(uDataModel);
                    }, function (error) {
                        fxpMessage.addMessage(fxpConstants.AzureStorageError, "error");
                    });

                }
            }
        }
    }
    $scope.EnvironmentNameAvilabiltyCheck = function (action) {
        var envName = $scope.envEdiables.EnvironmentName;
        $scope.isDupicateEnvironmentName = $scope.Environments.filter(function (obj, index) {
            if (index != $scope.editIndex) {
                return obj.EnvironmentName.toLowerCase() == envName.toLowerCase();
            }
        }).length > 0;
    }
    $scope.deleteEnvironment = function (module, index) {
        $scope.Deletedindex = index;
        angular.element(document.querySelector('#confirmEnvironmentsModule')).modal('show');
    }
    $scope.deleteEnvironmentConfirm = function () {
        var envConfig = $scope.Environments[$scope.Deletedindex];
        $scope.Environments.splice($scope.Deletedindex, 1);
        var dataCollection = angular.copy($scope.Environments);
        FxpFactory.updateConfigData(dataCollection).then(function () {
            FxpFactory.deleteConfigDirectory(envConfig);
            angular.element(document.querySelector('#confirmEnvironmentsModule')).modal('hide');
            fxpMessage.addMessage(fxpConstants.Messages.Delete, "success");
        }, function (error) {
            fxpMessage.addMessage(fxpConstants.Error, "error");
        });
    }
    $scope.modelCancel = function (container) {
        angular.element(document.querySelector('#' + container)).modal('hide');
    }
}]);