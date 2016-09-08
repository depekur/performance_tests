var gulp = require('gulp');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var streamqueue = require('streamqueue');
var cssmin = require('gulp-cssmin');
var sass = require('gulp-sass');


var path = {
    build: { //Тут мы укажем куда складывать готовые после сборки файлы
        html: 'build/',
        js: 'build/js/',
        css: 'build/css/',
        img: 'build/img/',
        fonts: 'build/fonts/'
    },
    src: { //Пути откуда брать исходники
        html: 'src/*.html', //Синтаксис src/*.html говорит gulp что мы хотим взять все файлы с расширением .html
        js: 'src/js/main.js',//В стилях и скриптах нам понадобятся только main файлы
        style: 'src/style/main.scss',
        img: 'src/img/**/*.*', //Синтаксис img/**/*.* означает - взять все файлы всех расширений из папки и из вложенных каталогов
        fonts: 'src/fonts/**/*.*'
    },
    watch: { //Тут мы укажем, за изменением каких файлов мы хотим наблюдать
        html: 'src/**/*.html',
        js: 'src/js/**/*.js',
        style: 'src/style/**/*.scss',
        img: 'src/img/**/*.*',
        fonts: 'src/fonts/**/*.*'
    },
    clean: './build'
};



gulp.task('sass', function () {
  return gulp.src('sass/main.sass')
    .pipe(sass().on('error', sass.logError))
    .pipe(concat('main.css'))
    //.pipe(cssmin())
    .pipe(gulp.dest('css/'));
});


gulp.task('watch', function () {
	gulp.watch('sass/*.sass', ['sass']);
	//gulp.watch('js/*.js', ['js']);
});

gulp.task('default', ['sass', 'watch']);