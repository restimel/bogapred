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
		// variables: require('collection/variables')
	}
});
