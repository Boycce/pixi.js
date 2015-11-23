var fs          = require('fs'),
    path        = require('path'),
    streamr     = require('stream'),
    through     = require('through2'),
    gulp        = require('gulp'),
    gutil       = require('gulp-util'),
    mirror      = require('gulp-mirror'),
    uglify      = require('gulp-uglify'),
    rename      = require('gulp-rename'),
    header      = require('gulp-header'),
    source      = require('vinyl-source-stream'),
    sourcemaps  = require('gulp-sourcemaps'),
    buffer      = require('vinyl-buffer'),
    browserify  = require('browserify'),
    watchify    = require('watchify'),
    handleErrors = require('../util/handleErrors'),
    headerText  = fs.readFileSync(path.join(__dirname, '..', 'header.txt'), 'utf8'),
    licenseText = fs.readFileSync(path.join(__dirname, '..', '..', 'LICENSE'), 'utf8'),
    date        = new Date(),
    exclude     = [

        // Node modules
        './node_modules/async/lib/async.js',
        './node_modules/object-assign/index.js',

        // Polyfill
        './src/deprecation.js',
        //'./src/polyfill/requestAnimationFrame.js',
        //'./src/polyfill/Math.sign.js',
        //'./src/polyfill/Object.assign.js',
        //'./src/polyfill/index.js',
        

        // Intereaction
        //'./src/interaction/interactiveTarget.js',
        //'./src/interaction/InteractionData.js',
        //'./src/interaction/InteractionManager.js',
        //'./src/interaction/index.js',


        // Extras
        './src/extras/getGlobalPosition.js',
        './src/extras/MovieClip.js',
        './src/extras/cacheAsBitmap.js',
        './src/extras/getChildByName.js',
        './src/extras/TilingSprite.js',
        './src/extras/BitmapText.js',
        './src/extras/index.js',
        
        
        // Loaders
        './src/loaders/index.js',
        './src/loaders/textureParser.js',
        './src/loaders/bitmapFontParser.js',
        './src/loaders/loader.js',
        './src/loaders/spritesheetParser.js',
        

        // Mesh
        './src/mesh/Rope.js',
        './src/mesh/Mesh.js',
        './src/mesh/webgl/MeshShader.js',
        './src/mesh/webgl/MeshRenderer.js',
        './src/mesh/index.js',
        
        
        // Core
        //'./src/core/const.js',
        //'./src/core/display/DisplayObject.js',
        //'./src/core/display/Container.js',
        //'./src/core/text/Text.js',
        //'./src/core/sprites/Sprite.js',
        './src/core/particles/ParticleContainer.js',
        //'./src/core/index.js',
        //'./src/index.js',
        
        // Core graphics
        //'./src/core/graphics/GraphicsData.js',
        //'./src/core/graphics/Graphics.js',
        
        // Core utils
        //'./src/core/utils/index.js',
        //'./src/core/utils/pluginTarget.js',
        
        // Core textures
        //'./src/core/textures/Texture.js',
        //'./src/core/textures/BaseTexture.js',
        //'./src/core/textures/RenderTexture.js',
        //'./src/core/textures/TextureUvs.js',
        './src/core/textures/VideoBaseTexture.js',
        
        // Core math
        //'./src/core/math/shapes/RoundedRectangle.js',
        //'./src/core/math/shapes/Rectangle.js',
        //'./src/core/math/shapes/Polygon.js',
        //'./src/core/math/shapes/Circle.js',
        './src/core/math/shapes/Ellipse.js',
        //'./src/core/math/Matrix.js',
        //'./src/core/math/Point.js',
        //'./src/core/math/index.js',

        // Core ticker
        //'./src/core/ticker/Ticker.js',
        //'./src/core/ticker/index.js',
        

        // Canvas
        //'./src/core/renderers/SystemRenderer.js',
        //'./src/core/renderers/canvas/utils/CanvasMaskManager.js',
        //'./src/core/renderers/canvas/CanvasRenderer.js',
        './src/core/renderers/canvas/utils/CanvasBuffer.js',
        //'./src/core/renderers/canvas/utils/CanvasGraphics.js',
        './src/core/renderers/canvas/utils/CanvasTinter.js',

        // Webgl
        './src/core/renderers/webgl/managers/MaskManager.js',
        './src/core/renderers/webgl/managers/BlendModeManager.js',
        './src/core/renderers/webgl/utils/Quad.js',
        './src/core/renderers/webgl/managers/FilterManager.js',
        './src/core/renderers/webgl/managers/StencilManager.js',
        './src/core/renderers/webgl/shaders/TextureShader.js',
        './src/core/renderers/webgl/shaders/ComplexPrimitiveShader.js',
        './src/core/renderers/webgl/shaders/PrimitiveShader.js',
        './src/core/renderers/webgl/managers/ShaderManager.js',
        './src/core/renderers/webgl/managers/WebGLManager.js',
        './src/core/renderers/webgl/utils/StencilMaskStack.js',
        './src/core/renderers/webgl/utils/RenderTarget.js',
        './src/core/renderers/webgl/utils/ObjectRenderer.js',
        './src/core/renderers/webgl/filters/AbstractFilter.js',
        './src/core/renderers/webgl/shaders/Shader.js',
        './src/core/renderers/webgl/filters/FXAAFilter.js',
        './src/core/renderers/webgl/filters/SpriteMaskFilter.js',
        './src/core/renderers/webgl/WebGLRenderer.js',

        // Webgl mixed
        './src/core/particles/webgl/ParticleShader.js',
        './src/core/particles/webgl/ParticleRenderer.js',
        './src/core/particles/webgl/ParticleBuffer.js',
        './src/core/sprites/webgl/SpriteRenderer.js',
        './src/core/graphics/webgl/WebGLGraphicsData.js',
        './src/core/graphics/webgl/GraphicsRenderer.js',
        
        // Filters
        './src/filters/tiltshift/TiltShiftYFilter.js',
        './src/filters/bloom/BloomFilter.js',
        './src/filters/blur/BlurFilter.js',
        './src/filters/tiltshift/TiltShiftFilter.js',
        './src/filters/ascii/AsciiFilter.js',
        './src/filters/blur/BlurYFilter.js',
        './src/filters/crosshatch/CrossHatchFilter.js',
        './src/filters/dot/DotScreenFilter.js',
        './src/filters/blur/BlurXFilter.js',
        './src/filters/blur/BlurDirFilter.js',
        './src/filters/gray/GrayFilter.js',
        './src/filters/displacement/DisplacementFilter.js',
        './src/filters/invert/InvertFilter.js',
        './src/filters/pixelate/PixelateFilter.js',
        './src/filters/rgb/RGBSplitFilter.js',
        './src/filters/noise/NoiseFilter.js',
        './src/filters/sepia/SepiaFilter.js',
        './src/filters/convolution/ConvolutionFilter.js',
        './src/filters/shockwave/ShockwaveFilter.js',
        './src/filters/blur/SmartBlurFilter.js',
        './src/filters/twist/TwistFilter.js',
        './src/filters/color/ColorStepFilter.js',
        './src/filters/color/ColorMatrixFilter.js',
        './src/filters/tiltshift/TiltShiftAxisFilter.js',
        './src/filters/tiltshift/TiltShiftXFilter.js',
        './src/filters/dropshadow/BlurYTintFilter.js',
        './src/filters/dropshadow/DropShadowFilter.js',
        './src/filters/index.js',
    ];

// TODO - Concat license header to dev/prod build files.
function rebundle(devBundle) {
    if (devBundle) {
        gutil.log('Starting dev rebundle...');
    }

    var debug, min;

    debug = sourcemaps.init({loadMaps: true});
    debug.pipe(sourcemaps.write('./', {sourceRoot: './'}))
        .pipe(gulp.dest(paths.out));

    min = rename({ suffix: '.min' });
    min.pipe(sourcemaps.init({loadMaps: true}))
        .pipe(uglify())
        .pipe(sourcemaps.write('./', {sourceRoot: './', addComment: true}))
        .pipe(gulp.dest(paths.out));

    // Record all dependencies
    var dependencies = '';
    this.pipeline.get('deps').push(through.obj(function(row, enc, next) {
        dependencies += (row.file || row.id) + '\n';
        this.push(row);
        next();
    }));

    var saveList = function() { 
        // Need to wait for bundle completion & 'bin' folder creation
        var read = new streamr.Readable();
        read.push(dependencies);
        read.push(null);
        read.pipe(fs.createWriteStream(paths.out + '/_dependencies.txt')); 
    };

    var stream = this.bundle()
        .on('error', handleErrors.handler)
        .pipe(handleErrors())
        .pipe(source('pixi.js'))
        .pipe(buffer())
        .pipe(header(
            headerText,
            {
                licenseText: licenseText,
                date: new Date().toISOString(),
                pkg: require('../../package.json')
            }
        ));

    // Save the list out.
    stream.on('finish', saveList);

    if (devBundle) {
        return stream.pipe(debug).once('end', function () {
            gutil.log('Dev rebundle complete.');
        });
    }
    else {
        return stream.pipe(mirror(debug, min));
    }
}

function createBundler(args) {
    args = args || {};
    args.debug = true;
    args.standalone = 'PIXI';

    var bundle = browserify(paths.jsEntry, args),
        argv = require('minimist')(process.argv.slice(2)),
        ignore = (argv.exclude || []).concat(argv.e || []);

    if (!Array.isArray(ignore)) {
        ignore = [ignore];
    }

    for (var i = 0; i < ignore.length; ++i) {
        bundle.ignore(require.resolve('../../src/' + ignore[i]));
    }

    for (i = 0; i < exclude.length; ++i) {
        bundle.ignore(exclude[i]);
    }

    return bundle;
}

function watch(onUpdate) {
    var bundler = watchify(createBundler(watchify.args));

    bundler.on('update', function () {
        var bundle = rebundle.call(this, true);

        if (onUpdate) {
            bundle.on('end', onUpdate);
        }
    });

    return rebundle.call(bundler);
}

module.exports = function bundle() {
    return rebundle.call(createBundler());
};

module.exports.watch = watch;
module.exports.rebundle = rebundle;
module.exports.createBundler = createBundler;
