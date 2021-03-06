/**
 * grunt-inline-images
 * https://github.com/EE/grunt-inline-images
 *
 * Author Michał Gołębiowski <michal.golebiowski@laboratorium.ee>
 * Licensed under the MIT license.
 */

'use strict';

// Disable options that don't work in Node.js 0.12.
// Gruntfile.js & tasks/*.js are the only non-transpiled files.
/* eslint-disable no-var, object-shorthand, prefer-arrow-callback, prefer-const,
 prefer-spread, prefer-reflect, prefer-template */

var assert = require('assert');

var newNode;
try {
    assert.strictEqual(eval('(r => [...r])([2])[0]'), 2); // eslint-disable-line no-eval
    newNode = true;
} catch (e) {
    newNode = false;
}

module.exports = function (grunt) {
    // Project configuration.
    grunt.initConfig({
        clean: {
            test: {
                src: [
                    'dist',
                    'test/tmp/*',
                ],
            },
        },

        copy: {
            nonGenerated: {
                files: [
                    {
                        expand: true,
                        dot: true,
                        src: [
                            'test/**/*',
                            '!test/**/*.js',
                        ],
                        dest: 'dist',
                    },
                ],
            },
            generated: {
                files: [
                    {
                        expand: true,
                        dot: true,
                        src: [
                            'test/tmp/**/*',
                        ],
                        dest: 'dist',
                    },
                ],
            },
        },

        babel: {
            options: {
                sourceMap: 'inline',
                sourceRoot: __dirname,
                retainLines: true,

                whitelist: [
                    // If a comment doesn't indicate otherwise, all commented out transformers
                    // would transpile features not available in latest stable Node.js yet
                    // so we can't use them as we don't transpile in latest Node.

                    'es6.arrowFunctions',
                    'es6.blockScoping',
                    'es6.classes',
                    'es6.constants',
//                    'es6.destructuring',
                    'es6.forOf',
//                    'es6.modules',
//                    'es6.parameters',
                    'es6.properties.computed',
                    'es6.properties.shorthand',
//                    'es6.spread',
//                    'es6.tailCall',
                    'es6.templateLiterals',
//                    'es6.regex.unicode',
//                    'es6.regex.sticky',
                    'strict',
                ],

                loose: [
                    // Speed up for-of on arrays by not using the iterator directly.
                    'es6.forOf',
                ],
            },
            all: {
                files: [
                    {
                        expand: true,
                        src: [
                            'src/**/*.js',
                            'test/**/*.js',
                        ],
                        dest: 'dist',
                    },
                ],
            },
        },

        eslint: {
            all: {
                src: [
                    'Gruntfile.js',
                    'src/**/*.js',
                    'test/**/*.js',
                ],
            },
        },

        // Configuration to be run (and then tested).
        inlineImages: {
            all: {
                options: {
                    // Beginnings of URLs to images to be inlined in a base64 representation.
                    toInline: [
                        'example.com/',
                        'raw\\.githubusercontent\\.com/',
                    ],
                    // Beginnings of URLs to be changed to "about:blank".
                    toDiscard: [
                        '(player\\.|)vimeo\\.com/',
                        'youtube\\.com/',
                        'facebook\\.com/',
                    ],
                },
                files: {
                    'test/tmp/actual1.json': ['test/fixtures/input1.json'],
                    'test/tmp/actual2.json': ['test/fixtures/input2.json'],
                },
            },
        },

        // Unit tests.
        mochaTest: {
            all: {
                options: {
                    reporter: 'spec',
                },
                src: [newNode ? 'test/*.js' : 'dist/test/*.js'],
            },
        },

    });

    // Load all grunt tasks matching the `grunt-*` pattern.
    require('load-grunt-tasks')(grunt);

    grunt.registerTask('lint', [
        'eslint',
    ]);

    // In modern Node.js we just use the non-transpiled source as it makes it easier to debug;
    // in older version we transpile (but keep the lines).
    grunt.registerTask('build', [
        'copy:nonGenerated',
        'babel',
    ]);

    grunt.registerTask('inlineImagesWrapped', function () {
        // Actually load this plugin's task...
        grunt.loadTasks('tasks');
        // ...and run it! It might not have existed before so we needed to delay it.
        grunt.task.run([
            'inlineImages',
            'copy:generated',
        ]);
    });


    // By default, lint and run all tests.
    grunt.registerTask('default', [
        'clean',
        'lint',
        'build',
        'inlineImagesWrapped',
        'mochaTest',
    ]);
};
