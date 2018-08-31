environmentApp.constant('fxpConstants', {
    defaultFiles:[
        "personaMapperConfig",
      "routes"
    ],
    mockFiles: [
               "FxpCouchbaseMediatorConfiguration",
              "FxpPersonaRoleMapping",
              "FxpStartupConfiguration",
              "FxpUIConfiguration_Functional_Manager",
              "FxpUIConfiguration_General_User",
              "FxpUIConfiguration_NonServicesUser",
              "FxpUIConfiguration_Requestor",
              "FxpUIConfiguration_Resource",
              "FxpUIConfiguration_Resource_Manager",
              "routes",
              "personaMapperConfig"],
    confitFiles: ["functionalmanagerdashboardconfig",
     "generaluserdashboardconfig",
     "nonservicesuserdashboardconfig",
     "partnerapp",
     "personarole",
     "requestordashboardconfig",
     "resourcedashboardconfig",
     "resourcemanagerdashboardconfig",
     "personaMapperConfig",
      "routes"
    ],
    configuration: {
        path: "./resources/",
        configPath: "./resources/configFile.json",
        DefaultContainerPath: ""
    },
    Models:{
        Telemetry:"Telemetry",
        Routes:"Routes",
        UIStrings:"UIStrings",
        FXPMessage:"FXPMessage",
        FxpHelpLinks: "FxpHelpLinks",
        FxpHelpChildLinks: "FxpHelpChildLinks",
        OBOUIStrings: "OBOUIStrings",
        Persona: "Persona",
        PersonaRole: "PersonaRole"
    },
     
    Messages: {
        Add: "Added Successfully",
        Update: "Updated Successfully",
        Delete: "Deleted Successfully",
        ErrorMessages: {
            Add: "An error has occurred while Adding",
            Update: "An error has occurred while Update",
            Delete: "An error has occurred while Delete"

        }
    },
    Source: {
        File: "file",
        Blob: "blob",
        New: "new",
        Warning: "Please select source"
    },
    Action: {
        Add: "Add",
        Update: "Update",
        Edit: "Edit",
        Delete: "Delete",
        Save: "Save",
        Error: "Error",
        Success:"Success"
    },
    PartnerScripts: {
        Update: "Partner Scripts Updated Successfully",
        Delete: "Partner Scripts Deleted Successfully",
        Add: "Partner Scripts Added Successfully",
        Error: "An Error occurred while updating Partner Scripts"
    },
    PartnerStyles: {
        Update: "Partner Styles Updated Successfully",
        Delete: "Partner Styles Deleted Successfully",
        Add: "Partner Styles Added Successfully",
        Error: "An Error occurred while updating Partner Styles"
    },
    PartnerModules: {
        Update: "Partner Modules Updated Successfully",
        Delete: "Partner Modules Deleted Successfully",
        Add: "Partner Modules Added Successfully",
        Error: "An Error occurred while updating Partner Modules"
    },
    Routes: {
        Error: "An error has occurred while updating the routes",
        Update: "Routes Updated Successfully",
        Delete: "Route Deleted Successfully",
        Add: "Route Added Successfully",
        RouteMap: "Routes have been mapped to Persona Successfully"
    },
    Telemetry: {
        Update: "Telemetry Details Updated Successfully",
        Delete: "Telemetry Details Deleted Successfully",
        Error: {
            Update: "An error has occurred while updating Telemetry Details",
            Delete: "An error has occurred while Delete Telemetry Details"
        }

    },
    UIStrings: {
        Update: "UI Strings have updated Successfully",
        Delete: "UI Strings have deleted Successfully",
        Error: {
            Update: "An error has occurred while updating UIStrings",
            Delete: "An error has occurred while Delete UIStrings",
        }
    },

    OBOStrings: {
        Update: "OBO Strings have updated Successfully",
        Delete: "OBO Strings have deleted Successfully",
        Error: {
            Update: "An error has occurred while updating OBOStrings",
            Delete: "An error has occurred while Delete OBOStrings",
        }
    },
    FXPMessage: {
        Add: "FXP Message Added successfully",
        Update: "FXP Message Updated successfully",
        Delete: "FXP Message Deleted successfully",
        Error: {
            Add: "An error has occurred while Adding OBOStrings",
            Update: "An error has occurred while updating OBOStrings",
            Delete: "An error has occurred while Delete OBOStrings",
        }
    },

    Persona: {
        Update: "Persona Updated Successfully",
        Delete: "Persona Deleted Successfully",
        Add: "Persona Added Successfully",
        UpdateRole: "Persona Role Updated Successfully",
        DeleteRole: "Persona Role Deleted Successfully",
        AddRole: "Persona Role Added Successfully",
        Error: {
            Update: "An error has occurred while Updating  Persona",
            Delete: "An error has occurred while Deleting  Persona",
            Add: "An error has occurred while Adding  Persona",
            UpdateRole: "An error has occurred while Updating  Persona  Role",
            DeleteRole: "An error has occurred while Deleting  Persona  Role",
            AddRole: "An error has occurred while Adding  Persona  Role"
        }
    },
    HelpLinks: {
        UpdatePersona: "Help Links have been mapped to Persona Successfully",
        Delete: "FXP Help Link Deleted Successfully",
        Update: "FXP Help Links Updated Successfully",
        Add: "FXP Help Links Added Successfully",
        Error: {
            UpdatePersona: "An error has occurred while mapping Help link to Persona ",
            Delete: "An error has occurred while Deleting  FXP Help Link",
            Add: "An error has occurred while Adding  FXP Help Link",
            Update: "An error has occurred while Updating  FXP Help Links"

        }
    },
    SubHelplinks: {
        Update: "FXP Sub Help Links Updated Successfully",
        Delete: "FXP Sub Help Link Deleted Successfully",
        Add: "FXP Sub Help Link Added Successfully",
        Error: {
            Delete: "An error has occurred while Deleting  FXP Sub Help Link",
            Add: "An error has occurred while Adding  FXP Sub Help Link",
            Update: "An error has occurred while Updating  FXP Sub Help Links"
        }
    },

    FxpFooter: {
        Update: "FXP Footer Updated Successfully",
        Delete: "FXP Footer Deleted Successfully",
        Add: "FXP Footer Added Successfully",
        Error: {
            Delete: "An error has occurred while Deleting  FXP Footer Element",
            Add: "An error has occurred while Adding  FXP Footer Element",
            Update: "An error has occurred while Updating  FXP Footer Element"
        }
    },
    FxpTable: {
        Update: "Table Details Updated Successfully",
        Delete: "Table Details Deleted Successfully",
        Add: "Table Details Added Successfully",
        Error: {
            Delete: "An error has occurred while Deleting  Table Details",
            Add: "An error has occurred while Adding  Table Details",
            Update: "An error has occurred while Updating  Table Details"
        }
    },
    NoEnvironment: "No Environments Configured at the moment. Please Configure new Environment.",
    SelectEnvironmentWarning: "Please select Environment !",
    fileNotExists: "One or more Config files are missing ,  Please contact IT support !",
    blobfileNotExists: "One or more Config files are missing , Please confirm if you like to add files @ Blob. otherwise,  Please contact IT support !",
    NoData: "No Data",
    Error: "An unexpected error has ocurred.Please try again",
    Success: "Environment added successfully",
    Publish: "Published Successfully",
    AzureStorageError: "The provided account credentials is not a valid, Please enter correct values",
    CouchBaseSettingUpdate: "Couch Base Settings Updated Successfully",
    AdalAuthExcludeExtnUpdate: "AdalAuthExcludeExtn Updated Successfully",
    FxpFooterData: [
    {
        "ElementType": "a",
        "DisplayText": "Data Protection Notice",
        "TabIndex": "401",
        "href": "https://microsoft.sharepoint.com/sites/lcaweb/Home/Product-Development/Regulatory-Complaince/Privacy-and-security/Data-protection-notic",
        "target": "_blank",
        "cssClass": "footer-item"
    },
    {
        "ElementType": "a",
        "DisplayText": "Terms of Use",
        "href": "http://www.microsoft.com/en-us/legal/intellectualproperty/copyright/default.aspx",
        "TabIndex": "402",
        "target": "_blank",
        "cssClass": "footer-item pull-right"
    }]
});