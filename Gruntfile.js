module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        // uglify: {
        //     options: {
        //         banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
        //     },
        //     build: {
        //         src: ['src/helper/*', 'src/model/*', 'src/object.js', 'src/polyline.js', 'src/area.js', 'src/marker.js', 'src/indoornavi.js', 'src/report.js'],
        //         dest: 'build/indoorNavi.min.js'
        //     }
        // },
        concat: {
            options: {
                separator: '\n'
            },
            prod: {
                src: ['src/helper/*', 'src/model/*', 'src/objects/base/*', 'src/objects/*', 'src/indoornavi.js', 'src/report.js', 'src/data.js'],
                dest: 'output/indoorNavi.js'
            },
            test: {
                src: ['src/helper/*', 'src/model/*', 'src/objects/base/*', 'src/objects/*', 'src/indoornavi.js', 'src/report.js', 'spec/*'],
                dest: 'output/indoorNavi.spec.js'
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');

    // Default task(s).
    grunt.registerTask('default', ['concat:prod']);
    grunt.registerTask('test', ['concat:test']);

};
