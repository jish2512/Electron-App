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
        /**
        * A service to display all types of Messages like Error, Warning, Information
        * @class Fxp.Services.fxpMessageService
        * @classdesc A service to display all types of Messages like Error, Warning, Information
        * @example <caption> Example to create an instance of Fxp Message Service</caption>
        *  //Initializing Fxp Message
        *  angular.module('FxPApp').controller('AppController', ['fxpMessageService', AppController]);
        *  function AppController(fxpMessageService, fxpConstants){ fxpMessageService.addMessage('message from FXP', Fxp.Common.Constants.FxpConstants.messageType.error); }
        */
        var FxpMessageService = (function () {
            function FxpMessageService($rootScope, $interval) {
                /**
                * Displays Error/Warning/Information messages on FXP and Focus
                * @method Fxp.Services.fxpMessageService.addMessage
                * @param {string} a mandatory string value which contains Error/Warning/Information.
                * @param {string} a mandatory string value determing type of messsage Error/Warning/Information.
                * @example <caption> Example to invoke addMessage</caption>
                *  fxpMessageService.addMessage('Error from FXP', fxpConstants.messageType.error);
                */
                this.addMessage = function (message, messageType, doNotAutoClose) {
                    var msg = {};
                    msg.msgDate = new Date();
                    msg.MessageType = messageType;
                    msg.Message = message;
                    msg.show = true;
                    if (doNotAutoClose === true)
                        msg.doNotAutoClose = doNotAutoClose;
                    else
                        msg.doNotAutoClose = false;
                    var $rootScope = this.$rootScope;
                    var $interval = this.$interval;
                    var msgInterval = this.msgInterval;
                    var timeout = this.msgTimeout;
                    this.$rootScope.messages.push(msg);
                    this.$rootScope.messageClass = this.$rootScope.messages.length > 0 ? "modal-show" : "modal-hide";
                    if (this.$rootScope.messages.length == 1 && $(":focus").length > 0) {
                        this.$rootScope.activeElement = $(":focus");
                    }
                    if (this.$rootScope.messages.length > 0) {
                        setTimeout(function () { $(".message-content").focus(); }, 100);
                    }
                    this.msgInterval = this.$interval(function () {
                        var dt = new Date();
                        var diff;
                        for (var i = $rootScope.messages.length - 1; i >= 0; i--) {
                            var messageType = $rootScope.messages[i].MessageType.toLowerCase();
                            if (messageType == "success" || ((messageType == "warning" || messageType == "info") && !$rootScope.messages[i].doNotAutoClose)) {
                                diff = dt - $rootScope.messages[i].msgDate;
                                if (diff >= timeout)
                                    $rootScope.messages.splice(i, 1);
                            }
                        }
                        if ($rootScope.messages.length == 0) {
                            $interval.cancel(msgInterval);
                            $rootScope.messageClass = "modal-hide";
                            if ($rootScope.activeElement) {
                                $rootScope.activeElement.focus();
                                $rootScope.activeElement = undefined;
                            }
                        }
                    }, 1000);
                };
                /**
                * An event handler whenever message close button is clicked.
                * @method Fxp.Services.fxpMessageService.closeMessage
                * @param {onject} message An object which is passed from the view.
                * @example <caption> Example to use closeMessage</caption>
                *  <div ng-app="AppController"><div ng-click="closeMessage">Close Message</div></div>;
                *  <div ng-app="AppController as app"><div ng-click="app.closeMessage">closeMessage</div></div>;
                */
                this.closeMessage = function (message) {
                    var index = this.$rootScope.messages.indexOf(message);
                    this.$rootScope.messages.splice(index, 1);
                    this.$rootScope.messageClass = this.$rootScope.messages.length > 0 ? "modal-show" : "modal-hide";
                    if (this.$rootScope.messages.length == 0) {
                        this.$interval.cancel(this.msgInterval);
                    }
                    else
                        setTimeout(function () { $(".message-content").focus(); }, 100);
                };
                this.$rootScope = $rootScope;
                this.$rootScope.messages = [];
                this.$rootScope.messageClass = "modal-hide";
                this.$interval = $interval;
                //this.msgTimeout = 2000;
                if (this.msgTimeout == "" || this.msgTimeout == null || isNaN(this.msgTimeout))
                    this.msgTimeout = 2000;
                this.$rootScope.closeMessage = this.closeMessage.bind(this);
            }
            return FxpMessageService;
        })();
        Services.FxpMessageService = FxpMessageService;
        angular
            .module('fxpEnvironment')
            .service('fxpMessage', ['$rootScope', '$interval' , FxpMessageService]) //For backward compatibility
            .service('FxpMessageService', ['$rootScope', '$interval', FxpMessageService]);
    })(Services = Fxp.Services || (Fxp.Services = {}));
})(Fxp || (Fxp = {}));
