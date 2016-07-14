
# Extended Backbone model

Backbone is a MV* JavaScript framework ([cf official website](http://backboneJS.org)).

In this project, Backbone has been extended in several way to handle nested models/collection/views.

All these extensions are written in `scripts/BB/*` files.

[Models]:#models()
<a name="models"></a>
## Models
[struct]:#models-struct()
<a name="models-struct"></a>
### struct

A model must be defined by a struct property. This defines the kind of each attributes and helps to validate them.
It is possible to define a default value or to build a sub-model.

example:

	Model.extend({
		struct: {
			state: {
				type: 'number',
				max: 32,
				min: 0
				defaults: 1
			}
		}
	});

This example creates a model with a unique attribute 'state' which is a number. Its default value will be 1 and becomes invalid if the value is negative or greater than 32.

In order to define *sub-model* or *sub-collection*, provide the Backbone constructor of the given object.

example:

	Model.extend({
		struct: {
			token: TokenBBModel
		}
	});

This example creates a model with a unique attribute 'token' which is a sub-model.
The constructor TokenBBModel will be used to create this sub-model.

#### type

It defines the type of the attribute.

* number: The value must be numeric.
* string: The value must be a string.
* boolean: The value must be boolean (true/false).

#### max

_For numeric attributes only_

If the value is greater than the given max value, the model is considered invalid.

#### min

_For numeric attributes only_

If the value is lesser than the given min value, the model is considered invalid.

#### defaults

If no value are defined for this attribute, it is set to this default value.


[get]:#models-get()
<a name="models-get"></a>
### get

The `get` method has been extended to retrieve nested value very easily.

Considering we have a model modelA which has an attribute "b" which is a model containing an attribute "value". We can access this value from modelA with the command:

	modelA.get('a.value');

Considering we have a model modelB which has an attribute "list" which is a collection containing models with an attribute "name". We can access the value of the 3rd model from modelB with the command:

	modelB.get('list[2].name');

Keeping the previous example and considering that models have also an attribute "id" and we look for the name of th one which has the id 42:

	modelB.get('list[id=42].name')

The [] writing works also for models by looping on all attributes to find a model which has an attribute matching the condition.

Note that it stops after finding the first one and order are not guaranted on models.

If any part of the chain is not defined, it will return `undefined`.

[has]:#models-has()
<a name="models-has"></a>
### has

The `has` method has been extended to support chain writing (cf "get" explanation).

It return false if any value in the chain is not defined or if the final value is not defined.

[set]:#models-set()
<a name="models-set"></a>
### set

The `set` method has been extended to support chain writing (cf "get" explanation).

	modelA.set('a.value', 42);

It will set the attribute "value" of the model defined in the attribute "a" of modelA.

Note: this does not work with collection. It is not possible to do `modelB.set('list[1]`, {id: 666, name: 'not working'})` but it works for models' attributes in collection like `modelB.set('list[0].name', 'new name')`

## Collections

## Views

