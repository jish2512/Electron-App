var fsextra = require('fs-extra');
var sourceFile = './resources/default/routes.json';
var targetFile = './resources/restApi/routes.json';
fsextra.copy(sourceFile, targetFile, function (err) {
    if (err)
        console.log(err);
    else {
         
        console.log('success!');
    }
});

