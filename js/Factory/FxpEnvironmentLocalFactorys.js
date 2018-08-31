var fsextra = require('fs-extra');
var storage = require('azure-storage');
var fs = require('fs');
var containerName = "configblobs";
var tableName = "FXP1";
environmentApp.factory('FxpFactory', function ($http, $q, fxpConstants) {
    return {

        //verify required files are exists/avilable in selected directory
        verifyFilesinDirectory: function (path, sourceType) {

            var filesNotInFolder = []
            var fileArray = (sourceType == 'file') ? fxpConstants.mockFiles : fxpConstants.confitFiles;
            for (var fName in fileArray) {
                if (!this.fileExists(path + fileArray[fName] + '.json')) {
                    filesNotInFolder.push(fileArray[fName]);
                }
            }
            for(var fName in fxpConstants.defaultFiles){
                if (filesNotInFolder.indexOf(fxpConstants.defaultFiles[fName]) >= 0) {
                    var sourceFile = './resources/default/' + fxpConstants.defaultFiles[fName] + '.json';
                    var targetFile = path + fxpConstants.defaultFiles[fName] + '.json';
                    fs.writeFileSync(targetFile, fs.readFileSync(sourceFile));
                    filesNotInFolder.splice(filesNotInFolder.indexOf(fxpConstants.defaultFiles[fName]), 1);
                }
            
            }
            return filesNotInFolder.length <= 0;
        },

        initializeContainer: function (path) {
            var deferred = $q.defer();
            try {
                for (var fName in fxpConstants.defaultFiles) {
                    var sourceFile = './resources/default/' + fxpConstants.defaultFiles[fName] + '.json';
                    var targetFile = path + fxpConstants.defaultFiles[fName] + '.json';
                    fsextra.copy(sourceFile, targetFile, function (err) {
                        if (err)
                            deferred.reject(err);
                        else {
                            deferred.resolve('success!');
                        }
                    });
                }
                deferred.resolve('initialize successfully');

            } catch (error) {
                deferred.reject(error);
            }
            return deferred.promise;

        },
        //vierify file is Exists
        fileExists(filePath) {
            try {
                return fs.statSync(filePath).isFile();
            }
            catch (err) {
                return false;
            }
        },

        getCurrentEnvironment: function () {
            try {
                if (localStorage.getItem("selectedEnv") != null) {
                    return JSON.parse(localStorage.getItem("selectedEnv"));
                }
            } catch (err) {

            }
        },
        //get File Name based on source type
        getFileName: function (file) {
            try {
                if (localStorage.getItem("selectedEnv") != null) {
                    var config = JSON.parse(localStorage.getItem("selectedEnv"));
                    var sType = (config.Source == 'file') ? config.Source : 'blob';
                    var fileName = '';
                    switch (file) {
                        case "routes":
                            fileName = (sType == 'file') ? 'routes.json' : 'routes.json';
                            break;
                        case 'partnerapp':
                            fileName = (sType == 'file') ? 'FxpStartupConfiguration.json' : 'partnerapp.json';
                            break;
                        case 'personarole':
                            fileName = (sType == 'file') ? 'FxpPersonaRoleMapping.json' : 'personarole.json';

                    }
                    return fileName;

                }
            } catch (err) {

            }



        },
        //read if any environment has been configured
        getConfigDetails: function () {
            var deferred = $q.defer();
            try {
                fs.readFile('./resources/configFile.json', 'utf8', function (err, response) {
                    if (!err) {
                        deferred.resolve(response);
                    } else {
                        deferred.reject(err);
                    }
                });
            } catch (error) {
                deferred.reject(error);
            }
            return deferred.promise;
        },
        // when any environment is updated in Manage environments
        updateConfigData: function (configDataCollection) {
            try {
                var deferred = $q.defer();
                var dataNew = JSON.stringify(configDataCollection);
                fs.writeFile('./resources/configFile.json', dataNew, function (err) {
                    if (!err) {
                        deferred.resolve(configDataCollection);
                    } else
                        deferred.reject(err);
                });
            } catch (e) {
                deferred.reject(err);
            }

            return deferred.promise;
        },


        updateConfigWithBlobFiles: function (configDataCollection, updatedConfig) {
            var deferred = $q.defer();
            var newData;
            try {
                var blobService = storage.createBlobService(updatedConfig.StorageName, updatedConfig.StorageKey);
                var fileName = './resources/' + updatedConfig.EnvironmentName + '/';
                if (!fs.existsSync(fileName)) {
                    fs.mkdirSync(fileName);
                }
                var dataNew = JSON.stringify(configDataCollection);
                fs.writeFile('./resources/configFile.json', dataNew, function (err, data) {
                    if (!err) {
                        blobService.listBlobsSegmented(containerName, null, function (err, result) {
                            if (err) {
                                console.log("Couldn't list blobs for container %s", containerName);
                                deferred.reject(err);
                            } else {
                                for (var i = 0; i < result.entries.length; i++) {
                                    blobService.getBlobToLocalFile(containerName, result.entries[i].name, fileName + result.entries[i].name + '.json', function (err, blobContent, blob) {
                                        if (err) {
                                            deferred.reject(err);
                                        } else {
                                            deferred.resolve(configDataCollection);
                                        }
                                    });
                                }

                            }
                        });
                    }
                });

            } catch (e) {
                deferred.reject(err);
            }
            return deferred.promise;
        },
        //publish local files to Blob

        //download blob files to local
        pullBlobFilestoLocal: function (configData) {
            var deferred = $q.defer();
            var newData;
            try {
                var blobService = storage.createBlobService(configData.StorageName, configData.StorageKey);
                var tableSvc = storage.createTableService(configData.StorageName, configData.StorageKey);
                var fileName = './resources/' + configData.EnvironmentName + '/';
                if (!fs.existsSync(fileName)) {
                    fs.mkdirSync(fileName);
                }
                blobService.listBlobsSegmented(containerName, null, function (err, result) {
                    if (err) {
                        deferred.reject(err);
                    } else {
                        for (var i = 0; i < result.entries.length; i++) {
                            blobService.getBlobToLocalFile(containerName, result.entries[i].name, fileName + result.entries[i].name + '.json', function (err, blobContent, blob) {
                                if (err) {
                                    deferred.resolve(err);
                                } else {
                                    deferred.resolve(configData);
                                }
                            });
                        }

                    }
                });

                var query = new storage.TableQuery().select('*');
                tableSvc.queryEntities(tableName, query, null, function (err, result, response) {
                    if (!err) {
                        var jsonData = {
                            "Entities": []
                        };
                        for (var i = 0; i < result.entries.length; i++) {
                            var tableKey = {
                                "PartitionKey": result.entries[i].PartitionKey._,
                                "RowKey": result.entries[i].RowKey._,
                                "IsBlob": result.entries[i].IsBlob._,
                                "Key": result.entries[i].Key._,
                                "Value": result.entries[i].Value._
                            };
                            jsonData.Entities.push(tableKey);
                        }
                        var wdata = JSON.stringify(jsonData, null, 4);
                        localStorage.setItem('orgTableData', wdata);
                        fs.writeFileSync(fileName + 'tableConfig.json', wdata);
                    }

                });
            } catch (e) {
                deferred.reject(e);
            }
            return deferred.promise;


        },
        updateMissingFiles: function (folderName) {

            try {
                var target = './resources/' + folderName;
                for (var fName in fxpConstants.confitFiles) {
                    if (!this.fileExists(target + '/' + fxpConstants.confitFiles[fName] + '.json')) {
                        var targetFile = target + '/' + fxpConstants.confitFiles[fName] + '.json';
                        var sourceFile = './resources/default/' + fxpConstants.confitFiles[fName] + '.json';
                        fs.writeFileSync(targetFile, fs.readFileSync(sourceFile));
                    }
                }
            } catch (error) {
                throw error;
            }

        },

        //update Configurator configs
        updateConfiguration: function (configData) {
            var deferred = $q.defer();
            var newData;
            fs.readFile('./resources/configFile.json', 'utf8', function (err, data) {
                if ((!err) && (data != null)) {
                    newData = JSON.parse(JSON.stringify(eval("(" + data + ")")));
                    newData.push(configData);
                    var dataNew = JSON.stringify(newData);
                    fs.writeFile('./resources/configFile.json', dataNew, function (err, data) {
                        if (!err) {
                            deferred.resolve(configData);
                        }
                        else {
                            deferred.reject(err);
                        }
                    });
                }
            });
            return deferred.promise;
        },
        cloneEnvironment: function (configData) {
            var deferred = $q.defer();
            var fse = require('fs-extra');
            var sourcePath;
            var destPath;
            if (configData.Source === 'blob') {
                sourcePath = './resources/' + configData.oldEnvironment;
                destPath = './resources/' + configData.EnvironmentName;
            } else {
                sourcePath = configData.oldPath.replace(/\\/g, "\\\\");
                destPath = configData.LocalPath.replace(/\\/g, "\\\\");
            }
            fse.copy(sourcePath, destPath, function (err) {
                if (err)
                    deferred.reject(err);
                else {
                    delete configData.selectedEnvironment;
                    deferred.resolve(configData);
                    console.log('success!')
                }
            });
            return deferred.promise;
        },
        verifyConnection: function (storageEnv) {
            var validCredentials = true;
            try {

                storage.createBlobService(storageEnv.StorageName, storageEnv.StorageKey);

            } catch (error) {
                validCredentials = false;
            }
            return validCredentials;
        },

        downloadLocalFiles: function (configData) {
            configData.StorageName = "";
            configData.StorageKey = "";
            var deferred = $q.defer();
            var newData;
            fs.readFile('./resources/configFile.json', 'utf8', function (err, data) {
                if ((!err) && (data != null)) {
                    newData = JSON.parse(JSON.stringify(eval("(" + data + ")")));
                    newData.push(configData);
                    var dataNew = JSON.stringify(newData);
                    fs.writeFile('./resources/configFile.json', dataNew, function (err) {
                        if (err) {
                            deferred.reject(err);
                        } else {
                            deferred.resolve(configData);
                        }
                    });
                }
            });
            return deferred.promise;
        },

        // fetch routes 
        getRoutes: function (routePath, sourceType) {
            try {
                var deferred = $q.defer();
                var fileName = this.getFileName('routes');
                fs.readFile(routePath + fileName, 'utf8', function (err, data) {
                    if (err) {
                        deferred.reject(err);
                    } else {
                        localStorage.setItem("routes", data);
                        deferred.resolve(data);
                    }

                });
            } catch (e) {
                deferred.reject(e);
            }
            return deferred.promise;
        },
        getTableConfig: function (rootPath) {
            var deferred = $q.defer();
            try {
                var data = fs.readFileSync(rootPath + 'tableConfig.json');
                if (data != null) {
                    var rData = JSON.stringify(eval("(" + data + ")"));
                    localStorage.setItem("tableConfig", rData);
                    deferred.resolve(rData);
                }
            } catch (error) {
                deferred.reject(error);
            }
            return deferred.promise;
        },
        //update azure table key's
        updateTableConfig: function (configDataCollection, rootPath) {
            var deferred = $q.defer();
            var tableDetails = JSON.parse(JSON.stringify(eval("(" + localStorage.getItem("tableConfig") + ")")));
            tableDetails.Entities = configDataCollection;
            var dataNew = JSON.stringify(tableDetails, null, 4);
            localStorage.setItem("tableConfig", dataNew);
            fs.writeFile(rootPath + 'tableConfig.json', dataNew, function (err) {
                if (err) { deferred.reject(err); }
                else {
                    deferred.resolve(configDataCollection);
                }
            });

            return deferred.promise;
        },
        //fetch partner data
        getPartnerModules: function (routePath, fileType) {
            try {
                var fileName = this.getFileName('partnerapp');
                var deferred = $q.defer();
                fs.readFile(routePath + fileName, 'utf8', function (err, data) {
                    if (!err) {
                        localStorage.setItem("partnerapp", data);
                        deferred.resolve(data);
                    } else
                        deferred.reject(err);
                });
            } catch (e) {
                deferred.reject(err);
            }
            return deferred.promise;
        },
        //fetch persona roles
        getPersonaRoles: function (routePath) {
            try {
                var deferred = $q.defer();
                var fileName = this.getFileName('personarole');
                fs.readFile(routePath + fileName, 'utf8', function (err, data) {
                    if (!err) {
                        localStorage.setItem("personarole", data);
                        deferred.resolve(data);
                    } else
                        deferred.reject(err);
                });
            } catch (e) {
                deferred.reject(err);
            }
            return deferred.promise;
        },
        //fetch the persona mapping for Routes and helplinks
        getPersonaList: function (routePath) {
            try {
                var personaList = [];
                var deferred = $q.defer();
                fs.readFile(routePath + 'personaMapperConfig.json', 'utf8', function (err, data) {
                    if (!err) {
                        localStorage.setItem("personaRouteMapping", data);
                        deferred.resolve(data);
                    } else
                        deferred.reject(err);
                });
            } catch (e) {
                deferred.reject(e);
            }
            return deferred.promise;

        },

        //update routes
        updateRouteDetails: function (path, route, action, index) {
            try {
                var deferred = $q.defer();
                var fileName = this.getFileName('routes');

                var oldRouteName = "";
                var updatePersonaFile = false;
                var envDetails = JSON.parse(JSON.stringify(eval("(" + localStorage.getItem("routes") + ")")));
                if (action == "Update") {
                    oldRouteName = envDetails.Routes[index].RouteName;
                    envDetails.Routes[index] = route;
                }
                else if (action == "Add")
                    envDetails.Routes.push(route);
                else {
                    route = envDetails.Routes[index];
                    oldRouteName = envDetails.Routes[index].RouteName;
                    envDetails.Routes.splice(index, 1);
                }
                var data = JSON.stringify(envDetails, null, 4);
                fs.writeFileSync(path + fileName, data, 'utf8');
                var personaData = JSON.parse(JSON.stringify(eval("(" + localStorage.getItem("personaRouteMapping") + ")")));
                for (var persona in personaData.Personas) {
                    personObj = personaData.Personas[persona];
                    for (var c = 0; c < personObj.Routes.length; c++) {
                        updatePersonaFile = false;
                        if (oldRouteName === personObj.Routes[c]) {
                            if (action === 'Delete') {
                                personObj.Routes.splice(c, 1);
                            } else if (oldRouteName != route.RouteName) {
                                personObj.Routes[c] = route.RouteName;
                            }
                            updatePersonaFile = true;
                        }
                        if (updatePersonaFile) {
                            this.updateRouteToPersonaFiles(route, personObj.FilePath, path, oldRouteName, action);
                        }
                    }
                }
                var configFilePath = path + 'personaMapperConfig.json';
                var cData = JSON.stringify(personaData, null, 4);
                fs.writeFileSync(configFilePath, cData, 'utf8');
                localStorage.setItem("personaRouteMapping", cData);
                deferred.resolve(localStorage.setItem("routes", JSON.stringify(envDetails, null, 4)));
            } catch (e) {
                deferred.reject(e);
            }
            return deferred.promise;
        },

        updateFxpHelpLinksDetails: function (updatemodel, rPath, index, action) {
            var deferred = $q.defer();
            try {
                var fileName = this.getFileName('routes');
                var updatePersonaFile = false;
                var oldHelpLink = "";
                var deferred = $q.defer();
                var envDetails = JSON.parse(JSON.stringify(eval("(" + localStorage.getItem("routes") + ")")));
                if (action == "Update") {
                    oldHelpLink = envDetails.FxpHelpLinks[index].DisplayText;
                    envDetails.FxpHelpLinks[index] = updatemodel;
                }
                else if (action == "Add")
                    envDetails.FxpHelpLinks.push(updatemodel);
                else {
                    updatemodel = envDetails.FxpHelpLinks[index]
                    oldHelpLink = envDetails.FxpHelpLinks[index].DisplayText;
                    envDetails.FxpHelpLinks.splice(index, 1);
                }
                var data = JSON.stringify(envDetails, null, 4);
                fs.writeFileSync(rPath + fileName, data, 'utf8');
                if (action != "Add") {
                    var personaData = JSON.parse(JSON.stringify(eval("(" + localStorage.getItem("personaRouteMapping") + ")")));
                    for (var persona in personaData.Personas) {
                        personObj = personaData.Personas[persona];
                        for (var c = 0; c < personObj.FxpHelpLinks.length; c++) {
                            updatePersonaFile = false;
                            if (oldHelpLink === personObj.FxpHelpLinks[c]) {
                                if (action === 'Delete') {
                                    personObj.FxpHelpLinks.splice(c, 1);
                                } else if (oldHelpLink != updatemodel.DisplayText) {
                                    personObj.FxpHelpLinks[c] = updatemodel.DisplayText;
                                }
                                updatePersonaFile = true;
                            }
                            if (updatePersonaFile) {
                                this.updateHelpLinkToPersonaFiles(updatemodel, personObj.FilePath, rPath, oldHelpLink, action);
                            }
                        }
                    }
                    var configFilePath = rPath + 'personaMapperConfig.json';
                    var cData = JSON.stringify(personaData, null, 4);
                    fs.writeFileSync(configFilePath, cData, 'utf8');
                    localStorage.setItem("personaRouteMapping", cData);
                }
                deferred.resolve(localStorage.setItem("routes", JSON.stringify(envDetails, null, 4)));

            } catch (e) {
                deferred.reject(e);
            }
            return deferred.promise;
        },
        //map routes to persona
        updateRouteToPersonaFiles: function (route, personaPath, rootPath, oldRouteName, action) {
            try {
                var roleData;
                var fileName = rootPath + personaPath + '.json';
                var roleData = JSON.parse(JSON.stringify(eval("(" + fs.readFileSync(fileName) + ")")));
                var index = -1;
                roleData.Routes.filter(function (obj, i) {
                    if (obj.RouteName === oldRouteName) {
                        index = i;
                        return;
                    }
                });
                if (action == 'Update') {
                    roleData.Routes[index] = route;
                }
                else {
                    roleData.Routes.splice(index, 1);
                }

                var mapData = JSON.stringify(roleData, null, 4);
                fs.writeFileSync(fileName, mapData, 'utf8');
            } catch (error) {
                throw error;
            }



        },


        updateHelpLinkToPersonaFiles: function (fxpHelpLink, personaPath, rootPath, oldHlink, action) {
            try {
                var roleData;
                var fileName = rootPath + personaPath + '.json';
                var roleData = JSON.parse(JSON.stringify(eval("(" + fs.readFileSync(fileName) + ")")));
                var index = -1;
                roleData.FxpHelpLinks.filter(function (obj, i) {
                    if (obj.DisplayText === oldHlink) {
                        index = i;
                        return;
                    }
                });
                if (action == 'Update') {
                    roleData.FxpHelpLinks[index] = fxpHelpLink;
                }
                else if (action == 'Delete') {
                    roleData.FxpHelpLinks.splice(index, 1);
                }
                var mapData = JSON.stringify(roleData, null, 4);
                fs.writeFileSync(fileName, mapData, 'utf8');



            } catch (error) {
                throw error;
            }
        },
        updatePersonaRouteMapptofiles: function (routePath) {
            try {
                var tRoutes = [];
                var personObj = {};
                var routeObj = {};
                var mapData = localStorage.getItem("personaRouteMapping");
                var routesData = JSON.parse(JSON.stringify(eval("(" + localStorage.getItem("routes") + ")")));
                var personaData = JSON.parse(JSON.stringify(eval("(" + mapData + ")")));
                fs.writeFile(routePath + 'personaMapperConfig.json', mapData, function (err, data) {
                    if (!err) {
                        console.log('success');
                    }
                });
                for (var persona in personaData.Personas) {
                    personObj = personaData.Personas[persona];
                    for (var c = 0; c < personObj.Routes.length; c++) {
                        for (var route in routesData.Routes) {
                            routeObj = routesData.Routes[route];
                            if (routeObj.RouteName == personObj.Routes[c]) {
                                tRoutes.push(routeObj);
                            }
                        }

                    }

                    this.updatePersonafiles(tRoutes, personObj.FilePath, routePath, "Routes");
                    tRoutes = [];

                }
            } catch (err) {
                throw err;
            }
        },


        //map helpLink to Persona
        updatePersonaHelpLinkMapptofiles: function (routePath) {
            try {
                var tHelpLinks = [];
                var personObj = {};
                var linkObj = {};
                var mapData = localStorage.getItem("personaRouteMapping");
                var routesData = JSON.parse(JSON.stringify(eval("(" + localStorage.getItem("routes") + ")")));
                var personaData = JSON.parse(JSON.stringify(eval("(" + mapData + ")")));
                fs.writeFile(routePath + 'personaMapperConfig.json', mapData, function (err, data) {
                    if (!err) {
                        console.log('success');
                    }
                });
                for (var persona in personaData.Personas) {
                    personObj = personaData.Personas[persona];
                    for (var c = 0; c < personObj.FxpHelpLinks.length; c++) {
                        for (var link in routesData.FxpHelpLinks) {
                            linkObj = routesData.FxpHelpLinks[link];
                            if (linkObj.DisplayText == personObj.FxpHelpLinks[c]) {
                                tHelpLinks.push(linkObj);
                            }
                        }

                    }
                    this.updatePersonafiles(tHelpLinks, personObj.FilePath, routePath, 'FxpHelpLinks');
                    tHelpLinks = [];
                }
            } catch (error) {
                throw error;
            }

        },
        updatePersonafiles: function (RouteCollection, personaFile, routePath, actionFor) {
            try {
                var roleData;
                var fileName = routePath + personaFile + '.json';
                fs.readFile(fileName, 'utf8', function (err, data) {
                    if (!err) {
                        console.log(data);
                        roleData = JSON.parse(JSON.stringify(eval("(" + data + ")")));
                        console.log(roleData);
                        if (actionFor == "FxpHelpLinks") {
                            roleData.FxpHelpLinks = RouteCollection;
                        } else {
                            roleData.Routes = RouteCollection;
                        }
                        var mapData = JSON.stringify(roleData, null, 4);
                        console.log(roleData);
                        fs.writeFile(fileName, mapData, function (err, data) {
                            if (!err) {
                                console.log('success');
                            }
                        });
                    }

                });
            } catch (e) {
                throw e;
            }

        },
        //update Persona Roles
        updatePersonaRoles: function (updatemodel, path) {
            var deferred = $q.defer();
            try {
                var fileName = this.getFileName('personarole');
                var envDetails = JSON.parse(JSON.stringify(eval("(" + localStorage.getItem("personarole") + ")")));
                envDetails.Persona = updatemodel;
                var data = JSON.stringify(envDetails, null, 4);
                fs.writeFile(path + fileName, data, function (err, response) {
                    if (!err) {
                        deferred.resolve(localStorage.setItem("personarole", data));
                        console.log('String uploaded successfully');
                    } else {
                        deferred.reject(err);
                    }
                });
            } catch (e) {
                deferred.reject(e);
            }
            return deferred.promise;
        },

        //updating help link to files
        updateHelplinkstoFiles: function (FxpHelpLinks, personaData, routePath) {
            try {
                for (link in personaData.Personas) {
                    var fileName = routePath + personaData.Personas[link].FilePath + '.json';
                    this.updateFxpHelpLinksToFile(fileName, FxpHelpLinks);
                }
            } catch (error) {
                throw error;
            }

        },
        updateFxpHelpLinksToFile: function (fileName, fxpHelpLinks) {
            try {
                var roleData;
                fs.readFile(fileName, 'utf8', function (err, data) {
                    if (!err) {
                        console.log(data);
                        roleData = JSON.parse(JSON.stringify(eval("(" + data + ")")));
                        console.log(roleData);
                        roleData.FxpHelpLinks = fxpHelpLinks;
                        var mapData = JSON.stringify(roleData, null, 4);
                        console.log(roleData);
                        fs.writeFile(fileName, mapData, function (err, data) {
                            if (!err) {
                                console.log('success');
                            }
                        });
                    }

                });
            } catch (error) {
                throw error;
            }
        },


        updatePersonaRouteMapping: function (persona, route, isRemove, filePath) {
            try {
                var personaData = JSON.parse(JSON.stringify(eval("(" + localStorage.getItem("personaRouteMapping") + ")")));
                if (isRemove) {
                    var index = personaData.Personas[persona].Routes.indexOf(route);
                    if (index >= 0) {
                        personaData.Personas[persona].Routes.splice(index, 1);
                    }
                } else {
                    personaData.Personas[persona].Routes.push(route);
                }
                var mapData = JSON.stringify(personaData, null, 4)
                localStorage.setItem("personaRouteMapping", mapData);
            } catch (e) {
                throw e;
            }

        },
        //updating Persona Map file
        updatePersonaMapperConfig: function (persona, configData, isRemove, filePath, configName) {
            try {
                var personaData = JSON.parse(JSON.stringify(eval("(" + localStorage.getItem("personaRouteMapping") + ")")));
                if (isRemove) {
                    var index = personaData.Personas[persona].FxpHelpLinks.indexOf(configData);
                    if (index >= 0) {
                        personaData.Personas[persona].FxpHelpLinks.splice(index, 1);
                    }
                } else {
                    personaData.Personas[persona].FxpHelpLinks.push(configData);
                }
                var mapData = JSON.stringify(personaData, null, 4)
                localStorage.setItem("personaRouteMapping", mapData);
            } catch (e) {
                throw e;
            }
        },


        //updating footer data
        updateFxpFooterDataDetails: function (updatemodel, path) {
            var deferred = $q.defer(); try {
                var fileName = this.getFileName('partnerapp');
                var envDetails = JSON.parse(JSON.stringify(eval("(" + localStorage.getItem("partnerapp") + ")")));
                envDetails.BaseConfiguration.FxpFooterData = updatemodel;
                var data = JSON.stringify(envDetails, null, 4);
                fs.writeFile(path + fileName, data, function (err) {
                    if (!err) {
                        deferred.resolve(localStorage.setItem("partnerapp", data));
                    } else {
                        deferred.reject(err);
                    }
                });
            } catch (e) {
                deferred.reject(e);
            }
            return deferred.promise;
        },
        //update Telemetry Details
        updateTelemetryDetails: function (updatemodel, path) {
            var deferred = $q.defer();
            try {
                var fileName = this.getFileName('partnerapp');
                var envDetails = JSON.parse(JSON.stringify(eval("(" + localStorage.getItem("partnerapp") + ")")));
                envDetails.BaseConfiguration.Telemetry = updatemodel;
                var data = JSON.stringify(envDetails, null, 4);
                fs.writeFile(path + fileName, data, function (error) {
                    if (!error) {
                        deferred.resolve(localStorage.setItem("partnerapp", data));
                    } else {
                        deferred.reject(error);
                    }
                });
            } catch (e) {
                deferred.reject(e);
            }
            return deferred.promise;

        },

        //update FXP UI Details
        updateFxpUIDetails: function (updatemodel, path) {
            var deferred = $q.defer();
            try {
                var fileName = this.getFileName('partnerapp');
                var envDetails = JSON.parse(JSON.stringify(eval("(" + localStorage.getItem("partnerapp") + ")")));
                envDetails.BaseConfiguration.FxpConfigurationStrings.UIStrings = updatemodel;
                var data = JSON.stringify(envDetails, null, 4);
                fs.writeFile(path + fileName, data, function (err) {
                    if (!err) {
                        deferred.resolve(localStorage.setItem("partnerapp", data));
                    } else
                        deferred.reject(err);
                });

                return deferred.promise;
            } catch (e) {
                deferred.reject(e);

            }
            return deferred.promise;
        },
        //update OBO details
        updateFxpOBODetails: function (updatemodel, path) {
            var deferred = $q.defer();
            try {
                var fileName = this.getFileName('partnerapp');
                var envDetails = JSON.parse(JSON.stringify(eval("(" + localStorage.getItem("partnerapp") + ")")));
                envDetails.BaseConfiguration.FxpConfigurationStrings.UIStrings.OBOUIStrings = updatemodel;

                var data = JSON.stringify(envDetails, null, 4);
                fs.writeFile(path + fileName, data, function (err) {
                    if (!err) {
                        deferred.resolve(localStorage.setItem("partnerapp", data));
                    } else {
                        deferred.reject(err);
                    }
                });


            }
            catch (e) {
                deferred.reject(e);
            }
            return deferred.promise;
        },
        //Update FxpMessages
        updateFxpMessageDetails: function (updatemodel, path) {
            var deferred = $q.defer();
            try {
                var fileName = this.getFileName('partnerapp');
                var envDetails = JSON.parse(JSON.stringify(eval("(" + localStorage.getItem("partnerapp") + ")")));
                envDetails.BaseConfiguration.FxpConfigurationStrings.UIMessages = updatemodel;
                var data = JSON.stringify(envDetails, null, 4);
                fs.writeFile(path + fileName, data, function (err, response) {
                    if (!err) {
                        deferred.resolve(localStorage.setItem("partnerapp", data));
                    } else {
                        deferred.reject(err);
                    }
                });
            } catch (e) {
                deferred.reject(e);
            }
            return deferred.promise;
        },
        //update help links

        //update Partner Modules
        updatePartnerModuleDetails: function (updatemodel, path) {
            try {
                var fileName = this.getFileName('partnerapp');
                var deferred = $q.defer();
                var envDetails = JSON.parse(JSON.stringify(eval("(" + localStorage.getItem("partnerapp") + ")")));

                envDetails.PartnerModules = updatemodel;
                var data = JSON.stringify(envDetails, null, 4);
                fs.writeFile(path + fileName, data, function (err, response) {
                    if (!err) {
                        deferred.resolve(localStorage.setItem("partnerapp", data));

                    } else
                        deferred.reject(err);
                });
            } catch (e) {
                deferred.reject(e);
            }
            return deferred.promise;
        },
        //update Partner Scripts
        updatePartnerScriptsDetails: function (updatemodel, path) {
            try {
                var deferred = $q.defer();
                var fileName = this.getFileName('partnerapp');
                var envDetails = JSON.parse(JSON.stringify(eval("(" + localStorage.getItem("partnerapp") + ")")));
                envDetails.PartnerAssets.Scripts = updatemodel;
                var data = JSON.stringify(envDetails, null, 4);
                fs.writeFile(path + fileName, data, function (err, response) {
                    if (!err) {
                        deferred.resolve(localStorage.setItem("partnerapp", data));
                    } else
                        deferred.reject(err);
                });
            } catch (e) {
                deferred.reject(e);
            }
            return deferred.promise;
        },
        //udpate Partner Styles
        updatePartnerStylesDetails: function (updatemodel, path) {
            try {
                var deferred = $q.defer();
                var fileName = this.getFileName('partnerapp');
                var envDetails = JSON.parse(JSON.stringify(eval("(" + localStorage.getItem("partnerapp") + ")")));
                envDetails.PartnerAssets.Styles = updatemodel
                var data = JSON.stringify(envDetails, null, 4);
                fs.writeFile(path + fileName, data, function (err, response) {
                    if (!err) {
                        deferred.resolve(localStorage.setItem("partnerapp", data));
                    } else
                        deferred.reject(err);
                });
            } catch (e) {
                deferred.reject(e);
            }
            return deferred.promise;
        },
        //update Couch and Adal settings
        updateCouchBaseSettings: function (updatemodel, path) {
            try {
                var deferred = $q.defer();
                var fileName = this.getFileName('partnerapp');
                var envDetails = JSON.parse(JSON.stringify(eval("(" + localStorage.getItem("partnerapp") + ")")));
                envDetails.BaseConfiguration.CouchBaseSettings = updatemodel;
                var data = JSON.stringify(envDetails, null, 4);
                fs.writeFile(path + fileName, data, function (err) {
                    if (!err) {
                        deferred.resolve(localStorage.setItem("partnerapp", data));
                    } else {
                        deferred.reject(err);
                    }
                });
            } catch (e) {
                deferred.reject(e);

            }
            return deferred.promise;
        },
        updateAdalAuthExcludeExtn: function (updatemodel, path) {
            var deferred = $q.defer();
            try {
                var fileName = this.getFileName('partnerapp');
                var envDetails = JSON.parse(JSON.stringify(eval("(" + localStorage.getItem("partnerapp") + ")")));
                envDetails.BaseConfiguration.FxpConfigurationStrings.AdalAuthExcludeExtn = updatemodel;
                var data = JSON.stringify(envDetails, null, 4);
                fs.writeFile(path + fileName, data, function (err) {
                    if (err) {
                        deferred.reject(err);
                    } else {
                        deferred.resolve(localStorage.setItem("partnerapp", data));
                    }
                });
            } catch (e) {
                deferred.reject(e);
            }
            return deferred.promise;
        },
        //delete Config files
        deleteConfigDirectory: function (config) {
            if (config.Source == 'blob') {
                var fs = require('fs-extra');
                fs.removeSync(fxpConstants.configuration.path + config.EnvironmentName);
            }
        },

        getFxpFooterData: function () {
            return {};
        },




    }
});

