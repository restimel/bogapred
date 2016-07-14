var dbVersion = 1;
var dbName = 'bogapred';

/*
	To remove Db from browser:
	indexedDB.deleteDatabase('bogapred')
*/

function Dbstore(callbacks) {
	var request;

	this.callbacks = callbacks;
	
	if (typeof self.indexedDB === 'undefined') {
		this.db = false;
		Dbstore.error('The browser does not seem to support indexedDB');
		this.loadData();
	} else {
		request = self.indexedDB.open(dbName, dbVersion);
		request.onerror = this.onOpenError.bind(this);
		request.onupgradeneeded = this.onupgradeneeded.bind(this);
		request.onsuccess  = this.onConnection.bind(this);
		/* TODO: */
		request.onblocked  = this.onupgradeneeded.bind(this);
	}
}

Dbstore.prototype.onBlocked = function(event) {
	sendMessage($$('This application is running in another context. Its version is deprecated and must be refresh.'), 'info', {
		time: 7000,
		html: false
	});
};

Dbstore.prototype.onOpenError = function(event) {
	Dbstore.error('error while opening DB');
	this.db = false;
	this.loadData();
};

Dbstore.prototype.onupgradeneeded = function(event) {
	this.db = event.target.result;

	var objectStore;

	switch(event.oldVersion) {
		case 0:
			objectStore = this.db.createObjectStore('projects');
			objectStore.createIndex('name', 'name', {unique: true}); //version?

			objectStore = this.db.createObjectStore('logs', {keyPath: 'history', autoIncrement: true});

			objectStore = this.db.createObjectStore('context');
			objectStore.createIndex('key', 'key', {unique: true});
	}
};

Dbstore.prototype.onVersionChange = function(event) {
	console.warn('indexedDB version has changed in a newer context. This page should be reloaded.');
	this.db.close();
	this.db = false;
};

Dbstore.prototype.onConnection = function(event) {
	if (this.db) {
		this.loadData();
	} else {
		this.db = event.target.result;
	}

	this.db.onversionchange = this.onVersionChange.bind(this);

	this.loadToStore(this.callbacks);
};

/** Load data from file and send them to store */
Dbstore.prototype.loadProjects = function() {
	/* To be override in order to load default data */
	console.info('loadProjects has not been defined');
};

/** Load existing data to store */
Dbstore.prototype.loadToStore = function(callbacks) {
	this.getProjects(storeSaves.bind(this));
	this.loadContexts(callbacks);

	function storeSaves(projects) {
		if (projects) {
			if (projects.length) {
				projects.forEach(function(project) {
					callbacks.saveProject(project, {fromDB: true});
				});
			} else {
				this.loadProjects();
			}
		}
	}
};

Dbstore.prototype.getProject = function(name, callback) {
	if (this.db) {
		var request = this.db
			.transaction(['projects'], 'readonly')
			.objectStore('projects')
			.index('name')
			.get(name);

		request.onsuccess = function(event) {
			callback(event.target.result);
		};
	} else {
		callback(null);
	}
};

Dbstore.prototype.getProjects = function(callback) {
	var projects = [];

	if (this.db) {
		var request = this.db
			.transaction(['projects'], 'readonly')
			.objectStore('projects')
			.index('name')
			.openCursor();

		request.onsuccess = readCursor;
	} else {
		callback(null);
	}

	function readCursor(event) {
		var cursor = event.target.result;

		if (cursor) {
			projects.push(cursor.value);
			cursor.continue();
		} else {
			callback(projects);
		}
	}
};

Dbstore.prototype.setProject = function(project) {
	var key, transaction;

	if (this.db) {
		key = project.name;

		transaction = this.db.transaction(['projects'], 'readwrite');
		transaction.objectStore('projects').put(project, key);
	}
};

Dbstore.prototype.removeCube = function(projectName, callback) {
	var key, transaction, request;

	if (this.db) {
		key = projectName;

		transaction = this.db.transaction(['projects'], 'readwrite');
		request = transaction.objectStore('projects').delete(key);
		request.onsuccess = callback;
		request.onerror = callback;
	} else {
		callback(null);
	}
};

Dbstore.prototype.getContext = function(name, callback) {
	if (this.db) {
		var request = this.db
			.transaction(['context'], 'readonly')
			.objectStore('context')
			.index('key')
			.get(name);

		request.onsuccess = function(event) {
			callback(event.target.result.value);
		};
	} else {
		Dbstore.error('Could not get context "' + name + '"');
		callback(null);
	}
};

/* load contexts in common context stores */
Dbstore.prototype.loadContexts = function(callbacks) {
	var contexts = {};
	var request;

	if (this.db) {
		request = this.db
			.transaction(['context'], 'readonly')
			.objectStore('context')
			.index('key')
			.openCursor();

		request.onsuccess = readCursor;
	}

	function readCursor(event) {
		var cursor = event.target.result;

		if (cursor) {
			contexts[cursor.key] = cursor.value;
			cursor.continue();
		} else {
			callbacks.storeContext(contexts);
		}
	}
};

Dbstore.prototype.setContext = function(name, value) {
	var key, context, transaction;

	if (this.db) {
		key = name;
		context = {
			key: key,
			value: value
		};

		transaction = this.db.transaction(['context'], 'readwrite');
		transaction.objectStore('context').put(context, key);
	}
};

Dbstore.prototype.incContext = function(name) {
	if (this.db) {
		this.getContext(name, (function getValue(name, value) {
			this.setContext(name, value + 1);
		}).bind(this, name));
	}
};

Dbstore.prototype.addLog = function() {};

/* Static methods */

Dbstore.error = function(message) {
	return function(event) {
		console.error(message, event);
	};
};

module.exports = Dbstore;
