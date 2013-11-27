module.exports = (grunt) ->
  pkg = grunt.file.readJSON 'package.json'
  for t of pkg.devDependencies
    if t.substring(0, 6) is 'grunt-'
      grunt.loadNpmTasks t

  grunt.initConfig

    coffee:
      options:
        sourceMap: true
      src:
        files: [
          {
            expand: true
            ext: '.js'
            src: ['**/*.coffee']
            cwd: 'coffee'
            dest: 'js'
          }
        ]

    clean:
      js: ["js/**"]

    copy:
      fixtures:
        expand: true
        cwd: 'coffee/test'
        src: ['fixtures/**']
        dest: 'js/test/'

    simplemocha:
      options:
        globals: ['should']
        timeout: 3000
        ignoreLeaks: false
        ui: 'bdd'
        reporter: 'spec'
      all:
        src: "js/test/**/*.js"

    watch:
      coffee:
        files: "coffee/**/*.coffee",
        tasks: ['coffee']
      test:
        files: "coffee/**/*.coffee",
        tasks: ['test']

  grunt.registerTask 'build', ['clean', 'coffee']
  grunt.registerTask 'dev', ['test', 'watch']
  grunt.registerTask 'test', ['build', 'copy:fixtures', 'simplemocha']
  grunt.registerTask 'default', ['build']
