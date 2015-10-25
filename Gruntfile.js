module.exports = function (grunt) {
    grunt.initConfig({
        jshint: {
            options: {
                expr: true
            },
            prefix: {
                src: ["./prefix.js"]
            },
        },
        uglify: {
            options:{
                report: "min"
            },
            minall: {
                files: {
                    "./prefix.min.js": ["./prefix.js"]
                }
            }
        }
    });

    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-contrib-uglify");

    grunt.registerTask("default", ["uglify:minall"]);
}
