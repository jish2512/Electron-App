environmentApp.controller('FxpDetailsController', ['$rootScope','$scope', 'FxpFactory', '$filter', '$state', '$stateParams', 'fxpMessage', 'fxpConstants', 'fxpModel',
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
    $scope.editfxptelemetryform = {};

    $scope.verifyPersonaHelpLinkMap = function (persona, helpLinkText) {
        var personaList = $scope.PersonaData;
        return (personaList.Personas[persona].FxpHelpLinks.indexOf(helpLinkText) >= 0);
    }
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
        });

        FxpFactory.getRoutes($stateParams.EnvID).then(function (response) {
            var data = JSON.parse(JSON.stringify(eval("(" + response + ")")));
            $scope.FxpHelpLinks = data.FxpHelpLinks;
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
        });
        FxpFactory.getPersonaRoles($stateParams.EnvID).then(function (response) {
            var data = JSON.parse(JSON.stringify(eval("(" + response + ")")));
            $scope.PersonaRoles = data.Persona;
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

    /*update add delete Telemetry details*/
    $scope.editTelemetry = function (key, value, action, index) {
        try {
            $scope.isDulplicateKey = false;
            $scope.submitted = false;
            $scope.editIndex = index;
            $scope.envEdiables = {};
            if (action == fxpConstants.Action.Edit) {
                $scope.envEdiables.key = key;
                $scope.envEdiables.value = value;
                $scope.envEdiables.ButtonText = fxpConstants.Action.Update;
                $scope.envEdiables.Action = fxpConstants.Action.Update;
            } else {
                $scope.envEdiables.ButtonText = fxpConstants.Action.Save;
                $scope.envEdiables.Action = fxpConstants.Action.Add;
            }
            angular.element(document.querySelector('#editFxpTelemetry')).modal('show');
        } catch (error) {
            fxpMessage.addMessage(fxpConstants.Telemetry.Error, "error");
        }
    }
    $scope.deleteTelemetry = function (key, index) {
        $scope.Deletedindex = index;
        $scope.deleteTelemetryKey = key;
        angular.element(document.querySelector('#confirmTelemetryModule')).modal('show');
    }
    $scope.deleteTelemetryDetails = function () {
        delete $scope.BaseConfiguration.Telemetry[$scope.deleteTelemetryKey];
        var data = angular.copy($scope.BaseConfiguration.Telemetry);
        FxpFactory.updateTelemetryDetails(data, $stateParams.EnvID).then(function (response) {
            if (response != fxpConstants.NoData) {
                angular.element(document.querySelector('#confirmTelemetryModule')).modal('hide');
                fxpMessage.addMessage(fxpConstants.Telemetry.Delete, "success");
            }
        }, function (reason) {
            var envDetails = JSON.parse(JSON.stringify(eval("(" + localStorage.getItem("partnerapp") + ")")));
            $scope.BaseConfiguration.Telemetry = envDetails.BaseConfiguration.Telemetry;
            angular.element(document.querySelector('#confirmTelemetryModule')).modal('hide');
            fxpMessage.addMessage(fxpConstants.Telemetry.DeleteError, "error");
        });
    }
    $scope.updateFxpTelemetry = function (model, form) {
        $scope.submitted = true;
        if ((form.$valid) && (!$scope.isDulplicateKey)) {
            $scope.BaseConfiguration.Telemetry[model.key] = model.value;
            FxpFactory.updateTelemetryDetails($scope.BaseConfiguration.Telemetry, $stateParams.EnvID).then(function (response) {
                if (response != fxpConstants.NoData) {
                    angular.element(document.querySelector('#editFxpTelemetry')).modal('hide');
                    fxpMessage.addMessage(fxpConstants.Telemetry.Update, "success");
                }
            }, function (reason) {
                var envDetails = JSON.parse(JSON.stringify(eval("(" + localStorage.getItem("partnerapp") + ")")));
                $scope.BaseConfiguration.Telemetry = envDetails.BaseConfiguration.Telemetry;
                fxpMessage.addMessage(fxpConstants.Telemetry.Error, "error");
                angular.element(document.querySelector('#editFxpTelemetry')).modal('hide');

            });
        }
    }

    /*Navigate to our landing page of Partner Details and FXP*/
    $scope.navigateTohome = function () {
        $state.go("wizard");
    }

    /*update add delte FXP UI strings*/
    $scope.editUIStrings = function (key, value, action, index) {
        $scope.isDulplicateKey = false;
        $scope.submitted = false;
        $scope.editIndex = index;
        $scope.envEdiables = {};
        if (action == fxpConstants.Action.Edit) {
            $scope.envEdiables.key = key;
            $scope.envEdiables.value = value;
            $scope.envEdiables.ButtonText = fxpConstants.Action.Update;
            $scope.envEdiables.Action = fxpConstants.Action.Update;
        } else {
            $scope.envEdiables.ButtonText = fxpConstants.Action.Save;
            $scope.envEdiables.Action = fxpConstants.Action.Add;
        }
        angular.element(document.querySelector('#editFxpUIStrings')).modal('show');

    }
    $scope.deleteUIStrings = function (key, index) {
        $scope.deleteUIstrings = key;
        angular.element(document.querySelector('#confirmUIStrings')).modal('show');
    }
    $scope.deleteUIStringsDetails = function () {
        delete $scope.FxpUIStrings[$scope.deleteUIstrings];
        var data = angular.copy($scope.FxpUIStrings);
        FxpFactory.updateFxpUIDetails(data, $stateParams.EnvID).then(function (response) {
            if (response != fxpConstants.NoData) {
                angular.element(document.querySelector('#confirmUIStrings')).modal('hide');
                fxpMessage.addMessage(fxpConstants.UIStrings.Delete, "success");
            } else
                fxpMessage.addMessage(fxpConstants.UIStrings.Error, "error");
        });


    }
    $scope.updateFxpUIStrings = function (model, form) {
        $scope.submitted = true;
        if ((form.$valid) && (!$scope.isDulplicateKey)) {

            $scope.BaseConfiguration.FxpConfigurationStrings.UIStrings[model.key] = model.value;
            FxpFactory.updateFxpUIDetails($scope.BaseConfiguration.FxpConfigurationStrings.UIStrings, $stateParams.EnvID).then(function (response) {
                if (response != fxpConstants.NoData) {
                    angular.element(document.querySelector('#editFxpUIStrings')).modal('hide');
                    fxpMessage.addMessage(fxpConstants.UIStrings.Update, "success");
                } else
                    fxpMessage.addMessage(fxpConstants.UIStrings.Error, "error");
            });
        }

    }

    /*update add delete OBOstrings*/
    $scope.editOBOStrings = function (key, value, action, index) {
        $scope.isDulplicateKey = false;
        $scope.submitted = false;
        $scope.editIndex = index;
        $scope.envEdiables = {};
        if (action == fxpConstants.Action.Edit) {
            $scope.envEdiables.key = key;
            $scope.envEdiables.value = value;
            $scope.envEdiables.ButtonText = fxpConstants.Action.Update;
            $scope.envEdiables.Action = fxpConstants.Action.Update;
        } else {
            $scope.envEdiables.ButtonText = fxpConstants.Action.Save;
            $scope.envEdiables.Action = fxpConstants.Action.Add;
        }
        angular.element(document.querySelector('#editFxpOBOStrings')).modal('show');
    }
    $scope.deleteOBOStrings = function (key) {
        $scope.deleteOBOstrings = key;
        angular.element(document.querySelector('#confirmOBOStrings')).modal('show');
    }
    $scope.deleteOBOStringsDetails = function () {
        delete $scope.FxpUIStrings.OBOUIStrings[$scope.deleteOBOstrings];
        FxpFactory.updateFxpOBODetails($scope.FxpUIStrings.OBOUIStrings, $stateParams.EnvID).then(function (response) {
            angular.element(document.querySelector('#confirmOBOStrings')).modal('hide');
            fxpMessage.addMessage(fxpConstants.OBOStrings.Delete, "success");
        }, function (error) {
            fxpMessage.addMessage(fxpConstants.OBOStrings.Error.Delete, "error");
        });

    }
    $scope.updateFxpOBOStrings = function (model, form) {
        $scope.submitted = true;
        if ((form.$valid) && (!$scope.isDulplicateKey)) {
            $scope.BaseConfiguration.FxpConfigurationStrings.UIStrings.OBOUIStrings[model.key] = model.value;
            FxpFactory.updateFxpOBODetails($scope.BaseConfiguration.FxpConfigurationStrings.UIStrings.OBOUIStrings, $stateParams.EnvID).then(function (response) {
                angular.element(document.querySelector('#editFxpOBOStrings')).modal('hide');
                fxpMessage.addMessage(fxpConstants.OBOStrings.Update, "success");
            }, function (error) {
                fxpMessage.addMessage(fxpConstants.OBOStrings.Error.Update, "success");
            });
        }

    }
    $scope.MessageNameAvilabiltyCheck = function (action) {
        var messageName = $scope.envEdiables.MessageName;
        $scope.isDulplicateKey = $scope.FxpConfigurationStrings.UIMessages.hasOwnProperty(messageName);

    }
    $scope.keyDuplicateCheck = function (model) {
        try {
            $scope.isDulplicateKey = false;
            switch (model) {
                case fxpConstants.Models.Telemetry:
                    var tkey = $scope.envEdiables.key;
                    $scope.isDulplicateKey = $scope.BaseConfiguration.Telemetry.hasOwnProperty(tkey);
                    break;
                case fxpConstants.Models.UIStrings:
                    var ukey = $scope.envEdiables.key;
                    $scope.isDulplicateKey = $scope.FxpUIStrings.hasOwnProperty(ukey);
                    break;
                case fxpConstants.Models.OBOUIStrings:
                    var bkey = $scope.envEdiables.key;
                    $scope.isDulplicateKey = $scope.FxpUIStrings.OBOUIStrings.hasOwnProperty(bkey);
                    break;
                case fxpConstants.Models.Persona:
                    var pName = $scope.envEdiables.Name;
                    $scope.isDulplicateKey = $scope.PersonaRoles.filter(function (obj, index) {
                        if (index != $scope.editIndex) {
                            return obj.Name.toLowerCase() == pName.toLowerCase();
                        }
                    }).length > 0;
                    break;
                case fxpConstants.Models.PersonaRole:
                    var rName = $scope.envEdiables.RoleName;
                    var pIndex = $scope.PersonaRoles.indexOf($scope.envEdiables.parent);
                    $scope.isDulplicateKey = $scope.PersonaRoles[pIndex].Roles.filter(function (obj, index) {
                        if (index != $scope.editIndex) {
                            return obj.RoleName.toLowerCase() == rName.toLowerCase();
                        }
                    }).length > 0;
                    break;
                case fxpConstants.Models.FxpHelpLinks:
                    var bText = $scope.envEdiables.DisplayText;
                    $scope.isDulplicateKey = $scope.FxpHelpLinks.filter(function (obj, index) {
                        if (index != $scope.editIndex) {
                            return obj.DisplayText.toLowerCase() == bText.toLowerCase();
                        }
                    }).length > 0;
                    break;
                case fxpConstants.Models.FxpHelpChildLinks:
                    var dText = $scope.envEdiables.DisplayText;
                    var pIndex = $scope.FxpHelpLinks.indexOf($scope.envEdiables.parent);
                    $scope.isDulplicateKey = $scope.FxpHelpLinks[pIndex].HelpLinks.filter(function (obj, index) {
                        if (index != $scope.editIndex) {
                            return obj.DisplayText.toLowerCase() == dText.toLowerCase();
                        }
                    }).length > 0;
                    break;

            }


        }
        catch (error) {
        }


    },

    /*update add delete FxpMessages*/
    $scope.editMessages = function (key, message, action, index) {
        $scope.isDulplicateKey = false;
        $scope.submitted = false;
        $scope.editIndex = index;
        $scope.envEdiables = {};
        if (action == fxpConstants.Action.Edit) {
            $scope.envEdiables = angular.copy(message);
            $scope.envEdiables.MessageName = key;
            console.log(message);
            $scope.envEdiables.ButtonText = fxpConstants.Action.Update;
            $scope.envEdiables.Action = fxpConstants.Action.Update;
        } else {
            $scope.envEdiables.ButtonText = fxpConstants.Action.Save;
            $scope.envEdiables.Action = fxpConstants.Action.Add;
        }
        angular.element(document.querySelector('#editFxpMessages')).modal('show');
    }
    $scope.deleteFxpMessages = function (key, index) {
        $scope.deleteMessages = key;
        angular.element(document.querySelector('#confirmMessages')).modal('show');
    }
    $scope.deleteMessageDetails = function () {
        delete $scope.FxpConfigurationStrings.UIMessages[$scope.deleteMessages];
        var data = angular.copy($scope.FxpConfigurationStrings.UIMessages);
        FxpFactory.updateFxpMessageDetails(data, $stateParams.EnvID).then(function () {
            angular.element(document.querySelector('#confirmMessages')).modal('hide');
            fxpMessage.addMessage(fxpConstants.FXPMessage.Delete, "success");
        });

    }
    $scope.updateFxpMessage = function (model, form) {

        $scope.submitted = true;
        if (form.$valid && !$scope.isDulplicateKey) {
            var updatedModel = {};
            if (model.Action == fxpConstants.Action.Update) {
                $scope.FxpConfigurationStrings.UIMessages[model.MessageName].ErrorMessage = model.ErrorMessage;
                $scope.FxpConfigurationStrings.UIMessages[model.MessageName].ErrorMessageTitle = model.ErrorMessageTitle;
                updatedModel = angular.copy($scope.FxpConfigurationStrings.UIMessages);
            } else {
                fxpModel.Messages.ErrorMessage = model.ErrorMessage;
                fxpModel.Messages.ErrorMessageTitle = model.ErrorMessageTitle;
                $scope.FxpConfigurationStrings.UIMessages[model.MessageName] = fxpModel.Messages;
                updatedModel = angular.copy($scope.FxpConfigurationStrings.UIMessages);
            }
            FxpFactory.updateFxpMessageDetails(updatedModel, $stateParams.EnvID).then(function (response) {
                angular.element(document.querySelector('#editFxpMessages')).modal('hide');
                if (model.Action == fxpConstants.Action.Update) {
                    fxpMessage.addMessage(fxpConstants.FXPMessage.Update, "success");
                } else {
                    fxpMessage.addMessage(fxpConstants.FXPMessage.Add, "success");
                }
            }, function (error) {
                angular.element(document.querySelector('#editFxpMessages')).modal('hide');
                if (model.Action == fxpConstants.Action.Update) {
                    fxpMessage.addMessage(fxpConstants.FXPMessage.UpdateError, "error");
                } else {
                    fxpMessage.addMessage(fxpConstants.FXPMessage.AddError, "error");
                }
                console.log(error.data);
            });
        }

    }

    /*update add delete Persona*/
    $scope.editPersona = function (personaObj, action, index) {
        $scope.isDulplicateKey = false;
        $scope.submitted = false;
        $scope.editIndex = index;
        $scope.envEdiables = {};
        if (action == fxpConstants.Action.Edit) {
            $scope.envEdiables = angular.copy(personaObj);
            $scope.envEdiables.Id = parseInt(personaObj.Id);
            $scope.envEdiables.ButtonText = fxpConstants.Action.Update;
            $scope.envEdiables.Action = fxpConstants.Action.Update;
        } else {
            $scope.envEdiables.ButtonText = fxpConstants.Action.Save;
            $scope.envEdiables.Action = fxpConstants.Action.Add;
        }
        angular.element(document.querySelector('#editPersona')).modal('show');

    }
    $scope.updatePersona = function (model, form) {
        $scope.submitted = true;
        if ((form.$valid) && (!$scope.isDulplicateKey)) {
            var updateModel = {};
            var index = $scope.editIndex;
            if (model.Action == fxpConstants.Action.Update) {
                $scope.PersonaRoles[index].Id = model.Id;
                $scope.PersonaRoles[index].Name = model.Name;
                var updateModel = angular.copy($scope.PersonaRoles);
            } else {
                fxpModel.Persona.Id = model.Id;
                fxpModel.Persona.Name = model.Name;
                fxpModel.Persona.Roles = [];
                $scope.PersonaRoles.push(angular.copy(fxpModel.Persona));
                var updateModel = angular.copy($scope.PersonaRoles);
            }
            FxpFactory.updatePersonaRoles(updateModel, $stateParams.EnvID).then(function (response) {
                angular.element(document.querySelector('#editPersona')).modal('hide');
                if (model.Action == fxpConstants.Action.Update)
                    fxpMessage.addMessage(fxpConstants.Persona.Update, "success");
                else
                    fxpMessage.addMessage(fxpConstants.Persona.Add, "success");
            }, function (error) {
                angular.element(document.querySelector('#editPersona')).modal('hide');
                if (model.Action == fxpConstants.Action.Update)
                    fxpMessage.addMessage(fxpConstants.Persona.UpdateError, "error");
                else
                    fxpMessage.addMessage(fxpConstants.Persona.AddError, "error");
            });

        }

    }
    $scope.editPersonaRole = function (parentObj, roleObj, action, index) {
        $scope.isDulplicateKey = false;
        $scope.submitted = false;
        $scope.editIndex = index;
        $scope.envEdiables = {};
        if (action == fxpConstants.Action.Edit) {
            $scope.envEdiables = angular.copy(roleObj);
            $scope.envEdiables.Id = parseInt(roleObj.Id);
            $scope.envEdiables.ButtonText = fxpConstants.Action.Update;
            $scope.envEdiables.Action = fxpConstants.Action.Update;
        } else {
            $scope.envEdiables.ButtonText = fxpConstants.Action.Save;
            $scope.envEdiables.Action = fxpConstants.Action.Add;
        }
        $scope.envEdiables.parent = parentObj;
        angular.element(document.querySelector('#editPersonaRoles')).modal('show');

    }
    $scope.updatePersonaRole = function (model, form) {
        $scope.submitted = true;
        if ((form.$valid) && (!$scope.isDulplicateKey)) {
            var index = $scope.editIndex;
            var updateModel = {};
            var pIndex = $scope.PersonaRoles.indexOf(model.parent);
            if (model.Action == fxpConstants.Action.Update) {
                $scope.PersonaRoles[pIndex].Roles[index].RoleId = model.RoleId;
                $scope.PersonaRoles[pIndex].Roles[index].RoleName = model.RoleName;
            } else {
                fxpModel.PersonaRole.RoleId = model.RoleId;
                fxpModel.PersonaRole.RoleName = model.RoleName;
                $scope.PersonaRoles[pIndex].Roles.push(angular.copy(fxpModel.PersonaRole));
            }
            var updateModel = angular.copy($scope.PersonaRoles);
            FxpFactory.updatePersonaRoles(updateModel, $stateParams.EnvID).then(function (response) {
                angular.element(document.querySelector('#editPersonaRoles')).modal('hide');
                if (model.Action == fxpConstants.Action.Update) {
                    fxpMessage.addMessage(fxpConstants.Persona.UpdateRole, "success");
                } else {
                    fxpMessage.addMessage(fxpConstants.Persona.AddRole, "success");
                }
            }, function (error) {
                angular.element(document.querySelector('#editPersonaRoles')).modal('hide');
                if (model.Action == fxpConstants.Action.Update) {
                    fxpMessage.addMessage(fxpConstants.Persona.Role.Error.Update, "error");
                } else {
                    fxpMessage.addMessage(fxpConstants.Persona.Role.Error.Add, "error");
                }
            });
        }

    }
    $scope.deletePersona = function (index) {
        $scope.Deletedindex = index;
        angular.element(document.querySelector('#confirmDeletePersona')).modal('show');
    }
    $scope.deletePersonaRole = function (personaIndex, index) {
        $scope.Deletedindex = index;
        $scope.Personaindex = personaIndex;
        angular.element(document.querySelector('#confirmDeletePersonaRole')).modal('show');
    }
    $scope.deletePersonaConfirm = function () {
        try {
            $scope.PersonaRoles.splice($scope.Deletedindex, 1);
            var newData = angular.copy($scope.PersonaRoles);
            FxpFactory.updatePersonaRoles(newData, $stateParams.EnvID).then(function (response) {
                angular.element(document.querySelector('#confirmDeletePersona')).modal('hide');
                fxpMessage.addMessage(fxpConstants.Persona.Delete, "success");
            }, function () {
                fxpMessage.addMessage(fxpConstants.Persona.Error.Delete, "error");
            });
        } catch (error) {
            fxpMessage.addMessage(fxpConstants.Persona.Error.Delete, "error");
        }
    }
    $scope.deletePersonaRoleConfirm = function () {
        $scope.PersonaRoles[$scope.Personaindex].Roles.splice($scope.Deletedindex, 1);
        var newData = angular.copy($scope.PersonaRoles);
        FxpFactory.updatePersonaRoles(newData, $stateParams.EnvID).then(function (response) {
            angular.element(document.querySelector('#confirmDeletePersonaRole')).modal('hide');
            fxpMessage.addMessage(fxpConstants.Persona.DeleteRole, "success");
        }, function () {
            fxpMessage.addMessage(fxpConstants.Persona.Error.DeleteRole, "error");
        });
    }


    /*Map help links to Persona*/
    $scope.updateHelplinkstoFiles = function () {
        try {
            var newData = angular.copy($scope.FxpHelpLinks);
            FxpFactory.updateHelplinkstoFiles(newData, $scope.PersonaData, $stateParams.EnvID);
        } catch (error) {
            fxpMessage.addMessage(fxpConstants.HelpLinks.Error.Update, "error");
        }
    }

    /*delete help links and sub help links*/
    $scope.personaHelpLinkChecked = function (persona, helpLinkText, elementid) {
        var element = angular.element(document.querySelector('#' + elementid));
        FxpFactory.updatePersonaMapperConfig(persona, helpLinkText, !element[0].checked, $stateParams.EnvID, "HelpLinks");
        $scope.isPersonaHLinkUpdated = true;
    }
    $scope.updatePersonaHelpLinks = function () {
        try {
            FxpFactory.updatePersonaHelpLinkMapptofiles($stateParams.EnvID);
            fxpMessage.addMessage(fxpConstants.HelpLinks.UpdatePersona, "success");
            $scope.isPersonaHLinkUpdated = false;
        } catch (error) {
            fxpMessage.addMessage(fxpConstants.HelpLinks.Error.UpdatePersona, "error");
        }
    }
    $scope.deleteFxpHelpLink = function (index) {
        $scope.Deletedindex = index;
        angular.element(document.querySelector('#confirmDeleteHelpLink')).modal('show');
    }
    $scope.deleteFxpSubHelplinks = function (personaIndex, index) {
        $scope.Deletedindex = index;
        $scope.Personaindex = personaIndex;
        angular.element(document.querySelector('#confirmDeleteHelpSubLink')).modal('show');
    }
    $scope.editFxpHelplinks = function (linkObj, action, index) {
        try {
            $scope.isDulplicateKey = false;
            $scope.submitted = false;
            $scope.editIndex = index;
            $scope.envEdiables = {};
            if (action == fxpConstants.Action.Edit) {
                $scope.envEdiables = angular.copy(linkObj);
                $scope.envEdiables.DisplayOrder = parseInt(linkObj.DisplayOrder);
                $scope.envEdiables.ButtonText = fxpConstants.Action.Update;
                $scope.envEdiables.Action = fxpConstants.Action.Update;
            } else {
                $scope.envEdiables.ButtonText = fxpConstants.Action.Save;
                $scope.envEdiables.Action = fxpConstants.Action.Add;
            }
            angular.element(document.querySelector('#editFxpHelpLinks')).modal('show');
        } catch (error) {
            fxpMessage.addMessage(fxpConstants.Error, "error");
        }
    }
    $scope.editFxpsubHelplinks = function (parentObj, linkObj, action, index) {
        $scope.isDulplicateKey = false;
        $scope.submitted = false;
        $scope.editIndex = index;
        $scope.envEdiables = {};
        if (action == fxpConstants.Action.Edit) {
            $scope.envEdiables = angular.copy(linkObj);
            $scope.envEdiables.ButtonText = fxpConstants.Action.Update;
            $scope.envEdiables.Action = fxpConstants.Action.Update;
        } else {
            $scope.envEdiables.ButtonText = fxpConstants.Action.Save;
            $scope.envEdiables.Action = fxpConstants.Action.Add;
        }
        $scope.envEdiables.parent = parentObj;
        angular.element(document.querySelector('#editFxpHelpSublinks')).modal('show');

    }
    $scope.updateFxpSubHelplinks = function (model, form) {
        $scope.submitted = true;
        if ((form.$valid) && (!$scope.isDulplicateKey)) {
            var updateModel = {};
            var index = $scope.editIndex;
            var pIndex = $scope.FxpHelpLinks.indexOf(model.parent);
            var helpLinks = {};
            if (model.Action == fxpConstants.Action.Update) {
                $scope.FxpHelpLinks[pIndex].HelpLinks[index].DisplayText = model.DisplayText;
                $scope.FxpHelpLinks[pIndex].HelpLinks[index].DisplayOrder = model.DisplayOrder;
                $scope.FxpHelpLinks[pIndex].HelpLinks[index].Href = model.Href;
                $scope.FxpHelpLinks[pIndex].HelpLinks[index].Title = model.Title;
                $scope.FxpHelpLinks[pIndex].HelpLinks[index].OpenInline = model.OpenInline;
            } else {
                fxpModel.FxpSubHelpLink.DisplayText = model.DisplayText;
                fxpModel.FxpSubHelpLink.Href = model.Href;
                fxpModel.FxpSubHelpLink.Title = model.Title;
                fxpModel.FxpSubHelpLink.DisplayOrder = model.DisplayOrder;
                fxpModel.FxpSubHelpLink.OpenInline = model.OpenInline;
                updateModel = angular.copy(fxpModel.FxpSubHelpLink);
                $scope.FxpHelpLinks[pIndex].HelpLinks.push(updateModel);

            }
            helpLinks = angular.copy($scope.FxpHelpLinks[pIndex]);
            FxpFactory.updateFxpHelpLinksDetails(helpLinks, $stateParams.EnvID, pIndex, fxpConstants.Action.Update).then(function (response) {

                angular.element(document.querySelector('#editFxpHelpSublinks')).modal('hide');
                if (model.Action == fxpConstants.Action.Update) {
                    fxpMessage.addMessage(fxpConstants.SubHelplinks.Update, "success");
                } else {
                    fxpMessage.addMessage(fxpConstants.SubHelplinks.Add, "success");
                }
            }, function (error) {
                var envDetails = JSON.parse(JSON.stringify(eval("(" + localStorage.getItem("routes") + ")")));
                $scope.FxpHelpLinks = envDetails.FxpHelpLinks;
                angular.element(document.querySelector('#editFxpHelpSublinks')).modal('hide');
                if (model.Action == fxpConstants.Action.Update) {
                    fxpMessage.addMessage(fxpConstants.SubHelplinks.Error.Update, "error");
                } else {
                    fxpMessage.addMessage(fxpConstants.SubHelplinks.Error.Add, "error");
                }
            });

        }

    }

    $scope.deleteHelpConfirm = function () {
        FxpFactory.updateFxpHelpLinksDetails(null, $stateParams.EnvID, $scope.Deletedindex, fxpConstants.Action.Delete).then(function (response) {
            $scope.PersonaData = JSON.parse(JSON.stringify(eval("(" + localStorage.getItem("personaRouteMapping") + ")")));
            $scope.FxpHelpLinks.splice($scope.Deletedindex, 1);
            angular.element(document.querySelector('#confirmDeleteHelpLink')).modal('hide');
            fxpMessage.addMessage(fxpConstants.HelpLinks.Delete, "success");
        }, function (error) {
            fxpMessage.addMessage(fxpConstants.HelpLinks.Error.Delete, "error");
        });
    }
    $scope.deleteHelpSubConfirm = function () {
        $scope.FxpHelpLinks[$scope.Personaindex].HelpLinks.splice($scope.Deletedindex, 1);
        var data = angular.copy($scope.FxpHelpLinks[$scope.Personaindex]);
        FxpFactory.updateFxpHelpLinksDetails(data, $stateParams.EnvID, $scope.Personaindex, fxpConstants.Action.Update).then(function (response) {
            angular.element(document.querySelector('#confirmDeleteHelpSubLink')).modal('hide');
            fxpMessage.addMessage(fxpConstants.SubHelplinks.Delete, "success");
        }, function (error) {
            fxpMessage.addMessage(fxpConstants.HelpLinks.Error.Delete, "error");
        });

    }

    $scope.updateFxpHelpLinks = function (model, form) {
        $scope.submitted = true;
        if ((form.$valid) && (!$scope.isDulplicateKey)) {
            var updateModel = {};
            var index = $scope.editIndex;
            if (model.Action == fxpConstants.Action.Update) {
                $scope.FxpHelpLinks[index].DisplayText = model.DisplayText;
                $scope.FxpHelpLinks[index].DisplayOrder = model.DisplayOrder;
                updateModel = angular.copy($scope.FxpHelpLinks[index]);
            } else {
                fxpModel.FxpHelpLink.DisplayText = model.DisplayText;
                fxpModel.FxpHelpLink.DisplayOrder = model.DisplayOrder;
                fxpModel.FxpHelpLink.HelpLinks = []
                $scope.FxpHelpLinks.push(fxpModel.FxpHelpLink);
                updateModel = angular.copy(fxpModel.FxpHelpLink);
            }

            FxpFactory.updateFxpHelpLinksDetails(updateModel, $stateParams.EnvID, $scope.editIndex, model.Action).then(function (response) {
                $scope.PersonaData = JSON.parse(JSON.stringify(eval("(" + localStorage.getItem("personaRouteMapping") + ")")));

                angular.element(document.querySelector('#editFxpHelpLinks')).modal('hide');
                if (model.Action == fxpConstants.Action.Update) {
                    fxpMessage.addMessage(fxpConstants.HelpLinks.Update, "success");
                } else {
                    fxpMessage.addMessage(fxpConstants.HelpLinks.Add, "success");
                }
            }, function (error) {
                angular.element(document.querySelector('#editFxpHelpLinks')).modal('hide');
                if (model.Action == fxpConstants.Action.Update) {
                    fxpMessage.addMessage(fxpConstants.HelpLinks.Error.Update, "error");
                } else {
                    fxpMessage.addMessage(fxpConstants.HelpLinks.Error.Add, "error");
                }
            });

        }
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

    /*Footer Delete update*/
    $scope.editFxpFooter = function (alignKey,linkObj, action, index) {
        $scope.submitted = false;
        $scope.editIndex = index;
        $scope.envEdiables = {};
        if (action == fxpConstants.Action.Edit) {
            
            $scope.envEdiables = angular.copy(linkObj);
            $scope.envEdiables.Alignment = alignKey;
            $scope.envEdiables.ButtonText = fxpConstants.Action.Update;
            $scope.envEdiables.Action = fxpConstants.Action.Update;
        } else {
            $scope.envEdiables.ButtonText = fxpConstants.Action.Save;
            $scope.envEdiables.Action = fxpConstants.Action.Add;
        }
        angular.element(document.querySelector('#editFxpFooter')).modal('show');

    }
    $scope.updateFxpFooter = function (model, form) {
        $scope.submitted = true;
        if (form.$valid) {
            var updateModel = {};
            var index = $scope.editIndex;
            if (model.Action == fxpConstants.Action.Update) {
                if (model.Alignment === "LeftAlignedLinks") {
                    $scope.FxpFooterData.LeftAlignedLinks[index].ElementType = model.ElementType;
                    $scope.FxpFooterData.LeftAlignedLinks[index].DisplayText = model.DisplayText;
                    $scope.FxpFooterData.LeftAlignedLinks[index].TabIndex = model.TabIndex;
                    $scope.FxpFooterData.LeftAlignedLinks[index].href = model.href;
                    $scope.FxpFooterData.LeftAlignedLinks[index].cssClass = model.cssClass;
                    $scope.FxpFooterData.LeftAlignedLinks[index].ImagePath = model.ImagePath;
                } else {
                        $scope.FxpFooterData.RightAlignedLinks[index].ImagePath = model.ImagePath;
                        $scope.FxpFooterData.RightAlignedLinks[index].ElementType = model.ElementType;
                        $scope.FxpFooterData.RightAlignedLinks[index].DisplayText = model.DisplayText;
                        $scope.FxpFooterData.RightAlignedLinks[index].cssClass = model.cssClass;
                        $scope.FxpFooterData.LeftAlignedLinks[index].href = model.href;
                        $scope.FxpFooterData.LeftAlignedLinks[index].TabIndex = model.TabIndex;
                }
                updateModel = angular.copy($scope.FxpFooterData);
            } else {
                fxpModel.Footer.ElementType = model.ElementType;
                fxpModel.Footer.DisplayText = model.DisplayText;
                fxpModel.Footer.TabIndex = model.TabIndex;
                fxpModel.Footer.href = model.href;
                fxpModel.Footer.cssClass = model.cssClass;
                fxpModel.Footer.ImagePath = model.ImagePath;
                if (model.Alignment === "LeftAlignedLinks") {
                    $scope.FxpFooterData.LeftAlignedLinks.push(angular.copy(fxpModel.Footer));
                } else {
                    $scope.FxpFooterData.RightAlignedLinks.push(angular.copy(fxpModel.Footer));
                }
                updateModel = angular.copy($scope.FxpFooterData);
            }
            FxpFactory.updateFxpFooterDataDetails(updateModel, $stateParams.EnvID).then(function (response) {
                angular.element(document.querySelector('#editFxpFooter')).modal('hide');
                if (model.Action == fxpConstants.Action.Update) {
                    fxpMessage.addMessage(fxpConstants.FxpFooter.Update, "success");
                } else {
                    fxpMessage.addMessage(fxpConstants.FxpFooter.Add, "success");
                }
            }, function (error) {
                angular.element(document.querySelector('#editFxpFooter')).modal('hide');
                if (model.Action == fxpConstants.Action.Update) {
                    fxpMessage.addMessage(fxpConstants.FxpFooter.Error.Update, "error");
                } else {
                    fxpMessage.addMessage(fxpConstants.FxpFooter.Error.Add, "error");
                }
            });

        }
    }
    $scope.deleteFxpFooter = function (key, index) {
        $scope.alignKey = key;
        $scope.Deletedindex = index;
        angular.element(document.querySelector('#confirmFooterModal')).modal('show');
    }
    $scope.deleteFooter = function () {
        $scope.FxpFooterData[$scope.alignKey].splice($scope.Deletedindex, 1);
        var data = angular.copy($scope.FxpFooterData);
        FxpFactory.updateFxpFooterDataDetails(data, $stateParams.EnvID).then(function (response) {
            angular.element(document.querySelector('#confirmFooterModal')).modal('hide');
            fxpMessage.addMessage(fxpConstants.FxpFooter.Delete, "success");
        }, function (error) {
            fxpMessage.addMessage(fxpConstants.FxpFooter.Error.Delete, "error");
        });
    }

    /*CouchBaseSettings and Adal Auth */
    $scope.editCouchBaseSettings = function (editObject) {
        $scope.submitted = false;
        $scope.envEdiables = {};
        $scope.envEdiables = angular.copy(editObject);
        $scope.envEdiables.ButtonText = fxpConstants.Action.Update;
        $scope.envEdiables.Action = fxpConstants.Action.Update;
        angular.element(document.querySelector('#editCouchBaseSettings')).modal('show');
    }
    $scope.editAdalAuthExcludeExtn = function (editObject) {
        $scope.submitted = false;
        $scope.envEdiables = {};
        $scope.envEdiables.AdalAuthExcludeExtn = editObject;
        $scope.envEdiables.ButtonText = fxpConstants.Action.Update;
        $scope.envEdiables.Action = fxpConstants.Action.Update;
        angular.element(document.querySelector('#editAdalAuthExcludeExtn')).modal('show');
    }
    $scope.updateCouchBaseSettings = function (model, form) {
        $scope.submitted = true;
        if (form.$valid) {
            $scope.BaseConfiguration.CouchBaseSettings.CouchBaseLoginUrl = model.CouchBaseLoginUrl;
            $scope.BaseConfiguration.CouchBaseSettings.CouchAccessToken = model.CouchAccessToken;
            var data = angular.copy(model.CouchBaseSettings);
            FxpFactory.updateCouchBaseSettings(data, $stateParams.EnvID).then(function (response) {
                angular.element(document.querySelector('#editCouchBaseSettings')).modal('hide');
                fxpMessage.addMessage(fxpConstants.CouchBaseSettingUpdate, "success");
            }, function (error) {
                fxpMessage.addMessage(fxpConstants.CouchBaseSettings.Error.Update, "success");
            });
        }

    }
    $scope.updateAdalAuthExcludeExtn = function (model, form) {
        $scope.submitted = true;
        if (form.$valid) {
            $scope.BaseConfiguration.FxpConfigurationStrings.AdalAuthExcludeExtn = model.AdalAuthExcludeExtn;
            FxpFactory.updateAdalAuthExcludeExtn($scope.BaseConfiguration.FxpConfigurationStrings.AdalAuthExcludeExtn, $stateParams.EnvID).then(function (response) {
                angular.element(document.querySelector('#editAdalAuthExcludeExtn')).modal('hide');
                fxpMessage.addMessage(fxpConstants.AdalAuthExcludeExtnUpdate, "success");
            }, function (error) {
                fxpMessage.addMessage(fxpConstants.AdalAuthExcludeExtn.Error.Update, "error");
            });
        }
    }

}]);

environmentApp.filter('searchKeyValue', function () {
    return function (input, searchText) {
        var tmp = {};
        if (searchText != undefined) {
            searchText = searchText.toLowerCase();
            angular.forEach(input, function (val, key) {
                var lowerKey = key.toLowerCase();
                var lowerVal = val.toString().toLowerCase();
                if (lowerKey.indexOf(searchText) !== -1 || lowerVal.indexOf(searchText) !== -1) {
                    tmp[key] = val;
                }
            });
            return tmp;
        }
        else {
            return input;
        }
    };
});

environmentApp.filter('searchMessageFilter', function () {
    return function (input, searchText) {
        var tmp = {};
        if (searchText != undefined) {
            searchText = searchText.toLowerCase();
            angular.forEach(input, function (val, key) {
                if (typeof val === 'object') {
                    var lowerKey = key.toLowerCase();
                    var message = val.ErrorMessage.toString().replace(/\s\s+/g, ' ').toLowerCase();
                    var messageTitle = val.ErrorMessageTitle.replace(/\s\s+/g, ' ').toString().toLowerCase();
                    if (lowerKey.indexOf(searchText) !== -1 || message.indexOf(searchText) !== -1 || messageTitle.indexOf(searchText) !== -1) {
                        tmp[key] = val;
                    }
                }
            });
            return tmp;
        }
        else {
            return input;
        }
    };
});