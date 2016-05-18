'use strict';

var connections = [], onConnectionCallback;

function Connection(socket) {
	this.id = socket.conn.id;
	this.socket = socket;
	this.session = false;
	this.label = '';
	this.socket.on('disconnect', () => {
		connections.splice(connections.indexOf(this), 1);
	});
	this.socket.on('register', (data) => {
		this.label = data.label;
	});
	connections.push(this);
}

Connection.prototype.getId = function() {
	return this.id;
};

Connection.prototype.setSession = function(session) {
	this.session = session;
}

Connection.prototype.getSession = function() {
	return this.session;
}

Connection.prototype.emit = function(event, data) {
	this.socket.emit(event, data);
};

Connection.prototype.disconnect = function() {
	this.socket.disconnect(true);
	connections.splice(connections.indexOf(this), 1);
};

Connection.prototype.addListener = function(event, callback) {
	this.socket.on(event, callback);
};

Connection.prototype.getLabel = function() {
	return this.label;
}

function onConnection(socket) {
	onConnectionCallback(new Connection(socket));
}

module.exports = function($http, $onConnectionCallback) {
	var io = require('socket.io')($http);
	io.on('connection', onConnection);
	onConnectionCallback = $onConnectionCallback;
};