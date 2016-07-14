'use strict';

var w = new SharedWorker('worker.js');

document.getElementById('test').textContent= 'running';
var Model = require('models/Project.js');
var ModelA = require('models/Archetype.js');

var test = new Model({id: 10, title: 'Youpi', a: 1, b: true, archetype: [{id: 1, title: 'first'}, {id: 42, title: 'The Archetype'}]});

console.log('test→', test);
console.log('Truthy', test.isValid());
test.set('archetype[0].id', 'arf');
console.log('Falsy', test.isValid());
test.set('archetype[0].id', 2);
console.log('Truthy', test.isValid());
console.log('(first)', test.get('archetype[0].title'));

console.log('archetype', test.get('archetype'));

console.log('findWhere (archetype 42)', test.get('archetype[id=42].title'))

document.getElementById('test').textContent= 'OK';