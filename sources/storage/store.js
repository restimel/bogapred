var Dbstore = require('storage/indexDB');

var store = {
	db: new Dbstore({
		saveProject: function(project) {
			store.projects.push(projects);
		},
		storeContext: function(contexts) {
			store.context = contexts;
		}
	}),
	projects: [],
	project: null,
	context: {},

	save: function() {
		this.db.setProject(this.project);
	},

	loadProject: function(name) {
		this.db.getProject(name, function(project) {
			store.project = project;
		});
	},

	getProjects: function() {
		
	}
};

module.exports = store;