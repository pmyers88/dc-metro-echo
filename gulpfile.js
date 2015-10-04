var gulp = require('gulp');
var gutil = require('gulp-util');
var del = require('del');
var rename = require('gulp-rename');
var install = require('gulp-install');
var zip = require('gulp-zip');
var AWS = require('aws-sdk');
var fs = require('fs');
var runSequence = require('run-sequence');

// First we need to clean out the dist folder and remove the compiled zip file.
gulp.task('clean', function() {
  del('./dist');
});

// The js task could be replaced with gulp-coffee as desired.
gulp.task('js', function() {
  return gulp.src(['index.js', '.env'])
    .pipe(gulp.dest('./dist/'));
});

gulp.task('lib', function() {
  return gulp.src('./lib/*')
    .pipe(gulp.dest('./dist/lib/'));
});

gulp.task('resources', function() {
  return gulp.src('./resources/*')
    .pipe(gulp.dest('./dist/resources/'));
});

// Here we want to install npm packages to dist, ignoring devDependencies.
gulp.task('npm', function() {
  return gulp.src('./package.json')
    .pipe(gulp.dest('./dist/'))
    .pipe(install({production: true}));
});

// Now the dist directory is ready to go. Zip it.
gulp.task('zip', function() {
  return gulp.src(['dist/**/*', '!dist/package.json', 'dist/.*'])
    .pipe(zip('dc-metro-echo.zip'))
    .pipe(gulp.dest('./'));
});

// Per the gulp guidelines, we do not need a plugin for something that can be
// done easily with an existing node module. #CodeOverConfig
//
// Note: This presumes that AWS.config already has credentials. This will be
// the case if you have installed and configured the AWS CLI.
//
// See http://aws.amazon.com/sdk-for-node-js/
gulp.task('upload', function() {

  // TODO: This should probably pull from package.json
  AWS.config.region = 'us-east-1';
  var lambda = new AWS.Lambda();
  var functionName = 'MetroTransit';

  lambda.getFunction({FunctionName: functionName}, function(err, data) {
    if (err) {
      var warning;
      if (err.statusCode === 404) {
        warning = 'Unable to find lambda function ' + deploy_function + '. ';
        warning += 'Verify the lambda function name and AWS region are correct.';
        gutil.log(warning);
      } else {
        warning = 'AWS API request failed. ';
        warning += 'Check your AWS credentials and permissions.';
        gutil.log(warning);
      }
    }

    // This is a bit silly, simply because these five parameters are required.
    var current = data.Configuration;
    var params = {
      FunctionName: functionName
    };

    fs.readFile('./dc-metro-echo.zip', function(err, data) {
      params.ZipFile = data;
      lambda.updateFunctionCode(params, function(err, data) {
        if (err) {
          console.log(JSON.stringify(err));
          var warning = 'Package upload failed. ';
          warning += 'Check your iam:PassRole permissions.';
          gutil.log(warning);
        }
      });
    });
  });
});

// The key to deploying as a single command is to manage the sequence of events.
gulp.task('default', function(callback) {
  return runSequence(
    ['clean'],
    ['js', 'lib', 'resources', 'npm'],
    ['zip'],
    ['upload'],
    callback
  );
});
