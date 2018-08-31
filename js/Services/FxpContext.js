/**
 * @application  Fxp
 */
/**
 * @module Fxp.Services
 */
var Fxp;
(function (Fxp) {
    var Services;
    (function (Services) {

        var FxpContext = (function () {
            function FxpContext($rootScope, fxpConstants) {
                this.getCurrentEnvironment = function () {
                    var environment = undefined;
                    if (localStorage.getItem("selectedEnv") != null) {
                        environment = JSON.parse(localStorage.getItem("selectedEnv"));
                    }
                    return environment;
                };
                this.getCurrentDirectroryPath = function () {
                    var environment = this.getCurrentEnvironment();
                    var path = "";
                    if (environment != undefined) {
                        if (environment.Source === 'blob') {
                            path = fxpConstants.configuration.path + environment.EnvironmentName;
                        } else {
                            path = environment.LocalPath;
                        }
                    }
                    return path;
                };

            }
            return FxpContext;
        })();
        Services.FxpContext = FxpContext;
        angular
            .module('fxpEnvironment')
            .service('fxpContext', ['$rootScope', 'fxpConstants', FxpContext])
    })(Services = Fxp.Services || (Fxp.Services = {}));
})(Fxp || (Fxp = {}));
