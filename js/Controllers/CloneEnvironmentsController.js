environmentApp.controller('CloneEnvironmentsController', ['$scope', 'FxpFactory','FxpPublishFactory', '$state', '$rootScope', 'fxpMessage', 'fxpConstants',
function ($scope, FxpFactory,FxpPublishFactory, $state, $rootScope, fxpMessage, fxpConstants) {
    $scope.selected = {};
    PageInit();
    function PageInit() {
        $rootScope.$emit("enableBack", true);
        $scope.isDuplicatePath = false;
        FxpFactory.getConfigDetails().then(function (response) {
            var data = JSON.parse(JSON.stringify(eval("(" + response + ")")));
            if (data.length > 0) {
                $scope.configEnv = data;
            } else {
                $rootScope.$emit("enablePublish", false);
                $rootScope.$emit("enableBack", false);
                $rootScope.isConfigEnvCall = true;
                fxpMessage.addMessage(fxpConstants.NoEnvironment, "warning");
                $state.go('setup');
            }
        });
    }
   
    $scope.EnvironmentNameAvilabiltyCheck = function (action) {
        env = $scope.selected.EnvironmentName;
        if (env != undefined) {
            $scope.isDuplicateEnvironmentName = $scope.configEnv.filter(function (obj, index) {
                return obj.EnvironmentName.toLowerCase() == env.toLowerCase();
            }).length > 0;
        }
    }
    $scope.onNext = function (model) {
        $scope.isFormsubmitted = true;
        try{
            if ((model.$valid) && (!$scope.isDuplicateEnvironmentName) && (!$scope.isDuplicatePath)) {
                if ($scope.selected.Source == fxpConstants.Source.Blob) {
                    FxpPublishFactory.verifyConnection($scope.selected).then(function (response) {
                        FxpFactory.cloneEnvironment($scope.selected).then(function (response) {
                            console.log(response);
                            configEnvironment(response);
                        });
                    }, function (error) {
                        fxpMessage.addMessage(fxpConstants.AzureStorageError, "error");
                    });
                    
                } else {
                    FxpFactory.cloneEnvironment($scope.selected).then(function (response) {
                        console.log(response);
                        configEnvironment(response);
                    });
                }
            }
        } catch (error) {
            fxpMessage.addMessage(fxpConstants.Error, "error");
        }


    }
    $scope.selectFolder = function (e) {
        if (e.files.length != 0) {
            var files = e.files;
            $scope.isDuplicatePath = $scope.configEnv.filter(function (obj, index) {
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
    //switching between configured environment
    $scope.onChangeEnvironment = function (item) {
        if ($scope.selected.selectedEnvironment != undefined) {
            $scope.selected.oldEnvironment = item.EnvironmentName;
            $scope.selected.Source = item.Source;
            $scope.selected.FileSourceType = item.FileSourceType;
            $scope.selected.oldPath = item.LocalPath;
        } else {
            $scope.selected.oldEnvironment = "";
            $scope.selected.Source = "";
            $scope.selected.FileSourceType ="";
            $scope.selected.oldPath = "";
        }

    }
    function configEnvironment(configData) {
        FxpFactory.updateConfiguration(configData).then(function (response) {
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
    $scope.navigateHome = function () {
        $state.go('wizard');
    }
    function manageHeaderButtons(val) {
        try {
            var settings = angular.element(document.querySelector('#liPublish'))[0];
            settings.attributes['data-disabled'].value = !val;
        } catch (err) {
            fxpMessage.addMessage(fxpConstants.error, "error");
        }
    }

}]);