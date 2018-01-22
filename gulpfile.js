let gulp = require('gulp')

let devServer = require('gulp-develop-server') // 自动启动

let notify = require('gulp-notify')

gulp.task('serve', (done) => {
  devServer.listen({
    path: './index.js'
  })
  done()
})

gulp.task('restart', (done) => {
  devServer.restart()
  done()
})

gulp.task('notify', () => gulp.src('./index.js').pipe(notify('服务器重启成功！')))

gulp.task('watch', () => {
  return gulp.watch(['./**/*', '!./gulpfile.js', '!./package..json'], gulp.series('restart', 'notify'))
})

gulp.task('default', gulp.series('serve', 'watch'))