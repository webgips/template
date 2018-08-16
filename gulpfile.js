'use strict';

const gulp   = require('gulp'),
        gp  = require('gulp-load-plugins')({
              rename: {
                  'gulp-rev-replace' : 'revReplace',
                  'gulp-pug-inheritance': 'pugInheritance'
              }
            }),
        del = require('del'),
        imageminJpegRecompress = require('imagemin-jpeg-recompress'),
        imageminPngquant = require('imagemin-pngquant'),
        browserSync = require('browser-sync').create();

gulp.task('browserSync', function() {
    browserSync.init({
        server: {
            baseDir: "./build"
        }
    });
});

gulp.task('pug', function() {
	return gulp.src('src/pug/pages/*.pug')
		.pipe(gp.plumber())
		.pipe(gp.pug({
			pretty: true,
			basedir: "src/"
		}))
		.pipe(gulp.dest('build'))
		.on('end', browserSync.reload);
});

gulp.task('js', function(){
   return gulp.src(['src/js/**/*.js', 'src/blocks/**/*.js'])
       .pipe(gulp.dest('build/js'))
       .pipe(browserSync.reload({
           stream: true
       }));
});

gulp.task('sass', function(){
    return gulp.src('src/scss/style.scss')
        .pipe(gp.plumber())
        .pipe(gp.sass())
        .pipe(gp.autoprefixer({
            browsers: ['last 10 versions']
        }))
    .pipe(gulp.dest('build/css'))
        .pipe(browserSync.reload({
            stream: true
        }));
});
gulp.task('sprite:svg', function() {
return gulp.src('./src/sprite/*.svg')
  .pipe(gp.svgmin({
    js2svg: {
      pretty: true
    }
  }))
  .pipe(gp.cheerio({
    run: function ($) {
      $('[fill]').removeAttr('fill');
      $('[stroke]').removeAttr('stroke');
      $('[style]').removeAttr('style');
    },
    parserOptions: { xmlMode: true }
  }))
  .pipe(gp.replace('&gt;', '>'))
  .pipe(gp.svgSprite({
    mode: {
      symbol: {
        sprite: "../sprite.svg"
      }
    }
  }))
  .pipe(gulp.dest('build/img'))
})
gulp.task('copy:image', function(){
    return gulp.src(['src/img/**/*', 'src/blocks/**/*.+(png|jpg|gif|jpeg|svg)'])
        .pipe(gp.newer('build/img/'))
        .pipe(gp.rename({dirname: ''}))
        .pipe(gulp.dest('build/img/'))
        .pipe(gp.imagemin([
            gp.imagemin.gifsicle({interlaced: true}),
            imageminJpegRecompress({
                progressive: true,
                max: 80,
                min: 70
            }),
            imageminPngquant({quality: '80'}),
        ]))
        .pipe(gulp.dest('build/img/'));
});

gulp.task('copy:fonts', function(){
    return gulp.src('src/fonts/**/*', {base: './src'})
        .pipe(gp.newer('build/fonts/'))
        .pipe(gulp.dest('build/'))
});

// gulp.task('watch', ['browserSync', 'pug', 'sass', 'js', 'copy:image', 'copy:fonts', 'sprite:svg'], function(){
//     gulp.watch('src/**/*.pug', ['pug']);
//     gulp.watch('src/**/*.scss', ['sass']);
//     gulp.watch(['src/img/**/*', 'src/blocks/project/**/*.+(png|jpg|gif|jpeg|svg)'], ['copy:image']);
//     gulp.watch(['src/js/**/*.js', 'src/blocks/**/*.js'], ['js']);
// });
// Слежение за изменениями
gulp.task('watch', function() {
    gulp.watch('src/**/*.pug', gulp.series('pug'));
    gulp.watch('src/**/*.scss', gulp.series('sass'));
    gulp.watch(['src/js/**/*.js', 'src/blocks/**/*.js'], gulp.series('js'));
    gulp.watch(['src/img/**/*', 'src/blocks/project/**/*.+(png|jpg|gif|jpeg|svg)'], gulp.series('copy:image'));
    gulp.watch('src/sprite/**/*.svg',  gulp.series('sprite:svg'));
});
// Запуск сборки
gulp.task('default', gulp.series(
    gulp.parallel('copy:fonts', 'pug', 'sass', 'js', 'copy:image', 'sprite:svg'),
    gulp.parallel('watch', 'browserSync')
));
