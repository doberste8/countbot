// gulpfile.js

'use strict';

let gulp = require('gulp');
let ts = require('gulp-typescript');
let bs = require('browser-sync').create(); // create a browser sync instance.

let clientTsProject = ts.createProject('client/tsconfig.json');
let serverTsProject = ts.createProject('server/tsconfig.json');

// These tasks will be run when you just type "gulp"
gulp.task('default', [ 'clientscripts', 'serverscripts' ]);

// This task can be run alone with "gulp clientscripts"
gulp.task('clientscripts', () => {
  return clientTsProject.src()
                        .pipe(clientTsProject())
                        .js
                        .pipe(gulp.dest('client/dist'));
});

// This task can be run alone with "gulp serverscripts"
gulp.task('serverscripts', () => {
  return serverTsProject.src()
                        .pipe(serverTsProject())
                        .js
                        .pipe(gulp.dest('server/dist'));
});

gulp.task('browser-sync', function() {
  bs.init({
    files: [
            {
                match: ['client/**/*.js', 'client/**/*.css', 'client/**/*.html'],
                fn:    function (event, file) {
                    this.reload();
                }
            }
        ],
    port: 8081,
  ui: {
    port: 8082
  }
  });
});

// By adding this, we can run "gulp watch" to automatically
// run the build when we change a script
gulp.task('watch', () => {
  gulp.watch('client/**/*.ts', [ 'clientscripts' ]);
  gulp.watch('server/**/*.ts', [ 'serverscripts' ]);
});