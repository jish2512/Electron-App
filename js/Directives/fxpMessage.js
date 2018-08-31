function fxpmessage() {
    var directive = {};
    directive.restrict = 'AE';
    directive.templateUrl = "templates/FxpMessage.html";
    return directive;
} 
environmentApp.directive('fxpmessage', fxpmessage);