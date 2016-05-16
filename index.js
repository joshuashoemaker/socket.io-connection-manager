var controller = require('./controller');

module.exports = function(http, registrationCallback, sessionEndCallback) {
	var connect = require('./connect')(http, function(connection){
		controller.addConnection(connection, registrationCallback, sessionEndCallback);
	});
	
	return controller;
};