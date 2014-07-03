module.exports = function(grunt){

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		jshint:{
			files: ['src/*.js'],
			options: {
				globals: {
					console: true,
					module: true
				}
			}
		},
		concat:{
			options: {
				separator: ';'
			},
			dist:{
				src: ['src/services.js', 'src/match.js', 'src/tournament.js'],
				dest: 'src/<%= pkg.name %>.js'
			}
		},
		uglify:{
			options:{
				banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
			},
			dist:{
				files: {
					'dist/<%= pkg.name %>.min.js': ['<%= concat.dist.dest %>']
				}
			}
		},
		clean:['src/<%= pkg.name %>.js']
	});

	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-clean');

	grunt.registerTask('default', ['jshint', 'concat', 'uglify', 'clean']);
}