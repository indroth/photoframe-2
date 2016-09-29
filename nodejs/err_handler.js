/**
* Standard error handlers
*/

var util = require('util');


exports.fatal_error = function(err) {
    util.error(err);
    process.exit(1);
};

