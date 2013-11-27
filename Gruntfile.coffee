coffeeDirectory = 'coffee'
coffeeOutputDirectory = 'lib'
testDirectory = 'test'

module.exports = (grunt) ->
  pkg = grunt.file.readJSON 'package.json'
  for t of pkg.devDependencies
    if t.substring(0, 6) is 'grunt-'
      grunt.loadNpmTasks t

  grunt.initConfig

    coffee:
      compile:
        options:
          sourceMap: true
        files: [
          {
            expand: true
            ext: '.js'
            cwd: coffeeDirectory
            src: ['**/*.coffee']
            dest: coffeeOutputDirectory
          }
        ],

    clean:
      lib: coffeeOutputDirectory

    simplemocha:
      options:
        globals: ['should']
        timeout: 3000
        ignoreLeaks: false
        ui: 'bdd'
        reporter: 'spec'
        compilers: 'coffee:coffee-script'
      all:
        src: "#{testDirectory}/**/*.coffee"

    watch:
      coffee:
        files: "#{coffeeDirectory}/**/*.coffee",
        tasks: ['coffee']
      test:
        files: ['**/*.coffee'],
        tasks: ['simplemocha']

  grunt.registerTask 'build', ['clean', 'coffee']
  grunt.registerTask 'dev', ['test', 'watch']
  grunt.registerTask 'test', ['simplemocha']
  grunt.registerTask 'default', ['build']
