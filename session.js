function Session(registrationCode) {
	this.connections = {};
	this.registrationCode = registrationCode;
	this.id = registrationCode + Date.now();
}

Session.prototype.connectionCount = function() {
	return Object.keys(this.connections).length;
}

Session.prototype.addConnection = function(connection, label) {
	this.connections[label] = connection;
	connection.addListener('disconnect', () => {
		delete this.connections[label];
	});
	connection.setSession(this);
};

Session.prototype.getConnection = function(label) {
	return this.connections[label];
};

Session.prototype.getRegistrationCode = function() {
	return this.registrationCode;
}

Session.prototype.getId = function() {
	return this.id;
}

module.exports = function(registrationCode){
	return new Session(registrationCode);
};