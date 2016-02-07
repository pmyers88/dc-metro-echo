var gulp = require('gulp');
var gutil = require('gulp-util');
var del = require('del');
var install = require('gulp-install');
var zip = require('gulp-zip');
var AWS = require('aws-sdk');
var fs = require('fs');
var runSequence = require('run-sequence');
var tape = require('gulp-tape');

gulp.task('test', function() {
  return gulp.src('test/*.js')
    .pipe(tape());
});

gulp.task('clean', function() {
  return del('./dist');
});

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

gulp.task('upload', function() {

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


gulp.task('default', function(callback) {
  return runSequence(
    ['test'],
    ['clean'],
    ['js', 'lib', 'resources', 'npm'],
    ['zip'],
    ['upload'],
    callback
  );
});
