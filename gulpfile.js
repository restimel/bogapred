'use strict';

var watchify = require('watchify');
var browserify = require('browserify');
var gulp = require('gulp');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var gutil = require('gulp-util');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var _ = require('underscore');

// Custom browserify options here
var mainOpts = {
  entries: ['./sources/main.js'],
  debug: true,
  paths: ['./node_modules', './sources']
};
var secondaryOpts = {
  entries: ['./sources/worker.js'],
  debug: true,
  paths: ['./node_modules', './sources']
};
var outputDir = './dist';
var outputMainFile = 'script.js';
var output2ndFile = 'worker.js';

var wMain = watchify(browserify(_.extend({}, watchify.args, mainOpts))); 
var w2nd = watchify(browserify(_.extend({}, watchify.args, secondaryOpts))); 

var minifyFiles = true;

// transformations here

gulp.task('js', ['main', 'worker']);
gulp.task('main', mainBundle);
gulp.task('worker', secondBundle);
gulp.task('debug', debug);
gulp.task('help', help);
gulp.task('default', ['js']);

function debug() {
	minifyFiles = false;

	mainBundle();
	secondBundle();
}

function mainBundle() {
	wMain.on('update', runMainBundle); // on any dep update, runs the bundler
	wMain.on('log', gutil.log); // output build logs to terminal

	runMainBundle();
}

function runMainBundle() {
  	var bundle = wMain.bundle()
		    .on('error', gutil.log.bind(gutil, 'Browserify Error')) // log errors if they happen
		    .pipe(source(outputMainFile))
		    .pipe(buffer())
		    .pipe(sourcemaps.init({loadMaps: true})); // loads map from browserify file
	
	if (minifyFiles) {
		bundle = bundle.pipe(uglify())
	}

	bundle = bundle.pipe(sourcemaps.write('./')) // writes .map file
		    .pipe(gulp.dest(outputDir));

	return bundle;
}

function secondBundle() {
	w2nd.on('update', run2ndBundle); // on any dep update, runs the bundler
	w2nd.on('log', gutil.log); // output build logs to terminal

	run2ndBundle();
}

function run2ndBundle() {
 	var bundle = w2nd.bundle()
		    .on('error', gutil.log.bind(gutil, 'Browserify Error')) // log errors if they happen
		    .pipe(source(output2ndFile))
		    .pipe(buffer())
		    .pipe(sourcemaps.init({loadMaps: true})) // loads map from browserify file
		    .pipe(uglify())
		    .pipe(sourcemaps.write('./')) // writes .map file
		    .pipe(gulp.dest(outputDir));

	return bundle;
}

function help() {
	console.log('run `gulp [option]` to compile the project\n\n');
	console.log('Options are\n');
	console.log('js: to build the whole project (both main and worker files).');
	console.log('main: to build only the main file.');
	console.log('worker: to build only the worker file.');
	console.log('help: to get help on command to build the project.');
	console.log('\nBy default the `js` command is run');
}
