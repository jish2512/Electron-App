
var fs = require('fs');
environmentApp.factory('FxpPublishFactory', function ($http, $q) {
    return {
        getFileNames: function (filePath) {
            try { 
                var fileNames = []
                var files = fs.readdirSync(filePath);
                for (var i in files) {
                    fileNames.push(files[i]);
                } return fileNames;
            } catch (e) {
                throw e;
            }
        },
        writeJsonFile: function (filePath, data) {
            try {
                var wdata = JSON.stringify(data, null, 4);
                fs.writeFileSync(filePath, wdata);
            } catch (error) {
                throw error;
            }
        },
        verifyConnection: function (storageEnv) {
            var deferred = $q.defer();
            try {
                var blobService = storage.createBlobService(storageEnv.StorageName, storageEnv.StorageKey);
                blobService.listContainersSegmented(null, function (err, result) {
                    if (err) {
                        console.log(err);
                        deferred.reject("Test connection failed");
                    }
                    else {
                        console.log(result);
                        deferred.resolve("Test connection Successfully");
                    }
                });
            } catch (error) {
                deferred.reject(error);
            }
            return deferred.promise;
        },
        publish: function (files, storageDetails) {
            var deferred = $q.defer();
            try {
                var self = this;
                self.publishBlobContent(files, storageDetails).then(function (response) {
                    deferred.resolve(response);
                }, function (error) {
                    deferred.reject(error);
                });
                if (files.indexOf("tableConfig") >= 0) {
                    self.publishTableContent(storageDetails).then(function (response) {
                        deferred.resolve(response);
                    }, function (error) {
                        deferred.reject(error);
                    });
                }
            } catch (e) {
                deferred.reject(error);
            }
            return deferred.promise;
        },

        publishBlobContent: function (files, storageEnv) {
            var deferred = $q.defer();
            try {
                var blobService = storage.createBlobService(storageEnv.StorageName, storageEnv.StorageKey);
                var dirName = '';
                if (storageEnv.Source == 'file') {
                    dirName = storageEnv.LocalPath.replace(/\\/g, "\\\\") + "\\\\";
                } else {
                    dirName = './resources/' + storageEnv.EnvironmentName + '/';
                }

                for (var i = 0; i < files.length; i++) {
                    if (files[i] != "tableConfig") {
                        var blobname = files[i];
                        blobService.createBlockBlobFromLocalFile(containerName, blobname, dirName + files[i] + '.json', function (error, result, response) {
                            if (error) {
                                deferred.reject(error);
                            } else {
                                deferred.resolve('success');
                            }
                        });
                    }
                }


            } catch (error) {
                deferred.reject(error);
            }
            return deferred.promise;
        },
        publishTableContent: function (storageEnv) {
            var deferred = $q.defer();
            try {
                var dirName = '';
                if (storageEnv.Source == 'file') {
                    dirName = storageEnv.LocalPath.replace(/\\/g, "\\\\") + "\\\\";
                } else {
                    dirName = './resources/' + storageEnv.EnvironmentName + '/';
                }
                var tableData = JSON.parse(JSON.stringify(eval("(" + localStorage.getItem("tableConfig") + ")")));
                var tableSvc = storage.createTableService(storageEnv.StorageName, storageEnv.StorageKey);
                var entGen = storage.TableUtilities.entityGenerator;
                if (tableData != null) {
                    for (var j = 0; j < tableData.Entities.length; j++) {
                        if ((tableData.Entities[j].hasOwnProperty('IsDeleted')) && (tableData.Entities[j].IsDeleted == true)) {

                            var task = {
                                PartitionKey: entGen.String(tableData.Entities[j].PartitionKey),
                                RowKey: entGen.String(tableData.Entities[j].RowKey)
                            };

                            tableSvc.deleteEntity(tableName, task, function (error, result, response) {
                                if (!error) {
                                    console.log("table successfully updated");
                                    deferred.resolve('success');
                                } else {
                                    console.log(error);
                                    deferred.reject(error);
                                }
                            });
                            tableData.Entities.splice(j, 1);

                        } else if (!tableData.Entities[j].hasOwnProperty('IsDeleted')) {
                           
                            var task = {
                                PartitionKey: entGen.String(tableData.Entities[j].PartitionKey),
                                RowKey: entGen.String(tableData.Entities[j].RowKey),
                                Key: entGen.String(tableData.Entities[j].Key),
                                IsBlob: entGen.Boolean(tableData.Entities[j].IsBlob),
                                Value: entGen.String(tableData.Entities[j].Value)
                            };
                            tableSvc.insertOrReplaceEntity(tableName, task, function (error, result, response) {
                                if (!error) {
                                    console.log("table successfully updated");
                                    deferred.resolve('success');
                                } else {
                                    console.log(error);
                                    deferred.reject(error);
                                }
                            });
                            delete tableData.Entities[j].IsAdded;
                        }

                    }
                    var data = JSON.stringify(tableData, null, 4);
                    localStorage.setItem("tableConfig", data);
                    fs.writeFileSync(dirName + 'tableConfig.json', data, 'utf8');
                    

                }

            } catch (error) {
                deferred.reject(error);
            }
            return deferred.promise;
        },


    }
});

