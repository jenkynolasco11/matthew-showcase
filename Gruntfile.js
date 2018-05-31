// const PORT = 35729;
const STYLES = 'static/assets/'

module.exports = function(grunt) {
    'use strict';

    grunt.initConfig({
        sass : {
        	scss : {
        		files : [{
        			expand : true,
        			cwd : STYLES + 'scss',
        			src : ['*.scss'],
        			dest : STYLES + 'css',
        			ext : '.css',
        		}],
        	},

        	options : {
        		outputStyle : 'expanded',
        		indendtType : 'tab',
        	},
        },
        autoprefixer : {
            // options : {
            //     browsers : ['ie 10','opera 39', 'firefox 49', 'safari 10'],
            // },
            css : {
                files : [{
                    expand : true,
                    cwd : STYLES + 'css',
                    src : ['*.css'],
                    dest : STYLES + 'css',
                    ext : '.css',
                }],
                options : {
                    browsers : ['ie > 9','opera > 2%', 'ff > 2%', 'safari > 2%'],
                    // cascade : false,
                },
            },
        },
        watch : {
        	scss : {
        		files : [STYLES + 'scss/*'],
        		tasks : ['sass:scss'],
        	},
          autoprefixer : {
              files : [STYLES + 'css/*.css'],
              tasks : ['autoprefixer:css'],
          },
        },
    });

    // Load the plugin that provides the "uglify" task.

    // grunt.loadNpmTasks('grunt-contrib-connect');
    // grunt.loadNpmTasks('grunt-contrib-pug');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-autoprefixer');
    grunt.loadNpmTasks('grunt-sass');

  // Default task(s)
    grunt.registerTask('default', [/*'pug',*/'sass','autoprefixer',/*'connect',*/'watch']);
};
