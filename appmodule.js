
var environmentApp = angular.module('fxpEnvironment', ['ui.router', 'ngMaterial', 'material.svgAssetsCache']);
environmentApp.run(['$rootScope', '$state', '$stateParams', function ($rootScope, $state, $stateParams) {
    $state.transitionTo('wizard');
}]);
environmentApp.config(function ($stateProvider) {
    $stateProvider
         .state('wizard', {
             url: '/wizard',
             templateUrl: "templates/LandingTiles.html",
             controller: "DashboardController"
         })
         .state('setup', {
             url: '/setup',
             templateUrl: "templates/Setup.html",
             controller: "wizardController"
         })
        .state('tableConfig', {
            url: '/tableContent/:EnvID',
            templateUrl: "templates/TableConfig.html",
            controller: "TableConfigController"
        })

        .state('Persona', {
            url: '/persona',
            templateUrl: "templates/PersonaRouteMapping.html",
            controller: "EnvironmentController"
        })
        .state('PartnerDetails', {
             url: '/PartnerDetails/:EnvID',
             templateUrl: "templates/PartnerDetails.html",
             controller: "EnvironmentController"
         })
        .state('FXPConfig', {
            url: '/FXPConfig/:EnvID',
            templateUrl: "templates/FxpConfiguration.html",
            controller: "FxpDetailsController"
        })
        .state('fxpConfiguration', {
            url: '/fxpConfiguration/:EnvID',
            templateUrl: "templates/FxpConfiguration.html",
            controller: "EnvironmentController"
        })
        .state('manageEnvironment', {
            url: '/environments',
            templateUrl: "templates/ManageEnvironments.html",
            controller: "ManageEnvironmentsController"
        }).state('publish', {
            url: '/publish',
            templateUrl: "templates/PublishWizard.html",
            controller: "PublishController"
        })
        .state('cloneEnvironment', {
            url: '/clone',
            templateUrl: "templates/CloneEnvironments.html",
            controller: "CloneEnvironmentsController"
        });
});
