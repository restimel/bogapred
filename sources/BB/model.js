'use strict';

var _ = require('underscore');
var Backbone = require('backbone');

var model = Backbone.Model.prototype;

function getPath(path) {
	return _.compact(path.split(/"?[.[\]]"?/));
}

function getValue(attrs, options) {
	return _.reduce(attrs, function(obj, attr) {
		if (_.isUndefined(obj)) {
			return;
		}

		if (obj instanceof Backbone.Model) {
			return model.get.call(obj, attr, options);
		} else if (obj instanceof Backbone.Collection) {
			return obj.at(attr, options);
		} else {
			return obj[attr];
		}
	}, this);
}

function get(path, options) {
	var attrs = getPath(path);

	return getValue.call(this, attrs, options);
}

function set(path, value, options) {
	var attrs, attr, obj;

	if (typeof path === 'object') {
		_.each(path, function(val, path) {
			return set.call(this, path, val, options);
		}, this);

		return this;
	}

	attrs = getPath(path);
	attr = attrs.pop();
	obj = getValue.call(this, attrs, options);

	if (_.isUndefined(obj)) {
		throw 'It is not possible to set a value to path "' + path + '".';
	}

	if (obj instanceof Backbone.Model) {
		return model.set.call(obj, attr, value, options);
	} else
	if (obj instanceof Backbone.Collection) {
		return obj.add(value, _.defaults({at: attr}, options));
	} else {
		obj[attr] = value;
		return obj;
	}
}

function has() {
	var value = get.apply(this, arguments);

	return !_.isUndefined(value);
}

function parse(args, options) {
	var response = {};

	if (!this.struct) {
		this.struct = {};
	}

	_.each(this.struct, function(def, attr) {
		var value = args[attr];

		if (def.prototype instanceof Backbone.Model || def.prototype instanceof Backbone.Collection) {
			value = new def(value, options);
		} else {
			if (_.isUndefined(value)) {
				value = def.defaults;
			}

			switch(def.type) {
				case 'number':
					value = +value;
					if (isNaN(value)) {
						value = undefined;
					}
					break;
				case 'string':
					break;
				case 'boolean':
					value = _.isUndefined(value) ? value : !!value;
					break;
				default:
					throw 'Construction issue: "' + attr + '" cannot be built. Structure of type ' + def.type + ' is unknown.';
			}
		}

		response[attr] = value;
	});

	return response;
}

function validate(attributes, options) {
	var errors = [];

	_.each(this.struct, function(def, attr) {
		var value = attributes[attr];
		var message;

		if (_.isUndefined(value)) {
			if (!def.optional) {
				errors.push('Attribute "' + attr + '" is required.')
			}

			return;
		}

		if (value instanceof Backbone.Model || value instanceof Backbone.Collection) {
			message = this.get(attr).validate(value.attributes, options);
			message = message.replace(/Attribute "((?:\\.|[^"]+)+)"/g, 'Attribute "' + attr + '.$1"');
			errors.push(message);
		} else {
			switch (def.type) {
				case 'number':
					value = +value;
					if (isNaN(value)) {
						errors.push('Attribute "' + attr + '" must be a number.');
						return;
					}

					if (typeof def.min === 'number' && def.min > value) {
						errors.push('Attribute "' + attr + '" must be greater than ' + def.min + '.');
					}
					if (typeof def.max === 'number' && def.max < value) {
						errors.push('Attribute "' + attr + '" must be lesser than ' + def.max + '.');
					}
					if (def.isInteger && value % 1) {
						errors.push('Attribute "' + attr + '" must be an integer number.');
					}
					break;
				case 'string':
					if (typeof value !== 'string') {
						errors.push('Attribute "' + attr + '" must be a string.');
						return;
					}

					if (def.allowedChars instanceof RegExp && !def.allowedChars.test(value)) {
						errors.push('Attribute "' + attr + '" must follow the pattern "' + def.allowedChars.toString() + '".');
					}
					if (def.forbiddenChars instanceof RegExp && def.forbiddenChars.test(value)) {
						errors.push('Attribute "' + attr + '" must not have characters "' + def.forbiddenChars.toString() + '".');
					}
					break;
				case 'boolean':
					if (typeof value !== 'boolean') {
						errors.push('Attribute "' + attr + '" must be a boolean.');
					}
					break;
			}
		}
	}, this);
	
	return errors.join('\n');
}

module.exports = Backbone.Model.extend({
	constructor: function(response, options) {
		options = _.defaults({parse: true}, options);

		Backbone.Model.call(this, response, options);
	},
	get: get,
	set: set,
	has: has,
	parse: parse,
	validate: validate
});
