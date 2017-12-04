var path = require('path');
var gulp = require('gulp');
var concat = require('gulp-concat');
var cleanCSS = require('gulp-clean-css');
var spawn = require('child_process').spawn;
var node, env = process.env;
var nodemon    = require('gulp-nodemon');
var livereload = require('gulp-livereload');


var paths = {
    server: {
        index: 'app.js'
    }
};

// nodemon 的配置
var nodemonConfig = {
    script : paths.server.index,
    ignore : [
        "chanincode/**",
        "scripts/**",
        "node_modules/**",
        "config/**",
        "public/**",
        "views/**"
    ],
    env    : {
        "NODE_ENV": "development"
    }
};

// 使用 nodemone 跑起服务器
gulp.task('serve', function() {
    return nodemon(nodemonConfig);
});


gulp.task('develop',['serve']);

