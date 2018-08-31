environmentApp.controller('DashboardController', ['$scope', 'FxpFactory', '$state', '$rootScope', 'fxpMessage', 'fxpConstants',
function ($scope, FxpFactory, $state, $rootScope, fxpMessage, fxpConstants) {
    $scope.selectedEnvironment = {};
    function PageInit() {
        $rootScope.$emit("enableBack", false);
        FxpFactory.getConfigDetails().then(function (response) {
             
            var data = JSON.parse(JSON.stringify(eval("(" + response + ")")));
            if (data.length > 0) {
                $scope.configEnv = data;
                if (localStorage.getItem("selectedEnv") != null) {
                    var obj = JSON.parse(localStorage.getItem("selectedEnv"));
                    $scope.configEnv.filter(function (config) {
                        if (config.EnvironmentName === obj.EnvironmentName) {
                            $scope.selectedEnvironment = config;
                            $scope.onChangeEnvironment(obj);
                        }
                    });
                } else {
                    $rootScope.$emit("enablePublish", false);
                }

            } else {
                $rootScope.$emit("enablePublish", false);
                $rootScope.isConfigEnvCall = true;
                $state.go('setup');
            }
            
        }, function (error) {
            fxpMessage.addMessage(fxpConstants.error, "error");
        });

    }

    PageInit();
     
    //switching between configured environment
    $scope.onChangeEnvironment = function (item) {
        var Environment = '';
        try {
            var enablePublish = false;
            if (item != null) {

                delete item.Environment;
                Environment = item.EnvironmentName;
                localStorage.setItem("selectedEnv", JSON.stringify(item));
                if (item.Source === 'file') {
                    enablePublish =false;
                } else {
                    enablePublish = true;
                }

            } else {
                Environment = '';
                localStorage.removeItem('selectedEnv');
                enablePublish = false;
            }
            $rootScope.$emit("enablePublish", enablePublish);
            $rootScope.$emit("environmentChange", Environment);
        } catch (err) {
            fxpMessage.addMessage(fxpConstants.error, "error");
        }
    }
    $scope.onNavigate = function (state) {
        var path = '';
        try {
            if (localStorage.getItem("selectedEnv") != null) {
                var data = JSON.parse(localStorage.getItem("selectedEnv"));
                if (data.Source == fxpConstants.Source.File) {
                    path = data.LocalPath.replace(/\\/g, "\\\\") + "\\\\";
                } else {
                    path = "./resources/" + JSON.parse(localStorage.getItem("selectedEnv")).EnvironmentName + '/';
                }
                $state.go(state, { EnvID: path });
            } else {
                fxpMessage.addMessage(fxpConstants.SelectEnvironmentWarning, "warning");
            }
        } catch (err) {
            fxpMessage.addMessage(fxpConstants.error, "error");
        }

    }

}]);