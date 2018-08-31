
var fs = require('fs');
environmentApp.factory('FxpPreSetupFactory', function ($http, $q, $timeout) {
    return {
        readJsonFile: function (filePath) {
            readData = {};
            try {
                console.log('path :' + filePath);
                var data = fs.readFileSync(filePath);
                console.log(data);
                readData = JSON.parse(JSON.stringify(eval("(" + data + ")")));
            } catch (e) {
                console.log(e);
            }
            return readData;
        },
        readJsonFileAsync: function (filePath) {
            var deferred = $q.defer();
            try {
                fs.readFile(filePath, 'utf8', function (err, data) {
                    if ((!err) && (data != null)) {
                        var pData = JSON.parse(JSON.stringify(eval("(" + data + ")")));
                        deferred.resolve(pData);
                    } else {
                        deferred.reject(err);
                    }
                });
            } catch (e) {
                deferred.reject(e);
            }
            return deferred.promise;
        },
        writeJsonFile: function (filePath, data) {
            try {
                var wdata = JSON.stringify(data, null, 4);
                fs.writeFileSync(filePath, wdata);
            } catch (error) {
                throw error;
            }
        },

        getPersonaRouteMapper: function (path) {
            try {
                return this.readJsonFile(path + 'personaMapperConfig.json')
            } catch (error) {
                throw error;
            }
        },
        

        getPersonaRoutes: function (path) {
            var deferred = $q.defer();
            this.readJsonFileAsync(path).then(function (response) {
                deferred.resolve(response.Routes);
            }, function (error) {
                deferred.reject(error);
            })
        },

        addRouteName: function (path) {
            try {
                var self = this;
                var personaList = self.getPersonaRouteMapper(path); 
                for (var pesona in personaList.Personas) {
                    var filePath = path + personaList.Personas[pesona].FilePath + '.json';
                    var personaFile = self.readJsonFile(filePath);
                    for (var route in personaFile.Routes) {
                        if (!personaFile.Routes[route].hasOwnProperty('RouteName')) { 
                            personaFile.Routes[route].RouteName = personaFile.Routes[route].StateName + "_Route";
                        }
                    }
                    this.writeJsonFile(filePath, personaFile);
                }

            } catch (error) {
                console.log(error);
            }

        },
        mapRoutesToPersona: function (path) {
            try {
                var self = this;
                var personaList = this.getPersonaRouteMapper(path);
                for (var pesona in personaList.Personas) {
                    var filePath = path + personaList.Personas[pesona].FilePath + '.json';
                    var personaFile = self.readJsonFile(filePath);
                    personaList.Personas[pesona].Routes = [];
                    personaList.Personas[pesona].FxpHelpLinks = [];
                    var routesList = personaFile.Routes;
                    for (var route in routesList) {
                        if (personaList.Personas[pesona].Routes.indexOf(routesList[route].RouteName) < 0) {
                            personaList.Personas[pesona].Routes.push(routesList[route].RouteName);
                        }
                    }
                    var fxpHelpLinks = personaFile.FxpHelpLinks;
                    for (var link in fxpHelpLinks) {
                        if (personaList.Personas[pesona].FxpHelpLinks.indexOf(fxpHelpLinks[link].DisplayText) < 0) {
                            personaList.Personas[pesona].FxpHelpLinks.push(fxpHelpLinks[link].DisplayText);
                        }
                    }
                }
                self.updatePersonaRouteConfig(path, personaList);
            } catch (error) {
                throw error; 
            }
        },

        updateRoutesHelplinks: function (path) {
            try {
                var self = this;
                var personaList = self.getPersonaRouteMapper(path);
                var routeContainer = self.readJsonFile(path + 'routes.json');
                routeContainer.Routes = [];
                routeContainer.FxpHelpLinks = [];
                for (var pesona in personaList.Personas) {
                    var filePath = path + personaList.Personas[pesona].FilePath + '.json';
                    var personaFile = self.readJsonFile(filePath);
                    var tempRoutes = angular.copy(personaFile.Routes);
                    var tempHelpLinks = angular.copy(personaFile.FxpHelpLinks); 
                    for (var i = tempRoutes.length - 1; i >= 0; i--) {
                        for (var j = 0; j < routeContainer.Routes.length; j++) {
                            if (tempRoutes[i] && (tempRoutes[i].RouteName === routeContainer.Routes[j].RouteName)) {
                                tempRoutes.splice(i, 1);
                            }
                        }
                    }
                    for (var i = 0; i < tempRoutes.length; i++) {
                        routeContainer.Routes.push(tempRoutes[i]);
                    } 
                    for (var i = tempHelpLinks.length - 1; i >= 0; i--) {
                        for (var j = 0; j < routeContainer.FxpHelpLinks.length; j++) {
                            if (tempHelpLinks[i] && (tempHelpLinks[i].DisplayText === routeContainer.FxpHelpLinks[j].DisplayText)) {
                                tempHelpLinks.splice(i, 1);
                            }
                        }
                    }
                    for (var i = 0; i < tempHelpLinks.length; i++) {
                        routeContainer.FxpHelpLinks.push(tempHelpLinks[i]);
                    }
                }
                this.writeJsonFile(path + 'routes.json', routeContainer);
            }

            catch (error) { throw error; }
        },

        updatePersonaRouteConfig: function (path, uModelCollection) {
            try {
                var filePath = path + 'personaMapperConfig.json';
                this.writeJsonFile(filePath, uModelCollection);
            } catch (error) {
                throw error;
            }
        },
        initializePersonaRoutes: function (path) {
            try {
                this.addRouteName(path);
                this.updateRoutesHelplinks(path);
                this.mapRoutesToPersona(path);
            } catch (error) {
                throw error;
            }

        },
        
    }
});

