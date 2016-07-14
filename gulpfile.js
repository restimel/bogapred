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
var build_sourcemaps = false;

// transformations here

gulp.task('js', ['main', 'worker']);
gulp.task('main', mainBundle);
gulp.task('worker', secondBundle);
gulp.task('build', build)
gulp.task('debug', debug);
gulp.task('help', help);
gulp.task('default', ['js']);

function debug() {
	minifyFiles = false;
	build_sourcemaps = true;

	mainBundle();
	secondBundle();
}

function build() {
	runMainBundle();
	run2ndBundle();
	gulp.stop();
}

function mainBundle() {
	wMain.on('update', runMainBundle); // on any dep update, runs the bundler
	wMain.on('log', gutil.log); // output build logs to terminal

	runMainBundle();
}

function runMainBundle() {
  	var bundle = wMain.bundle()
		    .on('error', gutil.log.bind(gutil, 'Browserify Error')) // log errors if they happen
		    .on('error', function() {
		    	//TODO clear file
		    	var x;
		    	for (x in gulp) {
		    		console.log(x, typeof gulp[x])
		    	}
		    	bundle.pipe(gulp.dest(outputDir));
		    })
		    .pipe(source(outputMainFile))
		    .pipe(buffer());

	if (build_sourcemaps) {
		bundle = bundle.pipe(sourcemaps.init({loadMaps: true})); // loads map from browserify file
	}
	
	if (minifyFiles) {
		bundle = bundle.pipe(uglify())
	}

	if (build_sourcemaps) {
		bundle = bundle.pipe(sourcemaps.write('./')); // writes .map file
	}

	bundle = bundle.pipe(gulp.dest(outputDir));

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
		    .pipe(buffer());
	if (build_sourcemaps) {
		bundle = bundle.pipe(sourcemaps.init({loadMaps: true})); // loads map from browserify file
	}

	if (minifyFiles) {
		bundle = bundle.pipe(uglify());
	}

	if (build_sourcemaps) {
		bundle = bundle.pipe(sourcemaps.write('./')); // writes .map file
	}

	bundle = bundle.pipe(gulp.dest(outputDir));

	return bundle;
}

function help() {
	console.log('run `gulp [option]` to compile the project\n\n');
	console.log('Options are\n');
	console.log('js: to build and watch the whole project (both main and worker files).');
	console.log('debug: to build and watch the whole project with sourcemaps but not minified.');
	console.log('main: to build and watch only the main file.');
	console.log('worker: to build and watch only the worker file.');
	console.log('build: build the project only once.');
	console.log('help: to get help on command to build the project.');
	console.log('\nBy default the `js` command is run');
	gulp.stop();
}
