import { src, dest, watch, parallel, series } from 'gulp';
import sass from 'gulp-sass';
import rename from 'gulp-rename';
import autoprefixer from 'gulp-autoprefixer';
import concat from 'gulp-concat';
import babel from 'gulp-babel';
import uglify from 'gulp-uglify-es';
import browserSync from 'browser-sync';
import del from 'del';
import imagemin from 'gulp-imagemin';

const paths = {
  html: {
    src: 'src/**/*.html',
  },
  styles: {
    src: 'src/scss/**/*.scss',
    libs: 'src/scss/',
    dev: 'src/styles/',
    dest: 'assets/styles/',
  },
  scripts: {
    src: 'src/scripts/**/*.js',
    dev: 'src/scripts/',
    dest: 'assets/scripts/',
  },
  fonts: {
    src: 'src/fonts/**/*',
    dest: 'assets/fonts/',
  },
  images: {
    src: 'src/images/*',
    dest: 'assets/images/',
  },
  baseDir: {
    src: 'src/',
    dest: 'assets/',
  },
};

export function html() {
  return src(paths.html.src).pipe(browserSync.stream());
}

export function libsSCSS() {
  return src([
    'node_modules/normalize.css/normalize.css',
    'node_modules/slick-carousel/slick/slick.scss',
    'node_modules/fullpage.js/dist/fullpage.css',
  ])
    .pipe(concat('_libs.scss'))
    .pipe(dest(paths.styles.libs))
    .pipe(browserSync.stream());
}

export function styles() {
  return src(paths.styles.src)
    .pipe(sass({ outputStyle: 'compressed' }))
    .pipe(autoprefixer({ overrideBrowserslist: ['last 10 version'], grid: true }))
    .pipe(
      rename({
        base: 'style',
        suffix: '.min',
      }),
    )
    .pipe(dest(paths.styles.dev))
    .pipe(browserSync.stream());
}

export function scripts() {
  return src(
    [
      'node_modules/jquery/dist/jquery.js',
      'node_modules/fullpage.js/vendors/scrolloverflow.min.js',
      'node_modules/fullpage.js/dist/fullpage.extensions.min.js',
      'node_modules/slick-carousel/slick/slick.min.js',
      'src/scripts/main.js',
    ],
    {
      sourcemaps: true,
    },
  )
    .pipe(babel())
    .pipe(concat('main.min.js'))
    .pipe(uglify())
    .pipe(dest(paths.scripts.dev))
    .pipe(browserSync.stream());
}

export function watchFiles() {
  watch(paths.html.src, html);
  watch(paths.styles.src, styles);
  watch([paths.scripts.src, '!src/scripts/main.min.js'], scripts);
}

export function browsersync() {
  browserSync.init({ server: { baseDir: paths.baseDir.src } });
}

export const clean = () => {
  return del([paths.baseDir.dest]);
};

export function builds() {
  return src(
    [
      paths.fonts.src,
      paths.scripts.dev + 'main.min.js',
      paths.styles.dev + 'style.min.css',
      paths.html.src,
    ],
    { base: 'src' },
  ).pipe(dest('assets'));
}

export function imageMin() {
  return src(paths.images.src)
    .pipe(
      imagemin([
        imagemin.gifsicle({ interlaced: true }),
        imagemin.mozjpeg({ quality: 75, progressive: true }),
        imagemin.optipng({ optimizationLevel: 5 }),
        imagemin.svgo({
          plugins: [{ removeViewBox: true }, { cleanupIDs: false }],
        }),
      ]),
    )
    .pipe(dest(paths.images.dest));
}

export const build = series(clean, imageMin, builds);

export const dev = parallel(libsSCSS, styles, scripts, browsersync, watchFiles);
export default dev;
