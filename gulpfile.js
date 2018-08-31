/*
This file in the main entry point for defining Gulp tasks and using Gulp plugins.
Click here to learn more. http://go.microsoft.com/fwlink/?LinkId=518007
*/
"use strict";
var gulp = require("gulp"),
     concat = require("gulp-concat"),
    cssmin = require("gulp-cssmin"),
    sass = require("gulp-sass");
var uglify = require('gulp-uglify');

var paths = {
    cssFolderPath: "./css/**/*.*",
    scssFolderPath: "./wwwroot/scss/*.scss"
};

gulp.task("sass:transpile", function () {
    return gulp.src('./css/*.scss')
      .pipe(sass().on('error', sass.logError))
      .pipe(concat('./site-min.css'))
       .pipe(cssmin())
      .pipe(gulp.dest('./lib/css/'));
});

gulp.task('jsmin', function () {
    return gulp.src(['./js/Services/*.*', 
        './js/Controllers/*.*' 
    ])
                .pipe(concat('./base.min.js'))
                .pipe(uglify())
                .pipe(gulp.dest('./lib/js/'))
});

gulp.task("default", ['sass:transpile', 'jsmin']);