'use strict';

var connections = {}, onConnectionCallback;

function Connection(socket) {
	this.id = socket.conn.id;
	this.socket = socket;
	this.session = 0;
	this.socket.on('disconnect', () => {
		this.disconnect();
	});
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
	delete connections[this.id];
};

Connection.prototype.addListener = function(event, callback) {
	this.socket.on(event, callback);
};

function onConnection(socket) {
	connections[socket.conn.id] = new Connection(socket);
	onConnectionCallback(connections[socket.conn.id]);
}

module.exports = function($http, $onConnectionCallback) {
	var io = require('socket.io')($http);
	io.on('connection', onConnection);
	onConnectionCallback = $onConnectionCallback;
};