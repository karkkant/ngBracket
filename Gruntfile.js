module.exports = function(grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		jshint: {
			files: ['src/*.js'],
			options: {
				globals: {
					console: true,
					module: true
				}
			}
		},
		concat: {
			options: {
				separator: ';'
			},
			dist: {
				src: ['src/services.js', 'src/match.js', 'src/tournament.js'],
				dest: 'src/<%= pkg.name %>.js'
			}
		},
		uglify: {
			options: {
				banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
			},
			dist: {
				files: {
					'dist/<%= pkg.name %>.min.js': ['<%= concat.dist.dest %>']
				}
			}
		},
		clean: ['src/<%= pkg.name %>.js'],
		karma: {
			unit: {
				configFile: 'karma.conf.js'
			}
		},
		jasmine: {
			src: [
				'refs/angular.js',
				'refs/angular-mocks.js',
				'src/services.js',
				'src/match.js',
				'src/tournament.js'
			],
			options: {
				specs: ['test/**/*Spec.js'],
				keepRunner: true
			}

		}
	});

	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-karma');
	grunt.loadNpmTasks('grunt-contrib-jasmine');

	grunt.registerTask('test', ['jshint', 'karma']);
	grunt.registerTask('default', ['jshint', 'karma', 'concat', 'uglify', 'clean']);
}
