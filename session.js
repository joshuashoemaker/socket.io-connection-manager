var sessions = [];

function Session(registrationCode) {
	this.connections = [];
	this.registrationCode = registrationCode;
	this.id = registrationCode + Date.now();
	sessions.push(this);
}

Session.prototype.connectionCount = function() {
	return this.connections.length;
}

Session.prototype.addConnection = function(connection) {
	this.connections.push(connection);
	connection.setSession(this);
};

Session.prototype.removeConnection = function(connection) {
	this.connections.splice(this.connections.indexOf(connection), 1);
}

Session.prototype.endSession = function() {
	sessions.splice(sessions.indexOf(this), 1);
}

Session.prototype.setName = function(name) {
	this.name = name;
}

Session.prototype.getName = function() {
	return this.name;
}

Session.prototype.setRegistrationCode = function(code) {
	this.registrationCode = code;
}

Session.prototype.getRegistrationCode = function() {
	return this.registrationCode;
}

Session.prototype.getId = function() {
	return this.id;
}

Session.prototype.getOtherSessions = function() {
	var otherSessions = sessions.slice(0);
	otherSessions.splice(otherSessions.indexOf(this), 1);
	return otherSessions;
}

Session.prototype.getConnections = function(index) {
	return this.connections;
}

Session.sessions = function() {
	return sessions;
}

module.exports = Session