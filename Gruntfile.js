'use strict';

module.exports = function(grunt) {
	grunt.initConfig({

        connect: {
        	dev: {
	            options: {
	                port: 8000,
	                keepalive: true,
	                open: {
	                    target: 'http://localhost:8000'
	                },
	                middleware: function(connect, options, middlewares) {
	                    var modRewrite = require('connect-modrewrite');

	                    // enable Angular's HTML5 mode
	                    middlewares.unshift(modRewrite(['!\\.html|\\.js|\\.svg|\\.css|\\.png|\\.ttf|\\.woff|\\.woff2$ /index.html [L]']));

	                    return middlewares;
	                }
	            }
	        }
	    }

    });

    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.registerTask('run', ['connect:dev']);
};