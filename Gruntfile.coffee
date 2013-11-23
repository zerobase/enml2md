module.exports = (grunt) ->
  pkg = grunt.file.readJSON 'package.json'
  for t of pkg.devDependencies
    if t.substring(0, 6) is 'grunt-'
      grunt.loadNpmTasks t

  grunt.initConfig

    coffee:
      compile:
        files: [
          {
            expand: true
            ext: '.js'
            cwd: 'coffee'
            src: ['**/*.coffee']
            dest: 'lib'
          }
        ]

    clean:
      lib: 'lib'

    simplemocha:
      options:
        globals: ['should']
        timeout: 3000
        ignoreLeaks: false
        ui: 'bdd'
        reporter: 'spec'
        compilers: 'coffee:coffee-script'
      all:
        src: 'test/**/*.coffee'

    watch:
      coffee:
        files: 'coffee/**/*.coffee',
        tasks: ['coffee']
      test:
        files: ['test/**/*.coffee'],
        tasks: ['simplemocha']

  grunt.registerTask 'build', ['clean', 'coffee']
  grunt.registerTask 'dev', ['build', 'watch']
  grunt.registerTask 'test', ['build', 'simplemocha']
  grunt.registerTask 'default', ['build']
