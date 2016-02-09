var gulp = require('gulp');
var gutil = require('gulp-util');
var del = require('del');
var install = require('gulp-install');
var zip = require('gulp-zip');
var AWS = require('aws-sdk');
var fs = require('fs');
var runSequence = require('run-sequence');
var tape = require('gulp-tape');
var faucet = require('faucet');
var semistandard = require('gulp-semistandard');

gulp.task('test', function () {
  return gulp.src('test/*.js')
    .pipe(tape({
      reporter: faucet()
    }));
});

gulp.task('semistandard', function () {
  return gulp.src(['*.js', 'lib/*.js'])
    .pipe(semistandard())
    .pipe(semistandard.reporter('default', {
      breakOnError: true
    }));
});

gulp.task('clean', function () {
  return del('./dist');
});

gulp.task('js', function () {
  return gulp.src(['index.js', '.env'])
    .pipe(gulp.dest('./dist/'));
});

gulp.task('lib', function () {
  return gulp.src('./lib/*')
    .pipe(gulp.dest('./dist/lib/'));
});

gulp.task('resources', function () {
  return gulp.src('./resources/*')
    .pipe(gulp.dest('./dist/resources/'));
});

gulp.task('vendor', function () {
  return gulp.src('./vendor/*')
    .pipe(gulp.dest('./dist/vendor/'));
});

// Here we want to install npm packages to dist, ignoring devDependencies.
gulp.task('npm', function () {
  return gulp.src('./package.json')
    .pipe(gulp.dest('./dist/'))
    .pipe(install({production: true}));
});

// Now the dist directory is ready to go. Zip it.
gulp.task('zip', function () {
  return gulp.src(['dist/**/*', '!dist/package.json', 'dist/.*'])
    .pipe(zip('dc-metro-echo.zip'))
    .pipe(gulp.dest('./'));
});

gulp.task('upload', function () {
  AWS.config.region = 'us-east-1';
  var lambda = new AWS.Lambda();
  var functionName = 'MetroTransit';

  lambda.getFunction({FunctionName: functionName}, function (err, data) {
    if (err) {
      var warning;
      if (err.statusCode === 404) {
        warning = 'Unable to find lambda function ' + functionName + '. ';
        warning += 'Verify the lambda function name and AWS region are correct.';
        gutil.log(warning);
      } else {
        warning = 'AWS API request failed. ';
        warning += 'Check your AWS credentials and permissions.';
        gutil.log(warning);
      }
      throw new Error(err);
    }

    var params = {
      FunctionName: functionName
    };

    fs.readFile('./dc-metro-echo.zip', function (err, data) {
      if (err) {
        var warning = 'Error creating zip.';
        gutil.log(warning);
        throw new Error(err);
      } else {
        params.ZipFile = data;
        lambda.updateFunctionCode(params, function (err, data) {
          if (err) {
            var warning = 'Package upload failed. ';
            warning += 'Check your iam:PassRole permissions.';
            gutil.log(warning);
            throw new Error(err);
          }
        });
      }
    });
  });
});

gulp.task('default', function (callback) {
  return runSequence(
    ['semistandard'],
    ['test'],
    ['clean'],
    ['js', 'lib', 'vendor', 'resources', 'npm'],
    ['zip'],
    ['upload'],
    callback
  );
});

gulp.task('lintTest', function (callback) {
  return runSequence(
    ['semistandard'],
    ['test']
  );
});
