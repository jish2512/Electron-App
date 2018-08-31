environmentApp.factory("fxpModel", function () {
    var Models =
        {
            PartnerStyles: {
                "Url": "",
                "SortOrder": ""
            },
            PartnerScripts: {
                "Url": "",
                "SortOrder": ""
            },
            Routes: {
                "StateName": "",
                "RouteConfig": "",
                "Style": "",
                "AppHeader": "",
                "RouteName": ""

            },
            Footer: {
                "ElementType": "",
                "DisplayText": "",
                "TabIndex": "",
                "href": "",
                "cssClass": "",
                "ImagePath":""
            },
            FxpHelpLink: {
                "DisplayText": "",
                "DisplayOrder": "",
                "HelpLinks": []
            },
            FxpSubHelpLink: {
                "DisplayText": "",
                "Href": "",
                "Title": "",
                "DisplayOrder": "",
                "OpenInline":""
            },
            PersonaRole: {
                "RoleId": "",
                "RoleName": ""
            },
            Persona: {
                "Id": "",
                "Name": "",
                "Roles": []
            },
            Messages: {
                "ErrorMessage": "",
                "ErrorMessageTitle": ""
            },
            FxpTable: {
                "PartitionKey": "",
                "RowKey": "",
                "IsBlob": "",
                "Key": "",
                "Value": "",
                "IsAdded":""
            },
            configDetails: {
                "Source": "",
                "LocalPath": "",
                "StorageName": "",
                "StorageKey": "",
                "EnvironmentName": ""
            }
        }

    return Models;
});