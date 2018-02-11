const gulp = require('gulp');
const sass = require('gulp-sass');
const pug = require('gulp-pug');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const tsify = require("tsify");

gulp.task('typescript', function() {
	return browserify({
		basedir: '.',
		debug: true,
		entries: ['src/ts/main.ts']
	})
	.plugin(tsify)
	.bundle()
	.pipe(source('bundle.js'))
	.pipe(gulp.dest('dist'));
});

gulp.task('sass', function() {
	gulp.src('src/sass/**/*.scss')
		.pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
		.pipe(gulp.dest('dist/'))
});

gulp.task('pug', function() {
	gulp.src(['src/pug/**/*.pug', '!src/pug/**/_*.pug'])
		.pipe(pug())
		.pipe(gulp.dest('dist/'));
});

gulp.task('default', ['pug', 'sass', 'typescript']);