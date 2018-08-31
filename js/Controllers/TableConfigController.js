environmentApp.controller('TableConfigController', ['$scope', 'FxpFactory', '$state', '$rootScope', 'fxpMessage', '$stateParams', 'fxpConstants', 'fxpModel',
function ($scope, FxpFactory, $state, $rootScope, fxpMessage, $stateParams, fxpConstants, fxpModel) {

    $scope.TableConfig = {};
    function PageInit() {
        try {
            $rootScope.$emit("enableBack", true);
            FxpFactory.getTableConfig($stateParams.EnvID).then(function (response) {
                $scope.TableConfig = JSON.parse(response).Entities;
            }, function (error) {
                fxpMessage.addMessage(fxpConstants.Error, "error");
            });
              
        } catch (error) {
            fxpMessage.addMessage(fxpConstants.Error, "error");
        };
    }

    PageInit();

    $scope.duplicateCheckPartionRowkey = function (model) {
        try {
            $scope.isDulplicateKey = false;
            var rowKey = (model.RowKey == null) ? '' : model.RowKey;
            var partitionKey = (model.PartitionKey == null) ? '' : model.PartitionKey;
            if ((rowKey != '') && (partitionKey != '')) {
                $scope.isDulplicateKey = $scope.TableConfig.filter(function (obj,index) {
                    if ((index != $scope.editIndex) && (!$scope.TableConfig[index].hasOwnProperty('IsDeleted'))) {
                        return ((obj.PartitionKey.toLowerCase() == partitionKey.toLowerCase()) &&
                             (obj.RowKey.toLowerCase() == rowKey.toLowerCase()));
                    }
                }).length > 0;
            }
        } catch (error) {

        }
    }

    $scope.editTableKey = function (model, action, index) {
        $scope.isDulplicateKey = false;
        $scope.editIndex = index;
        $scope.envEdiables = {};
        $scope.submitted = false;
        if (action == fxpConstants.Action.Edit) {
            $scope.envEdiables = angular.copy(model); 
            $scope.envEdiables.ButtonText = fxpConstants.Action.Update;
            $scope.envEdiables.Action = fxpConstants.Action.Update;
        } else {
            $scope.envEdiables.ButtonText = fxpConstants.Action.Save;
            $scope.envEdiables.Action = fxpConstants.Action.Add;
        }
        angular.element(document.querySelector('#editTableContent')).modal('show');
    }
    $scope.updateTableKey = function (modaldata, form) {
        try {
            $scope.submitted = true;
            if (form.$valid && !$scope.isDulplicateKey) {
                var index = $scope.editIndex;
                fxpModel.FxpTable.PartitionKey = modaldata.PartitionKey;
                fxpModel.FxpTable.RowKey = modaldata.RowKey;
                fxpModel.FxpTable.IsBlob = modaldata.IsBlob;
                fxpModel.FxpTable.Key = modaldata.Key;
                fxpModel.FxpTable.Value = modaldata.Value;
                if ($scope.envEdiables.Action === fxpConstants.Action.Update) {
                    $scope.TableConfig[index] = angular.copy(fxpModel.FxpTable);
                } else {
                    fxpModel.FxpTable.IsAdded = true;
                    $scope.TableConfig.push(angular.copy(fxpModel.FxpTable));
                }
                var data = angular.copy($scope.TableConfig);
                FxpFactory.updateTableConfig(data, $stateParams.EnvID).then(function () {
                    angular.element(document.querySelector('#editTableContent')).modal('hide');
                    if ($scope.envEdiables.Action === fxpConstants.Action.Update) {
                        fxpMessage.addMessage(fxpConstants.FxpTable.Update, "success");
                    }else
                        fxpMessage.addMessage(fxpConstants.FxpTable.Add, "success");
                }, function (error) {
                    angular.element(document.querySelector('#editTableContent')).modal('hide');
                    fxpMessage.addMessage(fxpConstants.FxpTable.Update, "success");
                });
            }
        } catch (error) {
            fxpMessage.addMessage(fxpConstants.FxpTable.Error.Update, "error");
        }

    }
    $scope.exculdeDelete = function (item) {

    }
    $scope.deleteTableKey = function (module, index) {
        $scope.Deletedindex = index;
        angular.element(document.querySelector('#confirmTableModule')).modal('show');
    }
    $scope.deleteTableKeyConfirm = function () {
        if ($scope.TableConfig[$scope.Deletedindex].hasOwnProperty('IsAdded')) {
            $scope.TableConfig.splice($scope.Deletedindex, 1);
        } else {
            $scope.TableConfig[$scope.Deletedindex].IsDeleted = true;
        }

        //
        var data = angular.copy($scope.TableConfig);
        FxpFactory.updateTableConfig(data, $stateParams.EnvID).then(function () {
            angular.element(document.querySelector('#confirmTableModule')).modal('hide');
            fxpMessage.addMessage(fxpConstants.FxpTable.Delete, "success");
        }, function (error) {
            fxpMessage.addMessage(fxpConstants.FxpTable.Error.Delete, "error");
        });
    }
    $scope.modelCancel = function (container) {
        angular.element(document.querySelector('#' + container)).modal('hide');
    }
}]);