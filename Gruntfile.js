'use strict';

module.exports = function (grunt) {
    require('load-grunt-tasks')(grunt);
    require('time-grunt')(grunt);

    var timer = require('grunt-timer'),
        configs = {
            app: './src',
            tempPath: '.tmp',
            distPath: './dist',
            buildPath: grunt.option('path') || './build',
            productionPath: grunt.option('path') || '/var/www/bruthans-website'
        },
        serveStatic = require('serve-static');

    timer.init(grunt, {
        friendlyTime: false,
        color: 'blue'
    });

    grunt.initConfig({

        /************************************************************************
         * General Configurations
         ************************************************************************/

        config: configs,


        // Enviroment variables configurations
        env: {
            test: {
                NODE_ENV: 'test'
            },
            prod: {
                NODE_ENV: 'prod'
            }
        },

        imagemin: {
            dynamic: {
                optimizationLevel: 5,
                files: [
                    {
                        expand: true,
                        cwd: 'assets/',
                        src: ['sprites/sprites.png'],
                        dest: '<%= config.productionPath %>/assets/sprites/'
                    },
                    {
                        expand: true,
                        cwd: 'assets/imgs',
                        src: ['**/*.{png,jpg,gif}'],
                        dest: '<%= config.productionPath %>/assets/images/'
                    }
                ]
            }
        },

        sprite: {
            all: {
                src: 'assets/images/**/*.png',
                dest: 'assets/sprites/sprites.png',
                destCss: 'assets/css/sprites.css',
                padding: 5
            },
            build: {
                src: 'assets/imgs/**/*.png',
                dest: 'assets/sprites/sprites.png',
                destCss: 'assets/css/sprites.css'
            },
            prod: {
                src: '<%= config.app %>/assets/imgs/**/*.png',
                dest: '<%= config.productionPath %>/assets/sprites/sprites.png',
                destCss: 'assets/css/sprites.css',
                imgPath: '../assets/sprites/sprites.png'
            }
        },

        // Compile Stylus files into CSS files
        sass: {
            build: {
                options: {
                    style: 'expanded',
                    trace: true,
                    unixNewlines: true,
                    lineNumbers: true,
                    cacheLocation: '<%= config.tempPath %>/sass-cache'
                },
                files: {
                    '<%= config.buildPath %>/css/main.css': '<%= config.app %>/assets/scss/appDev.scss'
                }
            },
            prod: {
                options: {
                    style: 'compressed',
                    unixNewlines: true,
                    cacheLocation: '<%= config.tempPath %>/sass-cache'
                },
                files: {
                    '<%= config.app %>/css/main.css': '<%= config.app %>/assets/scss/appProd.scss'
                }
            }
        },


        postcss: {
            options: {
                map: true,
                processors: [
                    require('autoprefixer')({browsers: 'Chrome >= 20, Firefox >= 20, Safari >= 8, Explorer >= 10'})
                ]
            },
            build: {
                src: '<%= config.buildPath %>/css/main.css'
            },
            prod: {
                src: '<%= config.app %>/css/main.css'
            }
        },


        // Remove desired directories
        clean: {
            build: {
                src: [
                    '<%= config.tempPath %>',
                    '<%= config.distPath %>',
                    '<%= config.buildPath %>'
                ]
            },
            prod: {
                options: {
                    force: true
                },
                src: [
                    '<%= config.tempPath %>',
                    '<%= config.distPath %>',
                    '<%= config.buildPath %>',
                    '<%= config.productionPath %>'
                ]
            },
            after: {
                src: [
                    '<%= config.app %>/js',
                    '<%= config.app %>/css',
                    '<%= config.tempPath %>',
                    '<%= config.distPath %>'
                ]
            }
        },


        // Copy files to a desired location
        copy: {
            build: {
                files: [
                    {
                        expand: true,
                        cwd: '<%= config.app %>/',
                        src: ['index.html'],
                        dest: '<%= config.buildPath %>/',
                        flatten: true,
                        filter: 'isFile'
                    },
                    {
                        expand: true,
                        cwd: '<%= config.app %>/',
                        src: ['assets/**'],
                        dest: '<%= config.buildPath %>/'
                    },
                    {
                        expand: true,
                        cwd: '<%= config.app %>/',
                        src: ['js/**'],
                        dest: '<%= config.buildPath %>/'
                    },
                    {
                        expand: true,
                        flatten: true,
                        cwd: '<%= config.app %>',
                        src: ['favicons/*'],
                        dest: '<%= config.buildPath %>/favicons/'
                    }
                ]
            },
            dist: {
                files: [
                    {
                        expand: true,
                        cwd: '<%= config.app %>/',
                        src: ['index.html'],
                        dest: '<%= config.distPath %>/',
                        flatten: true,
                        filter: 'isFile'
                    }
                ]
            },
            prod: {
                files: [
                    {
                        expand: true,
                        cwd: '<%= config.distPath %>/',
                        src: ['index.html'],
                        dest: '<%= config.productionPath %>/',
                        flatten: true,
                        filter: 'isFile'
                    },
                    {
                        expand: true,
                        cwd: '<%= config.distPath %>/',
                        src: ['js/**', 'css/**'],
                        dest: '<%= config.productionPath %>/'
                    },
                    {
                        expand: true,
                        cwd: '<%= config.app %>/',
                        src: ['assets/vendor/**/*'],
                        dest: '<%= config.productionPath %>/'
                    }
                ]
            }
        },


        // Add hash on file name to avoid caching
        filerev: {
            options: {
                algorithm: 'md5',
                length: 4
            },
            prod: {
                src: [
                    '<%= config.distPath %>/js/**/*.js',
                    '<%= config.distPath %>/css/**/*.css'
                ]
            }
        },


        // Prepare files to be compressed and uglified
        useminPrepare: {
            html: ['<%= config.app %>/index.html'],
            options: {
                dest: '<%= config.distPath %>/',
                flow: {
                    html: {
                        steps: {
                            js: ['concat'],
                            css: ['concat', 'cssmin']
                        },
                        post: {}
                    }
                }
            }
        },


        // Change file paths to concatenated and filereved ones
        usemin: {
            html: ['<%= config.distPath %>/index.html'],
            options: {
                dest: '<%= config.distPath %>/'
            }
        },


        ngAnnotate: {
            options: {
                singleQuotes: true
            },
            prod: {
                files: {
                    '<%= config.distPath %>/js/app.js': '<%= config.distPath %>/js/app.js'
                }
            }
        },


        // Uglify just concatenated app.js file
        uglify: {
            prod: {
                files: [{
                    expand: true,
                    cwd: '<%= config.distPath %>/js/',
                    src: '**',
                    dest: '<%= config.distPath %>/js/'
                }]
            }
        },


        // Generate template cache
        html2js: {
            options: {
                module: 'templates-fiddus',
                quoteChar: '\'',
                useStrict: true,
                htmlmin: {
                    collapseBooleanAttributes: true,
                    collapseWhitespace: true,
                    removeAttributeQuotes: true,
                    removeComments: true,
                    removeEmptyAttributes: true,
                    removeRedundantAttributes: true,
                    removeScriptTypeAttributes: true,
                    removeStyleLinkTypeAttributes: true
                },
                rename: function (moduleName) {
                    return moduleName.replace('../app/', '');
                }
            },
            build: {
                src: [
                    'app/**/*Tpl.html',
                    'components/**/*Tpl.html'
                ],
                dest: '<%= config.buildPath %>/js/templates.js'
            },
            prod: {
                src: [
                    'app/**/*Tpl.html',
                    'components/**/*Tpl.html'
                ],
                dest: '<%= config.app %>/js/templates.js'
            },
            tests: {
                src: [
                    'app/**/*Tpl.html',
                    'components/**/*Tpl.html'
                ],
                dest: '<%= config.tempPath %>/js/templates.js'
            }
        },


        // Minify HTML
        htmlmin: {
            deploy: {
                options: {
                    removeComments: true,
                    collapseWhitespace: true,
                    conservativeCollapse: true,
                    collapseBooleanAttributes: true,
                    removeOptionalTags: true
                },
                files: [{
                    expand: true,
                    cwd: '<%= config.productionPath %>/',
                    src: ['index.html'],
                    dest: '<%= config.productionPath %>/'
                }]
            }
        },


        // Connect application
        connect: {
            options: {
                port: 8001,
                livereload: 35730,
                hostname: 'localhost'
            },
            livereload: {
                options: {
                    open: true,
                    base: [
                        '<%= config.buildPath %>/'
                    ],
                    middleware: function (connect, options) {
                        var optBase = (typeof options.base === 'string') ?
                            [options.base] :
                            options.base;

                        return [require('connect-modrewrite')(['!(\\..+)$ / [L]'])]
                            .concat(optBase.map(function (path) {
                                return serveStatic(path);
                            }));
                    }
                }
            }
        },


        // Watch and live reload code
        watch: {
            options: {
                livereload: {
                    host: 'localhost',
                    port: '<%= connect.options.livereload %>'
                },
                dateFormat: function (time) {
                    grunt.log.writeln('File changed changed in ' + time + ' ms at ' + (new Date()).toString());
                    grunt.log.writeln('Waiting for more changes...');
                }
            },
            gruntfile: {
                files: [
                    '<%= config.app %>/Gruntfile.js'
                ]
            },
            html: {
                files: [
                    '<%= config.app %>/app/**/*.html',
                    '<%= config.app %>/components/**/*.html',
                    '<%= config.app %>/index.html'
                ],
                tasks: ['html2js:build', 'copy:build']
            },
            sass: {
                files: [
                    '<%= config.app %>/app/**/*.scss',
                    '<%= config.app %>/components/**/*.scss',
                    '<%= config.app %>/assets/**/*.scss'
                ],
                tasks: ['sass:build', 'postcss:build', 'copy:build']
            },
            js: {
                files: [
                    '<%= config.app %>/app/**/*.js',
                    '<%= config.app %>/components/**/*.js'
                ],
                tasks: ['copy:build']
            }
        },


        // Add new app release
        release: {
            options: {
                npm: false,
                additionalFiles: ['bower.json'],
                indentation: '    ',
                beforeBump: ['lint'],
                github: {
                    repo: 'fiddus/case4you-client',
                    usernameVar: 'GITHUB_USERNAME',
                    passwordVar: 'GITHUB_ACCESS_TOKEN'
                }
            }
        },

        concat:
            { generated:
                { files:
                    [ {
                        dest: '<%= config.distPath %>/assets/css/style.min.css',
                        src: [ '<%= config.app %>/assets/css/**.css']
                    },
                        {
                            dest: '.tmp/concat/assets/js/optimized.js',
                            src: [ 'js/foo.js', 'assets/js/bar.js' ]
                        }
                    ]
                }
            },

        cssmin:
        { generated:
            { files:
            [ { dest: '<%= config.distPath %>/assets/css/style.min.css',
                src: [ '<%= config.distPath %>/assets/css/style.min.css' ] } ] } }
    });


    /************************************************************************
     * Registered Tasks
     ************************************************************************/

    grunt.registerTask('build', [
        'clean:build',
        'sprite:build',
        'postcss:build',
        'copy:build'
    ]);


    grunt.registerTask('production', [
        'clean:prod',
        'env:prod',
        'sprite:prod',
        'copy:dist',
        'postcss:prod',
        'useminPrepare',
        'concat:generated',
        'cssmin:generated',
        'ngAnnotate',
        'uglify',
        'filerev',
        'usemin',
        'copy:prod',
        'imagemin',
        'htmlmin',
        'clean:after'
    ]);


    grunt.registerTask('serve', [
        'build',
        'connect:livereload',
        'watch'
    ]);


    grunt.registerTask('server', function (target) {
        grunt.log.warn('The `server` task has been deprecated. Use `grunt serve` next time.');
        grunt.task.run([target ? ('serve:' + target) : 'serve']);
    });
};
