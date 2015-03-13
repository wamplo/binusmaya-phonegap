/**
 *
 *  Web Starter Kit
 *  Copyright 2014 Google Inc. All rights reserved.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License
 *
 */

'use strict';

// Include Gulp & Tools We'll Use
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var del = require('del');
var runSequence = require('run-sequence');
var browserSync = require('browser-sync');
var pagespeed = require('psi');
var browserify  = require('browserify');
var tcache = require('gulp-angular-templatecache');
var source = require('vinyl-source-stream');
var reload = browserSync.reload;

var _path = {
   src:    'webkit_src'
,  dest:   'app/src/main/assets/www'
,  assets: 'file_ass'
}

var AUTOPREFIXER_BROWSERS = [
  'ie >= 10',
  'ie_mob >= 10',
  'ff >= 30',
  'chrome >= 34',
  'safari >= 7',
  'opera >= 23',
  'ios >= 7',
  'android >= 4.4',
  'bb >= 10'
];

// Lint JavaScript
gulp.task('jshint', function () {
  return gulp.src(_path.dest + '/' + _path.assets + '/js/**/*.js')
    .pipe(reload({stream: true, once: true}))
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish'))
    .pipe($.if(!browserSync.active, $.jshint.reporter('fail')));
});

//Browserify
gulp.task('browserify', function() {

  var Brorify =  browserify({
    entries   : ['./' +_path.src+ '/js/main']
  , extensions  : ['.js']
  , debug   : true  
  });

  // Lets bundle all
  var bundle = function() {
    return Brorify
    .bundle()
    .on('error', function(err) {
      console.log(err);
      this.emit('end');
    })
    .pipe(source('main.js'))
    .pipe(gulp.dest(_path.dest+ '/' +_path.assets+ '/js'))
    .on('update', bundle)
  }

  return bundle();
});

// Optimize Images
gulp.task('images', function () {
  return gulp.src(_path.src +'/img/**/*')
    .pipe($.imagemin({
      progressive: true,
      interlaced: true
    }))
    .pipe(gulp.dest(_path.dest+ '/' +_path.assets+ '/img'))
    .pipe($.size({title: 'images'}));
});

// Copy All Files At The Root Level (app)
// gulp.task('copy', function () {
//   return gulp.src([
//     'app/*',
//     '!app/*.html',
//     'node_modules/apache-server-configs/dist/.htaccess'
//   ], {
//     dot: true
//   }).pipe(gulp.dest('dist'))
//     .pipe($.size({title: 'copy'}));
// });

gulp.task('copy', function () {
  return gulp.src([
      _path.src+ '/vendor/**/**'
    ], {
      dot: true
    }).pipe(gulp.dest(_path.dest+ '/' +_path.assets+ '/vendor'))
      .pipe($.size({title: 'copy'}));
});

// Copy Web Fonts To Dist
gulp.task('fonts', function () {
  return gulp.src([_path.src+ '/fonts/**'])
    .pipe(gulp.dest(_path.dest+ '/' +_path.assets+ '/fonts'))
    .pipe($.size({title: 'fonts'}));
});

// Compile and Automatically Prefix Stylesheets
gulp.task('styles', function () {
  // For best performance, don't add Sass partials to `gulp.src`
  return gulp.src([
    _path.src + '/css/*.scss',
    _path.src + '/css/**/*.css',
  ])
    //.pipe($.changed('styles', {extension: '.scss'}))
    .pipe($.sass({
      precision: 10,
      style: 'compressed'
    }))
    .on('error', console.error.bind(console))
    .pipe($.autoprefixer({browsers: AUTOPREFIXER_BROWSERS}))
    .pipe(gulp.dest('.tmp/styles'))
    // Concatenate And Minify Styles
    //.pipe($.if('*.css', $.csso()))
    .pipe(gulp.dest(_path.dest + '/' +_path.assets+ '/css/'))
    .pipe($.size({title: 'styles'}));
});

// Scan Your HTML For Assets & Optimize Them
gulp.task('html', function () {
  var assets = $.useref.assets({searchPath: '{.tmp,' +_path.src+ '}'});

  return gulp.src(_path.dist +'/**/*.html')
    .pipe(assets)
    // Concatenate And Minify JavaScript
    .pipe($.if('*.js', $.uglify({preserveComments: 'some'})))
    // Remove Any Unused CSS
    // Note: If not using the Style Guide, you can delete it from
    // the next line to only include styles your project uses.
    .pipe($.if('*.css', $.uncss({
      html: [
        _path.dist + '/index.html',
        _path.dist + '/styleguide.html'
      ],
      // CSS Selectors for UnCSS to ignore
      ignore: [
        /.navdrawer-container.open/,
        /.app-bar.open/
      ]
    })))
    // Concatenate And Minify Styles
    // In case you are still using useref build blocks
    .pipe($.if('*.css', $.csso()))
    .pipe(assets.restore())
    .pipe($.useref())
    // Update Production Style Guide Paths
    .pipe($.replace('components/components.css', 'components/main.min.css'))
    // Minify Any HTML
    //.pipe($.if('*.html', $.minifyHtml()))
    // Output Files
    .pipe(gulp.dest(_path.dest))
    .pipe($.size({title: 'html'}));
});

// Angular Template
gulp.task('template', function () {
  gulp.src(_path.src+ '/template/**/*.html')
      .pipe(tcache({
        standalone: true
      }))
      .pipe(gulp.dest(_path.src+ '/js'));
});

// Clean Output Directory
gulp.task('clean', del.bind(null, ['.tmp', _path.dest + '/' +_path.assets]));

// Watch Files For Changes & Reload
gulp.task('serve', ['styles'], function () {
  browserSync({
    notify: false,
    // Customize the BrowserSync console logging prefix
    logPrefix: 'WSK',
    // Run as an https by uncommenting 'https: true'
    // Note: this uses an unsigned certificate which on first access
    //       will present a certificate warning in the browser.
    // https: true,
    server: ['.tmp', _path.dest]
  });

  gulp.watch([_path.src + '/**/*.html'], reload);
  gulp.watch([_path.src + '/css/**/*.{scss,css}'], ['styles', reload]);
  gulp.watch([_path.src + '/js/**/*.js'], ['jshint']);
  gulp.watch([_path.src + '/js/**/*.js'], ['browserify']);
  gulp.watch([_path.src + '/template/**/*.html'], ['template']);
  gulp.watch([_path.src + '/img/**/*'], reload);
});

// Run without SERVER and clean
gulp.task('watch', ['default'], function() {
  gulp.watch([_path.src + '/**/*.html'], reload);
  gulp.watch([_path.src + '/css/**/*.{scss,css}'], ['styles', reload]);
  //gulp.watch([_path.src + '/js/**/*.js'], ['jshint']);
  gulp.watch([_path.src + '/js/**/*.js'], ['browserify']);
  //gulp.watch([_path.src + '/template/**/*.html'], ['template']);
  gulp.watch([_path.src + '/img/**/*'], ['images', reload]);
})

// Build and serve the output from the dist build
gulp.task('serve:dist', ['default'], function () {
  browserSync({
    notify: false,
    logPrefix: 'WSK',
    // Run as an https by uncommenting 'https: true'
    // Note: this uses an unsigned certificate which on first access
    //       will present a certificate warning in the browser.
    // https: true,
    server: _path.dest
  });
});

// Build Production Files, the Default Task
gulp.task('default', ['clean'], function (cb) {
  runSequence('styles', ['copy', 'jshint', 'html', 'images', 'fonts', 'browserify', 'template'], cb);
});

// Run PageSpeed Insights
// Update `url` below to the public URL for your site
gulp.task('pagespeed', pagespeed.bind(null, {
  // By default, we use the PageSpeed Insights
  // free (no API key) tier. You can use a Google
  // Developer API key if you have one. See
  // http://goo.gl/RkN0vE for info key: 'YOUR_API_KEY'
  url: 'https://example.com',
  strategy: 'mobile'
}));

// Load custom tasks from the `tasks` directory
// try { require('require-dir')('tasks'); } catch (err) { console.error(err); }
