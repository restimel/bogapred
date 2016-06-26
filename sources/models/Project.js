'use strict'

var Model = require('BB/model.js');

module.exports = Model.extend({
	struct: {
		id: {
			type: 'number'
		},
		title: {
			type: 'string'
		},
		archetype: require('collections/Archetype')
		// materials: require('collection/Material')
	}
});
