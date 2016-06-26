'use strict';

var _ = require('underscore');
var Backbone = require('backbone');

function validate(attributes, options) {
	var messages = _.map(attributes, function(value) {
		return value.validate(value, options);
	});

	return messages.join('\n');
}

module.exports = Backbone.Collection.extend({
	constructor: function(response, options) {
		options = _.defaults({parse: true}, options);

		Backbone.Collection.apply(this, arguments);
	},
	validate: validate
});
