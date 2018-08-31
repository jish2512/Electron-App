environmentApp.controller('wizardController', ['$scope', 'FxpFactory', '$state', '$rootScope', 'fxpMessage', 'fxpConstants', 'FxpPreSetupFactory','$timeout',
function ($scope, FxpFactory, $state, $rootScope, fxpMessage, fxpConstants, FxpPreSetupFactory, $timeout) {

    $scope.selected = {};
    $scope.selectedPath = "";
    $scope.sourceEnvironment = "";
    $scope.onClickConfigNewEnvironment = function () {
        localStorage.removeItem('selectedEnv');
        $scope.sourceEnvironment = '';
        $rootScope.isConfigEnvCall = true;
        $state.go("setup");
    }
    $scope.navigateHome = function () {
        $rootScope.isConfigEnvCall = false;
        $state.go("wizard");
    }
    function PageInit() {
        $scope.isDuplicatePath = false;

        FxpFactory.getConfigDetails().then(function (response) {
            var data = JSON.parse(JSON.stringify(eval("(" + response + ")")));
            $scope.Environments = data;
        });
        manageHeaderButtons(false);
        $scope.isFormsubmitted = false;
        $scope.isDupicateEnvironmentName = false;
    }
    $rootScope.$on("environmentChange", function (evt, data) {
        $scope.sourceEnvironment = data;
    });
    $rootScope.$on("newUserEvent", function (evt, value) {
        $scope.isNewUser = value;
    });
    $rootScope.$on("enableBack", function (evt,value) { 
        $scope.isDisplayBack = value;
    });
    $rootScope.$on("enablePublish", function (evt, value) {
        manageHeaderButtons(value);
        $scope.enablePublish = !value;

    });

    function manageHeaderButtons(val) {
        try {
            var settings = angular.element(document.querySelector('#liPublish'))[0];
            settings.attributes['data-disabled'].value = !val;
        } catch (err) {
            fxpMessage.addMessage(fxpConstants.error, "error");
        }
    }
    PageInit();
    //fetch folder local folder name
    $scope.selectFolder = function (e) {
        if (e.files.length != 0) {
            var files = e.files;
            $scope.isDuplicatePath = $scope.Environments.filter(function (obj, index) {
                return obj.LocalPath == files[0].path;
            }).length > 0;

            $scope.$apply(function () {
                $scope.selected.LocalPath = files[0].path;
            });

        }
        else {
            $scope.$apply(function () {
                $scope.selected.LocalPath = "";
            });
        }
    }
    $scope.EnvironmentNameAvilabiltyCheck = function (action) {
        env = $scope.selected.EnvironmentName;
        if (env != undefined) {
            $scope.isDuplicateEnvironmentName = $scope.Environments.filter(function (obj, index) {
                return obj.EnvironmentName.toLowerCase() == env.toLowerCase();
            }).length > 0;
        }
    }
    //go to landing page based on the source type

    $scope.onNext = function (model) {
        try {
            $scope.isFormsubmitted = true;
            if ((model.$valid) && (!$scope.isDuplicateEnvironmentName) && (!$scope.isDuplicatePath)) {
                switch ($scope.selected.Source) {
                    case fxpConstants.Source.File:
                        var confirmFromUser = false;
                        var isFilesExists = FxpFactory.verifyFilesinDirectory($scope.selected.LocalPath+'\\', $scope.selected.Source);
                        if (isFilesExists) {
                            FxpFactory.downloadLocalFiles($scope.selected).then(function (response) {
                                FxpPreSetupFactory.initializePersonaRoutes($scope.selected.LocalPath + '\\');
                                navigateToWizard(response);
                            });
                        } else {
                            fxpMessage.addMessage(fxpConstants.fileNotExists, "error");
                        }
                        break;
                    case fxpConstants.Source.Blob:
                        FxpFactory.pullBlobFilestoLocal($scope.selected).then(function (response) {
                            var path = fxpConstants.configuration.path + $scope.selected.EnvironmentName;
                            var isFilesExists = FxpFactory.verifyFilesinDirectory(path+'/', 'confit');
                            if (!isFilesExists) {
                                if (confirm(fxpConstants.blobfileNotExists)) {
                                    FxpFactory.updateMissingFiles($scope.selected.EnvironmentName);
                                    isFilesExists = true;
                                } else {
                                    FxpFactory.deleteConfigDirectory($scope.selected);
                                }
                            } if (isFilesExists) {
                                $timeout(function () {
                                    FxpPreSetupFactory.initializePersonaRoutes(path + '/');
                                    configEnvironment();
                                }, 2000);
                                
                            }

                        }, function (error) {
                            console.log(error);
                            FxpFactory.deleteConfigDirectory($scope.selected);
                            fxpMessage.addMessage(fxpConstants.AzureStorageError, "error");
                        });
                        break;
                    default:
                        fxpMessage.addMessage(fxpConstants.Source.Warning, "warning");
                }
            }
        } catch (error) {
            fxpMessage.addMessage(fxpConstants.Error, "error");
        }
    }


    function configEnvironment() {
        FxpFactory.updateConfiguration($scope.selected).then(function (response) {
            navigateToWizard(response);
            fxpMessage.addMessage(fxpConstants.Success, "success");
        }, function (error) {
            fxpMessage.addMessage(fxpConstants.Error, "error");
        });
    }
    function navigateToWizard(Environment) {
        $rootScope.isConfigEnvCall = false;
        manageHeaderButtons(true);
        $scope.isNewUser = false;
        localStorage.setItem("selectedEnv", JSON.stringify(Environment));
        $state.go("wizard");
    };



    $scope.modelCancel = function (container) {
        angular.element(document.querySelector('#' + container)).modal('hide');
    }



    //publish details to blob
    $scope.onClickPublish = function () {
        try {
            $rootScope.$emit("onPublish");

        } catch (error) {
            fxpMessage.addMessage(fxpConstants.Error, "error");
        }
    }


    $scope.createNewEnvironment = function () {
        try {
            var data = JSON.parse(localStorage.getItem("selectedEnv"));
            FxpFactory.downloadNewDefaultFiles(data).then(function (response) {
                $scope.isConfigEnvCall = false;
                manageHeaderButtons(false);
                $scope.isNewUser = false;
                $state.go("wizard");
                localStorage.setItem("selectedEnv", JSON.stringify(response));
                angular.element(document.querySelector('#confirmNewUser')).modal('hide');
            });
        }
        catch (error) {
            fxpMessage.addMessage(fxpConstants.Error, "error");
        }
    }

}]);