module.exports = function(grunt) {
  
  // 项目设置
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    concat: {
      options: {
        separator: ';',
      },
      dist: {
        src: [
          'lib/env.js',
          'lib/utils.js',
          'lib/deps/ajax.js',
          'lib/deps/events.js',
          'lib/deps/file.js',
          'lib/deps/shim.js',
          'lib/asset.js',
          'lib/image.js',
          'lib/bucket.js',
          'lib/fop.js',
          'lib/qiniu.js'
        ],
        dest: 'qiniu.js',
      },
    },

    uglify: {
      qiniu_js_sdk: {
        files: {
          'qiniu.min.js': [
            'qiniu.js'
          ],
          'test/qiniu.min.js': [
            'qiniu.js'
          ]
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('default', [ 'concat', 'uglify' ]);
};