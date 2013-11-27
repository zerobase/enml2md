module.exports = (grunt) ->
  pkg = grunt.file.readJSON 'package.json'
  for t of pkg.devDependencies
    if t.substring(0, 6) is 'grunt-'
      grunt.loadNpmTasks t

  grunt.initConfig

    coffee:
      options:
        sourceMap: true
      lib:
        files: [
          {
            expand: true
            ext: '.js'
            src: ['**/*.coffee']
            cwd: 'lib'
            dest: 'js/lib'
          }
        ],
      test:
        files: [
          {
            expand: true
            ext: '.js'
            src: ['**/*.coffee']
            cwd: 'test'
            dest: 'js/test'
          }
        ],

    clean:
      js: ["js/**"]

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
        files: "lib/**/*.coffee",
        tasks: ['coffee']
      test:
        files: ['lib/**/*.coffee', 'test/**/*.coffee'],
        tasks: ['simplemocha']

  grunt.registerTask 'build', ['clean', 'coffee']
  grunt.registerTask 'dev', ['test', 'watch']
  grunt.registerTask 'test', ['build', 'simplemocha']
  grunt.registerTask 'default', ['build']
