'use strict';

module.exports = function (grunt) {
    var path = require('path');
    //var fs = require('fs');
    //var _ = require('lodash');

    // Load grunt tasks automatically
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        yeoman: {
            projectRoot: path.resolve('.'),
            app: '<%= yeoman.projectRoot %>',
            test: '<%= yeoman.app %>/**/*.spec.js',
            target: path.resolve('target'),
            dist: path.resolve('dist')
        },

        mocha_istanbul: {
            threshold: {
                src: testsMatchingFiles(),
                options: {
                    grep: testsMatchingPattern(),
                    require: ['./test-globals'],
                    coverageFolder: 'target/coverage',
                    reportFormats: ['html'],
                    excludes: ['**/*.spec.js'],
                    mochaOptions: [],
                    istanbulOptions: [],
                    check: {
                        lines: 100,
                        statements: 100
                    }
                }
            },
            noThreshold: {
                src: testsMatchingFiles(),
                options: {
                    grep: testsMatchingPattern(),
                    require: ['./test-globals'],
                    coverageFolder: 'target/coverage',
                    reportFormats: ['html'],
                    excludes: ['**/*.spec.js'],
                    mochaOptions: [],
                    istanbulOptions: []
                }
            }
        }
    });

    grunt.registerTask('test', 'Run tests and coverage, --grep "test descriptions matching regex" and --files available', ['mocha_istanbul:noThreshold']);

    function testsMatchingPattern() {
        if (grunt.option('grep')) {
            return [grunt.option('grep')];
        }

        return [];
    }

    function testsMatchingFiles() {
        var specFilePatterns = ['<%= yeoman.test %>'];
        if (grunt.option('files')) {
            specFilePatterns = [grunt.option('files')];
        }

        return specFilePatterns;
    }
};