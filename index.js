'use strict';

var Session = require('./session');

module.exports = Manager;

function Manager(http) {
    if (!(this instanceof Manager))
		return new Manager(http);
	
	this.connect = require('./connect')(http, (connection) => {
		this.addConnection(connection);
	});
	this.sessions = {};
	this.registrationCodes = {};
	
	this.addConnection = function(connection){
		connection.addListener('register', (data) => {
			var session = this.registerConnection(connection, data);
			connection.addListener('disconnect', () => {
				session.removeConnection(connection);
				if(session.connectionCount() === 0) {
					var id = session.getId(),
						registrationCode = session.getRegistrationCode();
					if(this.sessions[id]) {
						delete this.sessions[id];
					}
					if(this.registrationCodes[registrationCode])
						delete this.registrationCodes[registrationCode];
					if(this.sessionEndCallback)
						this.sessionEndCallback(session);
					session.endSession();
				}
			});
			if(this.registrationCallback)
				this.registrationCallback(connection);
		});
		if(this.connectionCallback)
			this.connectionCallback(connection);
	};
	
	this.registerConnection = function(connection, data) {
		let session = 0;
		if(data.registrationCode) {
			session = this.sessions[this.registrationCodes[data.registrationCode.toLowerCase()]];
			if(!!session) {
				session.addConnection(connection);
			}
		} else if(data.sessionId){
			session = this.sessions[data.sessionId];
			if(!!session) {
				session.addConnection(connection);
			}
		} else {
			let registrationCode = this.createRegistrationCode();
			session = new Session(registrationCode);
			this.sessions[session.getId()] = session;
			this.registrationCodes[registrationCode] = session.getId();
			setTimeout(() => {
				if(this.registrationCodes[registrationCode])
					delete this.registrationCodes[registrationCode];
			}, 300000);	
			if(data.name)
				session.setName(data.name);
			session.addConnection(connection);
		}
		if(session === 0 || typeof session === "undefined") {
			connection.emit('connect error', 'Could not connect with this code');
		}
		return session;
	};
	
	this.createRegistrationCode = function() {
		var code = "";
		var characters = "abcdefghijklmnopqrstuvwxyz";

		for( var i=0; i < 4; i++ )
			code += characters.charAt(Math.floor(Math.random() * characters.length));
		
		if(!this.sessions[code]) {
			return code;
		} else {
			return this.createRegistrationCode();
		}
	};
	
	this.sendToSession = function(session, event, data) {
		let connections = session.getConnections(),
			l = connections.length;
		for(let i=0; i<l; i++) {
			connections[i].emit(event, data);
		}
	};
	
	this.sendToConnection = function(connection, event, data) {
		connection.emit(event, data);
	};
	
	this.listenToSession = function(session, event, callback) {
		let connections = session.getConnections(),
			l = connections.length;
		for(let i=0; i<l; i++) {
			connections[i].addListener(event, callback);
		}
	};
	
	this.listenToConnection = function(connection, event, callback) {
		connection.addListener(event, callback);
	};
	
	return {
		onConnection: (callback) => {
			this.connectionCallback = callback;
		},
		onRegistration: (callback) => {
			this.registrationCallback = callback;
		},
		onSessionEnd: (callback) => {
			this.sessionEndCallback = callback;
		},
		sendToSession: (session, event, data) => {
			this.sendToSession(session, event, data);
		},
		sendToConnection: (connection, event, data) => {
			this.sendToConnection(connection, event, data);
		},
		listenToSession: (session, event, callback) => {
			this.listenToSession(session, event, callback);
		},
		listenToConnection: (connection, event, callback) => {
			this.listenToConnection(connection, event, callback);
		},
		sessions: () => {
			return Session.sessions();
		}
	}
}