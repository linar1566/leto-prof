let project_folder = "dist";
let source_folder = "#src";


let path = {
    build: {
        //dist
        html: project_folder + "/",
        css: project_folder + "/css/",
        js: project_folder + "/js/",
        img: project_folder + "/img/",
        fonts: project_folder + "/fonts/",
    },
    src: {
        //Исходники
        html: [source_folder + "/*.html", "!" + source_folder + "/_*.html"],
        css: source_folder + "/scss/style.scss",
        js: source_folder + "/js/script.js",
        img: source_folder + "/img/**/*.{jpg,svg,png,gif,ico,webp}",
        fonts: source_folder + "/fonts/*.ttf",
    },
    //Чекает
    watch: {
        html: source_folder + "/**/*.html",
        css: source_folder + "/scss/**/*.scss",
        js: source_folder + "/js/**/*.js",
        img: source_folder + "/img/**/*.{jpg,svg,png,gif,ico,webp}",
    },
    //Удаление
    clean: "./" + project_folder + "/"
}
///////////////////////////////////ПЛАГИНЫ/////////////////////////////////////////
let { src, dest } = require('gulp'),//Плагины которые установлены!!!//Не забывай ставить запятую и точку-запятую
    gulp = require('gulp'),
    browsersync = require("browser-sync").create(),
    fileinclude = require("gulp-file-include"),//Настройка и подключение file-include а он добавляется для сборки отдельных файлов - header,footer
    del = require("del"),//Настройка и подключение del
    scss = require("gulp-sass"),//Стили
    autoprefixer = require("gulp-autoprefixer"),//Аутопрефиксер
    group_media = require("gulp-group-css-media-queries"),//Сбор медиа запросов и группирует их в конце файла
    clean_css = require("gulp-clean-css"),//Сжимает css файл. Для скорости
    rename = require("gulp-rename"),//В целях удобства создем 2 css файла(Ниже)
    imagemin = require("gulp-imagemin");//Сжатие без потери качества
    ttf2woff = require("gulp-ttf2woff"),
    ttf2woff2 = require("gulp-ttf2woff2");



function browserSync(params) {
    browsersync.init({
        server: {
            baseDir: "./" + project_folder + "/"
        },
        port: 3000,
        notify: false    //Убираю уведомл
    })
}
/////////////HTML/////////////////////
function html() {
    return src(path.src.html)//Обращение к исходникам
        .pipe(fileinclude())//Просим галп собирать наши файлы(хедеры и футеры)
        .pipe(dest(path.build.html))//Выгрузка в результат
        .pipe(browsersync.stream())//обновляет страницу(Сама строка перезагружает страницу/Браузер)
}//Скопировал html из src в dist(Создав так же эту папку)

///////////////////////!!CSS!!/////////////////////
function css(params) {
    return src(path.src.css)//Обращение к исходникам(Почему 3 элемент css? Смотри 16 строку)
        .pipe(//Вклиниваю обработку (Строка 37)
            scss({//Ввод настроек для scss
                outputStyle: 'expanded' //Файл будет никак не сжатым и чтение будет лучше
            })
        )
        .pipe(
            autoprefixer({
                overrideBrowserList: ["last 5 version"],//Поддержка последних 5 версий браузеров
                cascade: true //Стиль написания каскад
            })
        )
        .pipe(
            group_media()//Медиа запросы
        )
        .pipe(dest(path.build.css))//Выгрузка в результат!!!
        .pipe(clean_css())//Сжимаем файл
        .pipe(
            rename({
                extname: ".min.css" //К названию файла добавляем min
            })
        )
        .pipe(dest(path.build.css))//Выгрузка в результат!!!
        .pipe(browsersync.stream())//обновляет страницу(Сама строка перезагружает страницу/Браузер)
}


function fonts(params){
    src(path.src.fonts)
        .pipe(ttf2woff())
        .pipe(dest(path.build.fonts))
    return src(path.src.fonts)
        .pipe(ttf2woff2())
        .pipe(dest(path.build.fonts))
};

//////////////////////////IMAGES///////////////////////////////
function images() {
    return src(path.src.img)//Обращение к исходникам
        .pipe(
            imagemin({
                progressive: true,
                svgoPlugins: [{ removeViewBox: false }],
                interlaced: true,
                optimizationLevel: 3//0 to 7
            })
        )
        .pipe(dest(path.build.img))//Выгрузка в результат
        .pipe(browsersync.stream())//обновляет страницу(Сама строка перезагружает страницу/Браузер)
}//Скопировал img из src в dist(Создав так же эту папку)

function js() {
    return src(path.src.js)//Обращение к исходникам
        .pipe(fileinclude())//Просим галп собирать наши файлы(хедеры и футеры)
        .pipe(dest(path.build.js))//Выгрузка в результат
        .pipe(browsersync.stream())//обновляет страницу(Сама строка перезагружает страницу/Браузер)
}

//Объявляем слежку за сайтом, чтобы не обновлять его самостоятельно
function wathcFiles(params) {
    gulp.watch([path.watch.html], html);//Задаем путь. ,html будет обрабатывать эту функцию
    gulp.watch([path.watch.css], css);
    gulp.watch([path.watch.img], images);
    gulp.watch([path.watch.js], js);
}

//Чистильщик
function clean(params) {//Удаляет ненужные файлы из дист
    return del(path.clean)
}

//Процесс выполнения
let build = gulp.series(clean, gulp.parallel(css, html, images, js,fonts));//Функцию надо подружить с галпом//Css и html буду выполняться одновременно
let watch = gulp.parallel(build, wathcFiles, browserSync);//Наш сценарий выполнения

//Переменные
exports.fonts = fonts;
exports.js = js;
exports.images = images;
exports.css = css;
exports.html = html;
exports.build = build;
exports.watch = watch;
exports.default = watch;