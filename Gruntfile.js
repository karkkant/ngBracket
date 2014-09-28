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
				src: ['src/services.js', 'src/bracket.js', 'src/tournamentGenerator.js'],
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
		clean: ['src/<%= pkg.name %>.js', 'styles/*.css.map'],
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
				'src/bracket.js',
				'src/tournamentGenerator.js'
			],
			options: {
				specs: ['test/**/*Spec.js'],
				keepRunner: true
			}
		},
		sass: {
			dist: {
				files: {
					'styles/bracket.css': 'styles/bracket.scss'
				}
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-karma');
	grunt.loadNpmTasks('grunt-contrib-jasmine');
	grunt.loadNpmTasks('grunt-contrib-sass');

	grunt.registerTask('test', ['jshint', 'karma']);
	grunt.registerTask('default', ['jshint', 'karma', 'sass', 'concat', 'uglify', 'clean']);
}
