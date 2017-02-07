/**
 *
 * @author  yujiyang
 * @date    2016-05-31
 * 
 * 功能
 * 一、启动 gulp
 *      1. 编译 sass文件 (src目录下的 scss文件夹下的scss和component文件夹下的scss文件)
 *      2. 合并 生成的CSS文件
 *      3. 开启browsersync，并监听html、css、js文件
 *      
 * 二、启动 gulp build
 *      1. 压缩css文件
 *      2. 其他
 *
 * 四、启动任务：
 *     1.启动 gulp: gulp vote
 *     2.启动 gulp build : gulp build-vote
 */

'use strict';

/* global module */
var gulp = require('gulp');
var gulpLoadPlugins = require('gulp-load-plugins');
var $ = gulpLoadPlugins({
    rename: {
        // 'gulp-sprite-generator': 'spriteGenerator'
    }
});
var fs = require('fs');


/* tasks */

// Static server
var browserSync = require('browser-sync').create();
gulp.task('browsersync', function() {
    browserSync.init([
        '!./bower_components/',
        '!./node_modules/',
        './*/html/**/*.html',
        './*/css/**/*.css',
        './*/js/**/*.js',
        'index.html'
    ], {
        server: {
            baseDir: "./"
        },
        ghostMode: false,
    });
});


//sass
var path = require('path'); // node Path
function getCurFolder() {
    var arr = fs.readdirSync('./').filter(function(file) {
        if (file.match('bower_components') || file.match('node_modules') || file.match('.git')) {
            return false;
        }
        return fs.statSync(path.join('./', file)).isDirectory();
    });
    return arr;
}

function generateSassTask(folder) {
    var conf = {
        includePaths: [
            'bower_components/bourbon/app/assets/stylesheets',
            'bower_components/normalize-css'
        ],
        outputStyle: 'nested'
    }
    return gulp.src('./' + folder + '/scss/*.scss')
        .pipe($.sourcemaps.init()) // sourcemaps init
        .pipe($.sass(conf).on('error', $.sass.logError))
        .pipe($.sourcemaps.write('../tmp/')) // output sourcemaps
        .pipe(gulp.dest('./' + folder + '/css'));
}
//sass-normal
gulp.task('sass', function() {
    var folderArr = getCurFolder();
    folderArr.forEach(function(item) {
        generateSassTask(item);
    });
});
//sass-compress
gulp.task('sass-build', ['clean-map'], function() {
    return gulp.src([
            './**/scss/*.scss',
            '!./node_modules/**/*.scss',
            '!./bower_components/**/*.scss'
        ])
        .pipe($.sass({
            includePaths: [
                'bower_components/bourbon/app/assets/stylesheets',
                'bower_components/normalize-css'
            ],
            outputStyle: 'compressed'
        }).on('error', $.sass.logError))
        .pipe($.rename(function(filepath) {
            // remove parent directory from relative path
            filepath.dirname = path.dirname(filepath.dirname) + '/css';
        }))
        .pipe(gulp.dest('./'));
});

//clean
gulp.task('clean-map', function() {
    return gulp.src([
            './*/tmp/',
            '!./node_modules/',
            '!./bower_components/'
        ], {
            read: false
        })
        .pipe($.clean());
});

//generateTask
function generateTask() {
    var folderArr = [{
        name: 'vote',
        imgDist: '/pic/',
        imgIcon: '_visual_icons.png'
    }];
    var itemUrl = '';
    folderArr.forEach(function(item) {
        //sass
        gulp.task('sass-' + item.name, function() {
            generateSassTask(item.name);
        });

        //browsersync
        gulp.task('browsersync-' + item.name, function() {
            browserSync.init([
                './' + item.name + '/html/**/*.html',
                './' + item.name + '/css/**/*.css',
                './' + item.name + '/js/**/*.js',
                'index.html'
            ], {
                server: {
                    baseDir: "./"
                },
                ghostMode: false,
                startPath: 'vote/html/index.html'
            });
        });

        //watch
        gulp.task('watch-' + item.name, function() {
            gulp.watch([
                './' + item.name + '/scss/*.scss'
            ], ['sass-' + item.name]);
        });

        //default(watch & browsersunc): gulp editor | gulp template
        gulp.task(item.name, [
            'browsersync-' + item.name,
            'watch-' + item.name
        ]);

        //sass-build
        gulp.task('sass-build-' + item.name, ['clean-map'], function() {
            return gulp.src([
                    './' + item.name + '/scss/*.scss',
                ])
                .pipe($.sass({
                    includePaths: [
                        'bower_components/bourbon/app/assets/stylesheets',
                        'bower_components/normalize-css'
                    ],
                    outputStyle: 'compressed'
                }).on('error', $.sass.logError))
                .pipe(gulp.dest('./' + item.name + '/css'));
        });

        //build: gulp editor-build | gulp template-build
        gulp.task('build-' + item.name, [
            'sass-build-' + item.name
        ]);
    });
}

//run generator
generateTask();

// just watch js & scss
gulp.task('watch', function() {
    gulp.watch([
        '!./bower_components/',
        '!./node_modules/',
        './*/scss/*.scss'
    ], ['sass']);
});


/* run tasks */
// watch & browsersunc
gulp.task('default', [
    'browsersync',
    'watch'
]);
//build
gulp.task('build', [
    'sass-build'
]);




