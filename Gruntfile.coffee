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
            cwd: 'src/lib'
            src: ['**/*.coffee']
            dest: 'lib'
          }
        ]
      test:
        files: [
          {
            expand: true
            ext: '.js'
            cwd: 'src/test'
            src: ['**/*.coffee']
            dest: 'test'
          }
        ]

    clean:
      lib: ["lib/**"]
      test: ["test/**"]

    copy:
      fixtures:
        expand: true
        cwd: 'src/test'
        src: ['fixtures/**']
        dest: 'test'

    simplemocha:
      options:
        globals: ['should']
        timeout: 3000
        ignoreLeaks: false
        ui: 'bdd'
        reporter: 'spec'
      all:
        src: 'test/**/*.js'

    watch:
      coffee:
        files: "src/**/*.coffee",
        tasks: ['coffee']
      test:
        files: "src/**/*.coffee",
        tasks: ['test']

  grunt.registerTask 'build', ['clean', 'coffee']
  grunt.registerTask 'dev', ['test', 'watch']
  grunt.registerTask 'test', ['build', 'copy:fixtures', 'simplemocha']
  grunt.registerTask 'default', ['build']
