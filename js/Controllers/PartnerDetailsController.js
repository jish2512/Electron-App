
environmentApp.controller('EnvironmentController', ['$rootScope','$scope', 'FxpFactory', '$filter', '$state', '$stateParams', 'fxpMessage', 'fxpConstants', 'fxpModel',
function ($rootScope,$scope, FxpFactory, $filter, $state, $stateParams, fxpMessage, fxpConstants, fxpModel) {
    $scope.formSubmitted = false;
    $scope.isPersonaRouteUpdated = false;
    $scope.isPersonaHLinkUpdated = false;
    $scope.editScriptsModel = {};
    $scope.editPartnerModuleform = {};
    $scope.editStylesform = {};
    $scope.editScriptsform = {};
    $scope.editRouteform = {};
    $scope.FxpUIStrings = {};
    $scope.EditRouteModel = {};
    $scope.content = {};

    /*intial page loading functionality */
    function PageInit() {
        $rootScope.$emit("enableBack", true);
        FxpFactory.getPersonaList($stateParams.EnvID).then(function (response) {
            var personaList = [];
            var data = JSON.parse(JSON.stringify(eval("(" + response + ")")));
            $scope.PersonaData = data;
            for (var persona in data.Personas) {
                personaList.push(persona);
            }
            $scope.Personas = personaList;
        }, function (error) {
            fxpMessage.addMessage(fxpConstants.Error, "error");
        });

        FxpFactory.getRoutes($stateParams.EnvID).then(function (response) {
            var data = JSON.parse(JSON.stringify(eval("(" + response + ")")));
            $scope.Routes = data.Routes;
            for (var route in data.Routes) {
                $scope.Routes[route].RouteConfig = JSON.parse(JSON.stringify(eval("(" + data.Routes[route].RouteConfig + ")")));
            }
            $scope.FxpHelpLinks = data.FxpHelpLinks;
        }, function (error) {
            fxpMessage.addMessage(fxpConstants.Error, "error");
        });
        FxpFactory.getPartnerModules($stateParams.EnvID).then(function (response) {
            var data = JSON.parse(JSON.stringify(eval("(" + response + ")")));
            $scope.PartnerModules = data.PartnerModules;
            $scope.Scripts = data.PartnerAssets.Scripts;
            $scope.Styles = data.PartnerAssets.Styles;
            $scope.BaseConfiguration = data.BaseConfiguration;
            $scope.FxpConfigurationStrings = data.BaseConfiguration.FxpConfigurationStrings;
            $scope.FxpUIStrings = data.BaseConfiguration.FxpConfigurationStrings.UIStrings;
            $scope.OBOUIStrings = data.BaseConfiguration.FxpConfigurationStrings.UIStrings.OBOUIStrings;
            $scope.FxpFooterData = data.BaseConfiguration.FxpFooterData;
        }, function (error) {
            fxpMessage.addMessage(fxpConstants.Error, "error");
        });
        FxpFactory.getPersonaRoles($stateParams.EnvID).then(function (response) {
            var data = JSON.parse(JSON.stringify(eval("(" + response + ")")));
            $scope.PersonaRoles = data.Persona;
        }, function (error) {
            fxpMessage.addMessage(fxpConstants.Error, "error");
        });
        $scope.footerdata = FxpFactory.getFxpFooterData();
    }

    PageInit();

    /*parsing route config data*/
    $scope.getconfigParse = function (data) {
        if (data != null || data != undefined) {
            return JSON.parse(JSON.stringify(eval("(" + data + ")")));
        }
    }

    $scope.onNavigate = function (state) {
        $state.go(state);
    }


    /*update add delete Partner Scripts*/
    $scope.editPrtnerScripts = function (key, action, index) {
        $scope.submitted = false;
        $scope.isDuplicateScriptUrl = false;
        $scope.editIndex = index;
        $scope.envEdiables = {};
        if (action == fxpConstants.Action.Edit) {
            $scope.envEdiables = angular.copy(key);
            $scope.envEdiables.ButtonText = fxpConstants.Action.Update;
            $scope.envEdiables.Action = fxpConstants.Action.Update;
        } else {
            $scope.envEdiables.ButtonText = fxpConstants.Action.Save;
            $scope.envEdiables.Action = fxpConstants.Action.Add;
        }
        angular.element(document.querySelector('#editScriptsModel')).modal('show');
    }
    $scope.deletePartnerScripts = function (module, index) {
        $scope.Deletedindex = index;
        angular.element(document.querySelector('#confirmScriptsModule')).modal('show');
    }
    $scope.deletePartnerScriptsDetails = function () {
        $scope.Scripts.splice($scope.Deletedindex, 1);
        var data = angular.copy($scope.Scripts);
        FxpFactory.updatePartnerScriptsDetails(data, $stateParams.EnvID).then(function () {
            angular.element(document.querySelector('#confirmScriptsModule')).modal('hide');
            fxpMessage.addMessage(fxpConstants.PartnerScripts.Delete, "success");
        }, function (response) {
            var envDetails = JSON.parse(JSON.stringify(eval("(" + localStorage.getItem("partnerapp") + ")")));
            $scope.Scripts = envDetails.PartnerAssets.Scripts
            fxpMessage.addMessage(fxpConstants.PartnerScripts.Error, "error");
            angular.element(document.querySelector('#confirmScriptsModule')).modal('hide');
        });
    }
    
    $scope.ScriptUrlAvilabiltyCheck = function (action) {
        var script = $scope.envEdiables.Url;
        $scope.isDuplicateScriptUrl = $scope.Scripts.filter(function (obj, index) {
            if (index != $scope.editIndex) {
                return obj.Url.toLowerCase() == script.toLowerCase();
            }
        }).length > 0;
    }

    $scope.updatePartnerScripts = function (modaldata, form) {
        $scope.submitted = true;
        if (form.$valid && !$scope.isDuplicateScriptUrl) {
            var index;
            if (modaldata.Action == fxpConstants.Action.Update) {
                index = $scope.editIndex;
                $scope.Scripts[index].Url = modaldata.Url;
                $scope.Scripts[index].SortOrder = modaldata.SortOrder;

            } else {
                fxpModel.PartnerScripts.Url = modaldata.Url;
                fxpModel.PartnerScripts.SortOrder = modaldata.SortOrder;
                $scope.Scripts.push(angular.copy(fxpModel.PartnerScripts));
            }
            var data = angular.copy($scope.Scripts);
            FxpFactory.updatePartnerScriptsDetails(data, $stateParams.EnvID).then(function (response) {
                angular.element(document.querySelector('#editScriptsModel')).modal('hide');
                if (modaldata.Action == fxpConstants.Action.Update) {
                    fxpMessage.addMessage(fxpConstants.PartnerScripts.Update, "success");
                } else
                    fxpMessage.addMessage(fxpConstants.PartnerScripts.Add, "success");
            }, function (response) {
                var envDetails = JSON.parse(JSON.stringify(eval("(" + localStorage.getItem("partnerapp") + ")")));
                $scope.Scripts = envDetails.PartnerAssets.Scripts
                fxpMessage.addMessage(fxpConstants.PartnerScripts.Error, "error");
                angular.element(document.querySelector('#editScriptsModel')).modal('hide');
            });
            form = {};

        }
    };

    $scope.IsObject = function (value) {
        $scope.isJsontext = (typeof value != "string") ? true : false;
        return $scope.isJsontext;
    }

    /*update add delete Partner Styles*/
    $scope.editPrtnerStyles = function (key, action, index) {
        $scope.submitted = false;
        $scope.isDuplicateStyle=false;
        $scope.editIndex = index;
        $scope.envEdiables = {};
        if (action == fxpConstants.Action.Edit) {
            $scope.envEdiables = angular.copy(key);
            $scope.envEdiables.ButtonText = fxpConstants.Action.Update;
            $scope.envEdiables.Action = fxpConstants.Action.Update;
        } else {
            $scope.envEdiables.ButtonText = fxpConstants.Action.Save;
            $scope.envEdiables.Action = fxpConstants.Action.Add;
        }
        angular.element(document.querySelector('#editStylesModel')).modal('show');
    }
    $scope.deletePartnerStyles = function (module, index) {
        $scope.Deletedindex = index;
        angular.element(document.querySelector('#confirmStylesModule')).modal('show');
    }
    $scope.deletePartnerStylesDetails = function () {
        $scope.Styles.splice($scope.Deletedindex, 1);
        var data = angular.copy($scope.Styles);
        FxpFactory.updatePartnerStylesDetails(data, $stateParams.EnvID).then(function () {
            angular.element(document.querySelector('#confirmStylesModule')).modal('hide');
            fxpMessage.addMessage(fxpConstants.PartnerStyles.Delete, "success");
        }, function (response) {
            var envDetails = JSON.parse(JSON.stringify(eval("(" + localStorage.getItem("partnerapp") + ")")));
            $scope.Styles = envDetails.PartnerAssets.Styles
            fxpMessage.addMessage(fxpConstants.PartnerStyles.Error, "error");
            angular.element(document.querySelector('#confirmStylesModule')).modal('hide');
        });
    }
    $scope.updatePartnerStyles = function (modaldata, form) {
        $scope.submitted = true;

        if (form.$valid && !$scope.isDuplicateStyle) {
            var index;
            if (modaldata.Action == fxpConstants.Action.Update) {
                index = $scope.editIndex;
                $scope.Styles[index].Url = modaldata.Url;
                $scope.Styles[index].SortOrder = modaldata.SortOrder;
            } else {
                fxpModel.PartnerStyles.Url = modaldata.Url;
                fxpModel.PartnerStyles.SortOrder = modaldata.SortOrder;
                $scope.Styles.push(angular.copy(fxpModel.PartnerStyles));
            }

            var data = angular.copy($scope.Styles);
            FxpFactory.updatePartnerStylesDetails(data, $stateParams.EnvID).then(function (response) {
                angular.element(document.querySelector('#editStylesModel')).modal('hide');
                if (modaldata.Action == fxpConstants.Action.Update) {
                    fxpMessage.addMessage(fxpConstants.PartnerStyles.Update, "success");
                } else
                    fxpMessage.addMessage(fxpConstants.PartnerStyles.Add, "success");
            }, function (response) {
                var envDetails = JSON.parse(JSON.stringify(eval("(" + localStorage.getItem("partnerapp") + ")")));
                $scope.Styles = envDetails.PartnerAssets.Styles
                fxpMessage.addMessage(fxpConstants.PartnerStyles.Error, "error");
                angular.element(document.querySelector('#editStylesModel')).modal('hide');
            });

        }
    };

    $scope.StylesAvilabiltyCheck = function (action) {
        var style = $scope.envEdiables.Url;
        $scope.isDuplicateStyle = $scope.Styles.filter(function (obj, index) {
            if (index != $scope.editIndex) {
                return obj.Url.toLowerCase() == style.toLowerCase();
            }
        }).length > 0;
    }

    /*update add delete Partner Modules*/
    $scope.editPartnerModule = function (key, action, index) {
        $scope.submitted = false;
        $scope.isDuplicatePartnerModule = false;
        $scope.editIndex = index;
        $scope.envEdiables = {};
        if (action == fxpConstants.Action.Edit) {
            $scope.envEdiables.ButtonText = fxpConstants.Action.Update;
            $scope.envEdiables.Action = fxpConstants.Action.Update;
            $scope.envEdiables.partnerModule = angular.copy(key);
        } else {
            $scope.envEdiables.ButtonText = fxpConstants.Action.Save;
            $scope.envEdiables.Action = fxpConstants.Action.Add;
            $scope.envEdiables.partnerModule = "";
        }
        angular.element(document.querySelector('#editPartnerModule')).modal('show');
    }
    
    $scope.PartnerModuleAvilabiltyCheck = function (action) {
        var partnerModule = $scope.envEdiables.partnerModule;
        $scope.isDuplicatePartnerModule = $scope.PartnerModules.filter(function (obj, index) {
            if (index != $scope.editIndex) {
                return obj.toLowerCase() == partnerModule.toLowerCase();
            }
        }).length > 0;
    }

    $scope.deletePartnerModule = function (module, index) {
        $scope.Deletedindex = index;
        angular.element(document.querySelector('#confirmPartnerModule')).modal('show');
    }
    $scope.deletePartnerModuleDetails = function () {
        $scope.PartnerModules.splice($scope.Deletedindex, 1);
        var data = angular.copy($scope.PartnerModules);
        FxpFactory.updatePartnerModuleDetails(data, $stateParams.EnvID).then(function () {
            angular.element(document.querySelector('#confirmPartnerModule')).modal('hide');
            fxpMessage.addMessage(fxpConstants.PartnerModules.Delete, "success");
        }, function (response) {
            var envDetails = JSON.parse(JSON.stringify(eval("(" + localStorage.getItem("partnerapp") + ")")));
            $scope.PartnerModules = envDetails.PartnerModules;
            fxpMessage.addMessage(fxpConstants.PartnerModules.Error, "error");
            angular.element(document.querySelector('#confirmPartnerModule')).modal('hide');
        });
    }
    $scope.updatePartnerModule = function (modaldata, form) {
        $scope.submitted = true;
        if (form.$valid&&!$scope.isDuplicatePartnerModule) {
            if (modaldata.Action == fxpConstants.Action.Update) {
                var index = $scope.editIndex;
                $scope.PartnerModules[index] = modaldata.partnerModule;
            } else {
                $scope.PartnerModules.push(modaldata.partnerModule);
            }
            FxpFactory.updatePartnerModuleDetails($scope.PartnerModules, $stateParams.EnvID).then(function (response) {
                angular.element(document.querySelector('#editPartnerModule')).modal('hide');
                if (modaldata.Action == fxpConstants.Action.Update) {
                    fxpMessage.addMessage(fxpConstants.PartnerModules.Update, "success");
                } else
                    fxpMessage.addMessage(fxpConstants.PartnerModules.Add, "success");
            }, function (response) {
                var envDetails = JSON.parse(JSON.stringify(eval("(" + localStorage.getItem("partnerapp") + ")")));
                $scope.PartnerModules = envDetails.PartnerModules;
                fxpMessage.addMessage(fxpConstants.PartnerModules.Error, "error");
                angular.element(document.querySelector('#editPartnerModule')).modal('hide');
            });

        }
    }

    /*update add delete Routes*/
    $scope.routeChecked = function (persona, route, elementid) {
        try {
            var element = angular.element(document.querySelector('#' + elementid));
            FxpFactory.updatePersonaRouteMapping(persona, route, !element[0].checked, $stateParams.EnvID);
            $scope.isPersonaRouteUpdated = true;
        } catch (e) {
            fxpMessage.addMessage(fxpConstants.Error, "error");
        }
    }
    $scope.verifyPersonaHelpLinkMap = function (persona, helpLinkText) {
        var personaList = $scope.PersonaData;
        return (personaList.Personas[persona].FxpHelpLinks.indexOf(helpLinkText) >= 0);
    }

    $scope.addRoute = function () {
        $scope.submitted = false;
        $scope.isDupicateRouteName = false;
        $scope.EditRouteModel = {};
        $scope.EditRouteModel.RouteConfig = {};
        angular.element(document.querySelector('#AddRouteModel')).modal('show');
    }
    $scope.editRoute = function (routeObject, action, index) {
        $scope.isDupicateRouteName = false;
        $scope.submitted = false;
        $scope.editIndex = index;
        $scope.EditRouteModel = {};
        $scope.EditRouteModel.RouteConfig = {};
        if (action == fxpConstants.Action.Edit) {
            $scope.ModelTitle = "Update Route Configuration";
            $scope.EditRouteModel = angular.copy(routeObject);
            $scope.EditRouteModel.ButtonText = fxpConstants.Action.Update;;
            $scope.EditRouteModel.Action = fxpConstants.Action.Update;
        } else {
            $scope.ModelTitle = "Add Route Configuration";
            $scope.EditRouteModel.ButtonText = fxpConstants.Action.Save;
            $scope.EditRouteModel.Action = fxpConstants.Action.Add;
        }
        angular.element(document.querySelector('#AddRouteModel')).modal('show');
    }
    $scope.CreateRouteConfigKey = function () {
        $scope.submitted = false;
        $scope.disableKeys = false;
        $scope.routeConfigKeyEdiables = [];
        $scope.routeConfigKeyEdiables.Action = fxpConstants.Action.Add;
        angular.element(document.querySelector('#AddRouteConfigModel')).modal('show');
    }
    $scope.editRouteConfigKey = function (key, value, index) {
        $scope.submitted = false;
        $scope.disableKeys = true;
        $scope.routeEditIndex = index;
        $scope.routeConfigKeyEdiables = { key: "", value: "" };
        $scope.routeConfigKeyEdiables.key = key;
        $scope.routeConfigKeyEdiables.value = (typeof value == 'string') ? value : JSON.stringify(value,null,4);
        $scope.routeConfigKeyEdiables.Action = fxpConstants.Action.Update;
        angular.element(document.querySelector('#AddRouteConfigModel')).modal('show');
    }
    $scope.updateRouteConfigKey = function (model, form, isJsonChecked) {
        $scope.submitted = true;
        $scope.isInvalidJson = false;
        if (form.$valid) {
            if (isJsonChecked) {
                $scope.isInvalidJson = !$scope.validateJson(model.value);
            }
            if (!$scope.isInvalidJson) {
                $scope.EditRouteModel.RouteConfig[model.key] = model.value;
                angular.element(document.querySelector('#AddRouteConfigModel')).modal('hide');
            }
        }
    }

    $scope.validateJson = function (text) {
        try {
            angular.fromJson(text);
        } catch (e) {
            return false;
        }
        return true;
    }

    $scope.JsonCheckbox = function () {
        $scope.isInvalidJson = false;
    }
    $scope.updateRoute = function (modaldata, action, form) {
        $scope.submitted = true;
        if (form.$valid && !$scope.isDupicateRouteName) {
            var route = {};
            if (action == fxpConstants.Action.Update) {
                var index = $scope.editIndex;
                $scope.Routes[index].StateName = modaldata.StateName;
                $scope.Routes[index].AppHeader = modaldata.AppHeader;
                $scope.Routes[index].Style = modaldata.Style;
                $scope.Routes[index].RouteConfig = modaldata.RouteConfig;
                $scope.Routes[index].RouteName = modaldata.RouteName
                route = angular.copy($scope.Routes[index]);

            } else {
                fxpModel.Routes.StateName = modaldata.StateName;
                fxpModel.Routes.RouteConfig = modaldata.RouteConfig;
                fxpModel.Routes.Style = modaldata.Style;
                fxpModel.Routes.AppHeader = modaldata.AppHeader;
                fxpModel.Routes.RouteName = modaldata.RouteName;
                route = angular.copy(fxpModel.Routes);
                $scope.Routes.push(fxpModel.Routes);
            }
            route.RouteConfig = JSON.stringify(modaldata.RouteConfig);
            FxpFactory.updateRouteDetails($stateParams.EnvID, route, action, index).then(function (response) {
                
                var persona = JSON.parse(JSON.stringify(eval("(" + localStorage.getItem("personaRouteMapping") + ")")));
                $scope.PersonaData = persona;
                if (action == fxpConstants.Action.Update) {
                    fxpMessage.addMessage(fxpConstants.Routes.Update, "success");
                    angular.element(document.querySelector('#AddRouteModel')).modal('hide');
                } else {
                    fxpMessage.addMessage(fxpConstants.Routes.Add, "success");
                    angular.element(document.querySelector('#AddRouteModel')).modal('hide');
                }
            }, function (error) {
                
                var envDetails = JSON.parse(JSON.stringify(eval("(" + localStorage.getItem("routes") + ")")));
                $scope.Routes = envDetails.Routes;
                fxpMessage.addMessage(fxpConstants.Routes.Error, "error");
                if (action == fxpConstants.Action.Update) {
                    angular.element(document.querySelector('#AddRouteModel')).modal('hide');
                } else {
                    angular.element(document.querySelector('#AddRouteModel')).modal('hide');

                }
            });
        }
    };
    $scope.deleteRouteKey = function (routeKey) {
        $scope.DeletedRouteKey = routeKey;
        angular.element(document.querySelector('#confirmRouteKeyModal')).modal('show');
    }
    $scope.deleteRouteKeyConfirm = function () {
        try {
            delete $scope.EditRouteModel.RouteConfig[$scope.DeletedRouteKey];
            angular.element(document.querySelector('#confirmRouteKeyModal')).modal('hide');
        } catch (error) {
            fxpMessage.addMessage(fxpConstants.Routes.Error, "error");
        }
    }
    $scope.deleteRoute = function (index) {
        $scope.Deletedindex = index;
        angular.element(document.querySelector('#confirmRouteModal')).modal('show');
    }
    $scope.deleteRouteConfirm = function () {
        $scope.Routes.splice($scope.Deletedindex, 1);
        FxpFactory.updateRouteDetails($stateParams.EnvID, null, 'Delete', $scope.Deletedindex).then(function () {
            angular.element(document.querySelector('#confirmRouteModal')).modal('hide');
            fxpMessage.addMessage(fxpConstants.Routes.Delete, "success");
        }, function (response) {
            var envDetails = JSON.parse(JSON.stringify(eval("(" + localStorage.getItem("routes") + ")")));
            $scope.Routes = envDetails.Routes;
            fxpMessage.addMessage(fxpConstants.Routes.Error, "error");
            angular.element(document.querySelector('#confirmRouteModal')).modal('hide');
        });
    }
    $scope.RouteNameAvilabiltyCheck = function (action) {
        route = $scope.EditRouteModel.RouteName;
        $scope.isDupicateRouteName = $scope.Routes.filter(function (obj, index) {
            if (index != $scope.editIndex) {
                return obj.RouteName.toLowerCase() == route.toLowerCase();
            }
        }).length > 0;
    }
    $scope.updatePersonaRouteMap = function () {
        try {
            FxpFactory.updatePersonaRouteMapptofiles($stateParams.EnvID);
            fxpMessage.addMessage(fxpConstants.Routes.RouteMap, "success");
            $scope.isPersonaRouteUpdated = false;
        } catch (e) {
            fxpMessage.addMessage(fxpConstants.Routes.Error, "error");
        }
    }
    $scope.verifyPersonaRouteMap = function (persona, route) {
        var personaList = $scope.PersonaData;
        return (personaList.Personas[persona].Routes.indexOf(route) >= 0);
    }




    /*Navigate to our landing page of Partner Details and FXP*/
    $scope.navigateTohome = function () {
        $state.go("wizard");
    }


    /*close all modal*/
    $scope.modalClose = function (container, form) {
        $scope.submitted = false;
        angular.element(document.querySelector('#' + container)).modal('hide');
    }
    /*cancel all modals*/
    $scope.modelCancel = function (container) {
        angular.element(document.querySelector('#' + container)).modal('hide');
    }


}]);

