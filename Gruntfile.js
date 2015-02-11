'use strict';

module.exports = function (grunt) {

    require('load-grunt-tasks')(grunt);

    grunt.initConfig({

        configs: configs,

        mozjpeg: mozjpeg,


        // Automatically inject Bower components
        wiredep: {
                src: ['index.html']
        }
};
