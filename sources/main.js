'use strict';

var Model = require('models/Project.js');
var ModelA = require('models/Archetype.js');

var test = new Model({id: 10, title: 'Youpi', a: 1, b: true, archetype: [{id: 42, title: 'Arheotype'}]});

console.log('test→', test);
console.log('Truthy', test.isValid());
test.set('archetype[0].id', 'arf');
console.log('Falsy', test.isValid());
test.set('archetype[0].id', 2);
console.log('Truthy', test.isValid());
test.set('archetype[1]', new ModelA({id: 42, title: 'added'}));
console.log('Truthy', test.isValid());
console.log(test.get('archetype[1].title'));

console.log('archetype', test.get('archetype'));