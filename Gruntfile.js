'use strict';

module.exports = function (grunt) {

    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        // Automatically inject Bower components
        wiredep: {
            task: {
                src: [
                './index.html'
                ]

            }
        }
    });
};
