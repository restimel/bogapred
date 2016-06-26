// var gulp = require('gulp');
// var browserify = require('browserify');
// var watchify = require('watchify');
// var source = require('vinyl-source-stream');
// var sourceFile = './main.js';
// var destFolder = './';
// var destFile = 'bundle.js';

// gulp.task('browserify', function() {
// 	return browserify(sourceFile)
// 		  .bundle()
// 		  .pipe(source(destFile))
// 		  .pipe(gulp.dest(destFolder));
// });

// gulp.task('watch', function() {
// 	var bundler = watchify({paths: [sourceFile]});

// 	bundler.on('update', rebundle);

// 	function rebundle() {
// 		return bundler.bundle()
// 			  .pipe(source(destFile))
// 			  .pipe(gulp.dest(destFolder));
// 	}

// 	return rebundle();
// });

// gulp.task('default', ['browserify', 'watch']);


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
  entries: ['./main.js'],
  debug: true
};
var secondaryOpts = {
  entries: ['./third.js'],
  debug: true
};
var outputDir = './dist';
var outputMainFile = 'bundle.js';
var output2ndFile = 'bundle2.js';

var wMain = watchify(browserify(_.extend({}, watchify.args, mainOpts))); 
var w2nd = watchify(browserify(_.extend({}, watchify.args, secondaryOpts))); 

// add transformations here
// i.e. b.transform(coffeeify);

gulp.task('js', ['main', 'worker']); // so you can run `gulp js` to build the file
gulp.task('main', mainBundle);
gulp.task('worker', secondBundle);
gulp.task('help', help);
gulp.task('default', ['js']); // so you can run `gulp` to build the file


function mainBundle() {
	wMain.on('update', mainBundle); // on any dep update, runs the bundler
	wMain.on('log', gutil.log); // output build logs to terminal

  	return wMain.bundle()
		    .on('error', gutil.log.bind(gutil, 'Browserify Error')) // log errors if they happen
		    .pipe(source(outputMainFile))
		    .pipe(buffer())
		    .pipe(sourcemaps.init({loadMaps: true})) // loads map from browserify file
		    .pipe(uglify())
		    .pipe(sourcemaps.write('./')) // writes .map file
		    .pipe(gulp.dest(outputDir));
}

function secondBundle() {
	w2nd.on('update', secondBundle); // on any dep update, runs the bundler
	w2nd.on('log', gutil.log); // output build logs to terminal

 	return w2nd.bundle()
		    .on('error', gutil.log.bind(gutil, 'Browserify Error')) // log errors if they happen
		    .pipe(source(output2ndFile))
		    .pipe(buffer())
		    .pipe(sourcemaps.init({loadMaps: true})) // loads map from browserify file
		    .pipe(uglify())
		    .pipe(sourcemaps.write('./')) // writes .map file
		    .pipe(gulp.dest(outputDir));
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
