module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        // uglify: {
        //     options: {
        //         banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
        //     },
        //     build: {
        //         src: 'src/<%= pkg.name %>.js',
        //         dest: 'build/<%= pkg.name %>.min.js'
        //     }
        // },
        concat: {
            options: {
                separator: '\n'
            },
            prod: {
                src: ['src/http.js', 'src/communication.js', 'src/dom.js', 'src/indoornavi.js'],
                dest: 'output/indoorNavi.js'
            },
            test: {
                src: ['src/indoornavi.js', 'src/communication.js', 'src/dom.js', 'spec/indoornavi.spec.js'],
                dest: 'output/indoorNavi.spec.js'
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');

    // Default task(s).
    grunt.registerTask('default', ['concat:prod']);
    grunt.registerTask('test', ['concat:test']);

};