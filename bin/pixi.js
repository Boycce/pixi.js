/**
 * @license
 * pixi.js - v3.0.8
 * Compiled 2015-11-23T06:37:06.584Z
 *
 * pixi.js is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license.php
 *
 *
 * The MIT License
 * 
 * Copyright (c) 2013-2015 Mathew Groves
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * 
 * 
 */
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.PIXI = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

},{}],2:[function(require,module,exports){
'use strict';

//
// We store our EE objects in a plain object whose properties are event names.
// If `Object.create(null)` is not supported we prefix the event names with a
// `~` to make sure that the built-in object properties are not overridden or
// used as an attack vector.
// We also assume that `Object.create(null)` is available when the event name
// is an ES6 Symbol.
//
var prefix = typeof Object.create !== 'function' ? '~' : false;

/**
 * Representation of a single EventEmitter function.
 *
 * @param {Function} fn Event handler to be called.
 * @param {Mixed} context Context for function execution.
 * @param {Boolean} once Only emit once
 * @api private
 */
function EE(fn, context, once) {
  this.fn = fn;
  this.context = context;
  this.once = once || false;
}

/**
 * Minimal EventEmitter interface that is molded against the Node.js
 * EventEmitter interface.
 *
 * @constructor
 * @api public
 */
function EventEmitter() { /* Nothing to set */ }

/**
 * Holds the assigned EventEmitters by name.
 *
 * @type {Object}
 * @private
 */
EventEmitter.prototype._events = undefined;

/**
 * Return a list of assigned event listeners.
 *
 * @param {String} event The events that should be listed.
 * @param {Boolean} exists We only need to know if there are listeners.
 * @returns {Array|Boolean}
 * @api public
 */
EventEmitter.prototype.listeners = function listeners(event, exists) {
  var evt = prefix ? prefix + event : event
    , available = this._events && this._events[evt];

  if (exists) return !!available;
  if (!available) return [];
  if (available.fn) return [available.fn];

  for (var i = 0, l = available.length, ee = new Array(l); i < l; i++) {
    ee[i] = available[i].fn;
  }

  return ee;
};

/**
 * Emit an event to all registered event listeners.
 *
 * @param {String} event The name of the event.
 * @returns {Boolean} Indication if we've emitted an event.
 * @api public
 */
EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
  var evt = prefix ? prefix + event : event;

  if (!this._events || !this._events[evt]) return false;

  var listeners = this._events[evt]
    , len = arguments.length
    , args
    , i;

  if ('function' === typeof listeners.fn) {
    if (listeners.once) this.removeListener(event, listeners.fn, undefined, true);

    switch (len) {
      case 1: return listeners.fn.call(listeners.context), true;
      case 2: return listeners.fn.call(listeners.context, a1), true;
      case 3: return listeners.fn.call(listeners.context, a1, a2), true;
      case 4: return listeners.fn.call(listeners.context, a1, a2, a3), true;
      case 5: return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
      case 6: return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
    }

    for (i = 1, args = new Array(len -1); i < len; i++) {
      args[i - 1] = arguments[i];
    }

    listeners.fn.apply(listeners.context, args);
  } else {
    var length = listeners.length
      , j;

    for (i = 0; i < length; i++) {
      if (listeners[i].once) this.removeListener(event, listeners[i].fn, undefined, true);

      switch (len) {
        case 1: listeners[i].fn.call(listeners[i].context); break;
        case 2: listeners[i].fn.call(listeners[i].context, a1); break;
        case 3: listeners[i].fn.call(listeners[i].context, a1, a2); break;
        default:
          if (!args) for (j = 1, args = new Array(len -1); j < len; j++) {
            args[j - 1] = arguments[j];
          }

          listeners[i].fn.apply(listeners[i].context, args);
      }
    }
  }

  return true;
};

/**
 * Register a new EventListener for the given event.
 *
 * @param {String} event Name of the event.
 * @param {Functon} fn Callback function.
 * @param {Mixed} context The context of the function.
 * @api public
 */
EventEmitter.prototype.on = function on(event, fn, context) {
  var listener = new EE(fn, context || this)
    , evt = prefix ? prefix + event : event;

  if (!this._events) this._events = prefix ? {} : Object.create(null);
  if (!this._events[evt]) this._events[evt] = listener;
  else {
    if (!this._events[evt].fn) this._events[evt].push(listener);
    else this._events[evt] = [
      this._events[evt], listener
    ];
  }

  return this;
};

/**
 * Add an EventListener that's only called once.
 *
 * @param {String} event Name of the event.
 * @param {Function} fn Callback function.
 * @param {Mixed} context The context of the function.
 * @api public
 */
EventEmitter.prototype.once = function once(event, fn, context) {
  var listener = new EE(fn, context || this, true)
    , evt = prefix ? prefix + event : event;

  if (!this._events) this._events = prefix ? {} : Object.create(null);
  if (!this._events[evt]) this._events[evt] = listener;
  else {
    if (!this._events[evt].fn) this._events[evt].push(listener);
    else this._events[evt] = [
      this._events[evt], listener
    ];
  }

  return this;
};

/**
 * Remove event listeners.
 *
 * @param {String} event The event we want to remove.
 * @param {Function} fn The listener that we need to find.
 * @param {Mixed} context Only remove listeners matching this context.
 * @param {Boolean} once Only remove once listeners.
 * @api public
 */
EventEmitter.prototype.removeListener = function removeListener(event, fn, context, once) {
  var evt = prefix ? prefix + event : event;

  if (!this._events || !this._events[evt]) return this;

  var listeners = this._events[evt]
    , events = [];

  if (fn) {
    if (listeners.fn) {
      if (
           listeners.fn !== fn
        || (once && !listeners.once)
        || (context && listeners.context !== context)
      ) {
        events.push(listeners);
      }
    } else {
      for (var i = 0, length = listeners.length; i < length; i++) {
        if (
             listeners[i].fn !== fn
          || (once && !listeners[i].once)
          || (context && listeners[i].context !== context)
        ) {
          events.push(listeners[i]);
        }
      }
    }
  }

  //
  // Reset the array, or remove it completely if we have no more listeners.
  //
  if (events.length) {
    this._events[evt] = events.length === 1 ? events[0] : events;
  } else {
    delete this._events[evt];
  }

  return this;
};

/**
 * Remove all listeners or only the listeners for the specified event.
 *
 * @param {String} event The event want to remove all listeners for.
 * @api public
 */
EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
  if (!this._events) return this;

  if (event) delete this._events[prefix ? prefix + event : event];
  else this._events = prefix ? {} : Object.create(null);

  return this;
};

//
// Alias methods names because people roll like that.
//
EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
EventEmitter.prototype.addListener = EventEmitter.prototype.on;

//
// This function doesn't apply anymore.
//
EventEmitter.prototype.setMaxListeners = function setMaxListeners() {
  return this;
};

//
// Expose the prefix.
//
EventEmitter.prefixed = prefix;

//
// Expose the module.
//
if ('undefined' !== typeof module) {
  module.exports = EventEmitter;
}

},{}],3:[function(require,module,exports){
module.exports={
  "name": "pixi.js",
  "version": "3.0.8",
  "description": "Pixi.js is a fast lightweight 2D library that works across all devices.",
  "author": "Mat Groves",
  "contributors": [
    "Chad Engler <chad@pantherdev.com>",
    "Richard Davey <rdavey@gmail.com>"
  ],
  "main": "./src/index.js",
  "homepage": "http://goodboydigital.com/",
  "bugs": "https://github.com/pixijs/pixi.js/issues",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/pixijs/pixi.js.git"
  },
  "scripts": {
    "start": "gulp && gulp watch",
    "test": "gulp && testem ci",
    "build": "gulp",
    "docs": "jsdoc -c ./gulp/util/jsdoc.conf.json -R README.md"
  },
  "files": [
    "bin/",
    "src/",
    "CONTRIBUTING.md",
    "LICENSE",
    "package.json",
    "README.md"
  ],
  "dependencies": {
    "async": "^1.4.2",
    "brfs": "^1.4.1",
    "earcut": "^2.0.2",
    "eventemitter3": "^1.1.1",
    "gulp-header": "^1.7.1",
    "object-assign": "^4.0.1",
    "resource-loader": "^1.6.2"
  },
  "devDependencies": {
    "browserify": "^11.1.0",
    "chai": "^3.2.0",
    "del": "^2.0.2",
    "gulp": "^3.9.0",
    "gulp-cached": "^1.1.0",
    "gulp-concat": "^2.6.0",
    "gulp-debug": "^2.1.0",
    "gulp-jshint": "^1.11.2",
    "gulp-mirror": "^0.4.0",
    "gulp-plumber": "^1.0.1",
    "gulp-rename": "^1.2.2",
    "gulp-sourcemaps": "^1.5.2",
    "gulp-uglify": "^1.4.1",
    "gulp-util": "^3.0.6",
    "jaguarjs-jsdoc": "git+https://github.com/davidshimjs/jaguarjs-jsdoc.git",
    "jsdoc": "^3.3.2",
    "jshint-summary": "^0.4.0",
    "minimist": "^1.2.0",
    "mocha": "^2.3.2",
    "require-dir": "^0.3.0",
    "run-sequence": "^1.1.2",
    "testem": "^0.9.4",
    "vinyl-buffer": "^1.0.0",
    "vinyl-source-stream": "^1.1.0",
    "watchify": "^3.4.0"
  },
  "browserify": {
    "transform": [
      "brfs"
    ]
  }
}

},{}],4:[function(require,module,exports){
/**
 * Constant values used in pixi
 *
 * @lends PIXI
 */
var CONST = {
    /**
     * String of the current PIXI version
     *
     * @static
     * @constant
     * @property {string} VERSION
     */
    VERSION: require('../../package.json').version,

    /**
     * @property {number} PI_2 - Two Pi
     * @constant
     * @static
     */
    PI_2: Math.PI * 2,

    /**
     * @property {number} RAD_TO_DEG - Constant conversion factor for converting radians to degrees
     * @constant
     * @static
     */
    RAD_TO_DEG: 180 / Math.PI,

    /**
     * @property {Number} DEG_TO_RAD - Constant conversion factor for converting degrees to radians
     * @constant
     * @static
     */
    DEG_TO_RAD: Math.PI / 180,

    /**
     * Target frames per millisecond.
     *
     * @static
     * @constant
     * @property {number} TARGET_FPMS=0.06
     */
    TARGET_FPMS: 0.06,

    /**
     * Constant to identify the Renderer Type.
     *
     * @static
     * @constant
     * @property {object} RENDERER_TYPE
     * @property {number} RENDERER_TYPE.UNKNOWN
     * @property {number} RENDERER_TYPE.WEBGL
     * @property {number} RENDERER_TYPE.CANVAS
     */
    RENDERER_TYPE: {
        UNKNOWN:    0,
        WEBGL:      1,
        CANVAS:     2
    },

    /**
     * Various blend modes supported by PIXI. IMPORTANT - The WebGL renderer only supports
     * the NORMAL, ADD, MULTIPLY and SCREEN blend modes. Anything else will silently act like
     * NORMAL.
     *
     * @static
     * @constant
     * @property {object} BLEND_MODES
     * @property {number} BLEND_MODES.NORMAL
     * @property {number} BLEND_MODES.ADD
     * @property {number} BLEND_MODES.MULTIPLY
     * @property {number} BLEND_MODES.SCREEN
     * @property {number} BLEND_MODES.OVERLAY
     * @property {number} BLEND_MODES.DARKEN
     * @property {number} BLEND_MODES.LIGHTEN
     * @property {number} BLEND_MODES.COLOR_DODGE
     * @property {number} BLEND_MODES.COLOR_BURN
     * @property {number} BLEND_MODES.HARD_LIGHT
     * @property {number} BLEND_MODES.SOFT_LIGHT
     * @property {number} BLEND_MODES.DIFFERENCE
     * @property {number} BLEND_MODES.EXCLUSION
     * @property {number} BLEND_MODES.HUE
     * @property {number} BLEND_MODES.SATURATION
     * @property {number} BLEND_MODES.COLOR
     * @property {number} BLEND_MODES.LUMINOSITY
     */
    BLEND_MODES: {
        NORMAL:         0,
        ADD:            1,
        MULTIPLY:       2,
        SCREEN:         3,
        OVERLAY:        4,
        DARKEN:         5,
        LIGHTEN:        6,
        COLOR_DODGE:    7,
        COLOR_BURN:     8,
        HARD_LIGHT:     9,
        SOFT_LIGHT:     10,
        DIFFERENCE:     11,
        EXCLUSION:      12,
        HUE:            13,
        SATURATION:     14,
        COLOR:          15,
        LUMINOSITY:     16
    },

    /**
     * Various webgl draw modes. These can be used to specify which GL drawMode to use
     * under certain situations and renderers.
     *
     * @static
     * @constant
     * @property {object} DRAW_MODES
     * @property {number} DRAW_MODES.POINTS
     * @property {number} DRAW_MODES.LINES
     * @property {number} DRAW_MODES.LINE_LOOP
     * @property {number} DRAW_MODES.LINE_STRIP
     * @property {number} DRAW_MODES.TRIANGLES
     * @property {number} DRAW_MODES.TRIANGLE_STRIP
     * @property {number} DRAW_MODES.TRIANGLE_FAN
     */
    DRAW_MODES: {
        POINTS:         0,
        LINES:          1,
        LINE_LOOP:      2,
        LINE_STRIP:     3,
        TRIANGLES:      4,
        TRIANGLE_STRIP: 5,
        TRIANGLE_FAN:   6
    },

    /**
     * The scale modes that are supported by pixi.
     *
     * The DEFAULT scale mode affects the default scaling mode of future operations.
     * It can be re-assigned to either LINEAR or NEAREST, depending upon suitability.
     *
     * @static
     * @constant
     * @property {object} SCALE_MODES
     * @property {number} SCALE_MODES.DEFAULT=LINEAR
     * @property {number} SCALE_MODES.LINEAR Smooth scaling
     * @property {number} SCALE_MODES.NEAREST Pixelating scaling
     */
    SCALE_MODES: {
        DEFAULT:    0,
        LINEAR:     0,
        NEAREST:    1
    },

    /**
     * The prefix that denotes a URL is for a retina asset
     *
     * @static
     * @constant
     * @property {string} RETINA_PREFIX
     */
    //example: '@2x',
    RETINA_PREFIX: /@(.+)x/,

    RESOLUTION:1,

    FILTER_RESOLUTION:1,

    /**
     * The default render options if none are supplied to {@link PIXI.WebGLRenderer}
     * or {@link PIXI.CanvasRenderer}.
     *
     * @static
     * @constant
     * @property {object} DEFAULT_RENDER_OPTIONS
     * @property {HTMLCanvasElement} DEFAULT_RENDER_OPTIONS.view=null
     * @property {boolean} DEFAULT_RENDER_OPTIONS.transparent=false
     * @property {boolean} DEFAULT_RENDER_OPTIONS.antialias=false
     * @property {boolean} DEFAULT_RENDER_OPTIONS.forceFXAA=false
     * @property {boolean} DEFAULT_RENDER_OPTIONS.preserveDrawingBuffer=false
     * @property {number} DEFAULT_RENDER_OPTIONS.resolution=1
     * @property {number} DEFAULT_RENDER_OPTIONS.backgroundColor=0x000000
     * @property {boolean} DEFAULT_RENDER_OPTIONS.clearBeforeRender=true
     * @property {boolean} DEFAULT_RENDER_OPTIONS.autoResize=false
     */
    DEFAULT_RENDER_OPTIONS: {
        view: null,
        resolution: 1,
        antialias: false,
        forceFXAA: false,
        autoResize: false,
        transparent: false,
        backgroundColor: 0x000000,
        clearBeforeRender: true,
        preserveDrawingBuffer: false,
        roundPixels: false
    },

    /**
     * Constants that identify shapes, mainly to prevent `instanceof` calls.
     *
     * @static
     * @constant
     * @property {object} SHAPES
     * @property {object} SHAPES.POLY=0
     * @property {object} SHAPES.RECT=1
     * @property {object} SHAPES.CIRC=2
     * @property {object} SHAPES.ELIP=3
     * @property {object} SHAPES.RREC=4
     */
    SHAPES: {
        POLY: 0,
        RECT: 1,
        CIRC: 2,
        ELIP: 3,
        RREC: 4
    },

    // TODO: maybe change to SPRITE.BATCH_SIZE: 2000
    // TODO: maybe add PARTICLE.BATCH_SIZE: 15000
    SPRITE_BATCH_SIZE: 2000 //nice balance between mobile and desktop machines
};

module.exports = CONST;

},{"../../package.json":3}],5:[function(require,module,exports){
var math = require('../math'),
    DisplayObject = require('./DisplayObject'),
    RenderTexture = require('../textures/RenderTexture'),
    _tempMatrix = new math.Matrix();

/**
 * A Container represents a collection of display objects.
 * It is the base class of all display objects that act as a container for other objects.
 *
 *```js
 * var container = new PIXI.Container();
 * container.addChild(sprite);
 * ```
 * @class
 * @extends PIXI.DisplayObject
 * @memberof PIXI
 */
function Container()
{
    DisplayObject.call(this);

    /**
     * The array of children of this container.
     *
     * @member {PIXI.DisplayObject[]}
     * @readonly
     */
    this.children = [];
}

// constructor
Container.prototype = Object.create(DisplayObject.prototype);
Container.prototype.constructor = Container;
module.exports = Container;

Object.defineProperties(Container.prototype, {
    /**
     * The width of the Container, setting this will actually modify the scale to achieve the value set
     *
     * @member {number}
     * @memberof PIXI.Container#
     */
    width: {
        get: function ()
        {
            return this.scale.x * this.getLocalBounds().width;
        },
        set: function (value)
        {

            var width = this.getLocalBounds().width;

            if (width !== 0)
            {
                this.scale.x = value / width;
            }
            else
            {
                this.scale.x = 1;
            }


            this._width = value;
        }
    },

    /**
     * The height of the Container, setting this will actually modify the scale to achieve the value set
     *
     * @member {number}
     * @memberof PIXI.Container#
     */
    height: {
        get: function ()
        {
            return  this.scale.y * this.getLocalBounds().height;
        },
        set: function (value)
        {

            var height = this.getLocalBounds().height;

            if (height !== 0)
            {
                this.scale.y = value / height ;
            }
            else
            {
                this.scale.y = 1;
            }

            this._height = value;
        }
    }
});

/**
 * Overridable method that can be used by Container subclasses whenever the children array is modified
 *
 * @private
 */
Container.prototype.onChildrenChange = function () {};

/**
 * Adds a child to the container.
 *
 * @param child {PIXI.DisplayObject} The DisplayObject to add to the container
 * @return {PIXI.DisplayObject} The child that was added.
 */
Container.prototype.addChild = function (child)
{
    return this.addChildAt(child, this.children.length);
};

/**
 * Adds a child to the container at a specified index. If the index is out of bounds an error will be thrown
 *
 * @param child {PIXI.DisplayObject} The child to add
 * @param index {number} The index to place the child in
 * @return {PIXI.DisplayObject} The child that was added.
 */
Container.prototype.addChildAt = function (child, index)
{
    // prevent adding self as child
    if (child === this)
    {
        return child;
    }

    if (index >= 0 && index <= this.children.length)
    {
        if (child.parent)
        {
            child.parent.removeChild(child);
        }

        child.parent = this;

        this.children.splice(index, 0, child);
        this.onChildrenChange(index);

        child.emit('added', this);

        return child;
    }
    else
    {
        throw new Error(child + 'addChildAt: The index '+ index +' supplied is out of bounds ' + this.children.length);
    }
};

/**
 * Swaps the position of 2 Display Objects within this container.
 *
 * @param child {PIXI.DisplayObject}
 * @param child2 {PIXI.DisplayObject}
 */
Container.prototype.swapChildren = function (child, child2)
{
    if (child === child2)
    {
        return;
    }

    var index1 = this.getChildIndex(child);
    var index2 = this.getChildIndex(child2);

    if (index1 < 0 || index2 < 0)
    {
        throw new Error('swapChildren: Both the supplied DisplayObjects must be children of the caller.');
    }

    this.children[index1] = child2;
    this.children[index2] = child;
    this.onChildrenChange(index1 < index2 ? index1 : index2);
};

/**
 * Returns the index position of a child DisplayObject instance
 *
 * @param child {PIXI.DisplayObject} The DisplayObject instance to identify
 * @return {number} The index position of the child display object to identify
 */
Container.prototype.getChildIndex = function (child)
{
    var index = this.children.indexOf(child);

    if (index === -1)
    {
        throw new Error('The supplied DisplayObject must be a child of the caller');
    }

    return index;
};

/**
 * Changes the position of an existing child in the display object container
 *
 * @param child {PIXI.DisplayObject} The child DisplayObject instance for which you want to change the index number
 * @param index {number} The resulting index number for the child display object
 */
Container.prototype.setChildIndex = function (child, index)
{
    if (index < 0 || index >= this.children.length)
    {
        throw new Error('The supplied index is out of bounds');
    }

    var currentIndex = this.getChildIndex(child);

    this.children.splice(currentIndex, 1); //remove from old position
    this.children.splice(index, 0, child); //add at new position
    this.onChildrenChange(index);
};

/**
 * Returns the child at the specified index
 *
 * @param index {number} The index to get the child at
 * @return {PIXI.DisplayObject} The child at the given index, if any.
 */
Container.prototype.getChildAt = function (index)
{
    if (index < 0 || index >= this.children.length)
    {
        throw new Error('getChildAt: Supplied index ' + index + ' does not exist in the child list, or the supplied DisplayObject is not a child of the caller');
    }

    return this.children[index];
};

/**
 * Removes a child from the container.
 *
 * @param child {PIXI.DisplayObject} The DisplayObject to remove
 * @return {PIXI.DisplayObject} The child that was removed.
 */
Container.prototype.removeChild = function (child)
{
    var index = this.children.indexOf(child);

    if (index === -1)
    {
        return;
    }

    return this.removeChildAt(index);
};

/**
 * Removes a child from the specified index position.
 *
 * @param index {number} The index to get the child from
 * @return {PIXI.DisplayObject} The child that was removed.
 */
Container.prototype.removeChildAt = function (index)
{
    var child = this.getChildAt(index);

    child.parent = null;
    this.children.splice(index, 1);
    this.onChildrenChange(index);

    child.emit('removed', this);

    return child;
};

/**
 * Removes all children from this container that are within the begin and end indexes.
 *
 * @param beginIndex {number} The beginning position. Default value is 0.
 * @param endIndex {number} The ending position. Default value is size of the container.
 */
Container.prototype.removeChildren = function (beginIndex, endIndex)
{
    var begin = beginIndex || 0;
    var end = typeof endIndex === 'number' ? endIndex : this.children.length;
    var range = end - begin;
    var removed, i;

    if (range > 0 && range <= end)
    {
        removed = this.children.splice(begin, range);

        for (i = 0; i < removed.length; ++i)
        {
            removed[i].parent = null;
        }

        this.onChildrenChange(beginIndex);

        for (i = 0; i < removed.length; ++i)
        {
            removed[i].emit('removed', this);
        }

        return removed;
    }
    else if (range === 0 && this.children.length === 0)
    {
        return [];
    }
    else
    {
        throw new RangeError('removeChildren: numeric values are outside the acceptable range.');
    }
};

/**
 * Useful function that returns a texture of the display object that can then be used to create sprites
 * This can be quite useful if your displayObject is static / complicated and needs to be reused multiple times.
 *
 * @param renderer {PIXI.CanvasRenderer|PIXI.WebGLRenderer} The renderer used to generate the texture.
 * @param resolution {number} The resolution of the texture being generated
 * @param scaleMode {number} See {@link PIXI.SCALE_MODES} for possible values
 * @return {PIXI.Texture} a texture of the display object
 */
Container.prototype.generateTexture = function (renderer, resolution, scaleMode)
{
    var bounds = this.getLocalBounds();

    var renderTexture = new RenderTexture(renderer, bounds.width | 0, bounds.height | 0, scaleMode, resolution);

    _tempMatrix.tx = -bounds.x;
    _tempMatrix.ty = -bounds.y;

    renderTexture.render(this, _tempMatrix);

    return renderTexture;
};

/*
 * Updates the transform on all children of this container for rendering
 *
 * @private
 */
Container.prototype.updateTransform = function ()
{
    if (!this.visible)
    {
        return;
    }

    this.displayObjectUpdateTransform();

    for (var i = 0, j = this.children.length; i < j; ++i)
    {
        this.children[i].updateTransform();
    }
};

// performance increase to avoid using call.. (10x faster)
Container.prototype.containerUpdateTransform = Container.prototype.updateTransform;

/**
 * Retrieves the bounds of the Container as a rectangle. The bounds calculation takes all visible children into consideration.
 *
 * @return {PIXI.Rectangle} The rectangular bounding area
 */
Container.prototype.getBounds = function ()
{
    if(!this._currentBounds)
    {

        if (this.children.length === 0)
        {
            return math.Rectangle.EMPTY;
        }

        // TODO the bounds have already been calculated this render session so return what we have

        var minX = Infinity;
        var minY = Infinity;

        var maxX = -Infinity;
        var maxY = -Infinity;

        var childBounds;
        var childMaxX;
        var childMaxY;

        var childVisible = false;

        for (var i = 0, j = this.children.length; i < j; ++i)
        {
            var child = this.children[i];

            if (!child.visible)
            {
                continue;
            }

            childVisible = true;

            childBounds = this.children[i].getBounds();

            minX = minX < childBounds.x ? minX : childBounds.x;
            minY = minY < childBounds.y ? minY : childBounds.y;

            childMaxX = childBounds.width + childBounds.x;
            childMaxY = childBounds.height + childBounds.y;

            maxX = maxX > childMaxX ? maxX : childMaxX;
            maxY = maxY > childMaxY ? maxY : childMaxY;
        }

        if (!childVisible)
        {
            return math.Rectangle.EMPTY;
        }

        var bounds = this._bounds;

        bounds.x = minX;
        bounds.y = minY;
        bounds.width = maxX - minX;
        bounds.height = maxY - minY;

        this._currentBounds = bounds;
    }

    return this._currentBounds;
};

Container.prototype.containerGetBounds = Container.prototype.getBounds;

/**
 * Retrieves the non-global local bounds of the Container as a rectangle.
 * The calculation takes all visible children into consideration.
 *
 * @return {PIXI.Rectangle} The rectangular bounding area
 */
Container.prototype.getLocalBounds = function ()
{
    var matrixCache = this.worldTransform;

    this.worldTransform = math.Matrix.IDENTITY;

    for (var i = 0, j = this.children.length; i < j; ++i)
    {
        this.children[i].updateTransform();
    }

    this.worldTransform = matrixCache;

    this._currentBounds = null;

    return this.getBounds( math.Matrix.IDENTITY );
};

/**
 * Renders the object using the WebGL renderer
 *
 * @param renderer {PIXI.WebGLRenderer} The renderer
 */
Container.prototype.renderWebGL = function (renderer)
{

    // if the object is not visible or the alpha is 0 then no need to render this element
    if (!this.visible || this.worldAlpha <= 0 || !this.renderable)
    {
        return;
    }

    var i, j;

    // do a quick check to see if this element has a mask or a filter.
    if (this._mask || this._filters)
    {
        renderer.currentRenderer.flush();

        // push filter first as we need to ensure the stencil buffer is correct for any masking
        if (this._filters && this._filters.length)
        {
            renderer.filterManager.pushFilter(this, this._filters);
        }

        if (this._mask)
        {
            renderer.maskManager.pushMask(this, this._mask);
        }

        renderer.currentRenderer.start();

        // add this object to the batch, only rendered if it has a texture.
        this._renderWebGL(renderer);

        // now loop through the children and make sure they get rendered
        for (i = 0, j = this.children.length; i < j; i++)
        {
            this.children[i].renderWebGL(renderer);
        }

        renderer.currentRenderer.flush();

        if (this._mask)
        {
            renderer.maskManager.popMask(this, this._mask);
        }

        if (this._filters)
        {
            renderer.filterManager.popFilter();

        }
        renderer.currentRenderer.start();
    }
    else
    {
        this._renderWebGL(renderer);

        // simple render children!
        for (i = 0, j = this.children.length; i < j; ++i)
        {
            this.children[i].renderWebGL(renderer);
        }
    }
};

/**
 * To be overridden by the subclass
 *
 * @param renderer {PIXI.WebGLRenderer} The renderer
 * @private
 */
Container.prototype._renderWebGL = function (renderer) // jshint unused:false
{
    // this is where content itself gets rendered...
};

/**
 * To be overridden by the subclass
 *
 * @param renderer {PIXI.CanvasRenderer} The renderer
 * @private
 */
Container.prototype._renderCanvas = function (renderer) // jshint unused:false
{
    // this is where content itself gets rendered...
};


/**
 * Renders the object using the Canvas renderer
 *
 * @param renderer {PIXI.CanvasRenderer} The renderer
 */
Container.prototype.renderCanvas = function (renderer)
{
    // if not visible or the alpha is 0 then no need to render this
    if (!this.visible || this.alpha <= 0 || !this.renderable)
    {
        return;
    }

    if (this._mask)
    {
        renderer.maskManager.pushMask(this._mask, renderer);
    }

    this._renderCanvas(renderer);
    for (var i = 0, j = this.children.length; i < j; ++i)
    {
        this.children[i].renderCanvas(renderer);
    }

    if (this._mask)
    {
        renderer.maskManager.popMask(renderer);
    }
};

/**
 * Destroys the container
 * @param [destroyChildren=false] {boolean} if set to true, all the children will have their destroy method called as well
 */
Container.prototype.destroy = function (destroyChildren)
{
    DisplayObject.prototype.destroy.call(this);

    if (destroyChildren)
    {
        for (var i = 0, j = this.children.length; i < j; ++i)
        {
            this.children[i].destroy(destroyChildren);
        }
    }

    this.removeChildren();

    this.children = null;
};

},{"../math":12,"../textures/RenderTexture":24,"./DisplayObject":6}],6:[function(require,module,exports){
var math = require('../math'),
    RenderTexture = require('../textures/RenderTexture'),
    EventEmitter = require('eventemitter3'),
    CONST = require('../const'),
    _tempMatrix = new math.Matrix(),
    _tempDisplayObjectParent = {worldTransform:new math.Matrix(), worldAlpha:1, children:[]};


/**
 * The base class for all objects that are rendered on the screen.
 * This is an abstract class and should not be used on its own rather it should be extended.
 *
 * @class
 * @extends EventEmitter
 * @memberof PIXI
 */
function DisplayObject()
{
    EventEmitter.call(this);

    /**
     * The coordinate of the object relative to the local coordinates of the parent.
     *
     * @member {PIXI.Point}
     */
    this.position = new math.Point();

    /**
     * The scale factor of the object.
     *
     * @member {PIXI.Point}
     */
    this.scale = new math.Point(1, 1);

    /**
     * The pivot point of the displayObject that it rotates around
     *
     * @member {PIXI.Point}
     */
    this.pivot = new math.Point(0, 0);

    /**
     * The rotation of the object in radians.
     *
     * @member {number}
     */
    this.rotation = 0;

    /**
     * The opacity of the object.
     *
     * @member {number}
     */
    this.alpha = 1;

    /**
     * The visibility of the object. If false the object will not be drawn, and
     * the updateTransform function will not be called.
     *
     * @member {boolean}
     */
    this.visible = true;

    /**
     * Can this object be rendered, if false the object will not be drawn but the updateTransform
     * methods will still be called.
     *
     * @member {boolean}
     */
    this.renderable = true;

    /**
     * The display object container that contains this display object.
     *
     * @member {PIXI.Container}
     * @readOnly
     */
    this.parent = null;

    /**
     * The multiplied alpha of the displayObject
     *
     * @member {number}
     * @readOnly
     */
    this.worldAlpha = 1;

    /**
     * Current transform of the object based on world (parent) factors
     *
     * @member {PIXI.Matrix}
     * @readOnly
     */
    this.worldTransform = new math.Matrix();

    /**
     * The area the filter is applied to. This is used as more of an optimisation
     * rather than figuring out the dimensions of the displayObject each frame you can set this rectangle
     *
     * @member {PIXI.Rectangle}
     */
    this.filterArea = null;

    /**
     * cached sin rotation
     *
     * @member {number}
     * @private
     */
    this._sr = 0;

    /**
     * cached cos rotation
     *
     * @member {number}
     * @private
     */
    this._cr = 1;

    /**
     * The original, cached bounds of the object
     *
     * @member {PIXI.Rectangle}
     * @private
     */
    this._bounds = new math.Rectangle(0, 0, 1, 1);

    /**
     * The most up-to-date bounds of the object
     *
     * @member {PIXI.Rectangle}
     * @private
     */
    this._currentBounds = null;

    /**
     * The original, cached mask of the object
     *
     * @member {PIXI.Rectangle}
     * @private
     */
    this._mask = null;
}

// constructor
DisplayObject.prototype = Object.create(EventEmitter.prototype);
DisplayObject.prototype.constructor = DisplayObject;
module.exports = DisplayObject;

Object.defineProperties(DisplayObject.prototype, {
    /**
     * The position of the displayObject on the x axis relative to the local coordinates of the parent.
     *
     * @member {number}
     * @memberof PIXI.DisplayObject#
     */
    x: {
        get: function ()
        {
            return this.position.x;
        },
        set: function (value)
        {
            this.position.x = value;
        }
    },

    /**
     * The position of the displayObject on the y axis relative to the local coordinates of the parent.
     *
     * @member {number}
     * @memberof PIXI.DisplayObject#
     */
    y: {
        get: function ()
        {
            return this.position.y;
        },
        set: function (value)
        {
            this.position.y = value;
        }
    },

    /**
     * Indicates if the sprite is globally visible.
     *
     * @member {boolean}
     * @memberof PIXI.DisplayObject#
     * @readonly
     */
    worldVisible: {
        get: function ()
        {
            var item = this;

            do {
                if (!item.visible)
                {
                    return false;
                }

                item = item.parent;
            } while (item);

            return true;
        }
    },

    /**
     * Sets a mask for the displayObject. A mask is an object that limits the visibility of an object to the shape of the mask applied to it.
     * In PIXI a regular mask must be a PIXI.Graphics or a PIXI.Sprite object. This allows for much faster masking in canvas as it utilises shape clipping.
     * To remove a mask, set this property to null.
     *
     * @member {PIXI.Graphics|PIXI.Sprite}
     * @memberof PIXI.DisplayObject#
     */
    mask: {
        get: function ()
        {
            return this._mask;
        },
        set: function (value)
        {
            if (this._mask)
            {
                this._mask.renderable = true;
            }

            this._mask = value;

            if (this._mask)
            {
                this._mask.renderable = false;
            }
        }
    },

    /**
     * Sets the filters for the displayObject.
     * * IMPORTANT: This is a webGL only feature and will be ignored by the canvas renderer.
     * To remove filters simply set this property to 'null'
     *
     * @member {PIXI.AbstractFilter[]}
     * @memberof PIXI.DisplayObject#
     */
    filters: {
        get: function ()
        {
            return this._filters && this._filters.slice();
        },
        set: function (value)
        {
            this._filters = value && value.slice();
        }
    }

});

/*
 * Updates the object transform for rendering
 *
 * TODO - Optimization pass!
 */
DisplayObject.prototype.updateTransform = function ()
{

    // create some matrix refs for easy access
    var pt = this.parent.worldTransform;
    var wt = this.worldTransform;

    // temporary matrix variables
    var a, b, c, d, tx, ty;

    // so if rotation is between 0 then we can simplify the multiplication process...
    if (this.rotation % CONST.PI_2)
    {
        // check to see if the rotation is the same as the previous render. This means we only need to use sin and cos when rotation actually changes
        if (this.rotation !== this.rotationCache)
        {
            this.rotationCache = this.rotation;
            this._sr = Math.sin(this.rotation);
            this._cr = Math.cos(this.rotation);
        }

        // get the matrix values of the displayobject based on its transform properties..
        a  =  this._cr * this.scale.x;
        b  =  this._sr * this.scale.x;
        c  = -this._sr * this.scale.y;
        d  =  this._cr * this.scale.y;
        tx =  this.position.x;
        ty =  this.position.y;

        // check for pivot.. not often used so geared towards that fact!
        if (this.pivot.x || this.pivot.y)
        {
            tx -= this.pivot.x * a + this.pivot.y * c;
            ty -= this.pivot.x * b + this.pivot.y * d;
        }

        // concat the parent matrix with the objects transform.
        wt.a  = a  * pt.a + b  * pt.c;
        wt.b  = a  * pt.b + b  * pt.d;
        wt.c  = c  * pt.a + d  * pt.c;
        wt.d  = c  * pt.b + d  * pt.d;
        wt.tx = tx * pt.a + ty * pt.c + pt.tx;
        wt.ty = tx * pt.b + ty * pt.d + pt.ty;
    }
    else
    {
        // lets do the fast version as we know there is no rotation..
        a  = this.scale.x;
        d  = this.scale.y;

        tx = this.position.x - this.pivot.x * a;
        ty = this.position.y - this.pivot.y * d;

        wt.a  = a  * pt.a;
        wt.b  = a  * pt.b;
        wt.c  = d  * pt.c;
        wt.d  = d  * pt.d;
        wt.tx = tx * pt.a + ty * pt.c + pt.tx;
        wt.ty = tx * pt.b + ty * pt.d + pt.ty;
    }

    // multiply the alphas..
    this.worldAlpha = this.alpha * this.parent.worldAlpha;

    // reset the bounds each time this is called!
    this._currentBounds = null;
};

// performance increase to avoid using call.. (10x faster)
DisplayObject.prototype.displayObjectUpdateTransform = DisplayObject.prototype.updateTransform;

/**
 *
 *
 * Retrieves the bounds of the displayObject as a rectangle object
 *
 * @param matrix {PIXI.Matrix}
 * @return {PIXI.Rectangle} the rectangular bounding area
 */
DisplayObject.prototype.getBounds = function (matrix) // jshint unused:false
{
    return math.Rectangle.EMPTY;
};

/**
 * Retrieves the local bounds of the displayObject as a rectangle object
 *
 * @return {PIXI.Rectangle} the rectangular bounding area
 */
DisplayObject.prototype.getLocalBounds = function ()
{
    return this.getBounds(math.Matrix.IDENTITY);
};

/**
 * Calculates the global position of the display object
 *
 * @param position {PIXI.Point} The world origin to calculate from
 * @return {PIXI.Point} A point object representing the position of this object
 */
DisplayObject.prototype.toGlobal = function (position)
{
    // this parent check is for just in case the item is a root object.
    // If it is we need to give it a temporary parent so that displayObjectUpdateTransform works correctly
    // this is mainly to avoid a parent check in the main loop. Every little helps for performance :)
    if(!this.parent)
    {
        this.parent = _tempDisplayObjectParent;
        this.displayObjectUpdateTransform();
        this.parent = null;
    }
    else
    {
        this.displayObjectUpdateTransform();
    }

    // don't need to update the lot
    return this.worldTransform.apply(position);
};

/**
 * Calculates the local position of the display object relative to another point
 *
 * @param position {PIXI.Point} The world origin to calculate from
 * @param [from] {PIXI.DisplayObject} The DisplayObject to calculate the global position from
 * @return {PIXI.Point} A point object representing the position of this object
 */
DisplayObject.prototype.toLocal = function (position, from)
{
    if (from)
    {
        position = from.toGlobal(position);
    }

    // this parent check is for just in case the item is a root object.
    // If it is we need to give it a temporary parent so that displayObjectUpdateTransform works correctly
    // this is mainly to avoid a parent check in the main loop. Every little helps for performance :)
    if(!this.parent)
    {
        this.parent = _tempDisplayObjectParent;
        this.displayObjectUpdateTransform();
        this.parent = null;
    }
    else
    {
        this.displayObjectUpdateTransform();
    }

    // simply apply the matrix..
    return this.worldTransform.applyInverse(position);
};

/**
 * Renders the object using the WebGL renderer
 *
 * @param renderer {PIXI.WebGLRenderer} The renderer
 * @private
 */
DisplayObject.prototype.renderWebGL = function (renderer) // jshint unused:false
{
    // OVERWRITE;
};

/**
 * Renders the object using the Canvas renderer
 *
 * @param renderer {PIXI.CanvasRenderer} The renderer
 * @private
 */
DisplayObject.prototype.renderCanvas = function (renderer) // jshint unused:false
{
    // OVERWRITE;
};
/**
 * Useful function that returns a texture of the display object that can then be used to create sprites
 * This can be quite useful if your displayObject is static / complicated and needs to be reused multiple times.
 *
 * @param renderer {PIXI.CanvasRenderer|PIXI.WebGLRenderer} The renderer used to generate the texture.
 * @param scaleMode {number} See {@link PIXI.SCALE_MODES} for possible values
 * @param resolution {number} The resolution of the texture being generated
 * @return {PIXI.Texture} a texture of the display object
 */
DisplayObject.prototype.generateTexture = function (renderer, scaleMode, resolution)
{
    var bounds = this.getLocalBounds();

    var renderTexture = new RenderTexture(renderer, bounds.width | 0, bounds.height | 0, scaleMode, resolution);

    _tempMatrix.tx = -bounds.x;
    _tempMatrix.ty = -bounds.y;

    renderTexture.render(this, _tempMatrix);

    return renderTexture;
};

/**
 * Set the parent Container of this DisplayObject
 *
 * @param container {Container} The Container to add this DisplayObject to
 * @return {Container} The Container that this DisplayObject was added to
 */
DisplayObject.prototype.setParent = function (container)
{
    if (!container || !container.addChild)
    {
        throw new Error('setParent: Argument must be a Container');
    }

    container.addChild(this);
    return container;
};

/**
 * Base destroy method for generic display objects
 *
 */
DisplayObject.prototype.destroy = function ()
{

    this.position = null;
    this.scale = null;
    this.pivot = null;

    this.parent = null;

    this._bounds = null;
    this._currentBounds = null;
    this._mask = null;

    this.worldTransform = null;
    this.filterArea = null;
};

},{"../const":4,"../math":12,"../textures/RenderTexture":24,"eventemitter3":2}],7:[function(require,module,exports){
var Container = require('../display/Container'),
    Texture = require('../textures/Texture'),
    CanvasBuffer = require('../renderers/canvas/utils/CanvasBuffer'),
    CanvasGraphics = require('../renderers/canvas/utils/CanvasGraphics'),
    GraphicsData = require('./GraphicsData'),
    math = require('../math'),
    CONST = require('../const'),
    tempPoint = new math.Point();

/**
 * The Graphics class contains methods used to draw primitive shapes such as lines, circles and
 * rectangles to the display, and to color and fill them.
 *
 * @class
 * @extends PIXI.Container
 * @memberof PIXI
 */
function Graphics()
{
    Container.call(this);

    /**
     * The alpha value used when filling the Graphics object.
     *
     * @member {number}
     * @default 1
     */
    this.fillAlpha = 1;

    /**
     * The width (thickness) of any lines drawn.
     *
     * @member {number}
     * @default 0
     */
    this.lineWidth = 0;

    /**
     * The color of any lines drawn.
     *
     * @member {string}
     * @default 0
     */
    this.lineColor = 0;

    /**
     * Graphics data
     *
     * @member {PIXI.GraphicsData[]}
     * @private
     */
    this.graphicsData = [];

    /**
     * The tint applied to the graphic shape. This is a hex value. Apply a value of 0xFFFFFF to reset the tint.
     *
     * @member {number}
     * @default 0xFFFFFF
     */
    this.tint = 0xFFFFFF;

    /**
     * The previous tint applied to the graphic shape. Used to compare to the current tint and check if theres change.
     *
     * @member {number}
     * @private
     * @default 0xFFFFFF
     */
    this._prevTint = 0xFFFFFF;

    /**
     * The blend mode to be applied to the graphic shape. Apply a value of `PIXI.BLEND_MODES.NORMAL` to reset the blend mode.
     *
     * @member {number}
     * @default PIXI.BLEND_MODES.NORMAL;
     * @see PIXI.BLEND_MODES
     */
    this.blendMode = CONST.BLEND_MODES.NORMAL;

    /**
     * Current path
     *
     * @member {PIXI.GraphicsData}
     * @private
     */
    this.currentPath = null;

    /**
     * Array containing some WebGL-related properties used by the WebGL renderer.
     *
     * @member {object<number, object>}
     * @private
     */
    // TODO - _webgl should use a prototype object, not a random undocumented object...
    this._webGL = {};

    /**
     * Whether this shape is being used as a mask.
     *
     * @member {boolean}
     */
    this.isMask = false;

    /**
     * The bounds' padding used for bounds calculation.
     *
     * @member {number}
     */
    this.boundsPadding = 0;

    /**
     * A cache of the local bounds to prevent recalculation.
     *
     * @member {PIXI.Rectangle}
     * @private
     */
    this._localBounds = new math.Rectangle(0,0,1,1);

    /**
     * Used to detect if the graphics object has changed. If this is set to true then the graphics
     * object will be recalculated.
     *
     * @member {boolean}
     * @private
     */
    this.dirty = true;

    /**
     * Used to detect if the WebGL graphics object has changed. If this is set to true then the
     * graphics object will be recalculated.
     *
     * @member {boolean}
     * @private
     */
    this.glDirty = false;

    this.boundsDirty = true;

    /**
     * Used to detect if the cached sprite object needs to be updated.
     *
     * @member {boolean}
     * @private
     */
    this.cachedSpriteDirty = false;

    /**
     * When cacheAsBitmap is set to true the graphics object will be rendered as if it was a sprite.
     * This is useful if your graphics element does not change often, as it will speed up the rendering
     * of the object in exchange for taking up texture memory. It is also useful if you need the graphics
     * object to be anti-aliased, because it will be rendered using canvas. This is not recommended if
     * you are constantly redrawing the graphics element.
     *
     * @name cacheAsBitmap
     * @member {boolean}
     * @memberof PIXI.Graphics#
     * @default false
     */
}

// constructor
Graphics.prototype = Object.create(Container.prototype);
Graphics.prototype.constructor = Graphics;
module.exports = Graphics;

/**
 * Creates a new Graphics object with the same values as this one.
 * Note that the only the properties of the object are cloned, not its transform (position,scale,etc)
 *
 * @return {PIXI.Graphics}
 */
Graphics.prototype.clone = function ()
{
    var clone = new Graphics();

    clone.renderable    = this.renderable;
    clone.fillAlpha     = this.fillAlpha;
    clone.lineWidth     = this.lineWidth;
    clone.lineColor     = this.lineColor;
    clone.tint          = this.tint;
    clone.blendMode     = this.blendMode;
    clone.isMask        = this.isMask;
    clone.boundsPadding = this.boundsPadding;
    clone.dirty         = true;
    clone.glDirty       = true;
    clone.cachedSpriteDirty = this.cachedSpriteDirty;

    // copy graphics data
    for (var i = 0; i < this.graphicsData.length; ++i)
    {
        clone.graphicsData.push(this.graphicsData[i].clone());
    }

    clone.currentPath = clone.graphicsData[clone.graphicsData.length - 1];

    clone.updateLocalBounds();

    return clone;
};

/**
 * Specifies the line style used for subsequent calls to Graphics methods such as the lineTo() method or the drawCircle() method.
 *
 * @param lineWidth {number} width of the line to draw, will update the objects stored style
 * @param color {number} color of the line to draw, will update the objects stored style
 * @param alpha {number} alpha of the line to draw, will update the objects stored style
 * @return {PIXI.Graphics}
 */
Graphics.prototype.lineStyle = function (lineWidth, color, alpha)
{
    this.lineWidth = lineWidth || 0;
    this.lineColor = color || 0;
    this.lineAlpha = (alpha === undefined) ? 1 : alpha;

    if (this.currentPath)
    {
        if (this.currentPath.shape.points.length)
        {
            // halfway through a line? start a new one!
            var shape = new math.Polygon(this.currentPath.shape.points.slice(-2));
            shape.closed = false;
            this.drawShape(shape);
        }
        else
        {
            // otherwise its empty so lets just set the line properties
            this.currentPath.lineWidth = this.lineWidth;
            this.currentPath.lineColor = this.lineColor;
            this.currentPath.lineAlpha = this.lineAlpha;
        }
    }

    return this;
};

/**
 * Moves the current drawing position to x, y.
 *
 * @param x {number} the X coordinate to move to
 * @param y {number} the Y coordinate to move to
 * @return {PIXI.Graphics}
  */
Graphics.prototype.moveTo = function (x, y)
{
    var shape = new math.Polygon([x,y]);
    shape.closed = false;
    this.drawShape(shape);

    return this;
};

/**
 * Draws a line using the current line style from the current drawing position to (x, y);
 * The current drawing position is then set to (x, y).
 *
 * @param x {number} the X coordinate to draw to
 * @param y {number} the Y coordinate to draw to
 * @return {PIXI.Graphics}
 */
Graphics.prototype.lineTo = function (x, y)
{
    this.currentPath.shape.points.push(x, y);
    this.dirty = true;

    return this;
};

/**
 * Calculate the points for a quadratic bezier curve and then draws it.
 * Based on: https://stackoverflow.com/questions/785097/how-do-i-implement-a-bezier-curve-in-c
 *
 * @param cpX {number} Control point x
 * @param cpY {number} Control point y
 * @param toX {number} Destination point x
 * @param toY {number} Destination point y
 * @return {PIXI.Graphics}
 */
Graphics.prototype.quadraticCurveTo = function (cpX, cpY, toX, toY)
{
    if (this.currentPath)
    {
        if (this.currentPath.shape.points.length === 0)
        {
            this.currentPath.shape.points = [0, 0];
        }
    }
    else
    {
        this.moveTo(0,0);
    }

    var xa,
        ya,
        n = 20,
        points = this.currentPath.shape.points;

    if (points.length === 0)
    {
        this.moveTo(0, 0);
    }

    var fromX = points[points.length-2];
    var fromY = points[points.length-1];

    var j = 0;
    for (var i = 1; i <= n; ++i)
    {
        j = i / n;

        xa = fromX + ( (cpX - fromX) * j );
        ya = fromY + ( (cpY - fromY) * j );

        points.push( xa + ( ((cpX + ( (toX - cpX) * j )) - xa) * j ),
                     ya + ( ((cpY + ( (toY - cpY) * j )) - ya) * j ) );
    }

    this.dirty = this.boundsDirty = true;

    return this;
};

/**
 * Calculate the points for a bezier curve and then draws it.
 *
 * @param cpX {number} Control point x
 * @param cpY {number} Control point y
 * @param cpX2 {number} Second Control point x
 * @param cpY2 {number} Second Control point y
 * @param toX {number} Destination point x
 * @param toY {number} Destination point y
 * @return {PIXI.Graphics}
 */
Graphics.prototype.bezierCurveTo = function (cpX, cpY, cpX2, cpY2, toX, toY)
{
    if (this.currentPath)
    {
        if (this.currentPath.shape.points.length === 0)
        {
            this.currentPath.shape.points = [0, 0];
        }
    }
    else
    {
        this.moveTo(0,0);
    }

    var n = 20,
        dt,
        dt2,
        dt3,
        t2,
        t3,
        points = this.currentPath.shape.points;

    var fromX = points[points.length-2];
    var fromY = points[points.length-1];

    var j = 0;

    for (var i = 1; i <= n; ++i)
    {
        j = i / n;

        dt = (1 - j);
        dt2 = dt * dt;
        dt3 = dt2 * dt;

        t2 = j * j;
        t3 = t2 * j;

        points.push( dt3 * fromX + 3 * dt2 * j * cpX + 3 * dt * t2 * cpX2 + t3 * toX,
                     dt3 * fromY + 3 * dt2 * j * cpY + 3 * dt * t2 * cpY2 + t3 * toY);
    }

    this.dirty = this.boundsDirty = true;

    return this;
};

/**
 * The arcTo() method creates an arc/curve between two tangents on the canvas.
 *
 * "borrowed" from https://code.google.com/p/fxcanvas/ - thanks google!
 *
 * @param x1 {number} The x-coordinate of the beginning of the arc
 * @param y1 {number} The y-coordinate of the beginning of the arc
 * @param x2 {number} The x-coordinate of the end of the arc
 * @param y2 {number} The y-coordinate of the end of the arc
 * @param radius {number} The radius of the arc
 * @return {PIXI.Graphics}
 */
Graphics.prototype.arcTo = function (x1, y1, x2, y2, radius)
{
    if (this.currentPath)
    {
        if (this.currentPath.shape.points.length === 0)
        {
            this.currentPath.shape.points.push(x1, y1);
        }
    }
    else
    {
        this.moveTo(x1, y1);
    }

    var points = this.currentPath.shape.points,
        fromX = points[points.length-2],
        fromY = points[points.length-1],
        a1 = fromY - y1,
        b1 = fromX - x1,
        a2 = y2   - y1,
        b2 = x2   - x1,
        mm = Math.abs(a1 * b2 - b1 * a2);

    if (mm < 1.0e-8 || radius === 0)
    {
        if (points[points.length-2] !== x1 || points[points.length-1] !== y1)
        {
            points.push(x1, y1);
        }
    }
    else
    {
        var dd = a1 * a1 + b1 * b1,
            cc = a2 * a2 + b2 * b2,
            tt = a1 * a2 + b1 * b2,
            k1 = radius * Math.sqrt(dd) / mm,
            k2 = radius * Math.sqrt(cc) / mm,
            j1 = k1 * tt / dd,
            j2 = k2 * tt / cc,
            cx = k1 * b2 + k2 * b1,
            cy = k1 * a2 + k2 * a1,
            px = b1 * (k2 + j1),
            py = a1 * (k2 + j1),
            qx = b2 * (k1 + j2),
            qy = a2 * (k1 + j2),
            startAngle = Math.atan2(py - cy, px - cx),
            endAngle   = Math.atan2(qy - cy, qx - cx);

        this.arc(cx + x1, cy + y1, radius, startAngle, endAngle, b1 * a2 > b2 * a1);
    }

    this.dirty = this.boundsDirty = true;

    return this;
};

/**
 * The arc method creates an arc/curve (used to create circles, or parts of circles).
 *
 * @param cx {number} The x-coordinate of the center of the circle
 * @param cy {number} The y-coordinate of the center of the circle
 * @param radius {number} The radius of the circle
 * @param startAngle {number} The starting angle, in radians (0 is at the 3 o'clock position of the arc's circle)
 * @param endAngle {number} The ending angle, in radians
 * @param anticlockwise {boolean} Optional. Specifies whether the drawing should be counterclockwise or clockwise. False is default, and indicates clockwise, while true indicates counter-clockwise.
 * @return {PIXI.Graphics}
 */
Graphics.prototype.arc = function(cx, cy, radius, startAngle, endAngle, anticlockwise)
{
    anticlockwise = anticlockwise || false;

    if (startAngle === endAngle)
    {
        return this;
    }

    if( !anticlockwise && endAngle <= startAngle )
    {
        endAngle += Math.PI * 2;
    }
    else if( anticlockwise && startAngle <= endAngle )
    {
        startAngle += Math.PI * 2;
    }

    var sweep = anticlockwise ? (startAngle - endAngle) * -1 : (endAngle - startAngle);
    var segs =  Math.ceil(Math.abs(sweep) / (Math.PI * 2)) * 40;

    if(sweep === 0)
    {
        return this;
    }

    var startX = cx + Math.cos(startAngle) * radius;
    var startY = cy + Math.sin(startAngle) * radius;

    if (this.currentPath)
    {
        this.currentPath.shape.points.push(startX, startY);
    }
    else
    {
        this.moveTo(startX, startY);
    }

    var points = this.currentPath.shape.points;

    var theta = sweep/(segs*2);
    var theta2 = theta*2;

    var cTheta = Math.cos(theta);
    var sTheta = Math.sin(theta);

    var segMinus = segs - 1;

    var remainder = ( segMinus % 1 ) / segMinus;

    for(var i=0; i<=segMinus; i++)
    {
        var real =  i + remainder * i;


        var angle = ((theta) + startAngle + (theta2 * real));

        var c = Math.cos(angle);
        var s = -Math.sin(angle);

        points.push(( (cTheta *  c) + (sTheta * s) ) * radius + cx,
                    ( (cTheta * -s) + (sTheta * c) ) * radius + cy);
    }

    this.dirty = this.boundsDirty = true;

    return this;
};

/**
 * Specifies a simple one-color fill that subsequent calls to other Graphics methods
 * (such as lineTo() or drawCircle()) use when drawing.
 *
 * @param color {number} the color of the fill
 * @param alpha {number} the alpha of the fill
 * @return {PIXI.Graphics}
 */
Graphics.prototype.beginFill = function (color, alpha)
{
    this.filling = true;
    this.fillColor = color || 0;
    this.fillAlpha = (alpha === undefined) ? 1 : alpha;

    if (this.currentPath)
    {
        if (this.currentPath.shape.points.length <= 2)
        {
            this.currentPath.fill = this.filling;
            this.currentPath.fillColor = this.fillColor;
            this.currentPath.fillAlpha = this.fillAlpha;
        }
    }
    return this;
};

/**
 * Applies a fill to the lines and shapes that were added since the last call to the beginFill() method.
 *
 * @return {Graphics}
 */
Graphics.prototype.endFill = function ()
{
    this.filling = false;
    this.fillColor = null;
    this.fillAlpha = 1;

    return this;
};

/**
 *
 * @param x {number} The X coord of the top-left of the rectangle
 * @param y {number} The Y coord of the top-left of the rectangle
 * @param width {number} The width of the rectangle
 * @param height {number} The height of the rectangle
 * @return {PIXI.Graphics}
 */
Graphics.prototype.drawRect = function ( x, y, width, height )
{
    this.drawShape(new math.Rectangle(x,y, width, height));

    return this;
};

/**
 *
 * @param x {number} The X coord of the top-left of the rectangle
 * @param y {number} The Y coord of the top-left of the rectangle
 * @param width {number} The width of the rectangle
 * @param height {number} The height of the rectangle
 * @param radius {number} Radius of the rectangle corners
 * @return {PIXI.Graphics}
 */
Graphics.prototype.drawRoundedRect = function ( x, y, width, height, radius )
{
    this.drawShape(new math.RoundedRectangle(x, y, width, height, radius));

    return this;
};

/**
 * Draws a circle.
 *
 * @param x {number} The X coordinate of the center of the circle
 * @param y {number} The Y coordinate of the center of the circle
 * @param radius {number} The radius of the circle
 * @return {PIXI.Graphics}
 */
Graphics.prototype.drawCircle = function (x, y, radius)
{
    this.drawShape(new math.Circle(x,y, radius));

    return this;
};

/**
 * Draws an ellipse.
 *
 * @param x {number} The X coordinate of the center of the ellipse
 * @param y {number} The Y coordinate of the center of the ellipse
 * @param width {number} The half width of the ellipse
 * @param height {number} The half height of the ellipse
 * @return {PIXI.Graphics}
 */
Graphics.prototype.drawEllipse = function (x, y, width, height)
{
    this.drawShape(new math.Ellipse(x, y, width, height));

    return this;
};

/**
 * Draws a polygon using the given path.
 *
 * @param path {number[]|PIXI.Point[]} The path data used to construct the polygon.
 * @return {PIXI.Graphics}
 */
Graphics.prototype.drawPolygon = function (path)
{
    // prevents an argument assignment deopt
    // see section 3.1: https://github.com/petkaantonov/bluebird/wiki/Optimization-killers#3-managing-arguments
    var points = path;

    var closed = true;

    if (points instanceof math.Polygon)
    {
        closed = points.closed;
        points = points.points;
    }

    if (!Array.isArray(points))
    {
        // prevents an argument leak deopt
        // see section 3.2: https://github.com/petkaantonov/bluebird/wiki/Optimization-killers#3-managing-arguments
        points = new Array(arguments.length);

        for (var i = 0; i < points.length; ++i)
        {
            points[i] = arguments[i];
        }
    }

    var shape = new math.Polygon(points);
    shape.closed = closed;

    this.drawShape(shape);

    return this;
};

/**
 * Clears the graphics that were drawn to this Graphics object, and resets fill and line style settings.
 *
 * @return {PIXI.Graphics}
 */
Graphics.prototype.clear = function ()
{
    this.lineWidth = 0;
    this.filling = false;

    this.dirty = true;
    this.clearDirty = true;
    this.graphicsData = [];

    return this;
};

/**
 * Useful function that returns a texture of the graphics object that can then be used to create sprites
 * This can be quite useful if your geometry is complicated and needs to be reused multiple times.
 *
 * @param resolution {number} The resolution of the texture being generated
 * @param scaleMode {number} Should be one of the scaleMode consts
 * @return {PIXI.Texture} a texture of the graphics object
 */
Graphics.prototype.generateTexture = function (renderer, resolution, scaleMode)
{

    resolution = resolution || 1;

    var bounds = this.getLocalBounds();

    var canvasBuffer = new CanvasBuffer(bounds.width * resolution, bounds.height * resolution);

    var texture = Texture.fromCanvas(canvasBuffer.canvas, scaleMode);
    texture.baseTexture.resolution = resolution;

    canvasBuffer.context.scale(resolution, resolution);

    canvasBuffer.context.translate(-bounds.x,-bounds.y);

    CanvasGraphics.renderGraphics(this, canvasBuffer.context);

    return texture;
};

/**
 * Renders the object using the WebGL renderer
 *
 * @param renderer {PIXI.WebGLRenderer}
 * @private
 */
Graphics.prototype._renderWebGL = function (renderer)
{
    // if the sprite is not visible or the alpha is 0 then no need to render this element

    // this code may still be needed so leaving for now..
    //
    /*
    if (this._cacheAsBitmap)
    {
        if (this.dirty || this.cachedSpriteDirty)
        {
            this._generateCachedSprite();

            // we will also need to update the texture on the gpu too!
            this.updateCachedSpriteTexture();

            this.cachedSpriteDirty = false;
            this.dirty = false;
        }

        this._cachedSprite.worldAlpha = this.worldAlpha;

        Sprite.prototype.renderWebGL.call(this._cachedSprite, renderer);

        return;
    }

    */

    if (this.glDirty)
    {
        this.dirty = true;
        this.glDirty = false;
    }

    renderer.setObjectRenderer(renderer.plugins.graphics);
    renderer.plugins.graphics.render(this);

};

/**
 * Renders the object using the Canvas renderer
 *
 * @param renderer {PIXI.CanvasRenderer}
 * @private
 */
Graphics.prototype._renderCanvas = function (renderer)
{
    if (this.isMask === true)
    {
        return;
    }

    // if the tint has changed, set the graphics object to dirty.
    if (this._prevTint !== this.tint) {
        this.dirty = true;
    }

    // this code may still be needed so leaving for now..
    //
    /*
    if (this._cacheAsBitmap)
    {
        if (this.dirty || this.cachedSpriteDirty)
        {
            this._generateCachedSprite();

            // we will also need to update the texture
            this.updateCachedSpriteTexture();

            this.cachedSpriteDirty = false;
            this.dirty = false;
        }

        this._cachedSprite.alpha = this.alpha;

        Sprite.prototype._renderCanvas.call(this._cachedSprite, renderer);

        return;
    }
    */
    var context = renderer.context;
    var transform = this.worldTransform;

    var compositeOperation = renderer.blendModes[this.blendMode];
    if (compositeOperation !== context.globalCompositeOperation)
    {
        context.globalCompositeOperation = compositeOperation;
    }

    var resolution = renderer.resolution;
    context.setTransform(
        transform.a * resolution,
        transform.b * resolution,
        transform.c * resolution,
        transform.d * resolution,
        transform.tx * resolution,
        transform.ty * resolution
    );

    CanvasGraphics.renderGraphics(this, context);
};

/**
 * Retrieves the bounds of the graphic shape as a rectangle object
 *
 * @param [matrix] {PIXI.Matrix} The world transform matrix to use, defaults to this
 *  object's worldTransform.
 * @return {PIXI.Rectangle} the rectangular bounding area
 */
Graphics.prototype.getBounds = function (matrix)
{
    if(!this._currentBounds)
    {

        // return an empty object if the item is a mask!
        if (!this.renderable)
        {
            return math.Rectangle.EMPTY;
        }

        if (this.boundsDirty)
        {
            this.updateLocalBounds();

            this.glDirty = true;
            this.cachedSpriteDirty = true;
            this.boundsDirty = false;
        }

        var bounds = this._localBounds;

        var w0 = bounds.x;
        var w1 = bounds.width + bounds.x;

        var h0 = bounds.y;
        var h1 = bounds.height + bounds.y;

        var worldTransform = matrix || this.worldTransform;

        var a = worldTransform.a;
        var b = worldTransform.b;
        var c = worldTransform.c;
        var d = worldTransform.d;
        var tx = worldTransform.tx;
        var ty = worldTransform.ty;

        var x1 = a * w1 + c * h1 + tx;
        var y1 = d * h1 + b * w1 + ty;

        var x2 = a * w0 + c * h1 + tx;
        var y2 = d * h1 + b * w0 + ty;

        var x3 = a * w0 + c * h0 + tx;
        var y3 = d * h0 + b * w0 + ty;

        var x4 =  a * w1 + c * h0 + tx;
        var y4 =  d * h0 + b * w1 + ty;

        var maxX = x1;
        var maxY = y1;

        var minX = x1;
        var minY = y1;

        minX = x2 < minX ? x2 : minX;
        minX = x3 < minX ? x3 : minX;
        minX = x4 < minX ? x4 : minX;

        minY = y2 < minY ? y2 : minY;
        minY = y3 < minY ? y3 : minY;
        minY = y4 < minY ? y4 : minY;

        maxX = x2 > maxX ? x2 : maxX;
        maxX = x3 > maxX ? x3 : maxX;
        maxX = x4 > maxX ? x4 : maxX;

        maxY = y2 > maxY ? y2 : maxY;
        maxY = y3 > maxY ? y3 : maxY;
        maxY = y4 > maxY ? y4 : maxY;

        this._bounds.x = minX;
        this._bounds.width = maxX - minX;

        this._bounds.y = minY;
        this._bounds.height = maxY - minY;

        this._currentBounds = this._bounds;
    }

    return this._currentBounds;
};

/**
* Tests if a point is inside this graphics object
*
* @param point {PIXI.Point} the point to test
* @return {boolean} the result of the test
*/
Graphics.prototype.containsPoint = function( point )
{
    this.worldTransform.applyInverse(point,  tempPoint);

    var graphicsData = this.graphicsData;

    for (var i = 0; i < graphicsData.length; i++)
    {
        var data = graphicsData[i];

        if (!data.fill)
        {
            continue;
        }

        // only deal with fills..
        if (data.shape)
        {
            if ( data.shape.contains( tempPoint.x, tempPoint.y ) )
            {
                return true;
            }
        }
    }

    return false;
};

/**
 * Update the bounds of the object
 *
 */
Graphics.prototype.updateLocalBounds = function ()
{
    var minX = Infinity;
    var maxX = -Infinity;

    var minY = Infinity;
    var maxY = -Infinity;

    if (this.graphicsData.length)
    {
        var shape, points, x, y, w, h;

        for (var i = 0; i < this.graphicsData.length; i++)
        {
            var data = this.graphicsData[i];
            var type = data.type;
            var lineWidth = data.lineWidth;
            shape = data.shape;

            if (type === CONST.SHAPES.RECT || type === CONST.SHAPES.RREC)
            {
                x = shape.x - lineWidth/2;
                y = shape.y - lineWidth/2;
                w = shape.width + lineWidth;
                h = shape.height + lineWidth;

                minX = x < minX ? x : minX;
                maxX = x + w > maxX ? x + w : maxX;

                minY = y < minY ? y : minY;
                maxY = y + h > maxY ? y + h : maxY;
            }
            else if (type === CONST.SHAPES.CIRC)
            {
                x = shape.x;
                y = shape.y;
                w = shape.radius + lineWidth/2;
                h = shape.radius + lineWidth/2;

                minX = x - w < minX ? x - w : minX;
                maxX = x + w > maxX ? x + w : maxX;

                minY = y - h < minY ? y - h : minY;
                maxY = y + h > maxY ? y + h : maxY;
            }
            else if (type === CONST.SHAPES.ELIP)
            {
                x = shape.x;
                y = shape.y;
                w = shape.width + lineWidth/2;
                h = shape.height + lineWidth/2;

                minX = x - w < minX ? x - w : minX;
                maxX = x + w > maxX ? x + w : maxX;

                minY = y - h < minY ? y - h : minY;
                maxY = y + h > maxY ? y + h : maxY;
            }
            else
            {
                // POLY
                points = shape.points;

                for (var j = 0; j < points.length; j += 2)
                {
                    x = points[j];
                    y = points[j+1];

                    minX = x-lineWidth < minX ? x-lineWidth : minX;
                    maxX = x+lineWidth > maxX ? x+lineWidth : maxX;

                    minY = y-lineWidth < minY ? y-lineWidth : minY;
                    maxY = y+lineWidth > maxY ? y+lineWidth : maxY;
                }
            }
        }
    }
    else
    {
        minX = 0;
        maxX = 0;
        minY = 0;
        maxY = 0;
    }

    var padding = this.boundsPadding;

    this._localBounds.x = minX - padding;
    this._localBounds.width = (maxX - minX) + padding * 2;

    this._localBounds.y = minY - padding;
    this._localBounds.height = (maxY - minY) + padding * 2;
};

/**
 * Generates the cached sprite when the sprite has cacheAsBitmap = true
 *
 * @private
 */
/*
Graphics.prototype._generateCachedSprite = function ()
{
    var bounds = this.getLocalBounds();

    if (!this._cachedSprite)
    {
        var canvasBuffer = new CanvasBuffer(bounds.width, bounds.height);
        var texture = Texture.fromCanvas(canvasBuffer.canvas);

        this._cachedSprite = new Sprite(texture);
        this._cachedSprite.buffer = canvasBuffer;

        this._cachedSprite.worldTransform = this.worldTransform;
    }
    else
    {
        this._cachedSprite.buffer.resize(bounds.width, bounds.height);
    }

    // leverage the anchor to account for the offset of the element
    this._cachedSprite.anchor.x = -( bounds.x / bounds.width );
    this._cachedSprite.anchor.y = -( bounds.y / bounds.height );

    // this._cachedSprite.buffer.context.save();
    this._cachedSprite.buffer.context.translate(-bounds.x,-bounds.y);

    // make sure we set the alpha of the graphics to 1 for the render..
    this.worldAlpha = 1;

    // now render the graphic..
    CanvasGraphics.renderGraphics(this, this._cachedSprite.buffer.context);

    this._cachedSprite.alpha = this.alpha;
};
*/
/**
 * Updates texture size based on canvas size
 *
 * @private
 */
/*
Graphics.prototype.updateCachedSpriteTexture = function ()
{
    var cachedSprite = this._cachedSprite;
    var texture = cachedSprite.texture;
    var canvas = cachedSprite.buffer.canvas;

    texture.baseTexture.width = canvas.width;
    texture.baseTexture.height = canvas.height;
    texture.crop.width = texture.frame.width = canvas.width;
    texture.crop.height = texture.frame.height = canvas.height;

    cachedSprite._width = canvas.width;
    cachedSprite._height = canvas.height;

    // update the dirty base textures
    texture.baseTexture.dirty();
};*/

/**
 * Destroys a previous cached sprite.
 *
 */
/*
Graphics.prototype.destroyCachedSprite = function ()
{
    this._cachedSprite.texture.destroy(true);

    // let the gc collect the unused sprite
    // TODO could be object pooled!
    this._cachedSprite = null;
};*/

/**
 * Draws the given shape to this Graphics object. Can be any of Circle, Rectangle, Ellipse, Line or Polygon.
 *
 * @param shape {PIXI.Circle|PIXI.Rectangle|PIXI.Ellipse|PIXI.Line|PIXI.Polygon} The shape object to draw.
 * @return {PIXI.GraphicsData} The generated GraphicsData object.
 */
Graphics.prototype.drawShape = function (shape)
{
    if (this.currentPath)
    {
        // check current path!
        if (this.currentPath.shape.points.length <= 2)
        {
            this.graphicsData.pop();
        }
    }

    this.currentPath = null;

    var data = new GraphicsData(this.lineWidth, this.lineColor, this.lineAlpha, this.fillColor, this.fillAlpha, this.filling, shape);

    this.graphicsData.push(data);

    if (data.type === CONST.SHAPES.POLY)
    {
        data.shape.closed = data.shape.closed || this.filling;
        this.currentPath = data;
    }

    this.dirty = this.boundsDirty = true;

    return data;
};

/**
 * Destroys the Graphics object.
 */
Graphics.prototype.destroy = function () {
    Container.prototype.destroy.apply(this, arguments);

    // destroy each of the GraphicsData objects
    for (var i = 0; i < this.graphicsData.length; ++i) {
        this.graphicsData[i].destroy();
    }

    // for each webgl data entry, destroy the WebGLGraphicsData
    for (var id in this._webgl) {
        for (var j = 0; j < this._webgl[id].data.length; ++j) {
            this._webgl[id].data[j].destroy();
        }
    }

    this.graphicsData = null;

    this.currentPath = null;
    this._webgl = null;
    this._localBounds = null;
};

},{"../const":4,"../display/Container":5,"../math":12,"../renderers/canvas/utils/CanvasBuffer":1,"../renderers/canvas/utils/CanvasGraphics":19,"../textures/Texture":25,"./GraphicsData":8}],8:[function(require,module,exports){
/**
 * A GraphicsData object.
 *
 * @class
 * @memberof PIXI
 * @param lineWidth {number} the width of the line to draw
 * @param lineColor {number} the color of the line to draw
 * @param lineAlpha {number} the alpha of the line to draw
 * @param fillColor {number} the color of the fill
 * @param fillAlpha {number} the alpha of the fill
 * @param fill      {boolean} whether or not the shape is filled with a colour
 * @param shape     {Circle|Rectangle|Ellipse|Line|Polygon} The shape object to draw.
 */
function GraphicsData(lineWidth, lineColor, lineAlpha, fillColor, fillAlpha, fill, shape)
{
    /*
     * @member {number} the width of the line to draw
     */
    this.lineWidth = lineWidth;

    /*
     * @member {number} the color of the line to draw
     */
    this.lineColor = lineColor;
    /*
     * @member {number} the alpha of the line to draw
     */
    this.lineAlpha = lineAlpha;
    /*
     * @member {number} cached tint of the line to draw
     */
    this._lineTint = lineColor;

    /*
     * @member {number} the color of the fill
     */
    this.fillColor = fillColor;

    /*
     * @member {number} the alpha of the fill
     */
    this.fillAlpha = fillAlpha;

    /*
     * @member {number} cached tint of the fill
     */
    this._fillTint = fillColor;

    /*
     * @member {boolean} whether or not the shape is filled with a colour
     */
    this.fill = fill;

    /*
     * @member {PIXI.Circle|PIXI.Rectangle|PIXI.Ellipse|PIXI.Line|PIXI.Polygon} The shape object to draw.
     */
    this.shape = shape;

    /*
     * @member {number} The type of the shape, see the Const.Shapes file for all the existing types,
     */
    this.type = shape.type;
}

GraphicsData.prototype.constructor = GraphicsData;
module.exports = GraphicsData;

/**
 * Creates a new GraphicsData object with the same values as this one.
 *
 * @return {PIXI.GraphicsData}
 */
GraphicsData.prototype.clone = function ()
{
    return new GraphicsData(
        this.lineWidth,
        this.lineColor,
        this.lineAlpha,
        this.fillColor,
        this.fillAlpha,
        this.fill,
        this.shape
    );
};

/**
 * Destroys the Graphics data.
 */
GraphicsData.prototype.destroy = function () {
    this.shape = null;
};

},{}],9:[function(require,module,exports){
/**
 * @file        Main export of the PIXI core library
 * @author      Mat Groves <mat@goodboydigital.com>
 * @copyright   2013-2015 GoodBoyDigital
 * @license     {@link https://github.com/pixijs/pixi.js/blob/master/LICENSE|MIT License}
 */

/**
 * @namespace PIXI
 */
// export core and const. We assign core to const so that the non-reference types in const remain in-tact
var core = module.exports = Object.assign(require('./const'), require('./math'), {
    // utils
    utils: require('./utils'),
    ticker: require('./ticker'),

    // display
    DisplayObject:          require('./display/DisplayObject'),
    Container:              require('./display/Container'),

    // sprites
    Sprite:                 require('./sprites/Sprite'),
    ParticleContainer:      require('./particles/ParticleContainer'),
    SpriteRenderer:         require('./sprites/webgl/SpriteRenderer'),
    ParticleRenderer:       require('./particles/webgl/ParticleRenderer'),

    // text
    Text:                   require('./text/Text'),

    // primitives
    Graphics:               require('./graphics/Graphics'),
    GraphicsData:           require('./graphics/GraphicsData'),
    GraphicsRenderer:       require('./graphics/webgl/GraphicsRenderer'),

    // textures
    Texture:                require('./textures/Texture'),
    BaseTexture:            require('./textures/BaseTexture'),
    RenderTexture:          require('./textures/RenderTexture'),
    VideoBaseTexture:       require('./textures/VideoBaseTexture'),
    TextureUvs:             require('./textures/TextureUvs'),

    // renderers - canvas
    CanvasRenderer:         require('./renderers/canvas/CanvasRenderer'),
    CanvasGraphics:         require('./renderers/canvas/utils/CanvasGraphics'),
    CanvasBuffer:           require('./renderers/canvas/utils/CanvasBuffer'),

    // renderers - webgl
    WebGLRenderer:          require('./renderers/webgl/WebGLRenderer'),
    ShaderManager:          require('./renderers/webgl/managers/ShaderManager'),
    Shader:                 require('./renderers/webgl/shaders/Shader'),
    ObjectRenderer:         require('./renderers/webgl/utils/ObjectRenderer'),
    RenderTarget:           require('./renderers/webgl/utils/RenderTarget'),

    // filters - webgl
    AbstractFilter:         require('./renderers/webgl/filters/AbstractFilter'),
    FXAAFilter:             require('./renderers/webgl/filters/FXAAFilter'),
    SpriteMaskFilter:       require('./renderers/webgl/filters/SpriteMaskFilter'),

    /**
     * This helper function will automatically detect which renderer you should be using.
     * WebGL is the preferred renderer as it is a lot faster. If webGL is not supported by
     * the browser then this function will return a canvas renderer
     *
     * @memberof PIXI
     * @param width=800 {number} the width of the renderers view
     * @param height=600 {number} the height of the renderers view
     * @param [options] {object} The optional renderer parameters
     * @param [options.view] {HTMLCanvasElement} the canvas to use as a view, optional
     * @param [options.transparent=false] {boolean} If the render view is transparent, default false
     * @param [options.antialias=false] {boolean} sets antialias (only applicable in chrome at the moment)
     * @param [options.preserveDrawingBuffer=false] {boolean} enables drawing buffer preservation, enable this if you
     *      need to call toDataUrl on the webgl context
     * @param [options.resolution=1] {number} the resolution of the renderer, retina would be 2
     * @param [noWebGL=false] {boolean} prevents selection of WebGL renderer, even if such is present
     *
     * @return {WebGLRenderer|CanvasRenderer} Returns WebGL renderer if available, otherwise CanvasRenderer
     */
    autoDetectRenderer: function (width, height, options, noWebGL)
    {
        width = width || 800;
        height = height || 600;

        if (!noWebGL && core.utils.isWebGLSupported())
        {
            return new core.WebGLRenderer(width, height, options);
        }

        return new core.CanvasRenderer(width, height, options);
    }
});

},{"./const":4,"./display/Container":5,"./display/DisplayObject":6,"./graphics/Graphics":7,"./graphics/GraphicsData":8,"./graphics/webgl/GraphicsRenderer":1,"./math":12,"./particles/ParticleContainer":1,"./particles/webgl/ParticleRenderer":1,"./renderers/canvas/CanvasRenderer":18,"./renderers/canvas/utils/CanvasBuffer":1,"./renderers/canvas/utils/CanvasGraphics":19,"./renderers/webgl/WebGLRenderer":1,"./renderers/webgl/filters/AbstractFilter":1,"./renderers/webgl/filters/FXAAFilter":1,"./renderers/webgl/filters/SpriteMaskFilter":1,"./renderers/webgl/managers/ShaderManager":1,"./renderers/webgl/shaders/Shader":1,"./renderers/webgl/utils/ObjectRenderer":1,"./renderers/webgl/utils/RenderTarget":1,"./sprites/Sprite":21,"./sprites/webgl/SpriteRenderer":1,"./text/Text":22,"./textures/BaseTexture":23,"./textures/RenderTexture":24,"./textures/Texture":25,"./textures/TextureUvs":26,"./textures/VideoBaseTexture":1,"./ticker":28,"./utils":29}],10:[function(require,module,exports){
var Point = require('./Point');

/**
 * The pixi Matrix class as an object, which makes it a lot faster,
 * here is a representation of it :
 * | a | b | tx|
 * | c | d | ty|
 * | 0 | 0 | 1 |
 *
 * @class
 * @memberof PIXI
 */
function Matrix()
{
    /**
     * @member {number}
     * @default 1
     */
    this.a = 1;

    /**
     * @member {number}
     * @default 0
     */
    this.b = 0;

    /**
     * @member {number}
     * @default 0
     */
    this.c = 0;

    /**
     * @member {number}
     * @default 1
     */
    this.d = 1;

    /**
     * @member {number}
     * @default 0
     */
    this.tx = 0;

    /**
     * @member {number}
     * @default 0
     */
    this.ty = 0;
}

Matrix.prototype.constructor = Matrix;
module.exports = Matrix;

/**
 * Creates a Matrix object based on the given array. The Element to Matrix mapping order is as follows:
 *
 * a = array[0]
 * b = array[1]
 * c = array[3]
 * d = array[4]
 * tx = array[2]
 * ty = array[5]
 *
 * @param array {number[]} The array that the matrix will be populated from.
 */
Matrix.prototype.fromArray = function (array)
{
    this.a = array[0];
    this.b = array[1];
    this.c = array[3];
    this.d = array[4];
    this.tx = array[2];
    this.ty = array[5];
};

/**
 * Creates an array from the current Matrix object.
 *
 * @param transpose {boolean} Whether we need to transpose the matrix or not
 * @return {number[]} the newly created array which contains the matrix
 */
Matrix.prototype.toArray = function (transpose, out)
{
    if (!this.array)
    {
        this.array = new Float32Array(9);
    }

    var array = out || this.array;

    if (transpose)
    {
        array[0] = this.a;
        array[1] = this.b;
        array[2] = 0;
        array[3] = this.c;
        array[4] = this.d;
        array[5] = 0;
        array[6] = this.tx;
        array[7] = this.ty;
        array[8] = 1;
    }
    else
    {
        array[0] = this.a;
        array[1] = this.c;
        array[2] = this.tx;
        array[3] = this.b;
        array[4] = this.d;
        array[5] = this.ty;
        array[6] = 0;
        array[7] = 0;
        array[8] = 1;
    }

    return array;
};

/**
 * Get a new position with the current transformation applied.
 * Can be used to go from a child's coordinate space to the world coordinate space. (e.g. rendering)
 *
 * @param pos {PIXI.Point} The origin
 * @param [newPos] {PIXI.Point} The point that the new position is assigned to (allowed to be same as input)
 * @return {PIXI.Point} The new point, transformed through this matrix
 */
Matrix.prototype.apply = function (pos, newPos)
{
    newPos = newPos || new Point();

    var x = pos.x;
    var y = pos.y;

    newPos.x = this.a * x + this.c * y + this.tx;
    newPos.y = this.b * x + this.d * y + this.ty;

    return newPos;
};

/**
 * Get a new position with the inverse of the current transformation applied.
 * Can be used to go from the world coordinate space to a child's coordinate space. (e.g. input)
 *
 * @param pos {PIXI.Point} The origin
 * @param [newPos] {PIXI.Point} The point that the new position is assigned to (allowed to be same as input)
 * @return {PIXI.Point} The new point, inverse-transformed through this matrix
 */
Matrix.prototype.applyInverse = function (pos, newPos)
{
    newPos = newPos || new Point();

    var id = 1 / (this.a * this.d + this.c * -this.b);

    var x = pos.x;
    var y = pos.y;

    newPos.x = this.d * id * x + -this.c * id * y + (this.ty * this.c - this.tx * this.d) * id;
    newPos.y = this.a * id * y + -this.b * id * x + (-this.ty * this.a + this.tx * this.b) * id;

    return newPos;
};

/**
 * Translates the matrix on the x and y.
 *
 * @param {number} x
 * @param {number} y
 * @return {PIXI.Matrix} This matrix. Good for chaining method calls.
 */
Matrix.prototype.translate = function (x, y)
{
    this.tx += x;
    this.ty += y;

    return this;
};

/**
 * Applies a scale transformation to the matrix.
 *
 * @param {number} x The amount to scale horizontally
 * @param {number} y The amount to scale vertically
 * @return {PIXI.Matrix} This matrix. Good for chaining method calls.
 */
Matrix.prototype.scale = function (x, y)
{
    this.a *= x;
    this.d *= y;
    this.c *= x;
    this.b *= y;
    this.tx *= x;
    this.ty *= y;

    return this;
};


/**
 * Applies a rotation transformation to the matrix.
 *
 * @param {number} angle - The angle in radians.
 * @return {PIXI.Matrix} This matrix. Good for chaining method calls.
 */
Matrix.prototype.rotate = function (angle)
{
    var cos = Math.cos( angle );
    var sin = Math.sin( angle );

    var a1 = this.a;
    var c1 = this.c;
    var tx1 = this.tx;

    this.a = a1 * cos-this.b * sin;
    this.b = a1 * sin+this.b * cos;
    this.c = c1 * cos-this.d * sin;
    this.d = c1 * sin+this.d * cos;
    this.tx = tx1 * cos - this.ty * sin;
    this.ty = tx1 * sin + this.ty * cos;

    return this;
};

/**
 * Appends the given Matrix to this Matrix.
 *
 * @param {PIXI.Matrix} matrix
 * @return {PIXI.Matrix} This matrix. Good for chaining method calls.
 */
Matrix.prototype.append = function (matrix)
{
    var a1 = this.a;
    var b1 = this.b;
    var c1 = this.c;
    var d1 = this.d;

    this.a  = matrix.a * a1 + matrix.b * c1;
    this.b  = matrix.a * b1 + matrix.b * d1;
    this.c  = matrix.c * a1 + matrix.d * c1;
    this.d  = matrix.c * b1 + matrix.d * d1;

    this.tx = matrix.tx * a1 + matrix.ty * c1 + this.tx;
    this.ty = matrix.tx * b1 + matrix.ty * d1 + this.ty;

    return this;
};

/**
 * Prepends the given Matrix to this Matrix.
 *
 * @param {PIXI.Matrix} matrix
 * @return {PIXI.Matrix} This matrix. Good for chaining method calls.
 */
Matrix.prototype.prepend = function(matrix)
{
    var tx1 = this.tx;

    if (matrix.a !== 1 || matrix.b !== 0 || matrix.c !== 0 || matrix.d !== 1)
    {
        var a1 = this.a;
        var c1 = this.c;
        this.a  = a1*matrix.a+this.b*matrix.c;
        this.b  = a1*matrix.b+this.b*matrix.d;
        this.c  = c1*matrix.a+this.d*matrix.c;
        this.d  = c1*matrix.b+this.d*matrix.d;
    }

    this.tx = tx1*matrix.a+this.ty*matrix.c+matrix.tx;
    this.ty = tx1*matrix.b+this.ty*matrix.d+matrix.ty;

    return this;
};

/**
 * Inverts this matrix
 *
 * @return {PIXI.Matrix} This matrix. Good for chaining method calls.
 */
Matrix.prototype.invert = function()
{
    var a1 = this.a;
    var b1 = this.b;
    var c1 = this.c;
    var d1 = this.d;
    var tx1 = this.tx;
    var n = a1*d1-b1*c1;

    this.a = d1/n;
    this.b = -b1/n;
    this.c = -c1/n;
    this.d = a1/n;
    this.tx = (c1*this.ty-d1*tx1)/n;
    this.ty = -(a1*this.ty-b1*tx1)/n;

    return this;
};


/**
 * Resets this Matix to an identity (default) matrix.
 *
 * @return {PIXI.Matrix} This matrix. Good for chaining method calls.
 */
Matrix.prototype.identity = function ()
{
    this.a = 1;
    this.b = 0;
    this.c = 0;
    this.d = 1;
    this.tx = 0;
    this.ty = 0;

    return this;
};

/**
 * Creates a new Matrix object with the same values as this one.
 *
 * @return {PIXI.Matrix} A copy of this matrix. Good for chaining method calls.
 */
Matrix.prototype.clone = function ()
{
    var matrix = new Matrix();
    matrix.a = this.a;
    matrix.b = this.b;
    matrix.c = this.c;
    matrix.d = this.d;
    matrix.tx = this.tx;
    matrix.ty = this.ty;

    return matrix;
};

/**
 * Changes the values of the given matrix to be the same as the ones in this matrix
 *
 * @return {PIXI.Matrix} The matrix given in parameter with its values updated.
 */
Matrix.prototype.copy = function (matrix)
{
    matrix.a = this.a;
    matrix.b = this.b;
    matrix.c = this.c;
    matrix.d = this.d;
    matrix.tx = this.tx;
    matrix.ty = this.ty;

    return matrix;
};

/**
 * A default (identity) matrix
 *
 * @static
 * @const
 */
Matrix.IDENTITY = new Matrix();

/**
 * A temp matrix
 *
 * @static
 * @const
 */
Matrix.TEMP_MATRIX = new Matrix();

},{"./Point":11}],11:[function(require,module,exports){
/**
 * The Point object represents a location in a two-dimensional coordinate system, where x represents
 * the horizontal axis and y represents the vertical axis.
 *
 * @class
 * @memberof PIXI
 * @param [x=0] {number} position of the point on the x axis
 * @param [y=0] {number} position of the point on the y axis
 */
function Point(x, y)
{
    /**
     * @member {number}
     * @default 0
     */
    this.x = x || 0;

    /**
     * @member {number}
     * @default 0
     */
    this.y = y || 0;
}

Point.prototype.constructor = Point;
module.exports = Point;

/**
 * Creates a clone of this point
 *
 * @return {PIXI.Point} a copy of the point
 */
Point.prototype.clone = function ()
{
    return new Point(this.x, this.y);
};

/**
 * Copies x and y from the given point
 *
 * @param p {PIXI.Point}
 */
Point.prototype.copy = function (p) {
    this.set(p.x, p.y);
};

/**
 * Returns true if the given point is equal to this point
 *
 * @param p {PIXI.Point}
 * @returns {boolean}
 */
Point.prototype.equals = function (p) {
    return (p.x === this.x) && (p.y === this.y);
};

/**
 * Sets the point to a new x and y position.
 * If y is omitted, both x and y will be set to x.
 *
 * @param [x=0] {number} position of the point on the x axis
 * @param [y=0] {number} position of the point on the y axis
 */
Point.prototype.set = function (x, y)
{
    this.x = x || 0;
    this.y = y || ( (y !== 0) ? this.x : 0 ) ;
};

},{}],12:[function(require,module,exports){
/**
 * Math classes and utilities mixed into PIXI namespace.
 *
 * @lends PIXI
 */
module.exports = {
    // These will be mixed to be made publicly available,
    // while this module is used internally in core
    // to avoid circular dependencies and cut down on
    // internal module requires.

    Point:      require('./Point'),
    Matrix:     require('./Matrix'),

    Circle:     require('./shapes/Circle'),
    Ellipse:    require('./shapes/Ellipse'),
    Polygon:    require('./shapes/Polygon'),
    Rectangle:  require('./shapes/Rectangle'),
    RoundedRectangle: require('./shapes/RoundedRectangle')
};

},{"./Matrix":10,"./Point":11,"./shapes/Circle":13,"./shapes/Ellipse":1,"./shapes/Polygon":14,"./shapes/Rectangle":15,"./shapes/RoundedRectangle":16}],13:[function(require,module,exports){
var Rectangle = require('./Rectangle'),
    CONST = require('../../const');

/**
 * The Circle object can be used to specify a hit area for displayObjects
 *
 * @class
 * @memberof PIXI
 * @param x {number} The X coordinate of the center of this circle
 * @param y {number} The Y coordinate of the center of this circle
 * @param radius {number} The radius of the circle
 */
function Circle(x, y, radius)
{
    /**
     * @member {number}
     * @default 0
     */
    this.x = x || 0;

    /**
     * @member {number}
     * @default 0
     */
    this.y = y || 0;

    /**
     * @member {number}
     * @default 0
     */
    this.radius = radius || 0;

    /**
     * The type of the object, mainly used to avoid `instanceof` checks
     *
     * @member {number}
     */
    this.type = CONST.SHAPES.CIRC;
}

Circle.prototype.constructor = Circle;
module.exports = Circle;

/**
 * Creates a clone of this Circle instance
 *
 * @return {PIXI.Circle} a copy of the Circle
 */
Circle.prototype.clone = function ()
{
    return new Circle(this.x, this.y, this.radius);
};

/**
 * Checks whether the x and y coordinates given are contained within this circle
 *
 * @param x {number} The X coordinate of the point to test
 * @param y {number} The Y coordinate of the point to test
 * @return {boolean} Whether the x/y coordinates are within this Circle
 */
Circle.prototype.contains = function (x, y)
{
    if (this.radius <= 0)
    {
        return false;
    }

    var dx = (this.x - x),
        dy = (this.y - y),
        r2 = this.radius * this.radius;

    dx *= dx;
    dy *= dy;

    return (dx + dy <= r2);
};

/**
* Returns the framing rectangle of the circle as a Rectangle object
*
* @return {PIXI.Rectangle} the framing rectangle
*/
Circle.prototype.getBounds = function ()
{
    return new Rectangle(this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);
};

},{"../../const":4,"./Rectangle":15}],14:[function(require,module,exports){
var Point = require('../Point'),
    CONST = require('../../const');

/**
 * @class
 * @memberof PIXI
 * @param points {PIXI.Point[]|number[]|...PIXI.Point|...number} This can be an array of Points that form the polygon,
 *      a flat array of numbers that will be interpreted as [x,y, x,y, ...], or the arguments passed can be
 *      all the points of the polygon e.g. `new PIXI.Polygon(new PIXI.Point(), new PIXI.Point(), ...)`, or the
 *      arguments passed can be flat x,y values e.g. `new Polygon(x,y, x,y, x,y, ...)` where `x` and `y` are
 *      Numbers.
 */
function Polygon(points_)
{
    // prevents an argument assignment deopt
    // see section 3.1: https://github.com/petkaantonov/bluebird/wiki/Optimization-killers#3-managing-arguments
    var points = points_;

    //if points isn't an array, use arguments as the array
    if (!Array.isArray(points))
    {
        // prevents an argument leak deopt
        // see section 3.2: https://github.com/petkaantonov/bluebird/wiki/Optimization-killers#3-managing-arguments
        points = new Array(arguments.length);

        for (var a = 0; a < points.length; ++a) {
            points[a] = arguments[a];
        }
    }

    // if this is an array of points, convert it to a flat array of numbers
    if (points[0] instanceof Point)
    {
        var p = [];
        for (var i = 0, il = points.length; i < il; i++)
        {
            p.push(points[i].x, points[i].y);
        }

        points = p;
    }

    this.closed = true;

    /**
     * An array of the points of this polygon
     *
     * @member {number[]}
     */
    this.points = points;

    /**
     * The type of the object, mainly used to avoid `instanceof` checks
     *
     * @member {number}
     */
    this.type = CONST.SHAPES.POLY;
}

Polygon.prototype.constructor = Polygon;
module.exports = Polygon;

/**
 * Creates a clone of this polygon
 *
 * @return {PIXI.Polygon} a copy of the polygon
 */
Polygon.prototype.clone = function ()
{
    return new Polygon(this.points.slice());
};

/**
 * Checks whether the x and y coordinates passed to this function are contained within this polygon
 *
 * @param x {number} The X coordinate of the point to test
 * @param y {number} The Y coordinate of the point to test
 * @return {boolean} Whether the x/y coordinates are within this polygon
 */
Polygon.prototype.contains = function (x, y)
{
    var inside = false;

    // use some raycasting to test hits
    // https://github.com/substack/point-in-polygon/blob/master/index.js
    var length = this.points.length / 2;

    for (var i = 0, j = length - 1; i < length; j = i++)
    {
        var xi = this.points[i * 2], yi = this.points[i * 2 + 1],
            xj = this.points[j * 2], yj = this.points[j * 2 + 1],
            intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);

        if (intersect)
        {
            inside = !inside;
        }
    }

    return inside;
};

},{"../../const":4,"../Point":11}],15:[function(require,module,exports){
var CONST = require('../../const');

/**
 * the Rectangle object is an area defined by its position, as indicated by its top-left corner point (x, y) and by its width and its height.
 *
 * @class
 * @memberof PIXI
 * @param x {number} The X coordinate of the upper-left corner of the rectangle
 * @param y {number} The Y coordinate of the upper-left corner of the rectangle
 * @param width {number} The overall width of this rectangle
 * @param height {number} The overall height of this rectangle
 */
function Rectangle(x, y, width, height)
{
    /**
     * @member {number}
     * @default 0
     */
    this.x = x || 0;

    /**
     * @member {number}
     * @default 0
     */
    this.y = y || 0;

    /**
     * @member {number}
     * @default 0
     */
    this.width = width || 0;

    /**
     * @member {number}
     * @default 0
     */
    this.height = height || 0;

    /**
     * The type of the object, mainly used to avoid `instanceof` checks
     *
     * @member {number}
     */
    this.type = CONST.SHAPES.RECT;
}

Rectangle.prototype.constructor = Rectangle;
module.exports = Rectangle;

/**
 * A constant empty rectangle.
 *
 * @static
 * @constant
 */
Rectangle.EMPTY = new Rectangle(0, 0, 0, 0);


/**
 * Creates a clone of this Rectangle
 *
 * @return {PIXI.Rectangle} a copy of the rectangle
 */
Rectangle.prototype.clone = function ()
{
    return new Rectangle(this.x, this.y, this.width, this.height);
};

/**
 * Checks whether the x and y coordinates given are contained within this Rectangle
 *
 * @param x {number} The X coordinate of the point to test
 * @param y {number} The Y coordinate of the point to test
 * @return {boolean} Whether the x/y coordinates are within this Rectangle
 */
Rectangle.prototype.contains = function (x, y)
{
    if (this.width <= 0 || this.height <= 0)
    {
        return false;
    }

    if (x >= this.x && x < this.x + this.width)
    {
        if (y >= this.y && y < this.y + this.height)
        {
            return true;
        }
    }

    return false;
};

},{"../../const":4}],16:[function(require,module,exports){
var CONST = require('../../const');

/**
 * The Rounded Rectangle object is an area that has nice rounded corners, as indicated by its top-left corner point (x, y) and by its width and its height and its radius.
 *
 * @class
 * @memberof PIXI
 * @param x {number} The X coordinate of the upper-left corner of the rounded rectangle
 * @param y {number} The Y coordinate of the upper-left corner of the rounded rectangle
 * @param width {number} The overall width of this rounded rectangle
 * @param height {number} The overall height of this rounded rectangle
 * @param radius {number} Controls the radius of the rounded corners
 */
function RoundedRectangle(x, y, width, height, radius)
{
    /**
     * @member {number}
     * @default 0
     */
    this.x = x || 0;

    /**
     * @member {number}
     * @default 0
     */
    this.y = y || 0;

    /**
     * @member {number}
     * @default 0
     */
    this.width = width || 0;

    /**
     * @member {number}
     * @default 0
     */
    this.height = height || 0;

    /**
     * @member {number}
     * @default 20
     */
    this.radius = radius || 20;

    /**
     * The type of the object, mainly used to avoid `instanceof` checks
     *
     * @member {number}
     */
    this.type = CONST.SHAPES.RREC;
}

RoundedRectangle.prototype.constructor = RoundedRectangle;
module.exports = RoundedRectangle;

/**
 * Creates a clone of this Rounded Rectangle
 *
 * @return {PIXI.RoundedRectangle} a copy of the rounded rectangle
 */
RoundedRectangle.prototype.clone = function ()
{
    return new RoundedRectangle(this.x, this.y, this.width, this.height, this.radius);
};

/**
 * Checks whether the x and y coordinates given are contained within this Rounded Rectangle
 *
 * @param x {number} The X coordinate of the point to test
 * @param y {number} The Y coordinate of the point to test
 * @return {boolean} Whether the x/y coordinates are within this Rounded Rectangle
 */
RoundedRectangle.prototype.contains = function (x, y)
{
    if (this.width <= 0 || this.height <= 0)
    {
        return false;
    }

    if (x >= this.x && x <= this.x + this.width)
    {
        if (y >= this.y && y <= this.y + this.height)
        {
            return true;
        }
    }

    return false;
};

},{"../../const":4}],17:[function(require,module,exports){
var utils = require('../utils'),
    math = require('../math'),
    CONST = require('../const'),
    EventEmitter = require('eventemitter3');

/**
 * The CanvasRenderer draws the scene and all its content onto a 2d canvas. This renderer should be used for browsers that do not support webGL.
 * Don't forget to add the CanvasRenderer.view to your DOM or you will not see anything :)
 *
 * @class
 * @memberof PIXI
 * @param system {string} The name of the system this renderer is for.
 * @param [width=800] {number} the width of the canvas view
 * @param [height=600] {number} the height of the canvas view
 * @param [options] {object} The optional renderer parameters
 * @param [options.view] {HTMLCanvasElement} the canvas to use as a view, optional
 * @param [options.transparent=false] {boolean} If the render view is transparent, default false
 * @param [options.autoResize=false] {boolean} If the render view is automatically resized, default false
 * @param [options.antialias=false] {boolean} sets antialias (only applicable in chrome at the moment)
 * @param [options.resolution=1] {number} the resolution of the renderer retina would be 2
 * @param [options.clearBeforeRender=true] {boolean} This sets if the CanvasRenderer will clear the canvas or
 *      not before the new render pass.
 * @param [options.backgroundColor=0x000000] {number} The background color of the rendered area (shown if not transparent).
 * @param [options.roundPixels=false] {boolean} If true Pixi will Math.floor() x/y values when rendering, stopping pixel interpolation.
 */
function SystemRenderer(system, width, height, options)
{
    EventEmitter.call(this);

    utils.sayHello(system);

    // prepare options
    if (options)
    {
        for (var i in CONST.DEFAULT_RENDER_OPTIONS)
        {
            if (typeof options[i] === 'undefined')
            {
                options[i] = CONST.DEFAULT_RENDER_OPTIONS[i];
            }
        }
    }
    else
    {
        options = CONST.DEFAULT_RENDER_OPTIONS;
    }

    /**
     * The type of the renderer.
     *
     * @member {number}
     * @default PIXI.RENDERER_TYPE.UNKNOWN
     * @see PIXI.RENDERER_TYPE
     */
    this.type = CONST.RENDERER_TYPE.UNKNOWN;

    /**
     * The width of the canvas view
     *
     * @member {number}
     * @default 800
     */
    this.width = width || 800;

    /**
     * The height of the canvas view
     *
     * @member {number}
     * @default 600
     */
    this.height = height || 600;

    /**
     * The canvas element that everything is drawn to
     *
     * @member {HTMLCanvasElement}
     */
    this.view = options.view || document.createElement('canvas');

    /**
     * The resolution of the renderer
     *
     * @member {number}
     * @default 1
     */
    this.resolution = options.resolution;

    /**
     * Whether the render view is transparent
     *
     * @member {boolean}
     */
    this.transparent = options.transparent;

    /**
     * Whether the render view should be resized automatically
     *
     * @member {boolean}
     */
    this.autoResize = options.autoResize || false;

    /**
     * Tracks the blend modes useful for this renderer.
     *
     * @member {object<string, mixed>}
     */
    this.blendModes = null;

    /**
     * The value of the preserveDrawingBuffer flag affects whether or not the contents of the stencil buffer is retained after rendering.
     *
     * @member {boolean}
     */
    this.preserveDrawingBuffer = options.preserveDrawingBuffer;

    /**
     * This sets if the CanvasRenderer will clear the canvas or not before the new render pass.
     * If the scene is NOT transparent Pixi will use a canvas sized fillRect operation every frame to set the canvas background color.
     * If the scene is transparent Pixi will use clearRect to clear the canvas every frame.
     * Disable this by setting this to false. For example if your game has a canvas filling background image you often don't need this set.
     *
     * @member {boolean}
     * @default
     */
    this.clearBeforeRender = options.clearBeforeRender;

    /**
     * If true Pixi will Math.floor() x/y values when rendering, stopping pixel interpolation.
     * Handy for crisp pixel art and speed on legacy devices.
     *
     * @member {boolean}
     */
    this.roundPixels = options.roundPixels;

    /**
     * The background color as a number.
     *
     * @member {number}
     * @private
     */
    this._backgroundColor = 0x000000;

    /**
     * The background color as an [R, G, B] array.
     *
     * @member {number[]}
     * @private
     */
    this._backgroundColorRgb = [0, 0, 0];

    /**
     * The background color as a string.
     *
     * @member {string}
     * @private
     */
    this._backgroundColorString = '#000000';

    this.backgroundColor = options.backgroundColor || this._backgroundColor; // run bg color setter

    /**
     * This temporary display object used as the parent of the currently being rendered item
     *
     * @member {PIXI.DisplayObject}
     * @private
     */
    this._tempDisplayObjectParent = {worldTransform:new math.Matrix(), worldAlpha:1, children:[]};

    /**
     * The last root object that the renderer tried to render.
     *
     * @member {PIXI.DisplayObject}
     * @private
     */
    this._lastObjectRendered = this._tempDisplayObjectParent;
}

// constructor
SystemRenderer.prototype = Object.create(EventEmitter.prototype);
SystemRenderer.prototype.constructor = SystemRenderer;
module.exports = SystemRenderer;

Object.defineProperties(SystemRenderer.prototype, {
    /**
     * The background color to fill if not transparent
     *
     * @member {number}
     * @memberof PIXI.SystemRenderer#
     */
    backgroundColor:
    {
        get: function ()
        {
            return this._backgroundColor;
        },
        set: function (val)
        {
            this._backgroundColor = val;
            this._backgroundColorString = utils.hex2string(val);
            utils.hex2rgb(val, this._backgroundColorRgb);
        }
    }
});

/**
 * Resizes the canvas view to the specified width and height
 *
 * @param width {number} the new width of the canvas view
 * @param height {number} the new height of the canvas view
 */
SystemRenderer.prototype.resize = function (width, height) {
    this.width = width * this.resolution;
    this.height = height * this.resolution;

    this.view.width = this.width;
    this.view.height = this.height;

    if (this.autoResize)
    {
        this.view.style.width = this.width / this.resolution + 'px';
        this.view.style.height = this.height / this.resolution + 'px';
    }
};

/**
 * Removes everything from the renderer and optionally removes the Canvas DOM element.
 *
 * @param [removeView=false] {boolean} Removes the Canvas element from the DOM.
 */
SystemRenderer.prototype.destroy = function (removeView) {
    if (removeView && this.view.parentNode)
    {
        this.view.parentNode.removeChild(this.view);
    }

    this.type = CONST.RENDERER_TYPE.UNKNOWN;

    this.width = 0;
    this.height = 0;

    this.view = null;

    this.resolution = 0;

    this.transparent = false;

    this.autoResize = false;

    this.blendModes = null;

    this.preserveDrawingBuffer = false;
    this.clearBeforeRender = false;

    this.roundPixels = false;

    this._backgroundColor = 0;
    this._backgroundColorRgb = null;
    this._backgroundColorString = null;
};

},{"../const":4,"../math":12,"../utils":29,"eventemitter3":2}],18:[function(require,module,exports){
var SystemRenderer = require('../SystemRenderer'),
    CanvasMaskManager = require('./utils/CanvasMaskManager'),
    utils = require('../../utils'),
    math = require('../../math'),
    CONST = require('../../const');

/**
 * The CanvasRenderer draws the scene and all its content onto a 2d canvas. This renderer should be used for browsers that do not support webGL.
 * Don't forget to add the CanvasRenderer.view to your DOM or you will not see anything :)
 *
 * @class
 * @memberof PIXI
 * @extends PIXI.SystemRenderer
 * @param [width=800] {number} the width of the canvas view
 * @param [height=600] {number} the height of the canvas view
 * @param [options] {object} The optional renderer parameters
 * @param [options.view] {HTMLCanvasElement} the canvas to use as a view, optional
 * @param [options.transparent=false] {boolean} If the render view is transparent, default false
 * @param [options.autoResize=false] {boolean} If the render view is automatically resized, default false
 * @param [options.antialias=false] {boolean} sets antialias (only applicable in chrome at the moment)
 * @param [options.resolution=1] {number} the resolution of the renderer retina would be 2
 * @param [options.clearBeforeRender=true] {boolean} This sets if the CanvasRenderer will clear the canvas or
 *      not before the new render pass.
 * @param [options.roundPixels=false] {boolean} If true Pixi will Math.floor() x/y values when rendering, stopping pixel interpolation.
 */
function CanvasRenderer(width, height, options)
{
    options = options || {};

    SystemRenderer.call(this, 'Canvas', width, height, options);

    this.type = CONST.RENDERER_TYPE.CANVAS;

    /**
     * The canvas 2d context that everything is drawn with.
     *
     * @member {CanvasRenderingContext2D}
     */
    this.context = this.view.getContext('2d', { alpha: this.transparent });

    /**
     * Boolean flag controlling canvas refresh.
     *
     * @member {boolean}
     */
    this.refresh = true;

    /**
     * Instance of a CanvasMaskManager, handles masking when using the canvas renderer.
     *
     * @member {PIXI.CanvasMaskManager}
     */
    this.maskManager = new CanvasMaskManager();

    /**
     * The canvas property used to set the canvas smoothing property.
     *
     * @member {string}
     */
    this.smoothProperty = 'imageSmoothingEnabled';

    if (!this.context.imageSmoothingEnabled)
    {
        if (this.context.webkitImageSmoothingEnabled)
        {
            this.smoothProperty = 'webkitImageSmoothingEnabled';
        }
        else if (this.context.mozImageSmoothingEnabled)
        {
            this.smoothProperty = 'mozImageSmoothingEnabled';
        }
        else if (this.context.oImageSmoothingEnabled)
        {
            this.smoothProperty = 'oImageSmoothingEnabled';
        }
        else if (this.context.msImageSmoothingEnabled)
        {
            this.smoothProperty = 'msImageSmoothingEnabled';
        }
    }

    this.initPlugins();

    this._mapBlendModes();

    /**
     * This temporary display object used as the parent of the currently being rendered item
     *
     * @member {PIXI.DisplayObject}
     * @private
     */
    this._tempDisplayObjectParent = {
        worldTransform: new math.Matrix(),
        worldAlpha: 1
    };


    this.resize(width, height);
}

// constructor
CanvasRenderer.prototype = Object.create(SystemRenderer.prototype);
CanvasRenderer.prototype.constructor = CanvasRenderer;
module.exports = CanvasRenderer;
utils.pluginTarget.mixin(CanvasRenderer);

/**
 * Renders the object to this canvas view
 *
 * @param object {PIXI.DisplayObject} the object to be rendered
 */
CanvasRenderer.prototype.render = function (object)
{
    var cacheParent = object.parent;

    this._lastObjectRendered = object;

    object.parent = this._tempDisplayObjectParent;

    // update the scene graph
    object.updateTransform();

    object.parent = cacheParent;

    this.context.setTransform(1, 0, 0, 1, 0, 0);

    this.context.globalAlpha = 1;

    this.context.globalCompositeOperation = this.blendModes[CONST.BLEND_MODES.NORMAL];

    if (navigator.isCocoonJS && this.view.screencanvas)
    {
        this.context.fillStyle = 'black';
        this.context.clear();
    }

    if (this.clearBeforeRender)
    {
        if (this.transparent)
        {
            this.context.clearRect(0, 0, this.width, this.height);
        }
        else
        {
            this.context.fillStyle = this._backgroundColorString;
            this.context.fillRect(0, 0, this.width , this.height);
        }
    }

    this.renderDisplayObject(object, this.context);
};

/**
 * Removes everything from the renderer and optionally removes the Canvas DOM element.
 *
 * @param [removeView=false] {boolean} Removes the Canvas element from the DOM.
 */
CanvasRenderer.prototype.destroy = function (removeView)
{
    this.destroyPlugins();

    // call the base destroy
    SystemRenderer.prototype.destroy.call(this, removeView);

    this.context = null;

    this.refresh = true;

    this.maskManager.destroy();
    this.maskManager = null;

    this.smoothProperty = null;
};

/**
 * Renders a display object
 *
 * @param displayObject {PIXI.DisplayObject} The displayObject to render
 * @private
 */
CanvasRenderer.prototype.renderDisplayObject = function (displayObject, context)
{
    var tempContext = this.context;

    this.context = context;
    displayObject.renderCanvas(this);
    this.context = tempContext;
};

/**
 * @extends PIXI.SystemRenderer#resize
 *
 * @param {number} w
 * @param {number} h
 */
CanvasRenderer.prototype.resize = function (w, h)
{
    SystemRenderer.prototype.resize.call(this, w, h);

    //reset the scale mode.. oddly this seems to be reset when the canvas is resized.
    //surely a browser bug?? Let pixi fix that for you..
    if(this.smoothProperty)
    {
        this.context[this.smoothProperty] = (CONST.SCALE_MODES.DEFAULT === CONST.SCALE_MODES.LINEAR);
    }

};

/**
 * Maps Pixi blend modes to canvas blend modes.
 *
 * @private
 */
CanvasRenderer.prototype._mapBlendModes = function ()
{
    if (!this.blendModes)
    {
        this.blendModes = {};

        if (utils.canUseNewCanvasBlendModes())
        {
            this.blendModes[CONST.BLEND_MODES.NORMAL]        = 'source-over';
            this.blendModes[CONST.BLEND_MODES.ADD]           = 'lighter'; //IS THIS OK???
            this.blendModes[CONST.BLEND_MODES.MULTIPLY]      = 'multiply';
            this.blendModes[CONST.BLEND_MODES.SCREEN]        = 'screen';
            this.blendModes[CONST.BLEND_MODES.OVERLAY]       = 'overlay';
            this.blendModes[CONST.BLEND_MODES.DARKEN]        = 'darken';
            this.blendModes[CONST.BLEND_MODES.LIGHTEN]       = 'lighten';
            this.blendModes[CONST.BLEND_MODES.COLOR_DODGE]   = 'color-dodge';
            this.blendModes[CONST.BLEND_MODES.COLOR_BURN]    = 'color-burn';
            this.blendModes[CONST.BLEND_MODES.HARD_LIGHT]    = 'hard-light';
            this.blendModes[CONST.BLEND_MODES.SOFT_LIGHT]    = 'soft-light';
            this.blendModes[CONST.BLEND_MODES.DIFFERENCE]    = 'difference';
            this.blendModes[CONST.BLEND_MODES.EXCLUSION]     = 'exclusion';
            this.blendModes[CONST.BLEND_MODES.HUE]           = 'hue';
            this.blendModes[CONST.BLEND_MODES.SATURATION]    = 'saturate';
            this.blendModes[CONST.BLEND_MODES.COLOR]         = 'color';
            this.blendModes[CONST.BLEND_MODES.LUMINOSITY]    = 'luminosity';
        }
        else
        {
            // this means that the browser does not support the cool new blend modes in canvas 'cough' ie 'cough'
            this.blendModes[CONST.BLEND_MODES.NORMAL]        = 'source-over';
            this.blendModes[CONST.BLEND_MODES.ADD]           = 'lighter'; //IS THIS OK???
            this.blendModes[CONST.BLEND_MODES.MULTIPLY]      = 'source-over';
            this.blendModes[CONST.BLEND_MODES.SCREEN]        = 'source-over';
            this.blendModes[CONST.BLEND_MODES.OVERLAY]       = 'source-over';
            this.blendModes[CONST.BLEND_MODES.DARKEN]        = 'source-over';
            this.blendModes[CONST.BLEND_MODES.LIGHTEN]       = 'source-over';
            this.blendModes[CONST.BLEND_MODES.COLOR_DODGE]   = 'source-over';
            this.blendModes[CONST.BLEND_MODES.COLOR_BURN]    = 'source-over';
            this.blendModes[CONST.BLEND_MODES.HARD_LIGHT]    = 'source-over';
            this.blendModes[CONST.BLEND_MODES.SOFT_LIGHT]    = 'source-over';
            this.blendModes[CONST.BLEND_MODES.DIFFERENCE]    = 'source-over';
            this.blendModes[CONST.BLEND_MODES.EXCLUSION]     = 'source-over';
            this.blendModes[CONST.BLEND_MODES.HUE]           = 'source-over';
            this.blendModes[CONST.BLEND_MODES.SATURATION]    = 'source-over';
            this.blendModes[CONST.BLEND_MODES.COLOR]         = 'source-over';
            this.blendModes[CONST.BLEND_MODES.LUMINOSITY]    = 'source-over';
        }
    }
};

},{"../../const":4,"../../math":12,"../../utils":29,"../SystemRenderer":17,"./utils/CanvasMaskManager":20}],19:[function(require,module,exports){
var CONST = require('../../../const');

/**
 * A set of functions used by the canvas renderer to draw the primitive graphics data.
 * @static
 * @class
 * @memberof PIXI
 */
var CanvasGraphics = {};
module.exports = CanvasGraphics;

/*
 * Renders a Graphics object to a canvas.
 *
 * @param graphics {PIXI.Graphics} the actual graphics object to render
 * @param context {CanvasRenderingContext2D} the 2d drawing method of the canvas
 */
CanvasGraphics.renderGraphics = function (graphics, context)
{
    var worldAlpha = graphics.worldAlpha;

    if (graphics.dirty)
    {
        this.updateGraphicsTint(graphics);
        graphics.dirty = false;
    }

    for (var i = 0; i < graphics.graphicsData.length; i++)
    {
        var data = graphics.graphicsData[i];
        var shape = data.shape;

        var fillColor = data._fillTint;
        var lineColor = data._lineTint;

        context.lineWidth = data.lineWidth;

        if (data.type === CONST.SHAPES.POLY)
        {
            context.beginPath();

            var points = shape.points;

            context.moveTo(points[0], points[1]);

            for (var j=1; j < points.length/2; j++)
            {
                context.lineTo(points[j * 2], points[j * 2 + 1]);
            }

            if (shape.closed)
            {
                context.lineTo(points[0], points[1]);
            }

            // if the first and last point are the same close the path - much neater :)
            if (points[0] === points[points.length-2] && points[1] === points[points.length-1])
            {
                context.closePath();
            }

            if (data.fill)
            {
                context.globalAlpha = data.fillAlpha * worldAlpha;
                context.fillStyle = '#' + ('00000' + ( fillColor | 0).toString(16)).substr(-6);
                context.fill();
            }
            if (data.lineWidth)
            {
                context.globalAlpha = data.lineAlpha * worldAlpha;
                context.strokeStyle = '#' + ('00000' + ( lineColor | 0).toString(16)).substr(-6);
                context.stroke();
            }
        }
        else if (data.type === CONST.SHAPES.RECT)
        {

            if (data.fillColor || data.fillColor === 0)
            {
                context.globalAlpha = data.fillAlpha * worldAlpha;
                context.fillStyle = '#' + ('00000' + ( fillColor | 0).toString(16)).substr(-6);
                context.fillRect(shape.x, shape.y, shape.width, shape.height);

            }
            if (data.lineWidth)
            {
                context.globalAlpha = data.lineAlpha * worldAlpha;
                context.strokeStyle = '#' + ('00000' + ( lineColor | 0).toString(16)).substr(-6);
                context.strokeRect(shape.x, shape.y, shape.width, shape.height);
            }
        }
        else if (data.type === CONST.SHAPES.CIRC)
        {
            // TODO - need to be Undefined!
            context.beginPath();
            context.arc(shape.x, shape.y, shape.radius,0,2*Math.PI);
            context.closePath();

            if (data.fill)
            {
                context.globalAlpha = data.fillAlpha * worldAlpha;
                context.fillStyle = '#' + ('00000' + ( fillColor | 0).toString(16)).substr(-6);
                context.fill();
            }
            if (data.lineWidth)
            {
                context.globalAlpha = data.lineAlpha * worldAlpha;
                context.strokeStyle = '#' + ('00000' + ( lineColor | 0).toString(16)).substr(-6);
                context.stroke();
            }
        }
        else if (data.type === CONST.SHAPES.ELIP)
        {
            // ellipse code taken from: http://stackoverflow.com/questions/2172798/how-to-draw-an-oval-in-html5-canvas

            var w = shape.width * 2;
            var h = shape.height * 2;

            var x = shape.x - w/2;
            var y = shape.y - h/2;

            context.beginPath();

            var kappa = 0.5522848,
                ox = (w / 2) * kappa, // control point offset horizontal
                oy = (h / 2) * kappa, // control point offset vertical
                xe = x + w,           // x-end
                ye = y + h,           // y-end
                xm = x + w / 2,       // x-middle
                ym = y + h / 2;       // y-middle

            context.moveTo(x, ym);
            context.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
            context.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
            context.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
            context.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);

            context.closePath();

            if (data.fill)
            {
                context.globalAlpha = data.fillAlpha * worldAlpha;
                context.fillStyle = '#' + ('00000' + ( fillColor | 0).toString(16)).substr(-6);
                context.fill();
            }
            if (data.lineWidth)
            {
                context.globalAlpha = data.lineAlpha * worldAlpha;
                context.strokeStyle = '#' + ('00000' + ( lineColor | 0).toString(16)).substr(-6);
                context.stroke();
            }
        }
        else if (data.type === CONST.SHAPES.RREC)
        {
            var rx = shape.x;
            var ry = shape.y;
            var width = shape.width;
            var height = shape.height;
            var radius = shape.radius;

            var maxRadius = Math.min(width, height) / 2 | 0;
            radius = radius > maxRadius ? maxRadius : radius;

            context.beginPath();
            context.moveTo(rx, ry + radius);
            context.lineTo(rx, ry + height - radius);
            context.quadraticCurveTo(rx, ry + height, rx + radius, ry + height);
            context.lineTo(rx + width - radius, ry + height);
            context.quadraticCurveTo(rx + width, ry + height, rx + width, ry + height - radius);
            context.lineTo(rx + width, ry + radius);
            context.quadraticCurveTo(rx + width, ry, rx + width - radius, ry);
            context.lineTo(rx + radius, ry);
            context.quadraticCurveTo(rx, ry, rx, ry + radius);
            context.closePath();

            if (data.fillColor || data.fillColor === 0)
            {
                context.globalAlpha = data.fillAlpha * worldAlpha;
                context.fillStyle = '#' + ('00000' + ( fillColor | 0).toString(16)).substr(-6);
                context.fill();

            }
            if (data.lineWidth)
            {
                context.globalAlpha = data.lineAlpha * worldAlpha;
                context.strokeStyle = '#' + ('00000' + ( lineColor | 0).toString(16)).substr(-6);
                context.stroke();
            }
        }
    }
};

/*
 * Renders a graphics mask
 *
 * @private
 * @param graphics {PIXI.Graphics} the graphics which will be used as a mask
 * @param context {CanvasRenderingContext2D} the context 2d method of the canvas
 */
CanvasGraphics.renderGraphicsMask = function (graphics, context)
{
    var len = graphics.graphicsData.length;

    if (len === 0)
    {
        return;
    }

    context.beginPath();

    for (var i = 0; i < len; i++)
    {
        var data = graphics.graphicsData[i];
        var shape = data.shape;

        if (data.type === CONST.SHAPES.POLY)
        {

            var points = shape.points;

            context.moveTo(points[0], points[1]);

            for (var j=1; j < points.length/2; j++)
            {
                context.lineTo(points[j * 2], points[j * 2 + 1]);
            }

            // if the first and last point are the same close the path - much neater :)
            if (points[0] === points[points.length-2] && points[1] === points[points.length-1])
            {
                context.closePath();
            }

        }
        else if (data.type === CONST.SHAPES.RECT)
        {
            context.rect(shape.x, shape.y, shape.width, shape.height);
            context.closePath();
        }
        else if (data.type === CONST.SHAPES.CIRC)
        {
            // TODO - need to be Undefined!
            context.arc(shape.x, shape.y, shape.radius, 0, 2 * Math.PI);
            context.closePath();
        }
        else if (data.type === CONST.SHAPES.ELIP)
        {

            // ellipse code taken from: http://stackoverflow.com/questions/2172798/how-to-draw-an-oval-in-html5-canvas

            var w = shape.width * 2;
            var h = shape.height * 2;

            var x = shape.x - w/2;
            var y = shape.y - h/2;

            var kappa = 0.5522848,
                ox = (w / 2) * kappa, // control point offset horizontal
                oy = (h / 2) * kappa, // control point offset vertical
                xe = x + w,           // x-end
                ye = y + h,           // y-end
                xm = x + w / 2,       // x-middle
                ym = y + h / 2;       // y-middle

            context.moveTo(x, ym);
            context.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
            context.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
            context.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
            context.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
            context.closePath();
        }
        else if (data.type === CONST.SHAPES.RREC)
        {

            var rx = shape.x;
            var ry = shape.y;
            var width = shape.width;
            var height = shape.height;
            var radius = shape.radius;

            var maxRadius = Math.min(width, height) / 2 | 0;
            radius = radius > maxRadius ? maxRadius : radius;

            context.moveTo(rx, ry + radius);
            context.lineTo(rx, ry + height - radius);
            context.quadraticCurveTo(rx, ry + height, rx + radius, ry + height);
            context.lineTo(rx + width - radius, ry + height);
            context.quadraticCurveTo(rx + width, ry + height, rx + width, ry + height - radius);
            context.lineTo(rx + width, ry + radius);
            context.quadraticCurveTo(rx + width, ry, rx + width - radius, ry);
            context.lineTo(rx + radius, ry);
            context.quadraticCurveTo(rx, ry, rx, ry + radius);
            context.closePath();
        }
    }
};

/*
 * Updates the tint of a graphics object
 *
 * @private
 * @param graphics {PIXI.Graphics} the graphics that will have its tint updated
 *
 */
CanvasGraphics.updateGraphicsTint = function (graphics)
{
    if (graphics.tint === 0xFFFFFF && graphics._prevTint === graphics.tint)
    {
        return;
    }
    graphics._prevTint = graphics.tint;

    var tintR = (graphics.tint >> 16 & 0xFF) / 255;
    var tintG = (graphics.tint >> 8 & 0xFF) / 255;
    var tintB = (graphics.tint & 0xFF)/ 255;

    for (var i = 0; i < graphics.graphicsData.length; i++)
    {
        var data = graphics.graphicsData[i];

        var fillColor = data.fillColor | 0;
        var lineColor = data.lineColor | 0;

        /*
        var colorR = (fillColor >> 16 & 0xFF) / 255;
        var colorG = (fillColor >> 8 & 0xFF) / 255;
        var colorB = (fillColor & 0xFF) / 255;

        colorR *= tintR;
        colorG *= tintG;
        colorB *= tintB;

        fillColor = ((colorR*255 << 16) + (colorG*255 << 8) + colorB*255);

        colorR = (lineColor >> 16 & 0xFF) / 255;
        colorG = (lineColor >> 8 & 0xFF) / 255;
        colorB = (lineColor & 0xFF) / 255;

        colorR *= tintR;
        colorG *= tintG;
        colorB *= tintB;

        lineColor = ((colorR*255 << 16) + (colorG*255 << 8) + colorB*255);
        */

        // super inline cos im an optimization NAZI :)
        data._fillTint = (((fillColor >> 16 & 0xFF) / 255 * tintR*255 << 16) + ((fillColor >> 8 & 0xFF) / 255 * tintG*255 << 8) +  (fillColor & 0xFF) / 255 * tintB*255);
        data._lineTint = (((lineColor >> 16 & 0xFF) / 255 * tintR*255 << 16) + ((lineColor >> 8 & 0xFF) / 255 * tintG*255 << 8) +  (lineColor & 0xFF) / 255 * tintB*255);

    }
};


},{"../../../const":4}],20:[function(require,module,exports){
var CanvasGraphics = require('./CanvasGraphics');

/**
 * A set of functions used to handle masking.
 *
 * @class
 * @memberof PIXI
 */
function CanvasMaskManager()
{}

CanvasMaskManager.prototype.constructor = CanvasMaskManager;
module.exports = CanvasMaskManager;

/**
 * This method adds it to the current stack of masks.
 *
 * @param maskData {object} the maskData that will be pushed
 * @param renderer {PIXI.WebGLRenderer|PIXI.CanvasRenderer} The renderer context to use.
 */
CanvasMaskManager.prototype.pushMask = function (maskData, renderer)
{

    renderer.context.save();

    var cacheAlpha = maskData.alpha;
    var transform = maskData.worldTransform;
    var resolution = renderer.resolution;

    renderer.context.setTransform(
        transform.a * resolution,
        transform.b * resolution,
        transform.c * resolution,
        transform.d * resolution,
        transform.tx * resolution,
        transform.ty * resolution
    );

    //TODO suport sprite alpha masks??
    //lots of effort required. If demand is great enough..
    if(!maskData.texture)
    {
        CanvasGraphics.renderGraphicsMask(maskData, renderer.context);
        renderer.context.clip();
    }

    maskData.worldAlpha = cacheAlpha;
};

/**
 * Restores the current drawing context to the state it was before the mask was applied.
 *
 * @param renderer {PIXI.WebGLRenderer|PIXI.CanvasRenderer} The renderer context to use.
 */
CanvasMaskManager.prototype.popMask = function (renderer)
{
    renderer.context.restore();
};

CanvasMaskManager.prototype.destroy = function () {};

},{"./CanvasGraphics":19}],21:[function(require,module,exports){
var math = require('../math'),
    Texture = require('../textures/Texture'),
    Container = require('../display/Container'),
    CanvasTinter = require('../renderers/canvas/utils/CanvasTinter'),
    utils = require('../utils'),
    CONST = require('../const'),
    tempPoint = new math.Point();

/**
 * The Sprite object is the base for all textured objects that are rendered to the screen
 *
 * A sprite can be created directly from an image like this:
 *
 * ```js
 * var sprite = new PIXI.Sprite.fromImage('assets/image.png');
 * ```
 *
 * @class
 * @extends PIXI.Container
 * @memberof PIXI
 * @param texture {PIXI.Texture} The texture for this sprite
 */
function Sprite(texture)
{
    Container.call(this);

    /**
     * The anchor sets the origin point of the texture.
     * The default is 0,0 this means the texture's origin is the top left
     * Setting the anchor to 0.5,0.5 means the texture's origin is centered
     * Setting the anchor to 1,1 would mean the texture's origin point will be the bottom right corner
     *
     * @member {PIXI.Point}
     */
    this.anchor = new math.Point();

    /**
     * The texture that the sprite is using
     *
     * @member {PIXI.Texture}
     * @private
     */
    this._texture = null;

    /**
     * The width of the sprite (this is initially set by the texture)
     *
     * @member {number}
     * @private
     */
    this._width = 0;

    /**
     * The height of the sprite (this is initially set by the texture)
     *
     * @member {number}
     * @private
     */
    this._height = 0;

    /**
     * The tint applied to the sprite. This is a hex value. A value of 0xFFFFFF will remove any tint effect.
     *
     * @member {number}
     * @default 0xFFFFFF
     */
    this.tint = 0xFFFFFF;

    /**
     * The blend mode to be applied to the sprite. Apply a value of `PIXI.BLEND_MODES.NORMAL` to reset the blend mode.
     *
     * @member {number}
     * @default PIXI.BLEND_MODES.NORMAL
     * @see PIXI.BLEND_MODES
     */
    this.blendMode = CONST.BLEND_MODES.NORMAL;

    /**
     * The shader that will be used to render the sprite. Set to null to remove a current shader.
     *
     * @member {PIXI.AbstractFilter|PIXI.Shader}
     */
    this.shader = null;

    /**
     * An internal cached value of the tint.
     *
     * @member {number}
     * @default 0xFFFFFF
     */
    this.cachedTint = 0xFFFFFF;

    // call texture setter
    this.texture = texture || Texture.EMPTY;
}

// constructor
Sprite.prototype = Object.create(Container.prototype);
Sprite.prototype.constructor = Sprite;
module.exports = Sprite;

Object.defineProperties(Sprite.prototype, {
    /**
     * The width of the sprite, setting this will actually modify the scale to achieve the value set
     *
     * @member {number}
     * @memberof PIXI.Sprite#
     */
    width: {
        get: function ()
        {
            return Math.abs(this.scale.x) * this.texture._frame.width;
        },
        set: function (value)
        {
            this.scale.x = utils.sign(this.scale.x) * value / this.texture._frame.width;
            this._width = value;
        }
    },

    /**
     * The height of the sprite, setting this will actually modify the scale to achieve the value set
     *
     * @member {number}
     * @memberof PIXI.Sprite#
     */
    height: {
        get: function ()
        {
            return  Math.abs(this.scale.y) * this.texture._frame.height;
        },
        set: function (value)
        {
            this.scale.y = utils.sign(this.scale.y) * value / this.texture._frame.height;
            this._height = value;
        }
    },

    /**
     * The texture that the sprite is using
     *
     * @member {PIXI.Texture}
     * @memberof PIXI.Sprite#
     */
    texture: {
        get: function ()
        {
            return  this._texture;
        },
        set: function (value)
        {
            if (this._texture === value)
            {
                return;
            }

            this._texture = value;
            this.cachedTint = 0xFFFFFF;

            if (value)
            {
                // wait for the texture to load
                if (value.baseTexture.hasLoaded)
                {
                    this._onTextureUpdate();
                }
                else
                {
                    value.once('update', this._onTextureUpdate, this);
                }
            }
        }
    }
});

/**
 * When the texture is updated, this event will fire to update the scale and frame
 *
 * @private
 */
Sprite.prototype._onTextureUpdate = function ()
{
    // so if _width is 0 then width was not set..
    if (this._width)
    {
        this.scale.x = utils.sign(this.scale.x) * this._width / this.texture.frame.width;
    }

    if (this._height)
    {
        this.scale.y = utils.sign(this.scale.y) * this._height / this.texture.frame.height;
    }
};

/**
*
* Renders the object using the WebGL renderer
*
* @param renderer {PIXI.WebGLRenderer}
* @private
*/
Sprite.prototype._renderWebGL = function (renderer)
{
    renderer.setObjectRenderer(renderer.plugins.sprite);
    renderer.plugins.sprite.render(this);
};

/**
 * Returns the bounds of the Sprite as a rectangle. The bounds calculation takes the worldTransform into account.
 *
 * @param matrix {PIXI.Matrix} the transformation matrix of the sprite
 * @return {PIXI.Rectangle} the framing rectangle
 */
Sprite.prototype.getBounds = function (matrix)
{
    if(!this._currentBounds)
    {

        var width = this._texture._frame.width;
        var height = this._texture._frame.height;

        var w0 = width * (1-this.anchor.x);
        var w1 = width * -this.anchor.x;

        var h0 = height * (1-this.anchor.y);
        var h1 = height * -this.anchor.y;

        var worldTransform = matrix || this.worldTransform ;

        var a = worldTransform.a;
        var b = worldTransform.b;
        var c = worldTransform.c;
        var d = worldTransform.d;
        var tx = worldTransform.tx;
        var ty = worldTransform.ty;

        var minX,
            maxX,
            minY,
            maxY;


        if (b === 0 && c === 0)
        {
            // scale may be negative!
            if (a < 0)
            {
                a *= -1;
            }

            if (d < 0)
            {
                d *= -1;
            }

            // this means there is no rotation going on right? RIGHT?
            // if thats the case then we can avoid checking the bound values! yay
            minX = a * w1 + tx;
            maxX = a * w0 + tx;
            minY = d * h1 + ty;
            maxY = d * h0 + ty;
        }
        else
        {
            var x1 = a * w1 + c * h1 + tx;
            var y1 = d * h1 + b * w1 + ty;

            var x2 = a * w0 + c * h1 + tx;
            var y2 = d * h1 + b * w0 + ty;

            var x3 = a * w0 + c * h0 + tx;
            var y3 = d * h0 + b * w0 + ty;

            var x4 =  a * w1 + c * h0 + tx;
            var y4 =  d * h0 + b * w1 + ty;

            minX = x1;
            minX = x2 < minX ? x2 : minX;
            minX = x3 < minX ? x3 : minX;
            minX = x4 < minX ? x4 : minX;

            minY = y1;
            minY = y2 < minY ? y2 : minY;
            minY = y3 < minY ? y3 : minY;
            minY = y4 < minY ? y4 : minY;

            maxX = x1;
            maxX = x2 > maxX ? x2 : maxX;
            maxX = x3 > maxX ? x3 : maxX;
            maxX = x4 > maxX ? x4 : maxX;

            maxY = y1;
            maxY = y2 > maxY ? y2 : maxY;
            maxY = y3 > maxY ? y3 : maxY;
            maxY = y4 > maxY ? y4 : maxY;
        }

        // check for children
        if(this.children.length)
        {
            var childBounds = this.containerGetBounds();

            w0 = childBounds.x;
            w1 = childBounds.x + childBounds.width;
            h0 = childBounds.y;
            h1 = childBounds.y + childBounds.height;

            minX = (minX < w0) ? minX : w0;
            minY = (minY < h0) ? minY : h0;

            maxX = (maxX > w1) ? maxX : w1;
            maxY = (maxY > h1) ? maxY : h1;
        }

        var bounds = this._bounds;

        bounds.x = minX;
        bounds.width = maxX - minX;

        bounds.y = minY;
        bounds.height = maxY - minY;

        // store a reference so that if this function gets called again in the render cycle we do not have to recalculate
        this._currentBounds = bounds;
    }

    return this._currentBounds;
};

/**
 * Gets the local bounds of the sprite object.
 *
 */
Sprite.prototype.getLocalBounds = function ()
{
    this._bounds.x = -this._texture._frame.width * this.anchor.x;
    this._bounds.y = -this._texture._frame.height * this.anchor.y;
    this._bounds.width = this._texture._frame.width;
    this._bounds.height = this._texture._frame.height;
    return this._bounds;
};

/**
* Tests if a point is inside this sprite
*
* @param point {PIXI.Point} the point to test
* @return {boolean} the result of the test
*/
Sprite.prototype.containsPoint = function( point )
{
    this.worldTransform.applyInverse(point,  tempPoint);

    var width = this._texture._frame.width;
    var height = this._texture._frame.height;
    var x1 = -width * this.anchor.x;
    var y1;

    if ( tempPoint.x > x1 && tempPoint.x < x1 + width )
    {
        y1 = -height * this.anchor.y;

        if ( tempPoint.y > y1 && tempPoint.y < y1 + height )
        {
            return true;
        }
    }

    return false;
};

/**
* Renders the object using the Canvas renderer
*
* @param renderer {PIXI.CanvasRenderer} The renderer
* @private
*/
Sprite.prototype._renderCanvas = function (renderer)
{
    if (this.texture.crop.width <= 0 || this.texture.crop.height <= 0)
    {
        return;
    }

    var compositeOperation = renderer.blendModes[this.blendMode];
    if (compositeOperation !== renderer.context.globalCompositeOperation)
    {
        renderer.context.globalCompositeOperation = compositeOperation;
    }

    //  Ignore null sources
    if (this.texture.valid)
    {
        var texture = this._texture,
            wt = this.worldTransform,
            dx,
            dy,
            width,
            height;

        renderer.context.globalAlpha = this.worldAlpha;

        // If smoothingEnabled is supported and we need to change the smoothing property for this texture
        var smoothingEnabled = texture.baseTexture.scaleMode === CONST.SCALE_MODES.LINEAR;
        if (renderer.smoothProperty && renderer.context[renderer.smoothProperty] !== smoothingEnabled)
        {
            renderer.context[renderer.smoothProperty] = smoothingEnabled;
        }

        // If the texture is trimmed we offset by the trim x/y, otherwise we use the frame dimensions

        if(texture.rotate)
        {

            // cheeky rotation!
            var a = wt.a;
            var b = wt.b;

            wt.a  = -wt.c;
            wt.b  = -wt.d;
            wt.c  =  a;
            wt.d  =  b;

            width = texture.crop.height;
            height = texture.crop.width;

            dx = (texture.trim) ? texture.trim.y - this.anchor.y * texture.trim.height : this.anchor.y * -texture._frame.height;
            dy = (texture.trim) ? texture.trim.x - this.anchor.x * texture.trim.width : this.anchor.x * -texture._frame.width;
        }
        else
        {
            width = texture.crop.width;
            height = texture.crop.height;

            dx = (texture.trim) ? texture.trim.x - this.anchor.x * texture.trim.width : this.anchor.x * -texture._frame.width;
            dy = (texture.trim) ? texture.trim.y - this.anchor.y * texture.trim.height : this.anchor.y * -texture._frame.height;
        }



        // Allow for pixel rounding
        if (renderer.roundPixels)
        {
            renderer.context.setTransform(
                wt.a,
                wt.b,
                wt.c,
                wt.d,
                (wt.tx * renderer.resolution) | 0,
                (wt.ty * renderer.resolution) | 0
            );

            dx = dx | 0;
            dy = dy | 0;
        }
        else
        {

            renderer.context.setTransform(
                wt.a,
                wt.b,
                wt.c,
                wt.d,
                wt.tx * renderer.resolution,
                wt.ty * renderer.resolution
            );


        }

        var resolution = texture.baseTexture.resolution;

        if (this.tint !== 0xFFFFFF)
        {
            if (this.cachedTint !== this.tint)
            {
                this.cachedTint = this.tint;

                // TODO clean up caching - how to clean up the caches?
                this.tintedTexture = CanvasTinter.getTintedTexture(this, this.tint);
            }

            renderer.context.drawImage(
                this.tintedTexture,
                0,
                0,
                width * resolution,
                height * resolution,
                dx * renderer.resolution,
                dy * renderer.resolution,
                width * renderer.resolution,
                height * renderer.resolution
            );
        }
        else
        {
            renderer.context.drawImage(
                texture.baseTexture.source,
                texture.crop.x * resolution,
                texture.crop.y * resolution,
                width * resolution,
                height * resolution,
                dx  * renderer.resolution,
                dy  * renderer.resolution,
                width * renderer.resolution,
                height * renderer.resolution
            );
        }
    }
};

/**
 * Destroys this sprite and optionally its texture
 *
 * @param [destroyTexture=false] {boolean} Should it destroy the current texture of the sprite as well
 * @param [destroyBaseTexture=false] {boolean} Should it destroy the base texture of the sprite as well
 */
Sprite.prototype.destroy = function (destroyTexture, destroyBaseTexture)
{
    Container.prototype.destroy.call(this);

    this.anchor = null;

    if (destroyTexture)
    {
        this._texture.destroy(destroyBaseTexture);
    }

    this._texture = null;
    this.shader = null;
};

// some helper functions..

/**
 * Helper function that creates a sprite that will contain a texture from the TextureCache based on the frameId
 * The frame ids are created when a Texture packer file has been loaded
 *
 * @static
 * @param frameId {string} The frame Id of the texture in the cache
 * @param [crossorigin=(auto)] {boolean} if you want to specify the cross-origin parameter
 * @param [scaleMode=PIXI.SCALE_MODES.DEFAULT] {number} if you want to specify the scale mode, see {@link PIXI.SCALE_MODES} for possible values
 * @return {PIXI.Sprite} A new Sprite using a texture from the texture cache matching the frameId
 */
Sprite.fromFrame = function (frameId)
{
    var texture = utils.TextureCache[frameId];

    if (!texture)
    {
        throw new Error('The frameId "' + frameId + '" does not exist in the texture cache');
    }

    return new Sprite(texture);
};

/**
 * Helper function that creates a sprite that will contain a texture based on an image url
 * If the image is not in the texture cache it will be loaded
 *
 * @static
 * @param imageId {string} The image url of the texture
 * @return {PIXI.Sprite} A new Sprite using a texture from the texture cache matching the image id
 */
Sprite.fromImage = function (imageId, crossorigin, scaleMode)
{
    return new Sprite(Texture.fromImage(imageId, crossorigin, scaleMode));
};

},{"../const":4,"../display/Container":5,"../math":12,"../renderers/canvas/utils/CanvasTinter":1,"../textures/Texture":25,"../utils":29}],22:[function(require,module,exports){
var Sprite = require('../sprites/Sprite'),
    Texture = require('../textures/Texture'),
    math = require('../math'),
    utils = require('../utils'),
    CONST = require('../const');

/**
 * A Text Object will create a line or multiple lines of text. To split a line you can use '\n' in your text string,
 * or add a wordWrap property set to true and and wordWrapWidth property with a value in the style object.
 *
 * A Text can be created directly from a string and a style object
 *
 * ```js
 * var text = new PIXI.Text('This is a pixi text',{font : '24px Arial', fill : 0xff1010, align : 'center'});
 * ```
 *
 * @class
 * @extends PIXI.Sprite
 * @memberof PIXI
 * @param text {string} The copy that you would like the text to display
 * @param [style] {object} The style parameters
 * @param [style.font] {string} default 'bold 20px Arial' The style and size of the font
 * @param [style.fill='black'] {String|Number} A canvas fillstyle that will be used on the text e.g 'red', '#00FF00'
 * @param [style.align='left'] {string} Alignment for multiline text ('left', 'center' or 'right'), does not affect single line text
 * @param [style.stroke] {String|Number} A canvas fillstyle that will be used on the text stroke e.g 'blue', '#FCFF00'
 * @param [style.strokeThickness=0] {number} A number that represents the thickness of the stroke. Default is 0 (no stroke)
 * @param [style.wordWrap=false] {boolean} Indicates if word wrap should be used
 * @param [style.wordWrapWidth=100] {number} The width at which text will wrap, it needs wordWrap to be set to true
 * @param [style.lineHeight] {number} The line height, a number that represents the vertical space that a letter uses
 * @param [style.dropShadow=false] {boolean} Set a drop shadow for the text
 * @param [style.dropShadowColor='#000000'] {string} A fill style to be used on the dropshadow e.g 'red', '#00FF00'
 * @param [style.dropShadowAngle=Math.PI/4] {number} Set a angle of the drop shadow
 * @param [style.dropShadowDistance=5] {number} Set a distance of the drop shadow
 * @param [style.padding=0] {number} Occasionally some fonts are cropped on top or bottom. Adding some padding will
 *      prevent this from happening by adding padding to the top and bottom of text height.
 * @param [style.textBaseline='alphabetic'] {string} The baseline of the text that is rendered.
 * @param [style.lineJoin='miter'] {string} The lineJoin property sets the type of corner created, it can resolve
 *      spiked text issues. Default is 'miter' (creates a sharp corner).
 * @param [style.miterLimit=10] {number} The miter limit to use when using the 'miter' lineJoin mode. This can reduce
 *      or increase the spikiness of rendered text.
 */
function Text(text, style, resolution)
{
    /**
     * The canvas element that everything is drawn to
     *
     * @member {HTMLCanvasElement}
     */
    this.canvas = document.createElement('canvas');

    /**
     * The canvas 2d context that everything is drawn with
     * @member {HTMLCanvasElement}
     */
    this.context = this.canvas.getContext('2d');

    /**
     * The resolution of the canvas.
     * @member {number}
     */
    this.resolution = resolution || CONST.RESOLUTION;

    /**
     * Private tracker for the current text.
     *
     * @member {string}
     * @private
     */
    this._text = null;

    /**
     * Private tracker for the current style.
     *
     * @member {object}
     * @private
     */
    this._style = null;

    var texture = Texture.fromCanvas(this.canvas);
    texture.trim = new math.Rectangle();
    Sprite.call(this, texture);

    this.text = text;
    this.style = style;
}

// constructor
Text.prototype = Object.create(Sprite.prototype);
Text.prototype.constructor = Text;
module.exports = Text;

Text.fontPropertiesCache = {};
Text.fontPropertiesCanvas = document.createElement('canvas');
Text.fontPropertiesContext = Text.fontPropertiesCanvas.getContext('2d');

Object.defineProperties(Text.prototype, {
    /**
     * The width of the Text, setting this will actually modify the scale to achieve the value set
     *
     * @member {number}
     * @memberof PIXI.Text#
     */
    width: {
        get: function ()
        {
            if (this.dirty)
            {
                this.updateText();
            }

            return this.scale.x * this._texture._frame.width;
        },
        set: function (value)
        {
            this.scale.x = value / this._texture._frame.width;
            this._width = value;
        }
    },

    /**
     * The height of the Text, setting this will actually modify the scale to achieve the value set
     *
     * @member {number}
     * @memberof PIXI.Text#
     */
    height: {
        get: function ()
        {
            if (this.dirty)
            {
                this.updateText();
            }

            return  this.scale.y * this._texture._frame.height;
        },
        set: function (value)
        {
            this.scale.y = value / this._texture._frame.height;
            this._height = value;
        }
    },

    /**
     * Set the style of the text
     *
     * @param [style] {object} The style parameters
     * @param [style.font='bold 20pt Arial'] {string} The style and size of the font
     * @param [style.fill='black'] {string|number} A canvas fillstyle that will be used on the text eg 'red', '#00FF00'
     * @param [style.align='left'] {string} Alignment for multiline text ('left', 'center' or 'right'), does not affect single line text
     * @param [style.stroke='black'] {string|number} A canvas fillstyle that will be used on the text stroke eg 'blue', '#FCFF00'
     * @param [style.strokeThickness=0] {number} A number that represents the thickness of the stroke. Default is 0 (no stroke)
     * @param [style.wordWrap=false] {boolean} Indicates if word wrap should be used
     * @param [style.wordWrapWidth=100] {number} The width at which text will wrap
     * @param [style.lineHeight] {number} The line height, a number that represents the vertical space that a letter uses
     * @param [style.dropShadow=false] {boolean} Set a drop shadow for the text
     * @param [style.dropShadowColor='#000000'] {string|number} A fill style to be used on the dropshadow e.g 'red', '#00FF00'
     * @param [style.dropShadowAngle=Math.PI/6] {number} Set a angle of the drop shadow
     * @param [style.dropShadowDistance=5] {number} Set a distance of the drop shadow
     * @param [style.padding=0] {number} Occasionally some fonts are cropped on top or bottom. Adding some padding will
     *      prevent this from happening by adding padding to the top and bottom of text height.
     * @param [style.textBaseline='alphabetic'] {string} The baseline of the text that is rendered.
     * @param [style.lineJoin='miter'] {string} The lineJoin property sets the type of corner created, it can resolve
     *      spiked text issues. Default is 'miter' (creates a sharp corner).
     * @param [style.miterLimit=10] {number} The miter limit to use when using the 'miter' lineJoin mode. This can reduce
     *      or increase the spikiness of rendered text.
     * @memberof PIXI.Text#
     */
    style: {
        get: function ()
        {
            return this._style;
        },
        set: function (style)
        {
            style = style || {};

            if (typeof style.fill === 'number') {
                style.fill = utils.hex2string(style.fill);
            }

            if (typeof style.stroke === 'number') {
                style.stroke = utils.hex2string(style.stroke);
            }

            if (typeof style.dropShadowColor === 'number') {
                style.dropShadowColor = utils.hex2string(style.dropShadowColor);
            }

            style.font = style.font || 'bold 20pt Arial';
            style.fill = style.fill || 'black';
            style.align = style.align || 'left';
            style.stroke = style.stroke || 'black'; //provide a default, see: https://github.com/pixijs/pixi.js/issues/136
            style.strokeThickness = style.strokeThickness || 0;
            style.wordWrap = style.wordWrap || false;
            style.wordWrapWidth = style.wordWrapWidth || 100;

            style.dropShadow = style.dropShadow || false;
            style.dropShadowColor = style.dropShadowColor || '#000000';
            style.dropShadowAngle = style.dropShadowAngle || Math.PI / 6;
            style.dropShadowDistance = style.dropShadowDistance || 5;

            style.padding = style.padding || 0;

            style.textBaseline = style.textBaseline || 'alphabetic';

            style.lineJoin = style.lineJoin || 'miter';
            style.miterLimit = style.miterLimit || 10;

            this._style = style;
            this.dirty = true;
        }
    },

    /**
     * Set the copy for the text object. To split a line you can use '\n'.
     *
     * @param text {string} The copy that you would like the text to display
     * @memberof PIXI.Text#
     */
    text: {
        get: function()
        {
            return this._text;
        },
        set: function (text){
            text = text.toString() || ' ';
            if (this._text === text)
            {
                return;
            }
            this._text = text;
            this.dirty = true;
        }
    }
});

/**
 * Renders text and updates it when needed
 *
 * @private
 */
Text.prototype.updateText = function ()
{
    var style = this._style;
    this.context.font = style.font;

    // word wrap
    // preserve original text
    var outputText = style.wordWrap ? this.wordWrap(this._text) : this._text;

    // split text into lines
    var lines = outputText.split(/(?:\r\n|\r|\n)/);

    // calculate text width
    var lineWidths = new Array(lines.length);
    var maxLineWidth = 0;
    var fontProperties = this.determineFontProperties(style.font);
    for (var i = 0; i < lines.length; i++)
    {
        var lineWidth = this.context.measureText(lines[i]).width;
        lineWidths[i] = lineWidth;
        maxLineWidth = Math.max(maxLineWidth, lineWidth);
    }

    var width = maxLineWidth + style.strokeThickness;
    if (style.dropShadow)
    {
        width += style.dropShadowDistance;
    }

    this.canvas.width = ( width + this.context.lineWidth ) * this.resolution;

    // calculate text height
    var lineHeight = this.style.lineHeight || fontProperties.fontSize + style.strokeThickness;

    var height = lineHeight * lines.length;
    if (style.dropShadow)
    {
        height += style.dropShadowDistance;
    }

    this.canvas.height = ( height + this._style.padding * 2 ) * this.resolution;

    this.context.scale( this.resolution, this.resolution);

    if (navigator.isCocoonJS)
    {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    }

    //this.context.fillStyle="#FF0000";
    //this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.context.font = style.font;
    this.context.strokeStyle = style.stroke;
    this.context.lineWidth = style.strokeThickness;
    this.context.textBaseline = style.textBaseline;
    this.context.lineJoin = style.lineJoin;
    this.context.miterLimit = style.miterLimit;

    var linePositionX;
    var linePositionY;

    if (style.dropShadow)
    {
        this.context.fillStyle = style.dropShadowColor;

        var xShadowOffset = Math.cos(style.dropShadowAngle) * style.dropShadowDistance;
        var yShadowOffset = Math.sin(style.dropShadowAngle) * style.dropShadowDistance;

        for (i = 0; i < lines.length; i++)
        {
            linePositionX = style.strokeThickness / 2;
            linePositionY = (style.strokeThickness / 2 + i * lineHeight) + fontProperties.ascent;

            if (style.align === 'right')
            {
                linePositionX += maxLineWidth - lineWidths[i];
            }
            else if (style.align === 'center')
            {
                linePositionX += (maxLineWidth - lineWidths[i]) / 2;
            }

            if (style.fill)
            {
                this.context.fillText(lines[i], linePositionX + xShadowOffset, linePositionY + yShadowOffset + this._style.padding);
            }
        }
    }

    //set canvas text styles
    this.context.fillStyle = style.fill;

    //draw lines line by line
    for (i = 0; i < lines.length; i++)
    {
        linePositionX = style.strokeThickness / 2;
        linePositionY = (style.strokeThickness / 2 + i * lineHeight) + fontProperties.ascent;

        if (style.align === 'right')
        {
            linePositionX += maxLineWidth - lineWidths[i];
        }
        else if (style.align === 'center')
        {
            linePositionX += (maxLineWidth - lineWidths[i]) / 2;
        }

        if (style.stroke && style.strokeThickness)
        {
            this.context.strokeText(lines[i], linePositionX, linePositionY + this._style.padding);
        }

        if (style.fill)
        {
            this.context.fillText(lines[i], linePositionX, linePositionY + this._style.padding);
        }
    }

    this.updateTexture();
};

/**
 * Updates texture size based on canvas size
 *
 * @private
 */
Text.prototype.updateTexture = function ()
{
    var texture = this._texture;

    texture.baseTexture.hasLoaded = true;
    texture.baseTexture.resolution = this.resolution;

    texture.baseTexture.width = this.canvas.width / this.resolution;
    texture.baseTexture.height = this.canvas.height / this.resolution;
    texture.crop.width = texture._frame.width = this.canvas.width / this.resolution;
    texture.crop.height = texture._frame.height = this.canvas.height / this.resolution;

    texture.trim.x = 0;
    texture.trim.y = -this._style.padding;

    texture.trim.width = texture._frame.width;
    texture.trim.height = texture._frame.height - this._style.padding*2;

    this._width = this.canvas.width / this.resolution;
    this._height = this.canvas.height / this.resolution;

    texture.baseTexture.emit('update',  texture.baseTexture);

    this.dirty = false;
};

/**
 * Renders the object using the WebGL renderer
 *
 * @param renderer {PIXI.WebGLRenderer}
 */
Text.prototype.renderWebGL = function (renderer)
{
    if (this.dirty)
    {
        //this.resolution = 1//renderer.resolution;

        this.updateText();
    }

    Sprite.prototype.renderWebGL.call(this, renderer);
};

/**
 * Renders the object using the Canvas renderer
 *
 * @param renderer {PIXI.CanvasRenderer}
 * @private
 */
Text.prototype._renderCanvas = function (renderer)
{
    if (this.dirty)
    {
     //   this.resolution = 1//renderer.resolution;

        this.updateText();
    }

    Sprite.prototype._renderCanvas.call(this, renderer);
};

/**
 * Calculates the ascent, descent and fontSize of a given fontStyle
 *
 * @param fontStyle {object}
 * @private
 */
Text.prototype.determineFontProperties = function (fontStyle)
{
    var properties = Text.fontPropertiesCache[fontStyle];

    if (!properties)
    {
        properties = {};

        var canvas = Text.fontPropertiesCanvas;
        var context = Text.fontPropertiesContext;

        context.font = fontStyle;

        var width = Math.ceil(context.measureText('|MÉq').width);
        var baseline = Math.ceil(context.measureText('M').width);
        var height = 2 * baseline;

        baseline = baseline * 1.4 | 0;

        canvas.width = width;
        canvas.height = height;

        context.fillStyle = '#f00';
        context.fillRect(0, 0, width, height);

        context.font = fontStyle;

        context.textBaseline = 'alphabetic';
        context.fillStyle = '#000';
        context.fillText('|MÉq', 0, baseline);

        var imagedata = context.getImageData(0, 0, width, height).data;
        var pixels = imagedata.length;
        var line = width * 4;

        var i, j;

        var idx = 0;
        var stop = false;

        // ascent. scan from top to bottom until we find a non red pixel
        for (i = 0; i < baseline; i++)
        {
            for (j = 0; j < line; j += 4)
            {
                if (imagedata[idx + j] !== 255)
                {
                    stop = true;
                    break;
                }
            }
            if (!stop)
            {
                idx += line;
            }
            else
            {
                break;
            }
        }

        properties.ascent = baseline - i;

        idx = pixels - line;
        stop = false;

        // descent. scan from bottom to top until we find a non red pixel
        for (i = height; i > baseline; i--)
        {
            for (j = 0; j < line; j += 4)
            {
                if (imagedata[idx + j] !== 255)
                {
                    stop = true;
                    break;
                }
            }
            if (!stop)
            {
                idx -= line;
            }
            else
            {
                break;
            }
        }

        properties.descent = i - baseline;
        properties.fontSize = properties.ascent + properties.descent;

        Text.fontPropertiesCache[fontStyle] = properties;
    }

    return properties;
};

/**
 * Applies newlines to a string to have it optimally fit into the horizontal
 * bounds set by the Text object's wordWrapWidth property.
 *
 * @param text {string}
 * @private
 */
Text.prototype.wordWrap = function (text)
{
    // Greedy wrapping algorithm that will wrap words as the line grows longer
    // than its horizontal bounds.
    var result = '';
    var lines = text.split('\n');
    var wordWrapWidth = this._style.wordWrapWidth;
    for (var i = 0; i < lines.length; i++)
    {
        var spaceLeft = wordWrapWidth;
        var words = lines[i].split(' ');
        for (var j = 0; j < words.length; j++)
        {
            var wordWidth = this.context.measureText(words[j]).width;
            var wordWidthWithSpace = wordWidth + this.context.measureText(' ').width;
            if (j === 0 || wordWidthWithSpace > spaceLeft)
            {
                // Skip printing the newline if it's the first word of the line that is
                // greater than the word wrap width.
                if (j > 0)
                {
                    result += '\n';
                }
                result += words[j];
                spaceLeft = wordWrapWidth - wordWidth;
            }
            else
            {
                spaceLeft -= wordWidthWithSpace;
                result += ' ' + words[j];
            }
        }

        if (i < lines.length-1)
        {
            result += '\n';
        }
    }
    return result;
};

/**
 * Returns the bounds of the Text as a rectangle. The bounds calculation takes the worldTransform into account.
 *
 * @param matrix {PIXI.Matrix} the transformation matrix of the Text
 * @return {PIXI.Rectangle} the framing rectangle
 */
Text.prototype.getBounds = function (matrix)
{
    if (this.dirty)
    {
        this.updateText();
    }

    return Sprite.prototype.getBounds.call(this, matrix);
};

/**
 * Destroys this text object.
 *
 * @param [destroyBaseTexture=true] {boolean} whether to destroy the base texture as well
 */
Text.prototype.destroy = function (destroyBaseTexture)
{
    // make sure to reset the the context and canvas.. dont want this hanging around in memory!
    this.context = null;
    this.canvas = null;

    this._style = null;

    this._texture.destroy(destroyBaseTexture === undefined ? true : destroyBaseTexture);
};

},{"../const":4,"../math":12,"../sprites/Sprite":21,"../textures/Texture":25,"../utils":29}],23:[function(require,module,exports){
var utils = require('../utils'),
    CONST = require('../const'),
    EventEmitter = require('eventemitter3');

/**
 * A texture stores the information that represents an image. All textures have a base texture.
 *
 * @class
 * @memberof PIXI
 * @param source {Image|Canvas} the source object of the texture.
 * @param [scaleMode=PIXI.SCALE_MODES.DEFAULT] {number} See {@link PIXI.SCALE_MODES} for possible values
 * @param resolution {number} the resolution of the texture for devices with different pixel ratios
 */
function BaseTexture(source, scaleMode, resolution)
{
    EventEmitter.call(this);

    this.uid = utils.uid();

    /**
     * The Resolution of the texture.
     *
     * @member {number}
     */
    this.resolution = resolution || 1;

    /**
     * The width of the base texture set when the image has loaded
     *
     * @member {number}
     * @readOnly
     */
    this.width = 100;

    /**
     * The height of the base texture set when the image has loaded
     *
     * @member {number}
     * @readOnly
     */
    this.height = 100;

    // TODO docs
    // used to store the actual dimensions of the source
    /**
     * Used to store the actual width of the source of this texture
     *
     * @member {number}
     * @readOnly
     */
    this.realWidth = 100;
    /**
     * Used to store the actual height of the source of this texture
     *
     * @member {number}
     * @readOnly
     */
    this.realHeight = 100;

    /**
     * The scale mode to apply when scaling this texture
     *
     * @member {number}
     * @default PIXI.SCALE_MODES.LINEAR
     * @see PIXI.SCALE_MODES
     */
    this.scaleMode = scaleMode || CONST.SCALE_MODES.DEFAULT;

    /**
     * Set to true once the base texture has successfully loaded.
     *
     * This is never true if the underlying source fails to load or has no texture data.
     *
     * @member {boolean}
     * @readOnly
     */
    this.hasLoaded = false;

    /**
     * Set to true if the source is currently loading.
     *
     * If an Image source is loading the 'loaded' or 'error' event will be
     * dispatched when the operation ends. An underyling source that is
     * immediately-available bypasses loading entirely.
     *
     * @member {boolean}
     * @readonly
     */
    this.isLoading = false;

    /**
     * The image source that is used to create the texture.
     *
     * TODO: Make this a setter that calls loadSource();
     *
     * @member {Image|Canvas}
     * @readonly
     */
    this.source = null; // set in loadSource, if at all

    /**
     * Controls if RGB channels should be pre-multiplied by Alpha  (WebGL only)
     *
     * @member {boolean}
     * @default true
     */
    this.premultipliedAlpha = true;

    /**
     * @member {string}
     */
    this.imageUrl = null;

    /**
     * Wether or not the texture is a power of two, try to use power of two textures as much as you can
     * @member {boolean}
     * @private
     */
    this.isPowerOfTwo = false;

    // used for webGL

    /**
     *
     * Set this to true if a mipmap of this texture needs to be generated. This value needs to be set before the texture is used
     * Also the texture must be a power of two size to work
     *
     * @member {boolean}
     */
    this.mipmap = false;

    /**
     * A map of renderer IDs to webgl textures
     *
     * @member {object<number, WebGLTexture>}
     * @private
     */
    this._glTextures = [];

    // if no source passed don't try to load
    if (source)
    {
        this.loadSource(source);
    }

    /**
     * Fired when a not-immediately-available source finishes loading.
     *
     * @event loaded
     * @memberof PIXI.BaseTexture#
     * @protected
     */

    /**
     * Fired when a not-immediately-available source fails to load.
     *
     * @event error
     * @memberof PIXI.BaseTexture#
     * @protected
     */
}

BaseTexture.prototype = Object.create(EventEmitter.prototype);
BaseTexture.prototype.constructor = BaseTexture;
module.exports = BaseTexture;

/**
 * Updates the texture on all the webgl renderers, this also assumes the src has changed.
 *
 * @fires update
 */
BaseTexture.prototype.update = function ()
{
    this.realWidth = this.source.naturalWidth || this.source.width;
    this.realHeight = this.source.naturalHeight || this.source.height;

    this.width = this.realWidth / this.resolution;
    this.height = this.realHeight / this.resolution;

    this.isPowerOfTwo = utils.isPowerOfTwo(this.realWidth, this.realHeight);

    this.emit('update', this);
};

/**
 * Load a source.
 *
 * If the source is not-immediately-available, such as an image that needs to be
 * downloaded, then the 'loaded' or 'error' event will be dispatched in the future
 * and `hasLoaded` will remain false after this call.
 *
 * The logic state after calling `loadSource` directly or indirectly (eg. `fromImage`, `new BaseTexture`) is:
 *
 *     if (texture.hasLoaded)
 {
 *        // texture ready for use
 *     } else if (texture.isLoading)
 {
 *        // listen to 'loaded' and/or 'error' events on texture
 *     } else {
 *        // not loading, not going to load UNLESS the source is reloaded
 *        // (it may still make sense to listen to the events)
 *     }
 *
 * @protected
 * @param source {Image|Canvas} the source object of the texture.
 */
BaseTexture.prototype.loadSource = function (source)
{
    var wasLoading = this.isLoading;
    this.hasLoaded = false;
    this.isLoading = false;

    if (wasLoading && this.source)
    {
        this.source.onload = null;
        this.source.onerror = null;
    }

    this.source = source;

    // Apply source if loaded. Otherwise setup appropriate loading monitors.
    if ((this.source.complete || this.source.getContext) && this.source.width && this.source.height)
    {
        this._sourceLoaded();
    }
    else if (!source.getContext)
    {

        // Image fail / not ready
        this.isLoading = true;

        var scope = this;

        source.onload = function ()
        {
            source.onload = null;
            source.onerror = null;

            if (!scope.isLoading)
            {
                return;
            }

            scope.isLoading = false;
            scope._sourceLoaded();

            scope.emit('loaded', scope);
        };

        source.onerror = function ()
        {
            source.onload = null;
            source.onerror = null;

            if (!scope.isLoading)
            {
                return;
            }

            scope.isLoading = false;
            scope.emit('error', scope);
        };

        // Per http://www.w3.org/TR/html5/embedded-content-0.html#the-img-element
        //   "The value of `complete` can thus change while a script is executing."
        // So complete needs to be re-checked after the callbacks have been added..
        // NOTE: complete will be true if the image has no src so best to check if the src is set.
        if (source.complete && source.src)
        {
            this.isLoading = false;

            // ..and if we're complete now, no need for callbacks
            source.onload = null;
            source.onerror = null;

            if (source.width && source.height)
            {
                this._sourceLoaded();

                // If any previous subscribers possible
                if (wasLoading)
                {
                    this.emit('loaded', this);
                }
            }
            else
            {
                // If any previous subscribers possible
                if (wasLoading)
                {
                    this.emit('error', this);
                }
            }
        }
    }
};

/**
 * Used internally to update the width, height, and some other tracking vars once
 * a source has successfully loaded.
 *
 * @private
 */
BaseTexture.prototype._sourceLoaded = function ()
{
    this.hasLoaded = true;
    this.update();
};

/**
 * Destroys this base texture
 *
 */
BaseTexture.prototype.destroy = function ()
{
    if (this.imageUrl)
    {
        delete utils.BaseTextureCache[this.imageUrl];
        delete utils.TextureCache[this.imageUrl];

        this.imageUrl = null;

        if (!navigator.isCocoonJS)
        {
            this.source.src = '';
        }
    }
    else if (this.source && this.source._pixiId)
    {
        delete utils.BaseTextureCache[this.source._pixiId];
    }

    this.source = null;

    this.dispose();
};

/**
 * Frees the texture from WebGL memory without destroying this texture object.
 * This means you can still use the texture later which will upload it to GPU
 * memory again.
 *
 */
BaseTexture.prototype.dispose = function ()
{
    this.emit('dispose', this);

    this._glTextures.length = 0;
};

/**
 * Changes the source image of the texture.
 * The original source must be an Image element.
 *
 * @param newSrc {string} the path of the image
 */
BaseTexture.prototype.updateSourceImage = function (newSrc)
{
    this.source.src = newSrc;

    this.loadSource(this.source);
};

/**
 * Helper function that creates a base texture from the given image url.
 * If the image is not in the base texture cache it will be created and loaded.
 *
 * @static
 * @param imageUrl {string} The image url of the texture
 * @param [crossorigin=(auto)] {boolean} Should use anonymous CORS? Defaults to true if the URL is not a data-URI.
 * @param [scaleMode=PIXI.SCALE_MODES.DEFAULT] {number} See {@link PIXI.SCALE_MODES} for possible values
 * @return PIXI.BaseTexture
 */
BaseTexture.fromImage = function (imageUrl, crossorigin, scaleMode)
{
    var baseTexture = utils.BaseTextureCache[imageUrl];

    if (crossorigin === undefined && imageUrl.indexOf('data:') !== 0)
    {
        crossorigin = true;
    }

    if (!baseTexture)
    {
        // new Image() breaks tex loading in some versions of Chrome.
        // See https://code.google.com/p/chromium/issues/detail?id=238071
        var image = new Image();//document.createElement('img');
        if (crossorigin)
        {
            image.crossOrigin = '';
        }

        baseTexture = new BaseTexture(image, scaleMode);
        baseTexture.imageUrl = imageUrl;

        image.src = imageUrl;

        utils.BaseTextureCache[imageUrl] = baseTexture;

        // if there is an @2x at the end of the url we are going to assume its a highres image
        baseTexture.resolution = utils.getResolutionOfUrl(imageUrl);
    }

    return baseTexture;
};

/**
 * Helper function that creates a base texture from the given canvas element.
 *
 * @static
 * @param canvas {Canvas} The canvas element source of the texture
 * @param scaleMode {number} See {@link PIXI.SCALE_MODES} for possible values
 * @return PIXI.BaseTexture
 */
BaseTexture.fromCanvas = function (canvas, scaleMode)
{
    if (!canvas._pixiId)
    {
        canvas._pixiId = 'canvas_' + utils.uid();
    }

    var baseTexture = utils.BaseTextureCache[canvas._pixiId];

    if (!baseTexture)
    {
        baseTexture = new BaseTexture(canvas, scaleMode);
        utils.BaseTextureCache[canvas._pixiId] = baseTexture;
    }

    return baseTexture;
};

},{"../const":4,"../utils":29,"eventemitter3":2}],24:[function(require,module,exports){
var BaseTexture = require('./BaseTexture'),
    Texture = require('./Texture'),
    RenderTarget = require('../renderers/webgl/utils/RenderTarget'),
    FilterManager = require('../renderers/webgl/managers/FilterManager'),
    CanvasBuffer = require('../renderers/canvas/utils/CanvasBuffer'),
    math = require('../math'),
    CONST = require('../const'),
    tempMatrix = new math.Matrix();

/**
 * A RenderTexture is a special texture that allows any Pixi display object to be rendered to it.
 *
 * __Hint__: All DisplayObjects (i.e. Sprites) that render to a RenderTexture should be preloaded
 * otherwise black rectangles will be drawn instead.
 *
 * A RenderTexture takes a snapshot of any Display Object given to its render method. The position
 * and rotation of the given Display Objects is ignored. For example:
 *
 * ```js
 * var renderer = PIXI.autoDetectRenderer(1024, 1024, { view: canvas, ratio: 1 });
 * var renderTexture = new PIXI.RenderTexture(renderer, 800, 600);
 * var sprite = PIXI.Sprite.fromImage("spinObj_01.png");
 *
 * sprite.position.x = 800/2;
 * sprite.position.y = 600/2;
 * sprite.anchor.x = 0.5;
 * sprite.anchor.y = 0.5;
 *
 * renderTexture.render(sprite);
 * ```
 *
 * The Sprite in this case will be rendered to a position of 0,0. To render this sprite at its actual
 * position a Container should be used:
 *
 * ```js
 * var doc = new PIXI.Container();
 *
 * doc.addChild(sprite);
 *
 * renderTexture.render(doc);  // Renders to center of renderTexture
 * ```
 *
 * @class
 * @extends PIXI.Texture
 * @memberof PIXI
 * @param renderer {PIXI.CanvasRenderer|PIXI.WebGLRenderer} The renderer used for this RenderTexture
 * @param [width=100] {number} The width of the render texture
 * @param [height=100] {number} The height of the render texture
 * @param [scaleMode] {number} See {@link PIXI.SCALE_MODES} for possible values
 * @param [resolution=1] {number} The resolution of the texture being generated
 */
function RenderTexture(renderer, width, height, scaleMode, resolution)
{
    if (!renderer)
    {
        throw new Error('Unable to create RenderTexture, you must pass a renderer into the constructor.');
    }

    width = width || 100;
    height = height || 100;
    resolution = resolution || CONST.RESOLUTION;

    /**
     * The base texture object that this texture uses
     *
     * @member {BaseTexture}
     */
    var baseTexture = new BaseTexture();
    baseTexture.width = width;
    baseTexture.height = height;
    baseTexture.resolution = resolution;
    baseTexture.scaleMode = scaleMode || CONST.SCALE_MODES.DEFAULT;
    baseTexture.hasLoaded = true;


    Texture.call(this,
        baseTexture,
        new math.Rectangle(0, 0, width, height)
    );


    /**
     * The with of the render texture
     *
     * @member {number}
     */
    this.width = width;

    /**
     * The height of the render texture
     *
     * @member {number}
     */
    this.height = height;

    /**
     * The Resolution of the texture.
     *
     * @member {number}
     */
    this.resolution = resolution;

    /**
     * Draw/render the given DisplayObject onto the texture.
     *
     * The displayObject and descendents are transformed during this operation.
     * If `updateTransform` is true then the transformations will be restored before the
     * method returns. Otherwise it is up to the calling code to correctly use or reset
     * the transformed display objects.
     *
     * The display object is always rendered with a worldAlpha value of 1.
     *
     * @method
     * @param displayObject {PIXI.DisplayObject} The display object to render this texture on
     * @param [matrix] {PIXI.Matrix} Optional matrix to apply to the display object before rendering.
     * @param [clear=false] {boolean} If true the texture will be cleared before the displayObject is drawn
     * @param [updateTransform=true] {boolean} If true the displayObject's worldTransform/worldAlpha and all children
     *  transformations will be restored. Not restoring this information will be a little faster.
     */
    this.render = null;

    /**
     * The renderer this RenderTexture uses. A RenderTexture can only belong to one renderer at the moment if its webGL.
     *
     * @member {PIXI.CanvasRenderer|PIXI.WebGLRenderer}
     */
    this.renderer = renderer;

    if (this.renderer.type === CONST.RENDERER_TYPE.WEBGL)
    {
        var gl = this.renderer.gl;

        this.textureBuffer = new RenderTarget(gl, this.width, this.height, baseTexture.scaleMode, this.resolution);//, this.baseTexture.scaleMode);
        this.baseTexture._glTextures[gl.id] =  this.textureBuffer.texture;

        //TODO refactor filter manager.. as really its no longer a manager if we use it here..
        this.filterManager = new FilterManager(this.renderer);
        this.filterManager.onContextChange();
        this.filterManager.resize(width, height);
        this.render = this.renderWebGL;

        // the creation of a filter manager unbinds the buffers..
        this.renderer.currentRenderer.start();
        this.renderer.currentRenderTarget.activate();
    }
    else
    {

        this.render = this.renderCanvas;
        this.textureBuffer = new CanvasBuffer(this.width* this.resolution, this.height* this.resolution);
        this.baseTexture.source = this.textureBuffer.canvas;
    }

    /**
     * @member {boolean}
     */
    this.valid = true;

    this._updateUvs();
}

RenderTexture.prototype = Object.create(Texture.prototype);
RenderTexture.prototype.constructor = RenderTexture;
module.exports = RenderTexture;

/**
 * Resizes the RenderTexture.
 *
 * @param width {number} The width to resize to.
 * @param height {number} The height to resize to.
 * @param updateBase {boolean} Should the baseTexture.width and height values be resized as well?
 */
RenderTexture.prototype.resize = function (width, height, updateBase)
{
    if (width === this.width && height === this.height)
    {
        return;
    }

    this.valid = (width > 0 && height > 0);

    this.width = this._frame.width = this.crop.width = width;
    this.height =  this._frame.height = this.crop.height = height;

    if (updateBase)
    {
        this.baseTexture.width = this.width;
        this.baseTexture.height = this.height;
    }

    if (!this.valid)
    {
        return;
    }

    this.textureBuffer.resize(this.width, this.height);

    if(this.filterManager)
    {
        this.filterManager.resize(this.width, this.height);
    }
};

/**
 * Clears the RenderTexture.
 *
 */
RenderTexture.prototype.clear = function ()
{
    if (!this.valid)
    {
        return;
    }

    if (this.renderer.type === CONST.RENDERER_TYPE.WEBGL)
    {
        this.renderer.gl.bindFramebuffer(this.renderer.gl.FRAMEBUFFER, this.textureBuffer.frameBuffer);
    }

    this.textureBuffer.clear();
};

/**
 * Internal method assigned to the `render` property if using a CanvasRenderer.
 *
 * @private
 * @param displayObject {PIXI.DisplayObject} The display object to render this texture on
 * @param [matrix] {PIXI.Matrix} Optional matrix to apply to the display object before rendering.
 * @param [clear=false] {boolean} If true the texture will be cleared before the displayObject is drawn
 * @param [updateTransform=true] {boolean} If true the displayObject's worldTransform/worldAlpha and all children
 *  transformations will be restored. Not restoring this information will be a little faster.
 */
RenderTexture.prototype.renderWebGL = function (displayObject, matrix, clear, updateTransform)
{
    if (!this.valid)
    {
        return;
    }


    updateTransform = (updateTransform !== undefined) ? updateTransform : true;//!updateTransform;

    this.textureBuffer.transform = matrix;

    //TODO not a fan that this is here... it will move!
    this.textureBuffer.activate();

    // setWorld Alpha to ensure that the object is renderer at full opacity
    displayObject.worldAlpha = 1;

    if (updateTransform)
    {

        // reset the matrix of the displatyObject..
        displayObject.worldTransform.identity();

        displayObject.currentBounds = null;

        // Time to update all the children of the displayObject with the new matrix..
        var children = displayObject.children;
        var i, j;

        for (i = 0, j = children.length; i < j; ++i)
        {
            children[i].updateTransform();
        }
    }

    //TODO rename textureBuffer to renderTarget..
    var temp =  this.renderer.filterManager;

    this.renderer.filterManager = this.filterManager;
    this.renderer.renderDisplayObject(displayObject, this.textureBuffer, clear);

    this.renderer.filterManager = temp;
};


/**
 * Internal method assigned to the `render` property if using a CanvasRenderer.
 *
 * @private
 * @param displayObject {PIXI.DisplayObject} The display object to render this texture on
 * @param [matrix] {PIXI.Matrix} Optional matrix to apply to the display object before rendering.
 * @param [clear] {boolean} If true the texture will be cleared before the displayObject is drawn
 */
RenderTexture.prototype.renderCanvas = function (displayObject, matrix, clear, updateTransform)
{
    if (!this.valid)
    {
        return;
    }

    updateTransform = !!updateTransform;

    var wt = tempMatrix;

    wt.identity();

    if (matrix)
    {
        wt.append(matrix);
    }

    displayObject.worldTransform = wt;
    var cachedWt = displayObject.worldTransform;

    // setWorld Alpha to ensure that the object is renderer at full opacity
    displayObject.worldAlpha = 1;

    // Time to update all the children of the displayObject with the new matrix..
    var children = displayObject.children;
    var i, j;

    for (i = 0, j = children.length; i < j; ++i)
    {
        children[i].updateTransform();
    }

    if (clear)
    {
        this.textureBuffer.clear();
    }

   
//    this.textureBuffer.
    var context = this.textureBuffer.context;

    var realResolution = this.renderer.resolution;

    this.renderer.resolution = this.resolution;

    this.renderer.renderDisplayObject(displayObject, context);

    this.renderer.resolution = realResolution;

     displayObject.worldTransform = cachedWt;

 //   context.setTransform(1, 0, 0, 1, 0, 0);
   // context.fillStyle ="#FF0000"
//    context.fillRect(0, 0, 800, 600);

};

/**
 * Destroys this texture
 *
 * @param destroyBase {boolean} Whether to destroy the base texture as well
 */
RenderTexture.prototype.destroy = function ()
{
    Texture.prototype.destroy.call(this, true);

    this.textureBuffer.destroy();

    // destroy the filtermanager..
    if(this.filterManager)
    {
        this.filterManager.destroy();
    }

    this.renderer = null;
};

/**
 * Will return a HTML Image of the texture
 *
 * @return {Image}
 */
RenderTexture.prototype.getImage = function ()
{
    var image = new Image();
    image.src = this.getBase64();
    return image;
};

/**
 * Will return a a base64 encoded string of this texture. It works by calling RenderTexture.getCanvas and then running toDataURL on that.
 *
 * @return {string} A base64 encoded string of the texture.
 */
RenderTexture.prototype.getBase64 = function ()
{
    return this.getCanvas().toDataURL();
};

/**
 * Creates a Canvas element, renders this RenderTexture to it and then returns it.
 *
 * @return {HTMLCanvasElement} A Canvas element with the texture rendered on.
 */
RenderTexture.prototype.getCanvas = function ()
{
    if (this.renderer.type === CONST.RENDERER_TYPE.WEBGL)
    {
        var gl = this.renderer.gl;
        var width = this.textureBuffer.size.width;
        var height = this.textureBuffer.size.height;

        var webGLPixels = new Uint8Array(4 * width * height);

        gl.bindFramebuffer(gl.FRAMEBUFFER, this.textureBuffer.frameBuffer);
        gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, webGLPixels);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        var tempCanvas = new CanvasBuffer(width, height);
        var canvasData = tempCanvas.context.getImageData(0, 0, width, height);
        canvasData.data.set(webGLPixels);

        tempCanvas.context.putImageData(canvasData, 0, 0);

        return tempCanvas.canvas;
    }
    else
    {
        return this.textureBuffer.canvas;
    }
};

/**
 * Will return a one-dimensional array containing the pixel data of the entire texture in RGBA order, with integer values between 0 and 255 (included).
 *
 * @return {Uint8ClampedArray}
 */
RenderTexture.prototype.getPixels = function ()
{
    var width, height;

    if (this.renderer.type === CONST.RENDERER_TYPE.WEBGL)
    {
        var gl = this.renderer.gl;
        width = this.textureBuffer.size.width;
        height = this.textureBuffer.size.height;

        var webGLPixels = new Uint8Array(4 * width * height);

        gl.bindFramebuffer(gl.FRAMEBUFFER, this.textureBuffer.frameBuffer);
        gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, webGLPixels);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        return webGLPixels;
    }
    else
    {
        width = this.textureBuffer.canvas.width;
        height = this.textureBuffer.canvas.height;

        return this.textureBuffer.canvas.getContext('2d').getImageData(0, 0, width, height).data;
    }
};

/**
 * Will return a one-dimensional array containing the pixel data of a pixel within the texture in RGBA order, with integer values between 0 and 255 (included).
 *
 * @param x {number} The x coordinate of the pixel to retrieve.
 * @param y {number} The y coordinate of the pixel to retrieve.
 * @return {Uint8ClampedArray}
 */
RenderTexture.prototype.getPixel = function (x, y)
{
    if (this.renderer.type === CONST.RENDERER_TYPE.WEBGL)
    {
        var gl = this.renderer.gl;

        var webGLPixels = new Uint8Array(4);

        gl.bindFramebuffer(gl.FRAMEBUFFER, this.textureBuffer.frameBuffer);
        gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, webGLPixels);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        return webGLPixels;
    }
    else
    {
        return this.textureBuffer.canvas.getContext('2d').getImageData(x, y, 1, 1).data;
    }
};

},{"../const":4,"../math":12,"../renderers/canvas/utils/CanvasBuffer":1,"../renderers/webgl/managers/FilterManager":1,"../renderers/webgl/utils/RenderTarget":1,"./BaseTexture":23,"./Texture":25}],25:[function(require,module,exports){
var BaseTexture = require('./BaseTexture'),
    VideoBaseTexture = require('./VideoBaseTexture'),
    TextureUvs = require('./TextureUvs'),
    EventEmitter = require('eventemitter3'),
    math = require('../math'),
    utils = require('../utils');

/**
 * A texture stores the information that represents an image or part of an image. It cannot be added
 * to the display list directly. Instead use it as the texture for a Sprite. If no frame is provided then the whole image is used.
 *
 * You can directly create a texture from an image and then reuse it multiple times like this :
 *
 * ```js
 * var texture = PIXI.Texture.fromImage('assets/image.png');
 * var sprite1 = new PIXI.Sprite(texture);
 * var sprite2 = new PIXI.Sprite(texture);
 * ```
 *
 * @class
 * @memberof PIXI
 * @param baseTexture {PIXI.BaseTexture} The base texture source to create the texture from
 * @param [frame] {PIXI.Rectangle} The rectangle frame of the texture to show
 * @param [crop] {PIXI.Rectangle} The area of original texture
 * @param [trim] {PIXI.Rectangle} Trimmed texture rectangle
 * @param [rotate] {boolean} indicates whether the texture should be rotated by 90 degrees ( used by texture packer )
 */
function Texture(baseTexture, frame, crop, trim, rotate)
{
    EventEmitter.call(this);

    /**
     * Does this Texture have any frame data assigned to it?
     *
     * @member {boolean}
     */
    this.noFrame = false;

    if (!frame)
    {
        this.noFrame = true;
        frame = new math.Rectangle(0, 0, 1, 1);
    }

    if (baseTexture instanceof Texture)
    {
        baseTexture = baseTexture.baseTexture;
    }

    /**
     * The base texture that this texture uses.
     *
     * @member {PIXI.BaseTexture}
     */
    this.baseTexture = baseTexture;

    /**
     * The frame specifies the region of the base texture that this texture uses
     *
     * @member {PIXI.Rectangle}
     * @private
     */
    this._frame = frame;

    /**
     * The texture trim data.
     *
     * @member {PIXI.Rectangle}
     */
    this.trim = trim;

    /**
     * This will let the renderer know if the texture is valid. If it's not then it cannot be rendered.
     *
     * @member {boolean}
     */
    this.valid = false;

    /**
     * This will let a renderer know that a texture has been updated (used mainly for webGL uv updates)
     *
     * @member {boolean}
     */
    this.requiresUpdate = false;

    /**
     * The WebGL UV data cache.
     *
     * @member {PIXI.TextureUvs}
     * @private
     */
    this._uvs = null;

    /**
     * The width of the Texture in pixels.
     *
     * @member {number}
     */
    this.width = 0;

    /**
     * The height of the Texture in pixels.
     *
     * @member {number}
     */
    this.height = 0;

    /**
     * This is the area of the BaseTexture image to actually copy to the Canvas / WebGL when rendering,
     * irrespective of the actual frame size or placement (which can be influenced by trimmed texture atlases)
     *
     * @member {PIXI.Rectangle}
     */
    this.crop = crop || frame;//new math.Rectangle(0, 0, 1, 1);

    /**
     * Indicates whether the texture should be rotated by 90 degrees
     *
     * @private
     * @member {boolean}
     */
    this.rotate = !!rotate;

    if (baseTexture.hasLoaded)
    {
        if (this.noFrame)
        {
            frame = new math.Rectangle(0, 0, baseTexture.width, baseTexture.height);

            // if there is no frame we should monitor for any base texture changes..
            baseTexture.on('update', this.onBaseTextureUpdated, this);
        }
        this.frame = frame;
    }
    else
    {
        baseTexture.once('loaded', this.onBaseTextureLoaded, this);
    }

    /**
     * Fired when the texture is updated. This happens if the frame or the baseTexture is updated.
     *
     * @event update
     * @memberof PIXI.Texture#
     * @protected
     */
}

Texture.prototype = Object.create(EventEmitter.prototype);
Texture.prototype.constructor = Texture;
module.exports = Texture;

Object.defineProperties(Texture.prototype, {
    /**
     * The frame specifies the region of the base texture that this texture uses.
     *
     * @member {PIXI.Rectangle}
     * @memberof PIXI.Texture#
     */
    frame: {
        get: function ()
        {
            return this._frame;
        },
        set: function (frame)
        {
            this._frame = frame;

            this.noFrame = false;

            this.width = frame.width;
            this.height = frame.height;

            if (!this.trim && !this.rotate && (frame.x + frame.width > this.baseTexture.width || frame.y + frame.height > this.baseTexture.height))
            {
                throw new Error('Texture Error: frame does not fit inside the base Texture dimensions ' + this);
            }

            //this.valid = frame && frame.width && frame.height && this.baseTexture.source && this.baseTexture.hasLoaded;
            this.valid = frame && frame.width && frame.height && this.baseTexture.hasLoaded;

            if (this.trim)
            {
                this.width = this.trim.width;
                this.height = this.trim.height;
                this._frame.width = this.trim.width;
                this._frame.height = this.trim.height;
            }
            else
            {
                this.crop = frame;
            }

            if (this.valid)
            {
                this._updateUvs();
            }
        }
    }
});

/**
 * Updates this texture on the gpu.
 *
 */
Texture.prototype.update = function ()
{
    this.baseTexture.update();
};

/**
 * Called when the base texture is loaded
 *
 * @private
 */
Texture.prototype.onBaseTextureLoaded = function (baseTexture)
{
    // TODO this code looks confusing.. boo to abusing getters and setterss!
    if (this.noFrame)
    {
        this.frame = new math.Rectangle(0, 0, baseTexture.width, baseTexture.height);
    }
    else
    {
        this.frame = this._frame;
    }

    this.emit('update', this);
};

/**
 * Called when the base texture is updated
 *
 * @private
 */
Texture.prototype.onBaseTextureUpdated = function (baseTexture)
{
    this._frame.width = baseTexture.width;
    this._frame.height = baseTexture.height;

    this.emit('update', this);
};

/**
 * Destroys this texture
 *
 * @param [destroyBase=false] {boolean} Whether to destroy the base texture as well
 */
Texture.prototype.destroy = function (destroyBase)
{
    if (this.baseTexture)
    {
        if (destroyBase)
        {
            this.baseTexture.destroy();
        }

        this.baseTexture.off('update', this.onBaseTextureUpdated, this);
        this.baseTexture.off('loaded', this.onBaseTextureLoaded, this);

        this.baseTexture = null;
    }

    this._frame = null;
    this._uvs = null;
    this.trim = null;
    this.crop = null;

    this.valid = false;

    this.off('dispose', this.dispose, this);
    this.off('update', this.update, this);
};

/**
 * Creates a new texture object that acts the same as this one.
 *
 * @return {PIXI.Texture}
 */
Texture.prototype.clone = function ()
{
    return new Texture(this.baseTexture, this.frame, this.crop, this.trim, this.rotate);
};

/**
 * Updates the internal WebGL UV cache.
 *
 * @private
 */
Texture.prototype._updateUvs = function ()
{
    if (!this._uvs)
    {
        this._uvs = new TextureUvs();
    }

    this._uvs.set(this.crop, this.baseTexture, this.rotate);
};

/**
 * Helper function that creates a Texture object from the given image url.
 * If the image is not in the texture cache it will be  created and loaded.
 *
 * @static
 * @param imageUrl {string} The image url of the texture
 * @param crossorigin {boolean} Whether requests should be treated as crossorigin
 * @param scaleMode {number} See {@link PIXI.SCALE_MODES} for possible values
 * @return {PIXI.Texture} The newly created texture
 */
Texture.fromImage = function (imageUrl, crossorigin, scaleMode)
{
    var texture = utils.TextureCache[imageUrl];

    if (!texture)
    {
        texture = new Texture(BaseTexture.fromImage(imageUrl, crossorigin, scaleMode));
        utils.TextureCache[imageUrl] = texture;
    }

    return texture;
};

/**
 * Helper function that creates a sprite that will contain a texture from the TextureCache based on the frameId
 * The frame ids are created when a Texture packer file has been loaded
 *
 * @static
 * @param frameId {string} The frame Id of the texture in the cache
 * @return {PIXI.Texture} The newly created texture
 */
Texture.fromFrame = function (frameId)
{
    var texture = utils.TextureCache[frameId];

    if (!texture)
    {
        throw new Error('The frameId "' + frameId + '" does not exist in the texture cache');
    }

    return texture;
};

/**
 * Helper function that creates a new Texture based on the given canvas element.
 *
 * @static
 * @param canvas {Canvas} The canvas element source of the texture
 * @param scaleMode {number} See {@link PIXI.SCALE_MODES} for possible values
 * @return {PIXI.Texture}
 */
Texture.fromCanvas = function (canvas, scaleMode)
{
    return new Texture(BaseTexture.fromCanvas(canvas, scaleMode));
};

/**
 * Helper function that creates a new Texture based on the given video element.
 *
 * @static
 * @param video {HTMLVideoElement}
 * @param scaleMode {number} See {@link PIXI.SCALE_MODES} for possible values
 * @return {PIXI.Texture} A Texture
 */
Texture.fromVideo = function (video, scaleMode)
{
    if (typeof video === 'string')
    {
        return Texture.fromVideoUrl(video, scaleMode);
    }
    else
    {
        return new Texture(VideoBaseTexture.fromVideo(video, scaleMode));
    }
};

/**
 * Helper function that creates a new Texture based on the video url.
 *
 * @static
 * @param videoUrl {string}
 * @param scaleMode {number} See {@link PIXI.SCALE_MODES} for possible values
 * @return {PIXI.Texture} A Texture
 */
Texture.fromVideoUrl = function (videoUrl, scaleMode)
{
    return new Texture(VideoBaseTexture.fromUrl(videoUrl, scaleMode));
};

/**
 * Adds a texture to the global utils.TextureCache. This cache is shared across the whole PIXI object.
 *
 * @static
 * @param texture {PIXI.Texture} The Texture to add to the cache.
 * @param id {string} The id that the texture will be stored against.
 */
Texture.addTextureToCache = function (texture, id)
{
    utils.TextureCache[id] = texture;
};

/**
 * Remove a texture from the global utils.TextureCache.
 *
 * @static
 * @param id {string} The id of the texture to be removed
 * @return {PIXI.Texture} The texture that was removed
 */
Texture.removeTextureFromCache = function (id)
{
    var texture = utils.TextureCache[id];

    delete utils.TextureCache[id];
    delete utils.BaseTextureCache[id];

    return texture;
};

/**
 * An empty texture, used often to not have to create multiple empty textures.
 *
 * @static
 * @constant
 */
Texture.EMPTY = new Texture(new BaseTexture());

},{"../math":12,"../utils":29,"./BaseTexture":23,"./TextureUvs":26,"./VideoBaseTexture":1,"eventemitter3":2}],26:[function(require,module,exports){

/**
 * A standard object to store the Uvs of a texture
 *
 * @class
 * @private
 * @memberof PIXI
 */
function TextureUvs()
{
    this.x0 = 0;
    this.y0 = 0;

    this.x1 = 1;
    this.y1 = 0;

    this.x2 = 1;
    this.y2 = 1;

    this.x3 = 0;
    this.y3 = 1;
}

module.exports = TextureUvs;

/**
 * Sets the texture Uvs based on the given frame information
 * @param frame {PIXI.Rectangle}
 * @param baseFrame {PIXI.Rectangle}
 * @param rotate {boolean} Whether or not the frame is rotated
 * @private
 */
TextureUvs.prototype.set = function (frame, baseFrame, rotate)
{
    var tw = baseFrame.width;
    var th = baseFrame.height;

    if(rotate)
    {
        this.x0 = (frame.x + frame.height) / tw;
        this.y0 = frame.y / th;

        this.x1 = (frame.x + frame.height) / tw;
        this.y1 = (frame.y + frame.width) / th;

        this.x2 = frame.x / tw;
        this.y2 = (frame.y + frame.width) / th;

        this.x3 = frame.x / tw;
        this.y3 = frame.y / th;
    }
    else
    {

        this.x0 = frame.x / tw;
        this.y0 = frame.y / th;

        this.x1 = (frame.x + frame.width) / tw;
        this.y1 = frame.y / th;

        this.x2 = (frame.x + frame.width) / tw;
        this.y2 = (frame.y + frame.height) / th;

        this.x3 = frame.x / tw;
        this.y3 = (frame.y + frame.height) / th;
    }
};

},{}],27:[function(require,module,exports){
var CONST = require('../const'),
    EventEmitter = require('eventemitter3'),
    // Internal event used by composed emitter
    TICK = 'tick';

/**
 * A Ticker class that runs an update loop that other objects listen to.
 * This class is composed around an EventEmitter object to add listeners
 * meant for execution on the next requested animation frame.
 * Animation frames are requested only when necessary,
 * e.g. When the ticker is started and the emitter has listeners.
 *
 * @class
 * @memberof PIXI.ticker
 */
function Ticker()
{
    var _this = this;

    /**
     * Internal tick method bound to ticker instance.
     * This is because in early 2015, Function.bind
     * is still 60% slower in high performance scenarios.
     * Also separating frame requests from update method
     * so listeners may be called at any time and with
     * any animation API, just invoke ticker.update(time).
     *
     * @private
     */
    this._tick = function _tick(time) {

        _this._requestId = null;

        if (_this.started)
        {
            // Invoke listeners now
            _this.update(time);
            // Listener side effects may have modified ticker state.
            if (_this.started && _this._requestId === null && _this._emitter.listeners(TICK, true))
            {
                _this._requestId = requestAnimationFrame(_this._tick);
            }
        }
    };

    /**
     * Internal emitter used to fire 'tick' event
     * @private
     */
    this._emitter = new EventEmitter();

    /**
     * Internal current frame request ID
     * @private
     */
    this._requestId = null;

    /**
     * Internal value managed by minFPS property setter and getter.
     * This is the maximum allowed milliseconds between updates.
     * @private
     */
    this._maxElapsedMS = 100;

    /**
     * Whether or not this ticker should invoke the method
     * {@link PIXI.ticker.Ticker#start} automatically
     * when a listener is added.
     *
     * @member {boolean}
     * @default false
     */
    this.autoStart = false;

    /**
     * Scalar time value from last frame to this frame.
     * This value is capped by setting {@link PIXI.ticker.Ticker#minFPS}
     * and is scaled with {@link PIXI.ticker.Ticker#speed}.
     * **Note:** The cap may be exceeded by scaling.
     *
     * @member {number}
     * @default 1
     */
    this.deltaTime = 1;

    /**
     * Time elapsed in milliseconds from last frame to this frame.
     * Opposed to what the scalar {@link PIXI.ticker.Ticker#deltaTime}
     * is based, this value is neither capped nor scaled.
     * If the platform supports DOMHighResTimeStamp,
     * this value will have a precision of 1 µs.
     *
     * @member {DOMHighResTimeStamp|number}
     * @default 1 / TARGET_FPMS
     */
    this.elapsedMS = 1 / CONST.TARGET_FPMS; // default to target frame time

    /**
     * The last time {@link PIXI.ticker.Ticker#update} was invoked.
     * This value is also reset internally outside of invoking
     * update, but only when a new animation frame is requested.
     * If the platform supports DOMHighResTimeStamp,
     * this value will have a precision of 1 µs.
     *
     * @member {DOMHighResTimeStamp|number}
     * @default 0
     */
    this.lastTime = 0;

    /**
     * Factor of current {@link PIXI.ticker.Ticker#deltaTime}.
     * @example
     * // Scales ticker.deltaTime to what would be
     * // the equivalent of approximately 120 FPS
     * ticker.speed = 2;
     *
     * @member {number}
     * @default 1
     */
    this.speed = 1;

    /**
     * Whether or not this ticker has been started.
     * `true` if {@link PIXI.ticker.Ticker#start} has been called.
     * `false` if {@link PIXI.ticker.Ticker#stop} has been called.
     * While `false`, this value may change to `true` in the
     * event of {@link PIXI.ticker.Ticker#autoStart} being `true`
     * and a listener is added.
     *
     * @member {boolean}
     * @default false
     */
    this.started = false;
}

Object.defineProperties(Ticker.prototype, {
    /**
     * The frames per second at which this ticker is running.
     * The default is approximately 60 in most modern browsers.
     * **Note:** This does not factor in the value of
     * {@link PIXI.ticker.Ticker#speed}, which is specific
     * to scaling {@link PIXI.ticker.Ticker#deltaTime}.
     *
     * @member
     * @memberof PIXI.ticker.Ticker#
     * @readonly
     */
    FPS: {
        get: function()
        {
            return 1000 / this.elapsedMS;
        }
    },

    /**
     * Manages the maximum amount of milliseconds allowed to
     * elapse between invoking {@link PIXI.ticker.Ticker#update}.
     * This value is used to cap {@link PIXI.ticker.Ticker#deltaTime},
     * but does not effect the measured value of {@link PIXI.ticker.Ticker#FPS}.
     * When setting this property it is clamped to a value between
     * `0` and `PIXI.TARGET_FPMS * 1000`.
     *
     * @member
     * @memberof PIXI.ticker.Ticker#
     * @default 10
     */
    minFPS: {
        get: function()
        {
            return 1000 / this._maxElapsedMS;
        },
        set: function(fps)
        {
            // Clamp: 0 to TARGET_FPMS
            var minFPMS = Math.min(Math.max(0, fps) / 1000, CONST.TARGET_FPMS);
            this._maxElapsedMS = 1 / minFPMS;
        }
    }
});

/**
 * Conditionally requests a new animation frame.
 * If a frame has not already been requested, and if the internal
 * emitter has listeners, a new frame is requested.
 *
 * @private
 */
Ticker.prototype._requestIfNeeded = function _requestIfNeeded()
{
    if (this._requestId === null && this._emitter.listeners(TICK, true))
    {
        // ensure callbacks get correct delta
        this.lastTime = performance.now();
        this._requestId = requestAnimationFrame(this._tick);
    }
};

/**
 * Conditionally cancels a pending animation frame.
 *
 * @private
 */
Ticker.prototype._cancelIfNeeded = function _cancelIfNeeded()
{
    if (this._requestId !== null)
    {
        cancelAnimationFrame(this._requestId);
        this._requestId = null;
    }
};

/**
 * Conditionally requests a new animation frame.
 * If the ticker has been started it checks if a frame has not already
 * been requested, and if the internal emitter has listeners. If these
 * conditions are met, a new frame is requested. If the ticker has not
 * been started, but autoStart is `true`, then the ticker starts now,
 * and continues with the previous conditions to request a new frame.
 *
 * @private
 */
Ticker.prototype._startIfPossible = function _startIfPossible()
{
    if (this.started)
    {
        this._requestIfNeeded();
    }
    else if (this.autoStart)
    {
        this.start();
    }
};

/**
 * Calls {@link module:eventemitter3.EventEmitter#on} internally for the
 * internal 'tick' event. It checks if the emitter has listeners,
 * and if so it requests a new animation frame at this point.
 *
 * @param fn {Function} The listener function to be added for updates
 * @param [context] {Function} The listener context
 * @returns {PIXI.ticker.Ticker} this
 */
Ticker.prototype.add = function add(fn, context)
{
    this._emitter.on(TICK, fn, context);

    this._startIfPossible();

    return this;
};

/**
 * Calls {@link module:eventemitter3.EventEmitter#once} internally for the
 * internal 'tick' event. It checks if the emitter has listeners,
 * and if so it requests a new animation frame at this point.
 *
 * @param fn {Function} The listener function to be added for one update
 * @param [context] {Function} The listener context
 * @returns {PIXI.ticker.Ticker} this
 */
Ticker.prototype.addOnce = function addOnce(fn, context)
{
    this._emitter.once(TICK, fn, context);

    this._startIfPossible();

    return this;
};

/**
 * Calls {@link module:eventemitter3.EventEmitter#off} internally for 'tick' event.
 * It checks if the emitter has listeners for 'tick' event.
 * If it does, then it cancels the animation frame.
 *
 * @param [fn] {Function} The listener function to be removed
 * @param [context] {Function} The listener context to be removed
 * @returns {PIXI.ticker.Ticker} this
 */
Ticker.prototype.remove = function remove(fn, context)
{
    this._emitter.off(TICK, fn, context);

    if (!this._emitter.listeners(TICK, true))
    {
        this._cancelIfNeeded();
    }

    return this;
};

/**
 * Starts the ticker. If the ticker has listeners
 * a new animation frame is requested at this point.
 */
Ticker.prototype.start = function start()
{
    if (!this.started)
    {
        this.started = true;
        this._requestIfNeeded();
    }
};

/**
 * Stops the ticker. If the ticker has requested
 * an animation frame it is canceled at this point.
 */
Ticker.prototype.stop = function stop()
{
    if (this.started)
    {
        this.started = false;
        this._cancelIfNeeded();
    }
};

/**
 * Triggers an update. An update entails setting the
 * current {@link PIXI.ticker.Ticker#elapsedMS},
 * the current {@link PIXI.ticker.Ticker#deltaTime},
 * invoking all listeners with current deltaTime,
 * and then finally setting {@link PIXI.ticker.Ticker#lastTime}
 * with the value of currentTime that was provided.
 * This method will be called automatically by animation
 * frame callbacks if the ticker instance has been started
 * and listeners are added.
 *
 * @param [currentTime=performance.now()] {DOMHighResTimeStamp|number} the current time of execution
 */
Ticker.prototype.update = function update(currentTime)
{
    var elapsedMS;

    // Allow calling update directly with default currentTime.
    currentTime = currentTime || performance.now();
    // Save uncapped elapsedMS for measurement
    elapsedMS = this.elapsedMS = currentTime - this.lastTime;

    // cap the milliseconds elapsed used for deltaTime
    if (elapsedMS > this._maxElapsedMS)
    {
        elapsedMS = this._maxElapsedMS;
    }

    this.deltaTime = elapsedMS * CONST.TARGET_FPMS * this.speed;

    // Invoke listeners added to internal emitter
    this._emitter.emit(TICK, this.deltaTime);

    this.lastTime = currentTime;
};

module.exports = Ticker;

},{"../const":4,"eventemitter3":2}],28:[function(require,module,exports){
var Ticker = require('./Ticker');

/**
 * The shared ticker instance used by {@link PIXI.extras.MovieClip}.
 * and by {@link PIXI.interaction.InteractionManager}.
 * The property {@link PIXI.ticker.Ticker#autoStart} is set to `true`
 * for this instance. Please follow the examples for usage, including
 * how to opt-out of auto-starting the shared ticker.
 *
 * @example
 * var ticker = PIXI.ticker.shared;
 * // Set this to prevent starting this ticker when listeners are added.
 * // By default this is true only for the PIXI.ticker.shared instance.
 * ticker.autoStart = false;
 * // FYI, call this to ensure the ticker is stopped. It should be stopped
 * // if you have not attempted to render anything yet.
 * ticker.stop();
 * // Call this when you are ready for a running shared ticker.
 * ticker.start();
 *
 * @example
 * // You may use the shared ticker to render...
 * var renderer = PIXI.autoDetectRenderer(800, 600);
 * var stage = new PIXI.Container();
 * var interactionManager = PIXI.interaction.InteractionManager(renderer);
 * document.body.appendChild(renderer.view);
 * ticker.add(function (time) {
 *     renderer.render(stage);
 * });
 *
 * @example
 * // Or you can just update it manually.
 * ticker.autoStart = false;
 * ticker.stop();
 * function animate(time) {
 *     ticker.update(time);
 *     renderer.render(stage);
 *     requestAnimationFrame(animate);
 * }
 * animate(performance.now());
 *
 * @type {PIXI.ticker.Ticker}
 * @memberof PIXI.ticker
 */
var shared = new Ticker();
shared.autoStart = true;

/**
 * @namespace PIXI.ticker
 */
module.exports = {
    shared: shared,
    Ticker: Ticker
};

},{"./Ticker":27}],29:[function(require,module,exports){
var CONST = require('../const');

/**
 * @namespace PIXI.utils
 */
var utils = module.exports = {
    _uid: 0,
    _saidHello: false,

    EventEmitter:   require('eventemitter3'),
    pluginTarget:   require('./pluginTarget'),
    async:          require('async'),

    /**
     * Gets the next unique identifier
     *
     * @return {number} The next unique identifier to use.
     */
    uid: function ()
    {
        return ++utils._uid;
    },

    /**
     * Converts a hex color number to an [R, G, B] array
     *
     * @param hex {number}
     * @param  {number[]} [out=[]]
     * @return {number[]} An array representing the [R, G, B] of the color.
     */
    hex2rgb: function (hex, out)
    {
        out = out || [];

        out[0] = (hex >> 16 & 0xFF) / 255;
        out[1] = (hex >> 8 & 0xFF) / 255;
        out[2] = (hex & 0xFF) / 255;

        return out;
    },

    /**
     * Converts a hex color number to a string.
     *
     * @param hex {number}
     * @return {string} The string color.
     */
    hex2string: function (hex)
    {
        hex = hex.toString(16);
        hex = '000000'.substr(0, 6 - hex.length) + hex;

        return '#' + hex;
    },

    /**
     * Converts a color as an [R, G, B] array to a hex number
     *
     * @param rgb {number[]}
     * @return {number} The color number
     */
    rgb2hex: function (rgb)
    {
        return ((rgb[0]*255 << 16) + (rgb[1]*255 << 8) + rgb[2]*255);
    },

    /**
     * Checks whether the Canvas BlendModes are supported by the current browser
     *
     * @return {boolean} whether they are supported
     */
    canUseNewCanvasBlendModes: function ()
    {
        if (typeof document === 'undefined')
        {
            return false;
        }

        var pngHead = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAABAQMAAADD8p2OAAAAA1BMVEX/';
        var pngEnd = 'AAAACklEQVQI12NgAAAAAgAB4iG8MwAAAABJRU5ErkJggg==';

        var magenta = new Image();
        magenta.src = pngHead + 'AP804Oa6' + pngEnd;

        var yellow = new Image();
        yellow.src = pngHead + '/wCKxvRF' + pngEnd;

        var canvas = document.createElement('canvas');
        canvas.width = 6;
        canvas.height = 1;

        var context = canvas.getContext('2d');
        context.globalCompositeOperation = 'multiply';
        context.drawImage(magenta, 0, 0);
        context.drawImage(yellow, 2, 0);

        var data = context.getImageData(2,0,1,1).data;

        return (data[0] === 255 && data[1] === 0 && data[2] === 0);
    },

    /**
     * Given a number, this function returns the closest number that is a power of two
     * this function is taken from Starling Framework as its pretty neat ;)
     *
     * @param number {number}
     * @return {number} the closest number that is a power of two
     */
    getNextPowerOfTwo: function (number)
    {
        // see: http://en.wikipedia.org/wiki/Power_of_two#Fast_algorithm_to_check_if_a_positive_number_is_a_power_of_two
        if (number > 0 && (number & (number - 1)) === 0)
        {
            return number;
        }
        else
        {
            var result = 1;

            while (result < number)
            {
                result <<= 1;
            }

            return result;
        }
    },

    /**
     * checks if the given width and height make a power of two rectangle
     *
     * @param width {number}
     * @param height {number}
     * @return {boolean}
     */
    isPowerOfTwo: function (width, height)
    {
        return (width > 0 && (width & (width - 1)) === 0 && height > 0 && (height & (height - 1)) === 0);
    },

    /**
     * get the resolution of an asset by looking for the prefix
     * used by spritesheets and image urls
     *
     * @param url {string} the image path
     * @return {number}
     */
    getResolutionOfUrl: function (url)
    {
        var resolution = CONST.RETINA_PREFIX.exec(url);

        if (resolution)
        {
           return parseFloat(resolution[1]);
        }

        return 1;
    },

    /**
     * Logs out the version and renderer information for this running instance of PIXI.
     * If you don't want to see this message you can set `PIXI.utils._saidHello = true;`
     * so the library thinks it already said it. Keep in mind that doing that will forever
     * makes you a jerk face.
     *
     * @param {string} type - The string renderer type to log.
     * @constant
     * @static
     */
    sayHello: function (type)
    {
        if (utils._saidHello)
        {
            return;
        }

        if (navigator.userAgent.toLowerCase().indexOf('chrome') > -1)
        {
            var args = [
                '\n %c %c %c Pixi.js ' + CONST.VERSION + ' - ✰ ' + type + ' ✰  %c ' + ' %c ' + ' http://www.pixijs.com/  %c %c ♥%c♥%c♥ \n\n',
                'background: #ff66a5; padding:5px 0;',
                'background: #ff66a5; padding:5px 0;',
                'color: #ff66a5; background: #030307; padding:5px 0;',
                'background: #ff66a5; padding:5px 0;',
                'background: #ffc3dc; padding:5px 0;',
                'background: #ff66a5; padding:5px 0;',
                'color: #ff2424; background: #fff; padding:5px 0;',
                'color: #ff2424; background: #fff; padding:5px 0;',
                'color: #ff2424; background: #fff; padding:5px 0;'
            ];

            window.console.log.apply(console, args); //jshint ignore:line
        }
        else if (window.console)
        {
            window.console.log('Pixi.js ' + CONST.VERSION + ' - ' + type + ' - http://www.pixijs.com/'); //jshint ignore:line
        }

        utils._saidHello = true;
    },

    /**
     * Helper for checking for webgl support
     *
     * @return {boolean}
     */
    isWebGLSupported: function ()
    {
        var contextOptions = { stencil: true };
        try
        {
            if (!window.WebGLRenderingContext)
            {
                return false;
            }

            var canvas = document.createElement('canvas'),
                gl = canvas.getContext('webgl', contextOptions) || canvas.getContext('experimental-webgl', contextOptions);

            return !!(gl && gl.getContextAttributes().stencil);
        }
        catch (e)
        {
            return false;
        }
    },

    /**
     * Returns sign of number
     *
     * @param n {number}
     * @returns {number} 0 if n is 0, -1 if n is negative, 1 if n i positive
     */
    sign: function (n) {
        return n ? (n < 0 ? -1 : 1) : 0;
    },

    /**
     * @todo Describe property usage
     * @private
     */
    TextureCache: {},

    /**
     * @todo Describe property usage
     * @private
     */
    BaseTextureCache: {}
};

},{"../const":4,"./pluginTarget":30,"async":1,"eventemitter3":2}],30:[function(require,module,exports){
/**
 * Mixins functionality to make an object have "plugins".
 *
 * @mixin
 * @memberof PIXI.utils
 * @param obj {object} The object to mix into.
 * @example
 *      function MyObject() {}
 *
 *      pluginTarget.mixin(MyObject);
 */
function pluginTarget(obj)
{
    obj.__plugins = {};

    /**
     * Adds a plugin to an object
     *
     * @param pluginName {string} The events that should be listed.
     * @param ctor {Function} The constructor function for the plugin.
     */
    obj.registerPlugin = function (pluginName, ctor)
    {
        obj.__plugins[pluginName] = ctor;
    };

    /**
     * Instantiates all the plugins of this object
     *
     */
    obj.prototype.initPlugins = function ()
    {
        this.plugins = this.plugins || {};

        for (var o in obj.__plugins)
        {
            this.plugins[o] = new (obj.__plugins[o])(this);
        }
    };

    /**
     * Removes all the plugins of this object
     *
     */
    obj.prototype.destroyPlugins = function ()
    {
        for (var o in this.plugins)
        {
            this.plugins[o].destroy();
            this.plugins[o] = null;
        }

        this.plugins = null;
    };
}


module.exports = {
    /**
     * Mixes in the properties of the pluginTarget into another object
     *
     * @param object {object} The obj to mix into
     */
    mixin: function mixin(obj)
    {
        pluginTarget(obj);
    }
};

},{}],31:[function(require,module,exports){
(function (global){
// run the polyfills
require('./polyfill');

var core = module.exports = require('./core');

// add core plugins.
core.extras         = require('./extras');
core.filters        = require('./filters');
core.interaction    = require('./interaction');
core.loaders        = require('./loaders');
core.mesh           = require('./mesh');

// export a premade loader instance
/**
 * A premade instance of the loader that can be used to loader resources.
 *
 * @name loader
 * @memberof PIXI
 * @property {PIXI.loaders.Loader}
 */
//core.loader = new core.loaders.Loader();

// mixin the deprecation features.
//Object.assign(core, require('./deprecation'));

// Always export pixi globally.
global.PIXI = core;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./core":9,"./extras":1,"./filters":1,"./interaction":34,"./loaders":1,"./mesh":1,"./polyfill":38}],32:[function(require,module,exports){
var core = require('../core');

/**
 * Holds all information related to an Interaction event
 *
 * @class
 * @memberof PIXI.interaction
 */
function InteractionData()
{
    /**
     * This point stores the global coords of where the touch/mouse event happened
     *
     * @member {PIXI.Point}
     */
    this.global = new core.Point();

    /**
     * The target Sprite that was interacted with
     *
     * @member {PIXI.Sprite}
     */
    this.target = null;

    /**
     * When passed to an event handler, this will be the original DOM Event that was captured
     *
     * @member {Event}
     */
    this.originalEvent = null;
}

InteractionData.prototype.constructor = InteractionData;
module.exports = InteractionData;

/**
 * This will return the local coordinates of the specified displayObject for this InteractionData
 *
 * @param displayObject {PIXI.DisplayObject} The DisplayObject that you would like the local coords off
 * @param [point] {PIXI.Point} A Point object in which to store the value, optional (otherwise will create a new point)
 * param [globalPos] {PIXI.Point} A Point object containing your custom global coords, optional (otherwise will use the current global coords)
 * @return {PIXI.Point} A point containing the coordinates of the InteractionData position relative to the DisplayObject
 */
InteractionData.prototype.getLocalPosition = function (displayObject, point, globalPos)
{
    return displayObject.toLocal(globalPos ? globalPos : this.global, point);
};

},{"../core":9}],33:[function(require,module,exports){
var core = require('../core'),
    InteractionData = require('./InteractionData');

// Mix interactiveTarget into core.DisplayObject.prototype
Object.assign(
    core.DisplayObject.prototype,
    require('./interactiveTarget')
);

/**
 * The interaction manager deals with mouse and touch events. Any DisplayObject can be interactive
 * if its interactive parameter is set to true
 * This manager also supports multitouch.
 *
 * @class
 * @memberof PIXI.interaction
 * @param renderer {PIXI.CanvasRenderer|PIXI.WebGLRenderer} A reference to the current renderer
 * @param [options] {object}
 * @param [options.autoPreventDefault=true] {boolean} Should the manager automatically prevent default browser actions.
 * @param [options.interactionFrequency=10] {number} Frequency increases the interaction events will be checked.
 */
function InteractionManager(renderer, options)
{
    options = options || {};

    /**
     * The renderer this interaction manager works for.
     *
     * @member {PIXI.SystemRenderer}
     */
    this.renderer = renderer;

    /**
     * Should default browser actions automatically be prevented.
     *
     * @member {boolean}
     * @default true
     */
    this.autoPreventDefault = options.autoPreventDefault !== undefined ? options.autoPreventDefault : true;

    /**
     * As this frequency increases the interaction events will be checked more often.
     *
     * @member {number}
     * @default 10
     */
    this.interactionFrequency = options.interactionFrequency || 10;

    /**
     * The mouse data
     *
     * @member {PIXI.interaction.InteractionData}
     */
    this.mouse = new InteractionData();

    /**
     * An event data object to handle all the event tracking/dispatching
     *
     * @member {object}
     */
    this.eventData = {
        stopped: false,
        target: null,
        type: null,
        data: this.mouse,
        stopPropagation:function(){
            this.stopped = true;
        }
    };

    /**
     * Tiny little interactiveData pool !
     *
     * @member {PIXI.interaction.InteractionData[]}
     */
    this.interactiveDataPool = [];

    /**
     * The DOM element to bind to.
     *
     * @member {HTMLElement}
     * @private
     */
    this.interactionDOMElement = null;

    /**
     * Have events been attached to the dom element?
     *
     * @member {boolean}
     * @private
     */
    this.eventsAdded = false;

    //this will make it so that you don't have to call bind all the time

    /**
     * @member {Function}
     */
    this.onMouseUp = this.onMouseUp.bind(this);
    this.processMouseUp = this.processMouseUp.bind( this );


    /**
     * @member {Function}
     */
    this.onMouseDown = this.onMouseDown.bind(this);
    this.processMouseDown = this.processMouseDown.bind( this );

    /**
     * @member {Function}
     */
    this.onMouseMove = this.onMouseMove.bind( this );
    this.processMouseMove = this.processMouseMove.bind( this );

    /**
     * @member {Function}
     */
    this.onMouseOut = this.onMouseOut.bind(this);
    this.processMouseOverOut = this.processMouseOverOut.bind( this );


    /**
     * @member {Function}
     */
    this.onTouchStart = this.onTouchStart.bind(this);
    this.processTouchStart = this.processTouchStart.bind(this);

    /**
     * @member {Function}
     */
    this.onTouchEnd = this.onTouchEnd.bind(this);
    this.processTouchEnd = this.processTouchEnd.bind(this);

    /**
     * @member {Function}
     */
    this.onTouchMove = this.onTouchMove.bind(this);
    this.processTouchMove = this.processTouchMove.bind(this);

    /**
     * @member {number}
     */
    this.last = 0;

    /**
     * The css style of the cursor that is being used
     * @member {string}
     */
    this.currentCursorStyle = 'inherit';

    /**
     * Internal cached var
     * @member {PIXI.Point}
     * @private
     */
    this._tempPoint = new core.Point();

    /**
     * The current resolution
     * @member {number}
     */
    this.resolution = 1;

    this.setTargetElement(this.renderer.view, this.renderer.resolution);
}

InteractionManager.prototype.constructor = InteractionManager;
module.exports = InteractionManager;

/**
 * Sets the DOM element which will receive mouse/touch events. This is useful for when you have
 * other DOM elements on top of the renderers Canvas element. With this you'll be bale to deletegate
 * another DOM element to receive those events.
 *
 * @param element {HTMLElement} the DOM element which will receive mouse and touch events.
 * @param [resolution=1] {number} THe resolution of the new element (relative to the canvas).
 * @private
 */
InteractionManager.prototype.setTargetElement = function (element, resolution)
{
    this.removeEvents();

    this.interactionDOMElement = element;

    this.resolution = resolution || 1;

    this.addEvents();
};

/**
 * Registers all the DOM events
 *
 * @private
 */
InteractionManager.prototype.addEvents = function ()
{
    if (!this.interactionDOMElement)
    {
        return;
    }

    core.ticker.shared.add(this.update, this);

    if (window.navigator.msPointerEnabled)
    {
        this.interactionDOMElement.style['-ms-content-zooming'] = 'none';
        this.interactionDOMElement.style['-ms-touch-action'] = 'none';
    }

    window.document.addEventListener('mousemove',    this.onMouseMove, true);
    this.interactionDOMElement.addEventListener('mousedown',    this.onMouseDown, true);
    this.interactionDOMElement.addEventListener('mouseout',     this.onMouseOut, true);

    this.interactionDOMElement.addEventListener('touchstart',   this.onTouchStart, true);
    this.interactionDOMElement.addEventListener('touchend',     this.onTouchEnd, true);
    this.interactionDOMElement.addEventListener('touchmove',    this.onTouchMove, true);

    window.addEventListener('mouseup',  this.onMouseUp, true);

    this.eventsAdded = true;
};

/**
 * Removes all the DOM events that were previously registered
 *
 * @private
 */
InteractionManager.prototype.removeEvents = function ()
{
    if (!this.interactionDOMElement)
    {
        return;
    }

    core.ticker.shared.remove(this.update);

    if (window.navigator.msPointerEnabled)
    {
        this.interactionDOMElement.style['-ms-content-zooming'] = '';
        this.interactionDOMElement.style['-ms-touch-action'] = '';
    }

    window.document.removeEventListener('mousemove', this.onMouseMove, true);
    this.interactionDOMElement.removeEventListener('mousedown', this.onMouseDown, true);
    this.interactionDOMElement.removeEventListener('mouseout',  this.onMouseOut, true);

    this.interactionDOMElement.removeEventListener('touchstart', this.onTouchStart, true);
    this.interactionDOMElement.removeEventListener('touchend',  this.onTouchEnd, true);
    this.interactionDOMElement.removeEventListener('touchmove', this.onTouchMove, true);

    this.interactionDOMElement = null;

    window.removeEventListener('mouseup',  this.onMouseUp, true);

    this.eventsAdded = false;
};

/**
 * Updates the state of interactive objects.
 * Invoked by a throttled ticker update from
 * {@link PIXI.ticker.shared}.
 *
 * @param deltaTime {number}
 */
InteractionManager.prototype.update = function (deltaTime)
{
    this._deltaTime += deltaTime;

    if (this._deltaTime < this.interactionFrequency)
    {
        return;
    }

    this._deltaTime = 0;

    if (!this.interactionDOMElement)
    {
        return;
    }

    // if the user move the mouse this check has already been dfone using the mouse move!
    if(this.didMove)
    {
        this.didMove = false;
        return;
    }

    this.cursor = 'inherit';

    this.processInteractive(this.mouse.global, this.renderer._lastObjectRendered, this.processMouseOverOut, true );

    if (this.currentCursorStyle !== this.cursor)
    {
        this.currentCursorStyle = this.cursor;
        this.interactionDOMElement.style.cursor = this.cursor;
    }

    //TODO
};

/**
 * Dispatches an event on the display object that was interacted with
 *
 * @param displayObject {PIXI.Container|PIXI.Sprite|PIXI.extras.TilingSprite} the display object in question
 * @param eventString {string} the name of the event (e.g, mousedown)
 * @param eventData {object} the event data object
 * @private
 */
InteractionManager.prototype.dispatchEvent = function ( displayObject, eventString, eventData )
{
    if(!eventData.stopped)
    {
        eventData.target = displayObject;
        eventData.type = eventString;

        displayObject.emit( eventString, eventData );

        if( displayObject[eventString] )
        {
            displayObject[eventString]( eventData );
        }
    }
};

/**
 * Maps x and y coords from a DOM object and maps them correctly to the pixi view. The resulting value is stored in the point.
 * This takes into account the fact that the DOM element could be scaled and positioned anywhere on the screen.
 *
 * @param  {PIXI.Point} point the point that the result will be stored in
 * @param  {number} x     the x coord of the position to map
 * @param  {number} y     the y coord of the position to map
 */
InteractionManager.prototype.mapPositionToPoint = function ( point, x, y )
{
    var rect = this.interactionDOMElement.getBoundingClientRect();
    point.x = ( ( x - rect.left ) * (this.interactionDOMElement.width  / rect.width  ) ) / this.resolution;
    point.y = ( ( y - rect.top  ) * (this.interactionDOMElement.height / rect.height ) ) / this.resolution;
};

/**
 * This function is provides a neat way of crawling through the scene graph and running a specified function on all interactive objects it finds.
 * It will also take care of hit testing the interactive objects and passes the hit across in the function.
 *
 * @param  {PIXI.Point} point the point that is tested for collision
 * @param  {PIXI.Container|PIXI.Sprite|PIXI.extras.TilingSprite} displayObject the displayObject that will be hit test (recurcsivly crawls its children)
 * @param  {Function} func the function that will be called on each interactive object. The displayObject and hit will be passed to the function
 * @param  {boolean} hitTest this indicates if the objects inside should be hit test against the point
 * @return {boolean} returns true if the displayObject hit the point
 */
InteractionManager.prototype.processInteractive = function (point, displayObject, func, hitTest, interactive )
{
    if(!displayObject || !displayObject.visible)
    {
        return false;
    }

    var children = displayObject.children;

    var hit = false;

    // if the object is interactive we must hit test all its children..
    interactive = interactive || displayObject.interactive;

    if(displayObject.interactiveChildren)
    {

        for (var i = children.length-1; i >= 0; i--)
        {
            if(! hit  && hitTest)
            {
                hit = this.processInteractive(point, children[i], func, true, interactive );
            }
            else
            {
                // now we know we can miss it all!
                this.processInteractive(point, children[i], func, false, false );
            }
        }

    }

    if(interactive)
    {
        if(hitTest)
        {
            if(displayObject.hitArea)
            {
                // lets use the hit object first!
                displayObject.worldTransform.applyInverse(point,  this._tempPoint);
                hit = displayObject.hitArea.contains( this._tempPoint.x, this._tempPoint.y );
            }
            else if(displayObject.containsPoint)
            {
                hit = displayObject.containsPoint(point);
            }
        }

        if(displayObject.interactive)
        {
            func(displayObject, hit);
        }
    }

    return hit;
};




/**
 * Is called when the mouse button is pressed down on the renderer element
 *
 * @param event {Event} The DOM event of a mouse button being pressed down
 * @private
 */
InteractionManager.prototype.onMouseDown = function (event)
{
    this.mouse.originalEvent = event;
    this.eventData.data = this.mouse;
    this.eventData.stopped = false;

    // Update internal mouse reference
    this.mapPositionToPoint( this.mouse.global, event.clientX, event.clientY);

    if (this.autoPreventDefault)
    {
        this.mouse.originalEvent.preventDefault();
    }

    this.processInteractive(this.mouse.global, this.renderer._lastObjectRendered, this.processMouseDown, true );
};

/**
 * Processes the result of the mouse down check and dispatches the event if need be
 *
 * @param displayObject {PIXI.Container|PIXI.Sprite|PIXI.extras.TilingSprite} The display object that was tested
 * @param hit {boolean} the result of the hit test on the dispay object
 * @private
 */
InteractionManager.prototype.processMouseDown = function ( displayObject, hit )
{
    var e = this.mouse.originalEvent;

    var isRightButton = e.button === 2 || e.which === 3;

    if(hit)
    {
        displayObject[ isRightButton ? '_isRightDown' : '_isLeftDown' ] = true;
        this.dispatchEvent( displayObject, isRightButton ? 'rightdown' : 'mousedown', this.eventData );
    }
};



/**
 * Is called when the mouse button is released on the renderer element
 *
 * @param event {Event} The DOM event of a mouse button being released
 * @private
 */
InteractionManager.prototype.onMouseUp = function (event)
{
    this.mouse.originalEvent = event;
    this.eventData.data = this.mouse;
    this.eventData.stopped = false;

    // Update internal mouse reference
    this.mapPositionToPoint( this.mouse.global, event.clientX, event.clientY);

    this.processInteractive(this.mouse.global, this.renderer._lastObjectRendered, this.processMouseUp, true );
};

/**
 * Processes the result of the mouse up check and dispatches the event if need be
 *
 * @param displayObject {PIXI.Container|PIXI.Sprite|PIXI.extras.TilingSprite} The display object that was tested
 * @param hit {boolean} the result of the hit test on the display object
 * @private
 */
InteractionManager.prototype.processMouseUp = function ( displayObject, hit )
{
    var e = this.mouse.originalEvent;

    var isRightButton = e.button === 2 || e.which === 3;
    var isDown =  isRightButton ? '_isRightDown' : '_isLeftDown';

    if(hit)
    {
        this.dispatchEvent( displayObject, isRightButton ? 'rightup' : 'mouseup', this.eventData );

        if( displayObject[ isDown ] )
        {
            displayObject[ isDown ] = false;
            this.dispatchEvent( displayObject, isRightButton ? 'rightclick' : 'click', this.eventData );
        }
    }
    else
    {
        if( displayObject[ isDown ] )
        {
            displayObject[ isDown ] = false;
            this.dispatchEvent( displayObject, isRightButton ? 'rightupoutside' : 'mouseupoutside', this.eventData );
        }
    }
};


/**
 * Is called when the mouse moves across the renderer element
 *
 * @param event {Event} The DOM event of the mouse moving
 * @private
 */
InteractionManager.prototype.onMouseMove = function (event)
{
    this.mouse.originalEvent = event;
    this.eventData.data = this.mouse;
    this.eventData.stopped = false;

    this.mapPositionToPoint( this.mouse.global, event.clientX, event.clientY);

    this.didMove = true;

    this.cursor = 'inherit';

    this.processInteractive(this.mouse.global, this.renderer._lastObjectRendered, this.processMouseMove, true );

    if (this.currentCursorStyle !== this.cursor)
    {
        this.currentCursorStyle = this.cursor;
        this.interactionDOMElement.style.cursor = this.cursor;
    }

    //TODO BUG for parents ineractive object (border order issue)
};

/**
 * Processes the result of the mouse move check and dispatches the event if need be
 *
 * @param displayObject {PIXI.Container|PIXI.Sprite|PIXI.extras.TilingSprite} The display object that was tested
 * @param hit {boolean} the result of the hit test on the display object
 * @private
 */
InteractionManager.prototype.processMouseMove = function ( displayObject, hit )
{
    this.dispatchEvent( displayObject, 'mousemove', this.eventData);
    this.processMouseOverOut(displayObject, hit);
};


/**
 * Is called when the mouse is moved out of the renderer element
 *
 * @param event {Event} The DOM event of a mouse being moved out
 * @private
 */
InteractionManager.prototype.onMouseOut = function (event)
{
    this.mouse.originalEvent = event;
    this.eventData.stopped = false;

    // Update internal mouse reference
    this.mapPositionToPoint( this.mouse.global, event.clientX, event.clientY);

    this.interactionDOMElement.style.cursor = 'inherit';

    // TODO optimize by not check EVERY TIME! maybe half as often? //
    this.mapPositionToPoint( this.mouse.global, event.clientX, event.clientY );

    this.processInteractive( this.mouse.global, this.renderer._lastObjectRendered, this.processMouseOverOut, false );
};

/**
 * Processes the result of the mouse over/out check and dispatches the event if need be
 *
 * @param displayObject {PIXI.Container|PIXI.Sprite|PIXI.extras.TilingSprite} The display object that was tested
 * @param hit {boolean} the result of the hit test on the display object
 * @private
 */
InteractionManager.prototype.processMouseOverOut = function ( displayObject, hit )
{
    if(hit)
    {
        if(!displayObject._over)
        {
            displayObject._over = true;
            this.dispatchEvent( displayObject, 'mouseover', this.eventData );
        }

        if (displayObject.buttonMode)
        {
            this.cursor = displayObject.defaultCursor;
        }
    }
    else
    {
        if(displayObject._over)
        {
            displayObject._over = false;
            this.dispatchEvent( displayObject, 'mouseout', this.eventData);
        }
    }
};


/**
 * Is called when a touch is started on the renderer element
 *
 * @param event {Event} The DOM event of a touch starting on the renderer view
 * @private
 */
InteractionManager.prototype.onTouchStart = function (event)
{
    if (this.autoPreventDefault)
    {
        event.preventDefault();
    }

    var changedTouches = event.changedTouches;
    var cLength = changedTouches.length;

    for (var i=0; i < cLength; i++)
    {
        var touchEvent = changedTouches[i];
        //TODO POOL
        var touchData = this.getTouchData( touchEvent );

        touchData.originalEvent = event;

        this.eventData.data = touchData;
        this.eventData.stopped = false;

        this.processInteractive( touchData.global, this.renderer._lastObjectRendered, this.processTouchStart, true );

        this.returnTouchData( touchData );
    }
};

/**
 * Processes the result of a touch check and dispatches the event if need be
 *
 * @param displayObject {PIXI.Container|PIXI.Sprite|PIXI.extras.TilingSprite} The display object that was tested
 * @param hit {boolean} the result of the hit test on the display object
 * @private
 */
InteractionManager.prototype.processTouchStart = function ( displayObject, hit )
{
    //console.log("hit" + hit)
    if(hit)
    {
        displayObject._touchDown = true;
        this.dispatchEvent( displayObject, 'touchstart', this.eventData );
    }
};


/**
 * Is called when a touch ends on the renderer element
 *
 * @param event {Event} The DOM event of a touch ending on the renderer view
 */
InteractionManager.prototype.onTouchEnd = function (event)
{
    if (this.autoPreventDefault)
    {
        event.preventDefault();
    }

    var changedTouches = event.changedTouches;
    var cLength = changedTouches.length;

    for (var i=0; i < cLength; i++)
    {
        var touchEvent = changedTouches[i];

        var touchData = this.getTouchData( touchEvent );

        touchData.originalEvent = event;

        //TODO this should be passed along.. no set
        this.eventData.data = touchData;
        this.eventData.stopped = false;


        this.processInteractive( touchData.global, this.renderer._lastObjectRendered, this.processTouchEnd, true );

        this.returnTouchData( touchData );
    }
};

/**
 * Processes the result of the end of a touch and dispatches the event if need be
 *
 * @param displayObject {PIXI.Container|PIXI.Sprite|PIXI.extras.TilingSprite} The display object that was tested
 * @param hit {boolean} the result of the hit test on the display object
 * @private
 */
InteractionManager.prototype.processTouchEnd = function ( displayObject, hit )
{
    if(hit)
    {
        this.dispatchEvent( displayObject, 'touchend', this.eventData );

        if( displayObject._touchDown )
        {
            displayObject._touchDown = false;
            this.dispatchEvent( displayObject, 'tap', this.eventData );
        }
    }
    else
    {
        if( displayObject._touchDown )
        {
            displayObject._touchDown = false;
            this.dispatchEvent( displayObject, 'touchendoutside', this.eventData );
        }
    }
};

/**
 * Is called when a touch is moved across the renderer element
 *
 * @param event {Event} The DOM event of a touch moving across the renderer view
 * @private
 */
InteractionManager.prototype.onTouchMove = function (event)
{
    if (this.autoPreventDefault)
    {
        event.preventDefault();
    }

    var changedTouches = event.changedTouches;
    var cLength = changedTouches.length;

    for (var i=0; i < cLength; i++)
    {
        var touchEvent = changedTouches[i];

        var touchData = this.getTouchData( touchEvent );

        touchData.originalEvent = event;

        this.eventData.data = touchData;
        this.eventData.stopped = false;

        this.processInteractive( touchData.global, this.renderer._lastObjectRendered, this.processTouchMove, true );

        this.returnTouchData( touchData );
    }
};

/**
 * Processes the result of a touch move check and dispatches the event if need be
 *
 * @param displayObject {PIXI.Container|PIXI.Sprite|PIXI.extras.TilingSprite} The display object that was tested
 * @param hit {boolean} the result of the hit test on the display object
 * @private
 */
InteractionManager.prototype.processTouchMove = function ( displayObject, hit )
{
    hit = hit;
    this.dispatchEvent( displayObject, 'touchmove', this.eventData);
};

/**
 * Grabs an interaction data object from the internal pool
 *
 * @param touchEvent {EventData} The touch event we need to pair with an interactionData object
 *
 * @private
 */
InteractionManager.prototype.getTouchData = function (touchEvent)
{
    var touchData = this.interactiveDataPool.pop();

    if(!touchData)
    {
        touchData = new InteractionData();
    }

    touchData.identifier = touchEvent.identifier;
    this.mapPositionToPoint( touchData.global, touchEvent.clientX, touchEvent.clientY );

    if(navigator.isCocoonJS)
    {
        touchData.global.x = touchData.global.x / this.resolution;
        touchData.global.y = touchData.global.y / this.resolution;
    }

    touchEvent.globalX = touchData.global.x;
    touchEvent.globalY = touchData.global.y;

    return touchData;
};

/**
 * Returns an interaction data object to the internal pool
 *
 * @param touchData {PIXI.interaction.InteractionData} The touch data object we want to return to the pool
 *
 * @private
 */
InteractionManager.prototype.returnTouchData = function ( touchData )
{
    this.interactiveDataPool.push( touchData );
};

/**
 * Destroys the interaction manager
 *
 */
InteractionManager.prototype.destroy = function () {
    this.removeEvents();

    this.renderer = null;

    this.mouse = null;

    this.eventData = null;

    this.interactiveDataPool = null;

    this.interactionDOMElement = null;

    this.onMouseUp = null;
    this.processMouseUp = null;


    this.onMouseDown = null;
    this.processMouseDown = null;

    this.onMouseMove = null;
    this.processMouseMove = null;

    this.onMouseOut = null;
    this.processMouseOverOut = null;


    this.onTouchStart = null;
    this.processTouchStart = null;

    this.onTouchEnd = null;
    this.processTouchEnd = null;

    this.onTouchMove = null;
    this.processTouchMove = null;

    this._tempPoint = null;
};

//core.WebGLRenderer.registerPlugin('interaction', InteractionManager);
core.CanvasRenderer.registerPlugin('interaction', InteractionManager);

},{"../core":9,"./InteractionData":32,"./interactiveTarget":35}],34:[function(require,module,exports){
/**
 * @file        Main export of the PIXI interactions library
 * @author      Mat Groves <mat@goodboydigital.com>
 * @copyright   2013-2015 GoodBoyDigital
 * @license     {@link https://github.com/pixijs/pixi.js/blob/master/LICENSE|MIT License}
 */

/**
 * @namespace PIXI.interaction
 */
module.exports = {
    InteractionData:    require('./InteractionData'),
    InteractionManager: require('./InteractionManager'),
    interactiveTarget:  require('./interactiveTarget')
};

},{"./InteractionData":32,"./InteractionManager":33,"./interactiveTarget":35}],35:[function(require,module,exports){
/**
 * Default property values of interactive objects
 * used by {@link PIXI.interaction.InteractionManager}.
 *
 * @mixin
 * @memberof PIXI.interaction
 * @example
 *      function MyObject() {}
 *
 *      Object.assign(
 *          MyObject.prototype,
 *          PIXI.interaction.interactiveTarget
 *      );
 */
var interactiveTarget = {
    /**
     * @todo Needs docs.
     */
    interactive: false,
    /**
     * @todo Needs docs.
     */
    buttonMode: false,
    /**
     * @todo Needs docs.
     */
    interactiveChildren: true,
    /**
     * @todo Needs docs.
     */
    defaultCursor: 'pointer',

    // some internal checks..

    /**
     * @todo Needs docs.
     * @private
     */
    _over: false,
    /**
     * @todo Needs docs.
     * @private
     */
    _touchDown: false
};

module.exports = interactiveTarget;

},{}],36:[function(require,module,exports){
// References:
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/sign

if (!Math.sign)
{
    Math.sign = function (x) {
        x = +x;
        if (x === 0 || isNaN(x))
        {
            return x;
        }
        return x > 0 ? 1 : -1;
    };
}

},{}],37:[function(require,module,exports){
// References:
// https://github.com/sindresorhus/object-assign
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign

if (!Object.assign)
{
    Object.assign = require('object-assign');
}

},{"object-assign":1}],38:[function(require,module,exports){
require('./Object.assign');
require('./requestAnimationFrame');
require('./Math.sign');

},{"./Math.sign":36,"./Object.assign":37,"./requestAnimationFrame":39}],39:[function(require,module,exports){
(function (global){
// References:
// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// https://gist.github.com/1579671
// http://updates.html5rocks.com/2012/05/requestAnimationFrame-API-now-with-sub-millisecond-precision
// https://gist.github.com/timhall/4078614
// https://github.com/Financial-Times/polyfill-service/tree/master/polyfills/requestAnimationFrame

// Expected to be used with Browserfiy
// Browserify automatically detects the use of `global` and passes the
// correct reference of `global`, `self`, and finally `window`

// Date.now
if (!(Date.now && Date.prototype.getTime)) {
    Date.now = function now() {
        return new Date().getTime();
    };
}

// performance.now
if (!(global.performance && global.performance.now)) {
    var startTime = Date.now();
    if (!global.performance) {
        global.performance = {};
    }
    global.performance.now = function () {
        return Date.now() - startTime;
    };
}

// requestAnimationFrame
var lastTime = Date.now();
var vendors = ['ms', 'moz', 'webkit', 'o'];

for(var x = 0; x < vendors.length && !global.requestAnimationFrame; ++x) {
    global.requestAnimationFrame = global[vendors[x] + 'RequestAnimationFrame'];
    global.cancelAnimationFrame = global[vendors[x] + 'CancelAnimationFrame'] ||
        global[vendors[x] + 'CancelRequestAnimationFrame'];
}

if (!global.requestAnimationFrame) {
    global.requestAnimationFrame = function (callback) {
        if (typeof callback !== 'function') {
            throw new TypeError(callback + 'is not a function');
        }

        var currentTime = Date.now(),
            delay = 16 + lastTime - currentTime;

        if (delay < 0) {
            delay = 0;
        }

        lastTime = currentTime;

        return setTimeout(function () {
            lastTime = Date.now();
            callback(performance.now());
        }, delay);
    };
}

if (!global.cancelAnimationFrame) {
    global.cancelAnimationFrame = function(id) {
        clearTimeout(id);
    };
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}]},{},[31])(31)
});
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9saWIvX2VtcHR5LmpzIiwibm9kZV9tb2R1bGVzL2V2ZW50ZW1pdHRlcjMvaW5kZXguanMiLCJwYWNrYWdlLmpzb24iLCJzcmMvY29yZS9jb25zdC5qcyIsInNyYy9jb3JlL2Rpc3BsYXkvQ29udGFpbmVyLmpzIiwic3JjL2NvcmUvZGlzcGxheS9EaXNwbGF5T2JqZWN0LmpzIiwic3JjL2NvcmUvZ3JhcGhpY3MvR3JhcGhpY3MuanMiLCJzcmMvY29yZS9ncmFwaGljcy9HcmFwaGljc0RhdGEuanMiLCJzcmMvY29yZS9pbmRleC5qcyIsInNyYy9jb3JlL21hdGgvTWF0cml4LmpzIiwic3JjL2NvcmUvbWF0aC9Qb2ludC5qcyIsInNyYy9jb3JlL21hdGgvaW5kZXguanMiLCJzcmMvY29yZS9tYXRoL3NoYXBlcy9DaXJjbGUuanMiLCJzcmMvY29yZS9tYXRoL3NoYXBlcy9Qb2x5Z29uLmpzIiwic3JjL2NvcmUvbWF0aC9zaGFwZXMvUmVjdGFuZ2xlLmpzIiwic3JjL2NvcmUvbWF0aC9zaGFwZXMvUm91bmRlZFJlY3RhbmdsZS5qcyIsInNyYy9jb3JlL3JlbmRlcmVycy9TeXN0ZW1SZW5kZXJlci5qcyIsInNyYy9jb3JlL3JlbmRlcmVycy9jYW52YXMvQ2FudmFzUmVuZGVyZXIuanMiLCJzcmMvY29yZS9yZW5kZXJlcnMvY2FudmFzL3V0aWxzL0NhbnZhc0dyYXBoaWNzLmpzIiwic3JjL2NvcmUvcmVuZGVyZXJzL2NhbnZhcy91dGlscy9DYW52YXNNYXNrTWFuYWdlci5qcyIsInNyYy9jb3JlL3Nwcml0ZXMvU3ByaXRlLmpzIiwic3JjL2NvcmUvdGV4dC9UZXh0LmpzIiwic3JjL2NvcmUvdGV4dHVyZXMvQmFzZVRleHR1cmUuanMiLCJzcmMvY29yZS90ZXh0dXJlcy9SZW5kZXJUZXh0dXJlLmpzIiwic3JjL2NvcmUvdGV4dHVyZXMvVGV4dHVyZS5qcyIsInNyYy9jb3JlL3RleHR1cmVzL1RleHR1cmVVdnMuanMiLCJzcmMvY29yZS90aWNrZXIvVGlja2VyLmpzIiwic3JjL2NvcmUvdGlja2VyL2luZGV4LmpzIiwic3JjL2NvcmUvdXRpbHMvaW5kZXguanMiLCJzcmMvY29yZS91dGlscy9wbHVnaW5UYXJnZXQuanMiLCJzcmNcXHNyY1xcaW5kZXguanMiLCJzcmMvaW50ZXJhY3Rpb24vSW50ZXJhY3Rpb25EYXRhLmpzIiwic3JjL2ludGVyYWN0aW9uL0ludGVyYWN0aW9uTWFuYWdlci5qcyIsInNyYy9pbnRlcmFjdGlvbi9pbmRleC5qcyIsInNyYy9pbnRlcmFjdGlvbi9pbnRlcmFjdGl2ZVRhcmdldC5qcyIsInNyYy9wb2x5ZmlsbC9NYXRoLnNpZ24uanMiLCJzcmMvcG9seWZpbGwvT2JqZWN0LmFzc2lnbi5qcyIsInNyYy9wb2x5ZmlsbC9pbmRleC5qcyIsInNyYy9wb2x5ZmlsbC9yZXF1ZXN0QW5pbWF0aW9uRnJhbWUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RRQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN1dBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuUUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0UUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoV0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25tQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaGJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hhQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25FQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaldBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3REQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6UEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNwRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3IxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7QUFDQTtBQUNBOzs7QUNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLG51bGwsIid1c2Ugc3RyaWN0JztcblxuLy9cbi8vIFdlIHN0b3JlIG91ciBFRSBvYmplY3RzIGluIGEgcGxhaW4gb2JqZWN0IHdob3NlIHByb3BlcnRpZXMgYXJlIGV2ZW50IG5hbWVzLlxuLy8gSWYgYE9iamVjdC5jcmVhdGUobnVsbClgIGlzIG5vdCBzdXBwb3J0ZWQgd2UgcHJlZml4IHRoZSBldmVudCBuYW1lcyB3aXRoIGFcbi8vIGB+YCB0byBtYWtlIHN1cmUgdGhhdCB0aGUgYnVpbHQtaW4gb2JqZWN0IHByb3BlcnRpZXMgYXJlIG5vdCBvdmVycmlkZGVuIG9yXG4vLyB1c2VkIGFzIGFuIGF0dGFjayB2ZWN0b3IuXG4vLyBXZSBhbHNvIGFzc3VtZSB0aGF0IGBPYmplY3QuY3JlYXRlKG51bGwpYCBpcyBhdmFpbGFibGUgd2hlbiB0aGUgZXZlbnQgbmFtZVxuLy8gaXMgYW4gRVM2IFN5bWJvbC5cbi8vXG52YXIgcHJlZml4ID0gdHlwZW9mIE9iamVjdC5jcmVhdGUgIT09ICdmdW5jdGlvbicgPyAnficgOiBmYWxzZTtcblxuLyoqXG4gKiBSZXByZXNlbnRhdGlvbiBvZiBhIHNpbmdsZSBFdmVudEVtaXR0ZXIgZnVuY3Rpb24uXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gRXZlbnQgaGFuZGxlciB0byBiZSBjYWxsZWQuXG4gKiBAcGFyYW0ge01peGVkfSBjb250ZXh0IENvbnRleHQgZm9yIGZ1bmN0aW9uIGV4ZWN1dGlvbi5cbiAqIEBwYXJhbSB7Qm9vbGVhbn0gb25jZSBPbmx5IGVtaXQgb25jZVxuICogQGFwaSBwcml2YXRlXG4gKi9cbmZ1bmN0aW9uIEVFKGZuLCBjb250ZXh0LCBvbmNlKSB7XG4gIHRoaXMuZm4gPSBmbjtcbiAgdGhpcy5jb250ZXh0ID0gY29udGV4dDtcbiAgdGhpcy5vbmNlID0gb25jZSB8fCBmYWxzZTtcbn1cblxuLyoqXG4gKiBNaW5pbWFsIEV2ZW50RW1pdHRlciBpbnRlcmZhY2UgdGhhdCBpcyBtb2xkZWQgYWdhaW5zdCB0aGUgTm9kZS5qc1xuICogRXZlbnRFbWl0dGVyIGludGVyZmFjZS5cbiAqXG4gKiBAY29uc3RydWN0b3JcbiAqIEBhcGkgcHVibGljXG4gKi9cbmZ1bmN0aW9uIEV2ZW50RW1pdHRlcigpIHsgLyogTm90aGluZyB0byBzZXQgKi8gfVxuXG4vKipcbiAqIEhvbGRzIHRoZSBhc3NpZ25lZCBFdmVudEVtaXR0ZXJzIGJ5IG5hbWUuXG4gKlxuICogQHR5cGUge09iamVjdH1cbiAqIEBwcml2YXRlXG4gKi9cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuX2V2ZW50cyA9IHVuZGVmaW5lZDtcblxuLyoqXG4gKiBSZXR1cm4gYSBsaXN0IG9mIGFzc2lnbmVkIGV2ZW50IGxpc3RlbmVycy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnQgVGhlIGV2ZW50cyB0aGF0IHNob3VsZCBiZSBsaXN0ZWQuXG4gKiBAcGFyYW0ge0Jvb2xlYW59IGV4aXN0cyBXZSBvbmx5IG5lZWQgdG8ga25vdyBpZiB0aGVyZSBhcmUgbGlzdGVuZXJzLlxuICogQHJldHVybnMge0FycmF5fEJvb2xlYW59XG4gKiBAYXBpIHB1YmxpY1xuICovXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmxpc3RlbmVycyA9IGZ1bmN0aW9uIGxpc3RlbmVycyhldmVudCwgZXhpc3RzKSB7XG4gIHZhciBldnQgPSBwcmVmaXggPyBwcmVmaXggKyBldmVudCA6IGV2ZW50XG4gICAgLCBhdmFpbGFibGUgPSB0aGlzLl9ldmVudHMgJiYgdGhpcy5fZXZlbnRzW2V2dF07XG5cbiAgaWYgKGV4aXN0cykgcmV0dXJuICEhYXZhaWxhYmxlO1xuICBpZiAoIWF2YWlsYWJsZSkgcmV0dXJuIFtdO1xuICBpZiAoYXZhaWxhYmxlLmZuKSByZXR1cm4gW2F2YWlsYWJsZS5mbl07XG5cbiAgZm9yICh2YXIgaSA9IDAsIGwgPSBhdmFpbGFibGUubGVuZ3RoLCBlZSA9IG5ldyBBcnJheShsKTsgaSA8IGw7IGkrKykge1xuICAgIGVlW2ldID0gYXZhaWxhYmxlW2ldLmZuO1xuICB9XG5cbiAgcmV0dXJuIGVlO1xufTtcblxuLyoqXG4gKiBFbWl0IGFuIGV2ZW50IHRvIGFsbCByZWdpc3RlcmVkIGV2ZW50IGxpc3RlbmVycy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnQgVGhlIG5hbWUgb2YgdGhlIGV2ZW50LlxuICogQHJldHVybnMge0Jvb2xlYW59IEluZGljYXRpb24gaWYgd2UndmUgZW1pdHRlZCBhbiBldmVudC5cbiAqIEBhcGkgcHVibGljXG4gKi9cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uIGVtaXQoZXZlbnQsIGExLCBhMiwgYTMsIGE0LCBhNSkge1xuICB2YXIgZXZ0ID0gcHJlZml4ID8gcHJlZml4ICsgZXZlbnQgOiBldmVudDtcblxuICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhdGhpcy5fZXZlbnRzW2V2dF0pIHJldHVybiBmYWxzZTtcblxuICB2YXIgbGlzdGVuZXJzID0gdGhpcy5fZXZlbnRzW2V2dF1cbiAgICAsIGxlbiA9IGFyZ3VtZW50cy5sZW5ndGhcbiAgICAsIGFyZ3NcbiAgICAsIGk7XG5cbiAgaWYgKCdmdW5jdGlvbicgPT09IHR5cGVvZiBsaXN0ZW5lcnMuZm4pIHtcbiAgICBpZiAobGlzdGVuZXJzLm9uY2UpIHRoaXMucmVtb3ZlTGlzdGVuZXIoZXZlbnQsIGxpc3RlbmVycy5mbiwgdW5kZWZpbmVkLCB0cnVlKTtcblxuICAgIHN3aXRjaCAobGVuKSB7XG4gICAgICBjYXNlIDE6IHJldHVybiBsaXN0ZW5lcnMuZm4uY2FsbChsaXN0ZW5lcnMuY29udGV4dCksIHRydWU7XG4gICAgICBjYXNlIDI6IHJldHVybiBsaXN0ZW5lcnMuZm4uY2FsbChsaXN0ZW5lcnMuY29udGV4dCwgYTEpLCB0cnVlO1xuICAgICAgY2FzZSAzOiByZXR1cm4gbGlzdGVuZXJzLmZuLmNhbGwobGlzdGVuZXJzLmNvbnRleHQsIGExLCBhMiksIHRydWU7XG4gICAgICBjYXNlIDQ6IHJldHVybiBsaXN0ZW5lcnMuZm4uY2FsbChsaXN0ZW5lcnMuY29udGV4dCwgYTEsIGEyLCBhMyksIHRydWU7XG4gICAgICBjYXNlIDU6IHJldHVybiBsaXN0ZW5lcnMuZm4uY2FsbChsaXN0ZW5lcnMuY29udGV4dCwgYTEsIGEyLCBhMywgYTQpLCB0cnVlO1xuICAgICAgY2FzZSA2OiByZXR1cm4gbGlzdGVuZXJzLmZuLmNhbGwobGlzdGVuZXJzLmNvbnRleHQsIGExLCBhMiwgYTMsIGE0LCBhNSksIHRydWU7XG4gICAgfVxuXG4gICAgZm9yIChpID0gMSwgYXJncyA9IG5ldyBBcnJheShsZW4gLTEpOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuICAgIH1cblxuICAgIGxpc3RlbmVycy5mbi5hcHBseShsaXN0ZW5lcnMuY29udGV4dCwgYXJncyk7XG4gIH0gZWxzZSB7XG4gICAgdmFyIGxlbmd0aCA9IGxpc3RlbmVycy5sZW5ndGhcbiAgICAgICwgajtcblxuICAgIGZvciAoaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgaWYgKGxpc3RlbmVyc1tpXS5vbmNlKSB0aGlzLnJlbW92ZUxpc3RlbmVyKGV2ZW50LCBsaXN0ZW5lcnNbaV0uZm4sIHVuZGVmaW5lZCwgdHJ1ZSk7XG5cbiAgICAgIHN3aXRjaCAobGVuKSB7XG4gICAgICAgIGNhc2UgMTogbGlzdGVuZXJzW2ldLmZuLmNhbGwobGlzdGVuZXJzW2ldLmNvbnRleHQpOyBicmVhaztcbiAgICAgICAgY2FzZSAyOiBsaXN0ZW5lcnNbaV0uZm4uY2FsbChsaXN0ZW5lcnNbaV0uY29udGV4dCwgYTEpOyBicmVhaztcbiAgICAgICAgY2FzZSAzOiBsaXN0ZW5lcnNbaV0uZm4uY2FsbChsaXN0ZW5lcnNbaV0uY29udGV4dCwgYTEsIGEyKTsgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgaWYgKCFhcmdzKSBmb3IgKGogPSAxLCBhcmdzID0gbmV3IEFycmF5KGxlbiAtMSk7IGogPCBsZW47IGorKykge1xuICAgICAgICAgICAgYXJnc1tqIC0gMV0gPSBhcmd1bWVudHNbal07XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgbGlzdGVuZXJzW2ldLmZuLmFwcGx5KGxpc3RlbmVyc1tpXS5jb250ZXh0LCBhcmdzKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn07XG5cbi8qKlxuICogUmVnaXN0ZXIgYSBuZXcgRXZlbnRMaXN0ZW5lciBmb3IgdGhlIGdpdmVuIGV2ZW50LlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudCBOYW1lIG9mIHRoZSBldmVudC5cbiAqIEBwYXJhbSB7RnVuY3Rvbn0gZm4gQ2FsbGJhY2sgZnVuY3Rpb24uXG4gKiBAcGFyYW0ge01peGVkfSBjb250ZXh0IFRoZSBjb250ZXh0IG9mIHRoZSBmdW5jdGlvbi5cbiAqIEBhcGkgcHVibGljXG4gKi9cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub24gPSBmdW5jdGlvbiBvbihldmVudCwgZm4sIGNvbnRleHQpIHtcbiAgdmFyIGxpc3RlbmVyID0gbmV3IEVFKGZuLCBjb250ZXh0IHx8IHRoaXMpXG4gICAgLCBldnQgPSBwcmVmaXggPyBwcmVmaXggKyBldmVudCA6IGV2ZW50O1xuXG4gIGlmICghdGhpcy5fZXZlbnRzKSB0aGlzLl9ldmVudHMgPSBwcmVmaXggPyB7fSA6IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gIGlmICghdGhpcy5fZXZlbnRzW2V2dF0pIHRoaXMuX2V2ZW50c1tldnRdID0gbGlzdGVuZXI7XG4gIGVsc2Uge1xuICAgIGlmICghdGhpcy5fZXZlbnRzW2V2dF0uZm4pIHRoaXMuX2V2ZW50c1tldnRdLnB1c2gobGlzdGVuZXIpO1xuICAgIGVsc2UgdGhpcy5fZXZlbnRzW2V2dF0gPSBbXG4gICAgICB0aGlzLl9ldmVudHNbZXZ0XSwgbGlzdGVuZXJcbiAgICBdO1xuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEFkZCBhbiBFdmVudExpc3RlbmVyIHRoYXQncyBvbmx5IGNhbGxlZCBvbmNlLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudCBOYW1lIG9mIHRoZSBldmVudC5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIENhbGxiYWNrIGZ1bmN0aW9uLlxuICogQHBhcmFtIHtNaXhlZH0gY29udGV4dCBUaGUgY29udGV4dCBvZiB0aGUgZnVuY3Rpb24uXG4gKiBAYXBpIHB1YmxpY1xuICovXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uY2UgPSBmdW5jdGlvbiBvbmNlKGV2ZW50LCBmbiwgY29udGV4dCkge1xuICB2YXIgbGlzdGVuZXIgPSBuZXcgRUUoZm4sIGNvbnRleHQgfHwgdGhpcywgdHJ1ZSlcbiAgICAsIGV2dCA9IHByZWZpeCA/IHByZWZpeCArIGV2ZW50IDogZXZlbnQ7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpIHRoaXMuX2V2ZW50cyA9IHByZWZpeCA/IHt9IDogT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgaWYgKCF0aGlzLl9ldmVudHNbZXZ0XSkgdGhpcy5fZXZlbnRzW2V2dF0gPSBsaXN0ZW5lcjtcbiAgZWxzZSB7XG4gICAgaWYgKCF0aGlzLl9ldmVudHNbZXZ0XS5mbikgdGhpcy5fZXZlbnRzW2V2dF0ucHVzaChsaXN0ZW5lcik7XG4gICAgZWxzZSB0aGlzLl9ldmVudHNbZXZ0XSA9IFtcbiAgICAgIHRoaXMuX2V2ZW50c1tldnRdLCBsaXN0ZW5lclxuICAgIF07XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUmVtb3ZlIGV2ZW50IGxpc3RlbmVycy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnQgVGhlIGV2ZW50IHdlIHdhbnQgdG8gcmVtb3ZlLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gVGhlIGxpc3RlbmVyIHRoYXQgd2UgbmVlZCB0byBmaW5kLlxuICogQHBhcmFtIHtNaXhlZH0gY29udGV4dCBPbmx5IHJlbW92ZSBsaXN0ZW5lcnMgbWF0Y2hpbmcgdGhpcyBjb250ZXh0LlxuICogQHBhcmFtIHtCb29sZWFufSBvbmNlIE9ubHkgcmVtb3ZlIG9uY2UgbGlzdGVuZXJzLlxuICogQGFwaSBwdWJsaWNcbiAqL1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lciA9IGZ1bmN0aW9uIHJlbW92ZUxpc3RlbmVyKGV2ZW50LCBmbiwgY29udGV4dCwgb25jZSkge1xuICB2YXIgZXZ0ID0gcHJlZml4ID8gcHJlZml4ICsgZXZlbnQgOiBldmVudDtcblxuICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhdGhpcy5fZXZlbnRzW2V2dF0pIHJldHVybiB0aGlzO1xuXG4gIHZhciBsaXN0ZW5lcnMgPSB0aGlzLl9ldmVudHNbZXZ0XVxuICAgICwgZXZlbnRzID0gW107XG5cbiAgaWYgKGZuKSB7XG4gICAgaWYgKGxpc3RlbmVycy5mbikge1xuICAgICAgaWYgKFxuICAgICAgICAgICBsaXN0ZW5lcnMuZm4gIT09IGZuXG4gICAgICAgIHx8IChvbmNlICYmICFsaXN0ZW5lcnMub25jZSlcbiAgICAgICAgfHwgKGNvbnRleHQgJiYgbGlzdGVuZXJzLmNvbnRleHQgIT09IGNvbnRleHQpXG4gICAgICApIHtcbiAgICAgICAgZXZlbnRzLnB1c2gobGlzdGVuZXJzKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IGxpc3RlbmVycy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoXG4gICAgICAgICAgICAgbGlzdGVuZXJzW2ldLmZuICE9PSBmblxuICAgICAgICAgIHx8IChvbmNlICYmICFsaXN0ZW5lcnNbaV0ub25jZSlcbiAgICAgICAgICB8fCAoY29udGV4dCAmJiBsaXN0ZW5lcnNbaV0uY29udGV4dCAhPT0gY29udGV4dClcbiAgICAgICAgKSB7XG4gICAgICAgICAgZXZlbnRzLnB1c2gobGlzdGVuZXJzW2ldKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vXG4gIC8vIFJlc2V0IHRoZSBhcnJheSwgb3IgcmVtb3ZlIGl0IGNvbXBsZXRlbHkgaWYgd2UgaGF2ZSBubyBtb3JlIGxpc3RlbmVycy5cbiAgLy9cbiAgaWYgKGV2ZW50cy5sZW5ndGgpIHtcbiAgICB0aGlzLl9ldmVudHNbZXZ0XSA9IGV2ZW50cy5sZW5ndGggPT09IDEgPyBldmVudHNbMF0gOiBldmVudHM7XG4gIH0gZWxzZSB7XG4gICAgZGVsZXRlIHRoaXMuX2V2ZW50c1tldnRdO1xuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFJlbW92ZSBhbGwgbGlzdGVuZXJzIG9yIG9ubHkgdGhlIGxpc3RlbmVycyBmb3IgdGhlIHNwZWNpZmllZCBldmVudC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnQgVGhlIGV2ZW50IHdhbnQgdG8gcmVtb3ZlIGFsbCBsaXN0ZW5lcnMgZm9yLlxuICogQGFwaSBwdWJsaWNcbiAqL1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBmdW5jdGlvbiByZW1vdmVBbGxMaXN0ZW5lcnMoZXZlbnQpIHtcbiAgaWYgKCF0aGlzLl9ldmVudHMpIHJldHVybiB0aGlzO1xuXG4gIGlmIChldmVudCkgZGVsZXRlIHRoaXMuX2V2ZW50c1twcmVmaXggPyBwcmVmaXggKyBldmVudCA6IGV2ZW50XTtcbiAgZWxzZSB0aGlzLl9ldmVudHMgPSBwcmVmaXggPyB7fSA6IE9iamVjdC5jcmVhdGUobnVsbCk7XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vL1xuLy8gQWxpYXMgbWV0aG9kcyBuYW1lcyBiZWNhdXNlIHBlb3BsZSByb2xsIGxpa2UgdGhhdC5cbi8vXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9mZiA9IEV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXI7XG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmFkZExpc3RlbmVyID0gRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbjtcblxuLy9cbi8vIFRoaXMgZnVuY3Rpb24gZG9lc24ndCBhcHBseSBhbnltb3JlLlxuLy9cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuc2V0TWF4TGlzdGVuZXJzID0gZnVuY3Rpb24gc2V0TWF4TGlzdGVuZXJzKCkge1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8vXG4vLyBFeHBvc2UgdGhlIHByZWZpeC5cbi8vXG5FdmVudEVtaXR0ZXIucHJlZml4ZWQgPSBwcmVmaXg7XG5cbi8vXG4vLyBFeHBvc2UgdGhlIG1vZHVsZS5cbi8vXG5pZiAoJ3VuZGVmaW5lZCcgIT09IHR5cGVvZiBtb2R1bGUpIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSBFdmVudEVtaXR0ZXI7XG59XG4iLCJtb2R1bGUuZXhwb3J0cz17XHJcbiAgXCJuYW1lXCI6IFwicGl4aS5qc1wiLFxyXG4gIFwidmVyc2lvblwiOiBcIjMuMC44XCIsXHJcbiAgXCJkZXNjcmlwdGlvblwiOiBcIlBpeGkuanMgaXMgYSBmYXN0IGxpZ2h0d2VpZ2h0IDJEIGxpYnJhcnkgdGhhdCB3b3JrcyBhY3Jvc3MgYWxsIGRldmljZXMuXCIsXHJcbiAgXCJhdXRob3JcIjogXCJNYXQgR3JvdmVzXCIsXHJcbiAgXCJjb250cmlidXRvcnNcIjogW1xyXG4gICAgXCJDaGFkIEVuZ2xlciA8Y2hhZEBwYW50aGVyZGV2LmNvbT5cIixcclxuICAgIFwiUmljaGFyZCBEYXZleSA8cmRhdmV5QGdtYWlsLmNvbT5cIlxyXG4gIF0sXHJcbiAgXCJtYWluXCI6IFwiLi9zcmMvaW5kZXguanNcIixcclxuICBcImhvbWVwYWdlXCI6IFwiaHR0cDovL2dvb2Rib3lkaWdpdGFsLmNvbS9cIixcclxuICBcImJ1Z3NcIjogXCJodHRwczovL2dpdGh1Yi5jb20vcGl4aWpzL3BpeGkuanMvaXNzdWVzXCIsXHJcbiAgXCJsaWNlbnNlXCI6IFwiTUlUXCIsXHJcbiAgXCJyZXBvc2l0b3J5XCI6IHtcclxuICAgIFwidHlwZVwiOiBcImdpdFwiLFxyXG4gICAgXCJ1cmxcIjogXCJodHRwczovL2dpdGh1Yi5jb20vcGl4aWpzL3BpeGkuanMuZ2l0XCJcclxuICB9LFxyXG4gIFwic2NyaXB0c1wiOiB7XHJcbiAgICBcInN0YXJ0XCI6IFwiZ3VscCAmJiBndWxwIHdhdGNoXCIsXHJcbiAgICBcInRlc3RcIjogXCJndWxwICYmIHRlc3RlbSBjaVwiLFxyXG4gICAgXCJidWlsZFwiOiBcImd1bHBcIixcclxuICAgIFwiZG9jc1wiOiBcImpzZG9jIC1jIC4vZ3VscC91dGlsL2pzZG9jLmNvbmYuanNvbiAtUiBSRUFETUUubWRcIlxyXG4gIH0sXHJcbiAgXCJmaWxlc1wiOiBbXHJcbiAgICBcImJpbi9cIixcclxuICAgIFwic3JjL1wiLFxyXG4gICAgXCJDT05UUklCVVRJTkcubWRcIixcclxuICAgIFwiTElDRU5TRVwiLFxyXG4gICAgXCJwYWNrYWdlLmpzb25cIixcclxuICAgIFwiUkVBRE1FLm1kXCJcclxuICBdLFxyXG4gIFwiZGVwZW5kZW5jaWVzXCI6IHtcclxuICAgIFwiYXN5bmNcIjogXCJeMS40LjJcIixcclxuICAgIFwiYnJmc1wiOiBcIl4xLjQuMVwiLFxyXG4gICAgXCJlYXJjdXRcIjogXCJeMi4wLjJcIixcclxuICAgIFwiZXZlbnRlbWl0dGVyM1wiOiBcIl4xLjEuMVwiLFxyXG4gICAgXCJndWxwLWhlYWRlclwiOiBcIl4xLjcuMVwiLFxyXG4gICAgXCJvYmplY3QtYXNzaWduXCI6IFwiXjQuMC4xXCIsXHJcbiAgICBcInJlc291cmNlLWxvYWRlclwiOiBcIl4xLjYuMlwiXHJcbiAgfSxcclxuICBcImRldkRlcGVuZGVuY2llc1wiOiB7XHJcbiAgICBcImJyb3dzZXJpZnlcIjogXCJeMTEuMS4wXCIsXHJcbiAgICBcImNoYWlcIjogXCJeMy4yLjBcIixcclxuICAgIFwiZGVsXCI6IFwiXjIuMC4yXCIsXHJcbiAgICBcImd1bHBcIjogXCJeMy45LjBcIixcclxuICAgIFwiZ3VscC1jYWNoZWRcIjogXCJeMS4xLjBcIixcclxuICAgIFwiZ3VscC1jb25jYXRcIjogXCJeMi42LjBcIixcclxuICAgIFwiZ3VscC1kZWJ1Z1wiOiBcIl4yLjEuMFwiLFxyXG4gICAgXCJndWxwLWpzaGludFwiOiBcIl4xLjExLjJcIixcclxuICAgIFwiZ3VscC1taXJyb3JcIjogXCJeMC40LjBcIixcclxuICAgIFwiZ3VscC1wbHVtYmVyXCI6IFwiXjEuMC4xXCIsXHJcbiAgICBcImd1bHAtcmVuYW1lXCI6IFwiXjEuMi4yXCIsXHJcbiAgICBcImd1bHAtc291cmNlbWFwc1wiOiBcIl4xLjUuMlwiLFxyXG4gICAgXCJndWxwLXVnbGlmeVwiOiBcIl4xLjQuMVwiLFxyXG4gICAgXCJndWxwLXV0aWxcIjogXCJeMy4wLjZcIixcclxuICAgIFwiamFndWFyanMtanNkb2NcIjogXCJnaXQraHR0cHM6Ly9naXRodWIuY29tL2Rhdmlkc2hpbWpzL2phZ3VhcmpzLWpzZG9jLmdpdFwiLFxyXG4gICAgXCJqc2RvY1wiOiBcIl4zLjMuMlwiLFxyXG4gICAgXCJqc2hpbnQtc3VtbWFyeVwiOiBcIl4wLjQuMFwiLFxyXG4gICAgXCJtaW5pbWlzdFwiOiBcIl4xLjIuMFwiLFxyXG4gICAgXCJtb2NoYVwiOiBcIl4yLjMuMlwiLFxyXG4gICAgXCJyZXF1aXJlLWRpclwiOiBcIl4wLjMuMFwiLFxyXG4gICAgXCJydW4tc2VxdWVuY2VcIjogXCJeMS4xLjJcIixcclxuICAgIFwidGVzdGVtXCI6IFwiXjAuOS40XCIsXHJcbiAgICBcInZpbnlsLWJ1ZmZlclwiOiBcIl4xLjAuMFwiLFxyXG4gICAgXCJ2aW55bC1zb3VyY2Utc3RyZWFtXCI6IFwiXjEuMS4wXCIsXHJcbiAgICBcIndhdGNoaWZ5XCI6IFwiXjMuNC4wXCJcclxuICB9LFxyXG4gIFwiYnJvd3NlcmlmeVwiOiB7XHJcbiAgICBcInRyYW5zZm9ybVwiOiBbXHJcbiAgICAgIFwiYnJmc1wiXHJcbiAgICBdXHJcbiAgfVxyXG59XHJcbiIsIi8qKlxyXG4gKiBDb25zdGFudCB2YWx1ZXMgdXNlZCBpbiBwaXhpXHJcbiAqXHJcbiAqIEBsZW5kcyBQSVhJXHJcbiAqL1xyXG52YXIgQ09OU1QgPSB7XHJcbiAgICAvKipcclxuICAgICAqIFN0cmluZyBvZiB0aGUgY3VycmVudCBQSVhJIHZlcnNpb25cclxuICAgICAqXHJcbiAgICAgKiBAc3RhdGljXHJcbiAgICAgKiBAY29uc3RhbnRcclxuICAgICAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBWRVJTSU9OXHJcbiAgICAgKi9cclxuICAgIFZFUlNJT046IHJlcXVpcmUoJy4uLy4uL3BhY2thZ2UuanNvbicpLnZlcnNpb24sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAcHJvcGVydHkge251bWJlcn0gUElfMiAtIFR3byBQaVxyXG4gICAgICogQGNvbnN0YW50XHJcbiAgICAgKiBAc3RhdGljXHJcbiAgICAgKi9cclxuICAgIFBJXzI6IE1hdGguUEkgKiAyLFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQHByb3BlcnR5IHtudW1iZXJ9IFJBRF9UT19ERUcgLSBDb25zdGFudCBjb252ZXJzaW9uIGZhY3RvciBmb3IgY29udmVydGluZyByYWRpYW5zIHRvIGRlZ3JlZXNcclxuICAgICAqIEBjb25zdGFudFxyXG4gICAgICogQHN0YXRpY1xyXG4gICAgICovXHJcbiAgICBSQURfVE9fREVHOiAxODAgLyBNYXRoLlBJLFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQHByb3BlcnR5IHtOdW1iZXJ9IERFR19UT19SQUQgLSBDb25zdGFudCBjb252ZXJzaW9uIGZhY3RvciBmb3IgY29udmVydGluZyBkZWdyZWVzIHRvIHJhZGlhbnNcclxuICAgICAqIEBjb25zdGFudFxyXG4gICAgICogQHN0YXRpY1xyXG4gICAgICovXHJcbiAgICBERUdfVE9fUkFEOiBNYXRoLlBJIC8gMTgwLFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVGFyZ2V0IGZyYW1lcyBwZXIgbWlsbGlzZWNvbmQuXHJcbiAgICAgKlxyXG4gICAgICogQHN0YXRpY1xyXG4gICAgICogQGNvbnN0YW50XHJcbiAgICAgKiBAcHJvcGVydHkge251bWJlcn0gVEFSR0VUX0ZQTVM9MC4wNlxyXG4gICAgICovXHJcbiAgICBUQVJHRVRfRlBNUzogMC4wNixcclxuXHJcbiAgICAvKipcclxuICAgICAqIENvbnN0YW50IHRvIGlkZW50aWZ5IHRoZSBSZW5kZXJlciBUeXBlLlxyXG4gICAgICpcclxuICAgICAqIEBzdGF0aWNcclxuICAgICAqIEBjb25zdGFudFxyXG4gICAgICogQHByb3BlcnR5IHtvYmplY3R9IFJFTkRFUkVSX1RZUEVcclxuICAgICAqIEBwcm9wZXJ0eSB7bnVtYmVyfSBSRU5ERVJFUl9UWVBFLlVOS05PV05cclxuICAgICAqIEBwcm9wZXJ0eSB7bnVtYmVyfSBSRU5ERVJFUl9UWVBFLldFQkdMXHJcbiAgICAgKiBAcHJvcGVydHkge251bWJlcn0gUkVOREVSRVJfVFlQRS5DQU5WQVNcclxuICAgICAqL1xyXG4gICAgUkVOREVSRVJfVFlQRToge1xyXG4gICAgICAgIFVOS05PV046ICAgIDAsXHJcbiAgICAgICAgV0VCR0w6ICAgICAgMSxcclxuICAgICAgICBDQU5WQVM6ICAgICAyXHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVmFyaW91cyBibGVuZCBtb2RlcyBzdXBwb3J0ZWQgYnkgUElYSS4gSU1QT1JUQU5UIC0gVGhlIFdlYkdMIHJlbmRlcmVyIG9ubHkgc3VwcG9ydHNcclxuICAgICAqIHRoZSBOT1JNQUwsIEFERCwgTVVMVElQTFkgYW5kIFNDUkVFTiBibGVuZCBtb2Rlcy4gQW55dGhpbmcgZWxzZSB3aWxsIHNpbGVudGx5IGFjdCBsaWtlXHJcbiAgICAgKiBOT1JNQUwuXHJcbiAgICAgKlxyXG4gICAgICogQHN0YXRpY1xyXG4gICAgICogQGNvbnN0YW50XHJcbiAgICAgKiBAcHJvcGVydHkge29iamVjdH0gQkxFTkRfTU9ERVNcclxuICAgICAqIEBwcm9wZXJ0eSB7bnVtYmVyfSBCTEVORF9NT0RFUy5OT1JNQUxcclxuICAgICAqIEBwcm9wZXJ0eSB7bnVtYmVyfSBCTEVORF9NT0RFUy5BRERcclxuICAgICAqIEBwcm9wZXJ0eSB7bnVtYmVyfSBCTEVORF9NT0RFUy5NVUxUSVBMWVxyXG4gICAgICogQHByb3BlcnR5IHtudW1iZXJ9IEJMRU5EX01PREVTLlNDUkVFTlxyXG4gICAgICogQHByb3BlcnR5IHtudW1iZXJ9IEJMRU5EX01PREVTLk9WRVJMQVlcclxuICAgICAqIEBwcm9wZXJ0eSB7bnVtYmVyfSBCTEVORF9NT0RFUy5EQVJLRU5cclxuICAgICAqIEBwcm9wZXJ0eSB7bnVtYmVyfSBCTEVORF9NT0RFUy5MSUdIVEVOXHJcbiAgICAgKiBAcHJvcGVydHkge251bWJlcn0gQkxFTkRfTU9ERVMuQ09MT1JfRE9ER0VcclxuICAgICAqIEBwcm9wZXJ0eSB7bnVtYmVyfSBCTEVORF9NT0RFUy5DT0xPUl9CVVJOXHJcbiAgICAgKiBAcHJvcGVydHkge251bWJlcn0gQkxFTkRfTU9ERVMuSEFSRF9MSUdIVFxyXG4gICAgICogQHByb3BlcnR5IHtudW1iZXJ9IEJMRU5EX01PREVTLlNPRlRfTElHSFRcclxuICAgICAqIEBwcm9wZXJ0eSB7bnVtYmVyfSBCTEVORF9NT0RFUy5ESUZGRVJFTkNFXHJcbiAgICAgKiBAcHJvcGVydHkge251bWJlcn0gQkxFTkRfTU9ERVMuRVhDTFVTSU9OXHJcbiAgICAgKiBAcHJvcGVydHkge251bWJlcn0gQkxFTkRfTU9ERVMuSFVFXHJcbiAgICAgKiBAcHJvcGVydHkge251bWJlcn0gQkxFTkRfTU9ERVMuU0FUVVJBVElPTlxyXG4gICAgICogQHByb3BlcnR5IHtudW1iZXJ9IEJMRU5EX01PREVTLkNPTE9SXHJcbiAgICAgKiBAcHJvcGVydHkge251bWJlcn0gQkxFTkRfTU9ERVMuTFVNSU5PU0lUWVxyXG4gICAgICovXHJcbiAgICBCTEVORF9NT0RFUzoge1xyXG4gICAgICAgIE5PUk1BTDogICAgICAgICAwLFxyXG4gICAgICAgIEFERDogICAgICAgICAgICAxLFxyXG4gICAgICAgIE1VTFRJUExZOiAgICAgICAyLFxyXG4gICAgICAgIFNDUkVFTjogICAgICAgICAzLFxyXG4gICAgICAgIE9WRVJMQVk6ICAgICAgICA0LFxyXG4gICAgICAgIERBUktFTjogICAgICAgICA1LFxyXG4gICAgICAgIExJR0hURU46ICAgICAgICA2LFxyXG4gICAgICAgIENPTE9SX0RPREdFOiAgICA3LFxyXG4gICAgICAgIENPTE9SX0JVUk46ICAgICA4LFxyXG4gICAgICAgIEhBUkRfTElHSFQ6ICAgICA5LFxyXG4gICAgICAgIFNPRlRfTElHSFQ6ICAgICAxMCxcclxuICAgICAgICBESUZGRVJFTkNFOiAgICAgMTEsXHJcbiAgICAgICAgRVhDTFVTSU9OOiAgICAgIDEyLFxyXG4gICAgICAgIEhVRTogICAgICAgICAgICAxMyxcclxuICAgICAgICBTQVRVUkFUSU9OOiAgICAgMTQsXHJcbiAgICAgICAgQ09MT1I6ICAgICAgICAgIDE1LFxyXG4gICAgICAgIExVTUlOT1NJVFk6ICAgICAxNlxyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIFZhcmlvdXMgd2ViZ2wgZHJhdyBtb2Rlcy4gVGhlc2UgY2FuIGJlIHVzZWQgdG8gc3BlY2lmeSB3aGljaCBHTCBkcmF3TW9kZSB0byB1c2VcclxuICAgICAqIHVuZGVyIGNlcnRhaW4gc2l0dWF0aW9ucyBhbmQgcmVuZGVyZXJzLlxyXG4gICAgICpcclxuICAgICAqIEBzdGF0aWNcclxuICAgICAqIEBjb25zdGFudFxyXG4gICAgICogQHByb3BlcnR5IHtvYmplY3R9IERSQVdfTU9ERVNcclxuICAgICAqIEBwcm9wZXJ0eSB7bnVtYmVyfSBEUkFXX01PREVTLlBPSU5UU1xyXG4gICAgICogQHByb3BlcnR5IHtudW1iZXJ9IERSQVdfTU9ERVMuTElORVNcclxuICAgICAqIEBwcm9wZXJ0eSB7bnVtYmVyfSBEUkFXX01PREVTLkxJTkVfTE9PUFxyXG4gICAgICogQHByb3BlcnR5IHtudW1iZXJ9IERSQVdfTU9ERVMuTElORV9TVFJJUFxyXG4gICAgICogQHByb3BlcnR5IHtudW1iZXJ9IERSQVdfTU9ERVMuVFJJQU5HTEVTXHJcbiAgICAgKiBAcHJvcGVydHkge251bWJlcn0gRFJBV19NT0RFUy5UUklBTkdMRV9TVFJJUFxyXG4gICAgICogQHByb3BlcnR5IHtudW1iZXJ9IERSQVdfTU9ERVMuVFJJQU5HTEVfRkFOXHJcbiAgICAgKi9cclxuICAgIERSQVdfTU9ERVM6IHtcclxuICAgICAgICBQT0lOVFM6ICAgICAgICAgMCxcclxuICAgICAgICBMSU5FUzogICAgICAgICAgMSxcclxuICAgICAgICBMSU5FX0xPT1A6ICAgICAgMixcclxuICAgICAgICBMSU5FX1NUUklQOiAgICAgMyxcclxuICAgICAgICBUUklBTkdMRVM6ICAgICAgNCxcclxuICAgICAgICBUUklBTkdMRV9TVFJJUDogNSxcclxuICAgICAgICBUUklBTkdMRV9GQU46ICAgNlxyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIFRoZSBzY2FsZSBtb2RlcyB0aGF0IGFyZSBzdXBwb3J0ZWQgYnkgcGl4aS5cclxuICAgICAqXHJcbiAgICAgKiBUaGUgREVGQVVMVCBzY2FsZSBtb2RlIGFmZmVjdHMgdGhlIGRlZmF1bHQgc2NhbGluZyBtb2RlIG9mIGZ1dHVyZSBvcGVyYXRpb25zLlxyXG4gICAgICogSXQgY2FuIGJlIHJlLWFzc2lnbmVkIHRvIGVpdGhlciBMSU5FQVIgb3IgTkVBUkVTVCwgZGVwZW5kaW5nIHVwb24gc3VpdGFiaWxpdHkuXHJcbiAgICAgKlxyXG4gICAgICogQHN0YXRpY1xyXG4gICAgICogQGNvbnN0YW50XHJcbiAgICAgKiBAcHJvcGVydHkge29iamVjdH0gU0NBTEVfTU9ERVNcclxuICAgICAqIEBwcm9wZXJ0eSB7bnVtYmVyfSBTQ0FMRV9NT0RFUy5ERUZBVUxUPUxJTkVBUlxyXG4gICAgICogQHByb3BlcnR5IHtudW1iZXJ9IFNDQUxFX01PREVTLkxJTkVBUiBTbW9vdGggc2NhbGluZ1xyXG4gICAgICogQHByb3BlcnR5IHtudW1iZXJ9IFNDQUxFX01PREVTLk5FQVJFU1QgUGl4ZWxhdGluZyBzY2FsaW5nXHJcbiAgICAgKi9cclxuICAgIFNDQUxFX01PREVTOiB7XHJcbiAgICAgICAgREVGQVVMVDogICAgMCxcclxuICAgICAgICBMSU5FQVI6ICAgICAwLFxyXG4gICAgICAgIE5FQVJFU1Q6ICAgIDFcclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgcHJlZml4IHRoYXQgZGVub3RlcyBhIFVSTCBpcyBmb3IgYSByZXRpbmEgYXNzZXRcclxuICAgICAqXHJcbiAgICAgKiBAc3RhdGljXHJcbiAgICAgKiBAY29uc3RhbnRcclxuICAgICAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBSRVRJTkFfUFJFRklYXHJcbiAgICAgKi9cclxuICAgIC8vZXhhbXBsZTogJ0AyeCcsXHJcbiAgICBSRVRJTkFfUFJFRklYOiAvQCguKyl4LyxcclxuXHJcbiAgICBSRVNPTFVUSU9OOjEsXHJcblxyXG4gICAgRklMVEVSX1JFU09MVVRJT046MSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIFRoZSBkZWZhdWx0IHJlbmRlciBvcHRpb25zIGlmIG5vbmUgYXJlIHN1cHBsaWVkIHRvIHtAbGluayBQSVhJLldlYkdMUmVuZGVyZXJ9XHJcbiAgICAgKiBvciB7QGxpbmsgUElYSS5DYW52YXNSZW5kZXJlcn0uXHJcbiAgICAgKlxyXG4gICAgICogQHN0YXRpY1xyXG4gICAgICogQGNvbnN0YW50XHJcbiAgICAgKiBAcHJvcGVydHkge29iamVjdH0gREVGQVVMVF9SRU5ERVJfT1BUSU9OU1xyXG4gICAgICogQHByb3BlcnR5IHtIVE1MQ2FudmFzRWxlbWVudH0gREVGQVVMVF9SRU5ERVJfT1BUSU9OUy52aWV3PW51bGxcclxuICAgICAqIEBwcm9wZXJ0eSB7Ym9vbGVhbn0gREVGQVVMVF9SRU5ERVJfT1BUSU9OUy50cmFuc3BhcmVudD1mYWxzZVxyXG4gICAgICogQHByb3BlcnR5IHtib29sZWFufSBERUZBVUxUX1JFTkRFUl9PUFRJT05TLmFudGlhbGlhcz1mYWxzZVxyXG4gICAgICogQHByb3BlcnR5IHtib29sZWFufSBERUZBVUxUX1JFTkRFUl9PUFRJT05TLmZvcmNlRlhBQT1mYWxzZVxyXG4gICAgICogQHByb3BlcnR5IHtib29sZWFufSBERUZBVUxUX1JFTkRFUl9PUFRJT05TLnByZXNlcnZlRHJhd2luZ0J1ZmZlcj1mYWxzZVxyXG4gICAgICogQHByb3BlcnR5IHtudW1iZXJ9IERFRkFVTFRfUkVOREVSX09QVElPTlMucmVzb2x1dGlvbj0xXHJcbiAgICAgKiBAcHJvcGVydHkge251bWJlcn0gREVGQVVMVF9SRU5ERVJfT1BUSU9OUy5iYWNrZ3JvdW5kQ29sb3I9MHgwMDAwMDBcclxuICAgICAqIEBwcm9wZXJ0eSB7Ym9vbGVhbn0gREVGQVVMVF9SRU5ERVJfT1BUSU9OUy5jbGVhckJlZm9yZVJlbmRlcj10cnVlXHJcbiAgICAgKiBAcHJvcGVydHkge2Jvb2xlYW59IERFRkFVTFRfUkVOREVSX09QVElPTlMuYXV0b1Jlc2l6ZT1mYWxzZVxyXG4gICAgICovXHJcbiAgICBERUZBVUxUX1JFTkRFUl9PUFRJT05TOiB7XHJcbiAgICAgICAgdmlldzogbnVsbCxcclxuICAgICAgICByZXNvbHV0aW9uOiAxLFxyXG4gICAgICAgIGFudGlhbGlhczogZmFsc2UsXHJcbiAgICAgICAgZm9yY2VGWEFBOiBmYWxzZSxcclxuICAgICAgICBhdXRvUmVzaXplOiBmYWxzZSxcclxuICAgICAgICB0cmFuc3BhcmVudDogZmFsc2UsXHJcbiAgICAgICAgYmFja2dyb3VuZENvbG9yOiAweDAwMDAwMCxcclxuICAgICAgICBjbGVhckJlZm9yZVJlbmRlcjogdHJ1ZSxcclxuICAgICAgICBwcmVzZXJ2ZURyYXdpbmdCdWZmZXI6IGZhbHNlLFxyXG4gICAgICAgIHJvdW5kUGl4ZWxzOiBmYWxzZVxyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIENvbnN0YW50cyB0aGF0IGlkZW50aWZ5IHNoYXBlcywgbWFpbmx5IHRvIHByZXZlbnQgYGluc3RhbmNlb2ZgIGNhbGxzLlxyXG4gICAgICpcclxuICAgICAqIEBzdGF0aWNcclxuICAgICAqIEBjb25zdGFudFxyXG4gICAgICogQHByb3BlcnR5IHtvYmplY3R9IFNIQVBFU1xyXG4gICAgICogQHByb3BlcnR5IHtvYmplY3R9IFNIQVBFUy5QT0xZPTBcclxuICAgICAqIEBwcm9wZXJ0eSB7b2JqZWN0fSBTSEFQRVMuUkVDVD0xXHJcbiAgICAgKiBAcHJvcGVydHkge29iamVjdH0gU0hBUEVTLkNJUkM9MlxyXG4gICAgICogQHByb3BlcnR5IHtvYmplY3R9IFNIQVBFUy5FTElQPTNcclxuICAgICAqIEBwcm9wZXJ0eSB7b2JqZWN0fSBTSEFQRVMuUlJFQz00XHJcbiAgICAgKi9cclxuICAgIFNIQVBFUzoge1xyXG4gICAgICAgIFBPTFk6IDAsXHJcbiAgICAgICAgUkVDVDogMSxcclxuICAgICAgICBDSVJDOiAyLFxyXG4gICAgICAgIEVMSVA6IDMsXHJcbiAgICAgICAgUlJFQzogNFxyXG4gICAgfSxcclxuXHJcbiAgICAvLyBUT0RPOiBtYXliZSBjaGFuZ2UgdG8gU1BSSVRFLkJBVENIX1NJWkU6IDIwMDBcclxuICAgIC8vIFRPRE86IG1heWJlIGFkZCBQQVJUSUNMRS5CQVRDSF9TSVpFOiAxNTAwMFxyXG4gICAgU1BSSVRFX0JBVENIX1NJWkU6IDIwMDAgLy9uaWNlIGJhbGFuY2UgYmV0d2VlbiBtb2JpbGUgYW5kIGRlc2t0b3AgbWFjaGluZXNcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQ09OU1Q7XHJcbiIsInZhciBtYXRoID0gcmVxdWlyZSgnLi4vbWF0aCcpLFxyXG4gICAgRGlzcGxheU9iamVjdCA9IHJlcXVpcmUoJy4vRGlzcGxheU9iamVjdCcpLFxyXG4gICAgUmVuZGVyVGV4dHVyZSA9IHJlcXVpcmUoJy4uL3RleHR1cmVzL1JlbmRlclRleHR1cmUnKSxcclxuICAgIF90ZW1wTWF0cml4ID0gbmV3IG1hdGguTWF0cml4KCk7XHJcblxyXG4vKipcclxuICogQSBDb250YWluZXIgcmVwcmVzZW50cyBhIGNvbGxlY3Rpb24gb2YgZGlzcGxheSBvYmplY3RzLlxyXG4gKiBJdCBpcyB0aGUgYmFzZSBjbGFzcyBvZiBhbGwgZGlzcGxheSBvYmplY3RzIHRoYXQgYWN0IGFzIGEgY29udGFpbmVyIGZvciBvdGhlciBvYmplY3RzLlxyXG4gKlxyXG4gKmBgYGpzXHJcbiAqIHZhciBjb250YWluZXIgPSBuZXcgUElYSS5Db250YWluZXIoKTtcclxuICogY29udGFpbmVyLmFkZENoaWxkKHNwcml0ZSk7XHJcbiAqIGBgYFxyXG4gKiBAY2xhc3NcclxuICogQGV4dGVuZHMgUElYSS5EaXNwbGF5T2JqZWN0XHJcbiAqIEBtZW1iZXJvZiBQSVhJXHJcbiAqL1xyXG5mdW5jdGlvbiBDb250YWluZXIoKVxyXG57XHJcbiAgICBEaXNwbGF5T2JqZWN0LmNhbGwodGhpcyk7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgYXJyYXkgb2YgY2hpbGRyZW4gb2YgdGhpcyBjb250YWluZXIuXHJcbiAgICAgKlxyXG4gICAgICogQG1lbWJlciB7UElYSS5EaXNwbGF5T2JqZWN0W119XHJcbiAgICAgKiBAcmVhZG9ubHlcclxuICAgICAqL1xyXG4gICAgdGhpcy5jaGlsZHJlbiA9IFtdO1xyXG59XHJcblxyXG4vLyBjb25zdHJ1Y3RvclxyXG5Db250YWluZXIucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShEaXNwbGF5T2JqZWN0LnByb3RvdHlwZSk7XHJcbkNvbnRhaW5lci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBDb250YWluZXI7XHJcbm1vZHVsZS5leHBvcnRzID0gQ29udGFpbmVyO1xyXG5cclxuT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoQ29udGFpbmVyLnByb3RvdHlwZSwge1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgd2lkdGggb2YgdGhlIENvbnRhaW5lciwgc2V0dGluZyB0aGlzIHdpbGwgYWN0dWFsbHkgbW9kaWZ5IHRoZSBzY2FsZSB0byBhY2hpZXZlIHRoZSB2YWx1ZSBzZXRcclxuICAgICAqXHJcbiAgICAgKiBAbWVtYmVyIHtudW1iZXJ9XHJcbiAgICAgKiBAbWVtYmVyb2YgUElYSS5Db250YWluZXIjXHJcbiAgICAgKi9cclxuICAgIHdpZHRoOiB7XHJcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2NhbGUueCAqIHRoaXMuZ2V0TG9jYWxCb3VuZHMoKS53aWR0aDtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHNldDogZnVuY3Rpb24gKHZhbHVlKVxyXG4gICAgICAgIHtcclxuXHJcbiAgICAgICAgICAgIHZhciB3aWR0aCA9IHRoaXMuZ2V0TG9jYWxCb3VuZHMoKS53aWR0aDtcclxuXHJcbiAgICAgICAgICAgIGlmICh3aWR0aCAhPT0gMClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zY2FsZS54ID0gdmFsdWUgLyB3aWR0aDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2NhbGUueCA9IDE7XHJcbiAgICAgICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgICAgICB0aGlzLl93aWR0aCA9IHZhbHVlO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgaGVpZ2h0IG9mIHRoZSBDb250YWluZXIsIHNldHRpbmcgdGhpcyB3aWxsIGFjdHVhbGx5IG1vZGlmeSB0aGUgc2NhbGUgdG8gYWNoaWV2ZSB0aGUgdmFsdWUgc2V0XHJcbiAgICAgKlxyXG4gICAgICogQG1lbWJlciB7bnVtYmVyfVxyXG4gICAgICogQG1lbWJlcm9mIFBJWEkuQ29udGFpbmVyI1xyXG4gICAgICovXHJcbiAgICBoZWlnaHQ6IHtcclxuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICByZXR1cm4gIHRoaXMuc2NhbGUueSAqIHRoaXMuZ2V0TG9jYWxCb3VuZHMoKS5oZWlnaHQ7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBzZXQ6IGZ1bmN0aW9uICh2YWx1ZSlcclxuICAgICAgICB7XHJcblxyXG4gICAgICAgICAgICB2YXIgaGVpZ2h0ID0gdGhpcy5nZXRMb2NhbEJvdW5kcygpLmhlaWdodDtcclxuXHJcbiAgICAgICAgICAgIGlmIChoZWlnaHQgIT09IDApXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2NhbGUueSA9IHZhbHVlIC8gaGVpZ2h0IDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2NhbGUueSA9IDE7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoaXMuX2hlaWdodCA9IHZhbHVlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSk7XHJcblxyXG4vKipcclxuICogT3ZlcnJpZGFibGUgbWV0aG9kIHRoYXQgY2FuIGJlIHVzZWQgYnkgQ29udGFpbmVyIHN1YmNsYXNzZXMgd2hlbmV2ZXIgdGhlIGNoaWxkcmVuIGFycmF5IGlzIG1vZGlmaWVkXHJcbiAqXHJcbiAqIEBwcml2YXRlXHJcbiAqL1xyXG5Db250YWluZXIucHJvdG90eXBlLm9uQ2hpbGRyZW5DaGFuZ2UgPSBmdW5jdGlvbiAoKSB7fTtcclxuXHJcbi8qKlxyXG4gKiBBZGRzIGEgY2hpbGQgdG8gdGhlIGNvbnRhaW5lci5cclxuICpcclxuICogQHBhcmFtIGNoaWxkIHtQSVhJLkRpc3BsYXlPYmplY3R9IFRoZSBEaXNwbGF5T2JqZWN0IHRvIGFkZCB0byB0aGUgY29udGFpbmVyXHJcbiAqIEByZXR1cm4ge1BJWEkuRGlzcGxheU9iamVjdH0gVGhlIGNoaWxkIHRoYXQgd2FzIGFkZGVkLlxyXG4gKi9cclxuQ29udGFpbmVyLnByb3RvdHlwZS5hZGRDaGlsZCA9IGZ1bmN0aW9uIChjaGlsZClcclxue1xyXG4gICAgcmV0dXJuIHRoaXMuYWRkQ2hpbGRBdChjaGlsZCwgdGhpcy5jaGlsZHJlbi5sZW5ndGgpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEFkZHMgYSBjaGlsZCB0byB0aGUgY29udGFpbmVyIGF0IGEgc3BlY2lmaWVkIGluZGV4LiBJZiB0aGUgaW5kZXggaXMgb3V0IG9mIGJvdW5kcyBhbiBlcnJvciB3aWxsIGJlIHRocm93blxyXG4gKlxyXG4gKiBAcGFyYW0gY2hpbGQge1BJWEkuRGlzcGxheU9iamVjdH0gVGhlIGNoaWxkIHRvIGFkZFxyXG4gKiBAcGFyYW0gaW5kZXgge251bWJlcn0gVGhlIGluZGV4IHRvIHBsYWNlIHRoZSBjaGlsZCBpblxyXG4gKiBAcmV0dXJuIHtQSVhJLkRpc3BsYXlPYmplY3R9IFRoZSBjaGlsZCB0aGF0IHdhcyBhZGRlZC5cclxuICovXHJcbkNvbnRhaW5lci5wcm90b3R5cGUuYWRkQ2hpbGRBdCA9IGZ1bmN0aW9uIChjaGlsZCwgaW5kZXgpXHJcbntcclxuICAgIC8vIHByZXZlbnQgYWRkaW5nIHNlbGYgYXMgY2hpbGRcclxuICAgIGlmIChjaGlsZCA9PT0gdGhpcylcclxuICAgIHtcclxuICAgICAgICByZXR1cm4gY2hpbGQ7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGluZGV4ID49IDAgJiYgaW5kZXggPD0gdGhpcy5jaGlsZHJlbi5sZW5ndGgpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKGNoaWxkLnBhcmVudClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNoaWxkLnBhcmVudC5yZW1vdmVDaGlsZChjaGlsZCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjaGlsZC5wYXJlbnQgPSB0aGlzO1xyXG5cclxuICAgICAgICB0aGlzLmNoaWxkcmVuLnNwbGljZShpbmRleCwgMCwgY2hpbGQpO1xyXG4gICAgICAgIHRoaXMub25DaGlsZHJlbkNoYW5nZShpbmRleCk7XHJcblxyXG4gICAgICAgIGNoaWxkLmVtaXQoJ2FkZGVkJywgdGhpcyk7XHJcblxyXG4gICAgICAgIHJldHVybiBjaGlsZDtcclxuICAgIH1cclxuICAgIGVsc2VcclxuICAgIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoY2hpbGQgKyAnYWRkQ2hpbGRBdDogVGhlIGluZGV4ICcrIGluZGV4ICsnIHN1cHBsaWVkIGlzIG91dCBvZiBib3VuZHMgJyArIHRoaXMuY2hpbGRyZW4ubGVuZ3RoKTtcclxuICAgIH1cclxufTtcclxuXHJcbi8qKlxyXG4gKiBTd2FwcyB0aGUgcG9zaXRpb24gb2YgMiBEaXNwbGF5IE9iamVjdHMgd2l0aGluIHRoaXMgY29udGFpbmVyLlxyXG4gKlxyXG4gKiBAcGFyYW0gY2hpbGQge1BJWEkuRGlzcGxheU9iamVjdH1cclxuICogQHBhcmFtIGNoaWxkMiB7UElYSS5EaXNwbGF5T2JqZWN0fVxyXG4gKi9cclxuQ29udGFpbmVyLnByb3RvdHlwZS5zd2FwQ2hpbGRyZW4gPSBmdW5jdGlvbiAoY2hpbGQsIGNoaWxkMilcclxue1xyXG4gICAgaWYgKGNoaWxkID09PSBjaGlsZDIpXHJcbiAgICB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBpbmRleDEgPSB0aGlzLmdldENoaWxkSW5kZXgoY2hpbGQpO1xyXG4gICAgdmFyIGluZGV4MiA9IHRoaXMuZ2V0Q2hpbGRJbmRleChjaGlsZDIpO1xyXG5cclxuICAgIGlmIChpbmRleDEgPCAwIHx8IGluZGV4MiA8IDApXHJcbiAgICB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdzd2FwQ2hpbGRyZW46IEJvdGggdGhlIHN1cHBsaWVkIERpc3BsYXlPYmplY3RzIG11c3QgYmUgY2hpbGRyZW4gb2YgdGhlIGNhbGxlci4nKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmNoaWxkcmVuW2luZGV4MV0gPSBjaGlsZDI7XHJcbiAgICB0aGlzLmNoaWxkcmVuW2luZGV4Ml0gPSBjaGlsZDtcclxuICAgIHRoaXMub25DaGlsZHJlbkNoYW5nZShpbmRleDEgPCBpbmRleDIgPyBpbmRleDEgOiBpbmRleDIpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFJldHVybnMgdGhlIGluZGV4IHBvc2l0aW9uIG9mIGEgY2hpbGQgRGlzcGxheU9iamVjdCBpbnN0YW5jZVxyXG4gKlxyXG4gKiBAcGFyYW0gY2hpbGQge1BJWEkuRGlzcGxheU9iamVjdH0gVGhlIERpc3BsYXlPYmplY3QgaW5zdGFuY2UgdG8gaWRlbnRpZnlcclxuICogQHJldHVybiB7bnVtYmVyfSBUaGUgaW5kZXggcG9zaXRpb24gb2YgdGhlIGNoaWxkIGRpc3BsYXkgb2JqZWN0IHRvIGlkZW50aWZ5XHJcbiAqL1xyXG5Db250YWluZXIucHJvdG90eXBlLmdldENoaWxkSW5kZXggPSBmdW5jdGlvbiAoY2hpbGQpXHJcbntcclxuICAgIHZhciBpbmRleCA9IHRoaXMuY2hpbGRyZW4uaW5kZXhPZihjaGlsZCk7XHJcblxyXG4gICAgaWYgKGluZGV4ID09PSAtMSlcclxuICAgIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1RoZSBzdXBwbGllZCBEaXNwbGF5T2JqZWN0IG11c3QgYmUgYSBjaGlsZCBvZiB0aGUgY2FsbGVyJyk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGluZGV4O1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIENoYW5nZXMgdGhlIHBvc2l0aW9uIG9mIGFuIGV4aXN0aW5nIGNoaWxkIGluIHRoZSBkaXNwbGF5IG9iamVjdCBjb250YWluZXJcclxuICpcclxuICogQHBhcmFtIGNoaWxkIHtQSVhJLkRpc3BsYXlPYmplY3R9IFRoZSBjaGlsZCBEaXNwbGF5T2JqZWN0IGluc3RhbmNlIGZvciB3aGljaCB5b3Ugd2FudCB0byBjaGFuZ2UgdGhlIGluZGV4IG51bWJlclxyXG4gKiBAcGFyYW0gaW5kZXgge251bWJlcn0gVGhlIHJlc3VsdGluZyBpbmRleCBudW1iZXIgZm9yIHRoZSBjaGlsZCBkaXNwbGF5IG9iamVjdFxyXG4gKi9cclxuQ29udGFpbmVyLnByb3RvdHlwZS5zZXRDaGlsZEluZGV4ID0gZnVuY3Rpb24gKGNoaWxkLCBpbmRleClcclxue1xyXG4gICAgaWYgKGluZGV4IDwgMCB8fCBpbmRleCA+PSB0aGlzLmNoaWxkcmVuLmxlbmd0aClcclxuICAgIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1RoZSBzdXBwbGllZCBpbmRleCBpcyBvdXQgb2YgYm91bmRzJyk7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGN1cnJlbnRJbmRleCA9IHRoaXMuZ2V0Q2hpbGRJbmRleChjaGlsZCk7XHJcblxyXG4gICAgdGhpcy5jaGlsZHJlbi5zcGxpY2UoY3VycmVudEluZGV4LCAxKTsgLy9yZW1vdmUgZnJvbSBvbGQgcG9zaXRpb25cclxuICAgIHRoaXMuY2hpbGRyZW4uc3BsaWNlKGluZGV4LCAwLCBjaGlsZCk7IC8vYWRkIGF0IG5ldyBwb3NpdGlvblxyXG4gICAgdGhpcy5vbkNoaWxkcmVuQ2hhbmdlKGluZGV4KTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBSZXR1cm5zIHRoZSBjaGlsZCBhdCB0aGUgc3BlY2lmaWVkIGluZGV4XHJcbiAqXHJcbiAqIEBwYXJhbSBpbmRleCB7bnVtYmVyfSBUaGUgaW5kZXggdG8gZ2V0IHRoZSBjaGlsZCBhdFxyXG4gKiBAcmV0dXJuIHtQSVhJLkRpc3BsYXlPYmplY3R9IFRoZSBjaGlsZCBhdCB0aGUgZ2l2ZW4gaW5kZXgsIGlmIGFueS5cclxuICovXHJcbkNvbnRhaW5lci5wcm90b3R5cGUuZ2V0Q2hpbGRBdCA9IGZ1bmN0aW9uIChpbmRleClcclxue1xyXG4gICAgaWYgKGluZGV4IDwgMCB8fCBpbmRleCA+PSB0aGlzLmNoaWxkcmVuLmxlbmd0aClcclxuICAgIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2dldENoaWxkQXQ6IFN1cHBsaWVkIGluZGV4ICcgKyBpbmRleCArICcgZG9lcyBub3QgZXhpc3QgaW4gdGhlIGNoaWxkIGxpc3QsIG9yIHRoZSBzdXBwbGllZCBEaXNwbGF5T2JqZWN0IGlzIG5vdCBhIGNoaWxkIG9mIHRoZSBjYWxsZXInKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGhpcy5jaGlsZHJlbltpbmRleF07XHJcbn07XHJcblxyXG4vKipcclxuICogUmVtb3ZlcyBhIGNoaWxkIGZyb20gdGhlIGNvbnRhaW5lci5cclxuICpcclxuICogQHBhcmFtIGNoaWxkIHtQSVhJLkRpc3BsYXlPYmplY3R9IFRoZSBEaXNwbGF5T2JqZWN0IHRvIHJlbW92ZVxyXG4gKiBAcmV0dXJuIHtQSVhJLkRpc3BsYXlPYmplY3R9IFRoZSBjaGlsZCB0aGF0IHdhcyByZW1vdmVkLlxyXG4gKi9cclxuQ29udGFpbmVyLnByb3RvdHlwZS5yZW1vdmVDaGlsZCA9IGZ1bmN0aW9uIChjaGlsZClcclxue1xyXG4gICAgdmFyIGluZGV4ID0gdGhpcy5jaGlsZHJlbi5pbmRleE9mKGNoaWxkKTtcclxuXHJcbiAgICBpZiAoaW5kZXggPT09IC0xKVxyXG4gICAge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGhpcy5yZW1vdmVDaGlsZEF0KGluZGV4KTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBSZW1vdmVzIGEgY2hpbGQgZnJvbSB0aGUgc3BlY2lmaWVkIGluZGV4IHBvc2l0aW9uLlxyXG4gKlxyXG4gKiBAcGFyYW0gaW5kZXgge251bWJlcn0gVGhlIGluZGV4IHRvIGdldCB0aGUgY2hpbGQgZnJvbVxyXG4gKiBAcmV0dXJuIHtQSVhJLkRpc3BsYXlPYmplY3R9IFRoZSBjaGlsZCB0aGF0IHdhcyByZW1vdmVkLlxyXG4gKi9cclxuQ29udGFpbmVyLnByb3RvdHlwZS5yZW1vdmVDaGlsZEF0ID0gZnVuY3Rpb24gKGluZGV4KVxyXG57XHJcbiAgICB2YXIgY2hpbGQgPSB0aGlzLmdldENoaWxkQXQoaW5kZXgpO1xyXG5cclxuICAgIGNoaWxkLnBhcmVudCA9IG51bGw7XHJcbiAgICB0aGlzLmNoaWxkcmVuLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICB0aGlzLm9uQ2hpbGRyZW5DaGFuZ2UoaW5kZXgpO1xyXG5cclxuICAgIGNoaWxkLmVtaXQoJ3JlbW92ZWQnLCB0aGlzKTtcclxuXHJcbiAgICByZXR1cm4gY2hpbGQ7XHJcbn07XHJcblxyXG4vKipcclxuICogUmVtb3ZlcyBhbGwgY2hpbGRyZW4gZnJvbSB0aGlzIGNvbnRhaW5lciB0aGF0IGFyZSB3aXRoaW4gdGhlIGJlZ2luIGFuZCBlbmQgaW5kZXhlcy5cclxuICpcclxuICogQHBhcmFtIGJlZ2luSW5kZXgge251bWJlcn0gVGhlIGJlZ2lubmluZyBwb3NpdGlvbi4gRGVmYXVsdCB2YWx1ZSBpcyAwLlxyXG4gKiBAcGFyYW0gZW5kSW5kZXgge251bWJlcn0gVGhlIGVuZGluZyBwb3NpdGlvbi4gRGVmYXVsdCB2YWx1ZSBpcyBzaXplIG9mIHRoZSBjb250YWluZXIuXHJcbiAqL1xyXG5Db250YWluZXIucHJvdG90eXBlLnJlbW92ZUNoaWxkcmVuID0gZnVuY3Rpb24gKGJlZ2luSW5kZXgsIGVuZEluZGV4KVxyXG57XHJcbiAgICB2YXIgYmVnaW4gPSBiZWdpbkluZGV4IHx8IDA7XHJcbiAgICB2YXIgZW5kID0gdHlwZW9mIGVuZEluZGV4ID09PSAnbnVtYmVyJyA/IGVuZEluZGV4IDogdGhpcy5jaGlsZHJlbi5sZW5ndGg7XHJcbiAgICB2YXIgcmFuZ2UgPSBlbmQgLSBiZWdpbjtcclxuICAgIHZhciByZW1vdmVkLCBpO1xyXG5cclxuICAgIGlmIChyYW5nZSA+IDAgJiYgcmFuZ2UgPD0gZW5kKVxyXG4gICAge1xyXG4gICAgICAgIHJlbW92ZWQgPSB0aGlzLmNoaWxkcmVuLnNwbGljZShiZWdpbiwgcmFuZ2UpO1xyXG5cclxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgcmVtb3ZlZC5sZW5ndGg7ICsraSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJlbW92ZWRbaV0ucGFyZW50ID0gbnVsbDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMub25DaGlsZHJlbkNoYW5nZShiZWdpbkluZGV4KTtcclxuXHJcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IHJlbW92ZWQubGVuZ3RoOyArK2kpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICByZW1vdmVkW2ldLmVtaXQoJ3JlbW92ZWQnLCB0aGlzKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiByZW1vdmVkO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAocmFuZ2UgPT09IDAgJiYgdGhpcy5jaGlsZHJlbi5sZW5ndGggPT09IDApXHJcbiAgICB7XHJcbiAgICAgICAgcmV0dXJuIFtdO1xyXG4gICAgfVxyXG4gICAgZWxzZVxyXG4gICAge1xyXG4gICAgICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdyZW1vdmVDaGlsZHJlbjogbnVtZXJpYyB2YWx1ZXMgYXJlIG91dHNpZGUgdGhlIGFjY2VwdGFibGUgcmFuZ2UuJyk7XHJcbiAgICB9XHJcbn07XHJcblxyXG4vKipcclxuICogVXNlZnVsIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyBhIHRleHR1cmUgb2YgdGhlIGRpc3BsYXkgb2JqZWN0IHRoYXQgY2FuIHRoZW4gYmUgdXNlZCB0byBjcmVhdGUgc3ByaXRlc1xyXG4gKiBUaGlzIGNhbiBiZSBxdWl0ZSB1c2VmdWwgaWYgeW91ciBkaXNwbGF5T2JqZWN0IGlzIHN0YXRpYyAvIGNvbXBsaWNhdGVkIGFuZCBuZWVkcyB0byBiZSByZXVzZWQgbXVsdGlwbGUgdGltZXMuXHJcbiAqXHJcbiAqIEBwYXJhbSByZW5kZXJlciB7UElYSS5DYW52YXNSZW5kZXJlcnxQSVhJLldlYkdMUmVuZGVyZXJ9IFRoZSByZW5kZXJlciB1c2VkIHRvIGdlbmVyYXRlIHRoZSB0ZXh0dXJlLlxyXG4gKiBAcGFyYW0gcmVzb2x1dGlvbiB7bnVtYmVyfSBUaGUgcmVzb2x1dGlvbiBvZiB0aGUgdGV4dHVyZSBiZWluZyBnZW5lcmF0ZWRcclxuICogQHBhcmFtIHNjYWxlTW9kZSB7bnVtYmVyfSBTZWUge0BsaW5rIFBJWEkuU0NBTEVfTU9ERVN9IGZvciBwb3NzaWJsZSB2YWx1ZXNcclxuICogQHJldHVybiB7UElYSS5UZXh0dXJlfSBhIHRleHR1cmUgb2YgdGhlIGRpc3BsYXkgb2JqZWN0XHJcbiAqL1xyXG5Db250YWluZXIucHJvdG90eXBlLmdlbmVyYXRlVGV4dHVyZSA9IGZ1bmN0aW9uIChyZW5kZXJlciwgcmVzb2x1dGlvbiwgc2NhbGVNb2RlKVxyXG57XHJcbiAgICB2YXIgYm91bmRzID0gdGhpcy5nZXRMb2NhbEJvdW5kcygpO1xyXG5cclxuICAgIHZhciByZW5kZXJUZXh0dXJlID0gbmV3IFJlbmRlclRleHR1cmUocmVuZGVyZXIsIGJvdW5kcy53aWR0aCB8IDAsIGJvdW5kcy5oZWlnaHQgfCAwLCBzY2FsZU1vZGUsIHJlc29sdXRpb24pO1xyXG5cclxuICAgIF90ZW1wTWF0cml4LnR4ID0gLWJvdW5kcy54O1xyXG4gICAgX3RlbXBNYXRyaXgudHkgPSAtYm91bmRzLnk7XHJcblxyXG4gICAgcmVuZGVyVGV4dHVyZS5yZW5kZXIodGhpcywgX3RlbXBNYXRyaXgpO1xyXG5cclxuICAgIHJldHVybiByZW5kZXJUZXh0dXJlO1xyXG59O1xyXG5cclxuLypcclxuICogVXBkYXRlcyB0aGUgdHJhbnNmb3JtIG9uIGFsbCBjaGlsZHJlbiBvZiB0aGlzIGNvbnRhaW5lciBmb3IgcmVuZGVyaW5nXHJcbiAqXHJcbiAqIEBwcml2YXRlXHJcbiAqL1xyXG5Db250YWluZXIucHJvdG90eXBlLnVwZGF0ZVRyYW5zZm9ybSA9IGZ1bmN0aW9uICgpXHJcbntcclxuICAgIGlmICghdGhpcy52aXNpYmxlKVxyXG4gICAge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmRpc3BsYXlPYmplY3RVcGRhdGVUcmFuc2Zvcm0oKTtcclxuXHJcbiAgICBmb3IgKHZhciBpID0gMCwgaiA9IHRoaXMuY2hpbGRyZW4ubGVuZ3RoOyBpIDwgajsgKytpKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMuY2hpbGRyZW5baV0udXBkYXRlVHJhbnNmb3JtKCk7XHJcbiAgICB9XHJcbn07XHJcblxyXG4vLyBwZXJmb3JtYW5jZSBpbmNyZWFzZSB0byBhdm9pZCB1c2luZyBjYWxsLi4gKDEweCBmYXN0ZXIpXHJcbkNvbnRhaW5lci5wcm90b3R5cGUuY29udGFpbmVyVXBkYXRlVHJhbnNmb3JtID0gQ29udGFpbmVyLnByb3RvdHlwZS51cGRhdGVUcmFuc2Zvcm07XHJcblxyXG4vKipcclxuICogUmV0cmlldmVzIHRoZSBib3VuZHMgb2YgdGhlIENvbnRhaW5lciBhcyBhIHJlY3RhbmdsZS4gVGhlIGJvdW5kcyBjYWxjdWxhdGlvbiB0YWtlcyBhbGwgdmlzaWJsZSBjaGlsZHJlbiBpbnRvIGNvbnNpZGVyYXRpb24uXHJcbiAqXHJcbiAqIEByZXR1cm4ge1BJWEkuUmVjdGFuZ2xlfSBUaGUgcmVjdGFuZ3VsYXIgYm91bmRpbmcgYXJlYVxyXG4gKi9cclxuQ29udGFpbmVyLnByb3RvdHlwZS5nZXRCb3VuZHMgPSBmdW5jdGlvbiAoKVxyXG57XHJcbiAgICBpZighdGhpcy5fY3VycmVudEJvdW5kcylcclxuICAgIHtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuY2hpbGRyZW4ubGVuZ3RoID09PSAwKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmV0dXJuIG1hdGguUmVjdGFuZ2xlLkVNUFRZO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gVE9ETyB0aGUgYm91bmRzIGhhdmUgYWxyZWFkeSBiZWVuIGNhbGN1bGF0ZWQgdGhpcyByZW5kZXIgc2Vzc2lvbiBzbyByZXR1cm4gd2hhdCB3ZSBoYXZlXHJcblxyXG4gICAgICAgIHZhciBtaW5YID0gSW5maW5pdHk7XHJcbiAgICAgICAgdmFyIG1pblkgPSBJbmZpbml0eTtcclxuXHJcbiAgICAgICAgdmFyIG1heFggPSAtSW5maW5pdHk7XHJcbiAgICAgICAgdmFyIG1heFkgPSAtSW5maW5pdHk7XHJcblxyXG4gICAgICAgIHZhciBjaGlsZEJvdW5kcztcclxuICAgICAgICB2YXIgY2hpbGRNYXhYO1xyXG4gICAgICAgIHZhciBjaGlsZE1heFk7XHJcblxyXG4gICAgICAgIHZhciBjaGlsZFZpc2libGUgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGogPSB0aGlzLmNoaWxkcmVuLmxlbmd0aDsgaSA8IGo7ICsraSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHZhciBjaGlsZCA9IHRoaXMuY2hpbGRyZW5baV07XHJcblxyXG4gICAgICAgICAgICBpZiAoIWNoaWxkLnZpc2libGUpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBjaGlsZFZpc2libGUgPSB0cnVlO1xyXG5cclxuICAgICAgICAgICAgY2hpbGRCb3VuZHMgPSB0aGlzLmNoaWxkcmVuW2ldLmdldEJvdW5kcygpO1xyXG5cclxuICAgICAgICAgICAgbWluWCA9IG1pblggPCBjaGlsZEJvdW5kcy54ID8gbWluWCA6IGNoaWxkQm91bmRzLng7XHJcbiAgICAgICAgICAgIG1pblkgPSBtaW5ZIDwgY2hpbGRCb3VuZHMueSA/IG1pblkgOiBjaGlsZEJvdW5kcy55O1xyXG5cclxuICAgICAgICAgICAgY2hpbGRNYXhYID0gY2hpbGRCb3VuZHMud2lkdGggKyBjaGlsZEJvdW5kcy54O1xyXG4gICAgICAgICAgICBjaGlsZE1heFkgPSBjaGlsZEJvdW5kcy5oZWlnaHQgKyBjaGlsZEJvdW5kcy55O1xyXG5cclxuICAgICAgICAgICAgbWF4WCA9IG1heFggPiBjaGlsZE1heFggPyBtYXhYIDogY2hpbGRNYXhYO1xyXG4gICAgICAgICAgICBtYXhZID0gbWF4WSA+IGNoaWxkTWF4WSA/IG1heFkgOiBjaGlsZE1heFk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIWNoaWxkVmlzaWJsZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVybiBtYXRoLlJlY3RhbmdsZS5FTVBUWTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciBib3VuZHMgPSB0aGlzLl9ib3VuZHM7XHJcblxyXG4gICAgICAgIGJvdW5kcy54ID0gbWluWDtcclxuICAgICAgICBib3VuZHMueSA9IG1pblk7XHJcbiAgICAgICAgYm91bmRzLndpZHRoID0gbWF4WCAtIG1pblg7XHJcbiAgICAgICAgYm91bmRzLmhlaWdodCA9IG1heFkgLSBtaW5ZO1xyXG5cclxuICAgICAgICB0aGlzLl9jdXJyZW50Qm91bmRzID0gYm91bmRzO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0aGlzLl9jdXJyZW50Qm91bmRzO1xyXG59O1xyXG5cclxuQ29udGFpbmVyLnByb3RvdHlwZS5jb250YWluZXJHZXRCb3VuZHMgPSBDb250YWluZXIucHJvdG90eXBlLmdldEJvdW5kcztcclxuXHJcbi8qKlxyXG4gKiBSZXRyaWV2ZXMgdGhlIG5vbi1nbG9iYWwgbG9jYWwgYm91bmRzIG9mIHRoZSBDb250YWluZXIgYXMgYSByZWN0YW5nbGUuXHJcbiAqIFRoZSBjYWxjdWxhdGlvbiB0YWtlcyBhbGwgdmlzaWJsZSBjaGlsZHJlbiBpbnRvIGNvbnNpZGVyYXRpb24uXHJcbiAqXHJcbiAqIEByZXR1cm4ge1BJWEkuUmVjdGFuZ2xlfSBUaGUgcmVjdGFuZ3VsYXIgYm91bmRpbmcgYXJlYVxyXG4gKi9cclxuQ29udGFpbmVyLnByb3RvdHlwZS5nZXRMb2NhbEJvdW5kcyA9IGZ1bmN0aW9uICgpXHJcbntcclxuICAgIHZhciBtYXRyaXhDYWNoZSA9IHRoaXMud29ybGRUcmFuc2Zvcm07XHJcblxyXG4gICAgdGhpcy53b3JsZFRyYW5zZm9ybSA9IG1hdGguTWF0cml4LklERU5USVRZO1xyXG5cclxuICAgIGZvciAodmFyIGkgPSAwLCBqID0gdGhpcy5jaGlsZHJlbi5sZW5ndGg7IGkgPCBqOyArK2kpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5jaGlsZHJlbltpXS51cGRhdGVUcmFuc2Zvcm0oKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLndvcmxkVHJhbnNmb3JtID0gbWF0cml4Q2FjaGU7XHJcblxyXG4gICAgdGhpcy5fY3VycmVudEJvdW5kcyA9IG51bGw7XHJcblxyXG4gICAgcmV0dXJuIHRoaXMuZ2V0Qm91bmRzKCBtYXRoLk1hdHJpeC5JREVOVElUWSApO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFJlbmRlcnMgdGhlIG9iamVjdCB1c2luZyB0aGUgV2ViR0wgcmVuZGVyZXJcclxuICpcclxuICogQHBhcmFtIHJlbmRlcmVyIHtQSVhJLldlYkdMUmVuZGVyZXJ9IFRoZSByZW5kZXJlclxyXG4gKi9cclxuQ29udGFpbmVyLnByb3RvdHlwZS5yZW5kZXJXZWJHTCA9IGZ1bmN0aW9uIChyZW5kZXJlcilcclxue1xyXG5cclxuICAgIC8vIGlmIHRoZSBvYmplY3QgaXMgbm90IHZpc2libGUgb3IgdGhlIGFscGhhIGlzIDAgdGhlbiBubyBuZWVkIHRvIHJlbmRlciB0aGlzIGVsZW1lbnRcclxuICAgIGlmICghdGhpcy52aXNpYmxlIHx8IHRoaXMud29ybGRBbHBoYSA8PSAwIHx8ICF0aGlzLnJlbmRlcmFibGUpXHJcbiAgICB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBpLCBqO1xyXG5cclxuICAgIC8vIGRvIGEgcXVpY2sgY2hlY2sgdG8gc2VlIGlmIHRoaXMgZWxlbWVudCBoYXMgYSBtYXNrIG9yIGEgZmlsdGVyLlxyXG4gICAgaWYgKHRoaXMuX21hc2sgfHwgdGhpcy5fZmlsdGVycylcclxuICAgIHtcclxuICAgICAgICByZW5kZXJlci5jdXJyZW50UmVuZGVyZXIuZmx1c2goKTtcclxuXHJcbiAgICAgICAgLy8gcHVzaCBmaWx0ZXIgZmlyc3QgYXMgd2UgbmVlZCB0byBlbnN1cmUgdGhlIHN0ZW5jaWwgYnVmZmVyIGlzIGNvcnJlY3QgZm9yIGFueSBtYXNraW5nXHJcbiAgICAgICAgaWYgKHRoaXMuX2ZpbHRlcnMgJiYgdGhpcy5fZmlsdGVycy5sZW5ndGgpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICByZW5kZXJlci5maWx0ZXJNYW5hZ2VyLnB1c2hGaWx0ZXIodGhpcywgdGhpcy5fZmlsdGVycyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5fbWFzaylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJlbmRlcmVyLm1hc2tNYW5hZ2VyLnB1c2hNYXNrKHRoaXMsIHRoaXMuX21hc2spO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmVuZGVyZXIuY3VycmVudFJlbmRlcmVyLnN0YXJ0KCk7XHJcblxyXG4gICAgICAgIC8vIGFkZCB0aGlzIG9iamVjdCB0byB0aGUgYmF0Y2gsIG9ubHkgcmVuZGVyZWQgaWYgaXQgaGFzIGEgdGV4dHVyZS5cclxuICAgICAgICB0aGlzLl9yZW5kZXJXZWJHTChyZW5kZXJlcik7XHJcblxyXG4gICAgICAgIC8vIG5vdyBsb29wIHRocm91Z2ggdGhlIGNoaWxkcmVuIGFuZCBtYWtlIHN1cmUgdGhleSBnZXQgcmVuZGVyZWRcclxuICAgICAgICBmb3IgKGkgPSAwLCBqID0gdGhpcy5jaGlsZHJlbi5sZW5ndGg7IGkgPCBqOyBpKyspXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLmNoaWxkcmVuW2ldLnJlbmRlcldlYkdMKHJlbmRlcmVyKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJlbmRlcmVyLmN1cnJlbnRSZW5kZXJlci5mbHVzaCgpO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5fbWFzaylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJlbmRlcmVyLm1hc2tNYW5hZ2VyLnBvcE1hc2sodGhpcywgdGhpcy5fbWFzayk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5fZmlsdGVycylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJlbmRlcmVyLmZpbHRlck1hbmFnZXIucG9wRmlsdGVyKCk7XHJcblxyXG4gICAgICAgIH1cclxuICAgICAgICByZW5kZXJlci5jdXJyZW50UmVuZGVyZXIuc3RhcnQoKTtcclxuICAgIH1cclxuICAgIGVsc2VcclxuICAgIHtcclxuICAgICAgICB0aGlzLl9yZW5kZXJXZWJHTChyZW5kZXJlcik7XHJcblxyXG4gICAgICAgIC8vIHNpbXBsZSByZW5kZXIgY2hpbGRyZW4hXHJcbiAgICAgICAgZm9yIChpID0gMCwgaiA9IHRoaXMuY2hpbGRyZW4ubGVuZ3RoOyBpIDwgajsgKytpKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5jaGlsZHJlbltpXS5yZW5kZXJXZWJHTChyZW5kZXJlcik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuLyoqXHJcbiAqIFRvIGJlIG92ZXJyaWRkZW4gYnkgdGhlIHN1YmNsYXNzXHJcbiAqXHJcbiAqIEBwYXJhbSByZW5kZXJlciB7UElYSS5XZWJHTFJlbmRlcmVyfSBUaGUgcmVuZGVyZXJcclxuICogQHByaXZhdGVcclxuICovXHJcbkNvbnRhaW5lci5wcm90b3R5cGUuX3JlbmRlcldlYkdMID0gZnVuY3Rpb24gKHJlbmRlcmVyKSAvLyBqc2hpbnQgdW51c2VkOmZhbHNlXHJcbntcclxuICAgIC8vIHRoaXMgaXMgd2hlcmUgY29udGVudCBpdHNlbGYgZ2V0cyByZW5kZXJlZC4uLlxyXG59O1xyXG5cclxuLyoqXHJcbiAqIFRvIGJlIG92ZXJyaWRkZW4gYnkgdGhlIHN1YmNsYXNzXHJcbiAqXHJcbiAqIEBwYXJhbSByZW5kZXJlciB7UElYSS5DYW52YXNSZW5kZXJlcn0gVGhlIHJlbmRlcmVyXHJcbiAqIEBwcml2YXRlXHJcbiAqL1xyXG5Db250YWluZXIucHJvdG90eXBlLl9yZW5kZXJDYW52YXMgPSBmdW5jdGlvbiAocmVuZGVyZXIpIC8vIGpzaGludCB1bnVzZWQ6ZmFsc2Vcclxue1xyXG4gICAgLy8gdGhpcyBpcyB3aGVyZSBjb250ZW50IGl0c2VsZiBnZXRzIHJlbmRlcmVkLi4uXHJcbn07XHJcblxyXG5cclxuLyoqXHJcbiAqIFJlbmRlcnMgdGhlIG9iamVjdCB1c2luZyB0aGUgQ2FudmFzIHJlbmRlcmVyXHJcbiAqXHJcbiAqIEBwYXJhbSByZW5kZXJlciB7UElYSS5DYW52YXNSZW5kZXJlcn0gVGhlIHJlbmRlcmVyXHJcbiAqL1xyXG5Db250YWluZXIucHJvdG90eXBlLnJlbmRlckNhbnZhcyA9IGZ1bmN0aW9uIChyZW5kZXJlcilcclxue1xyXG4gICAgLy8gaWYgbm90IHZpc2libGUgb3IgdGhlIGFscGhhIGlzIDAgdGhlbiBubyBuZWVkIHRvIHJlbmRlciB0aGlzXHJcbiAgICBpZiAoIXRoaXMudmlzaWJsZSB8fCB0aGlzLmFscGhhIDw9IDAgfHwgIXRoaXMucmVuZGVyYWJsZSlcclxuICAgIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRoaXMuX21hc2spXHJcbiAgICB7XHJcbiAgICAgICAgcmVuZGVyZXIubWFza01hbmFnZXIucHVzaE1hc2sodGhpcy5fbWFzaywgcmVuZGVyZXIpO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuX3JlbmRlckNhbnZhcyhyZW5kZXJlcik7XHJcbiAgICBmb3IgKHZhciBpID0gMCwgaiA9IHRoaXMuY2hpbGRyZW4ubGVuZ3RoOyBpIDwgajsgKytpKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMuY2hpbGRyZW5baV0ucmVuZGVyQ2FudmFzKHJlbmRlcmVyKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAodGhpcy5fbWFzaylcclxuICAgIHtcclxuICAgICAgICByZW5kZXJlci5tYXNrTWFuYWdlci5wb3BNYXNrKHJlbmRlcmVyKTtcclxuICAgIH1cclxufTtcclxuXHJcbi8qKlxyXG4gKiBEZXN0cm95cyB0aGUgY29udGFpbmVyXHJcbiAqIEBwYXJhbSBbZGVzdHJveUNoaWxkcmVuPWZhbHNlXSB7Ym9vbGVhbn0gaWYgc2V0IHRvIHRydWUsIGFsbCB0aGUgY2hpbGRyZW4gd2lsbCBoYXZlIHRoZWlyIGRlc3Ryb3kgbWV0aG9kIGNhbGxlZCBhcyB3ZWxsXHJcbiAqL1xyXG5Db250YWluZXIucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbiAoZGVzdHJveUNoaWxkcmVuKVxyXG57XHJcbiAgICBEaXNwbGF5T2JqZWN0LnByb3RvdHlwZS5kZXN0cm95LmNhbGwodGhpcyk7XHJcblxyXG4gICAgaWYgKGRlc3Ryb3lDaGlsZHJlbilcclxuICAgIHtcclxuICAgICAgICBmb3IgKHZhciBpID0gMCwgaiA9IHRoaXMuY2hpbGRyZW4ubGVuZ3RoOyBpIDwgajsgKytpKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5jaGlsZHJlbltpXS5kZXN0cm95KGRlc3Ryb3lDaGlsZHJlbik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHRoaXMucmVtb3ZlQ2hpbGRyZW4oKTtcclxuXHJcbiAgICB0aGlzLmNoaWxkcmVuID0gbnVsbDtcclxufTtcclxuIiwidmFyIG1hdGggPSByZXF1aXJlKCcuLi9tYXRoJyksXHJcbiAgICBSZW5kZXJUZXh0dXJlID0gcmVxdWlyZSgnLi4vdGV4dHVyZXMvUmVuZGVyVGV4dHVyZScpLFxyXG4gICAgRXZlbnRFbWl0dGVyID0gcmVxdWlyZSgnZXZlbnRlbWl0dGVyMycpLFxyXG4gICAgQ09OU1QgPSByZXF1aXJlKCcuLi9jb25zdCcpLFxyXG4gICAgX3RlbXBNYXRyaXggPSBuZXcgbWF0aC5NYXRyaXgoKSxcclxuICAgIF90ZW1wRGlzcGxheU9iamVjdFBhcmVudCA9IHt3b3JsZFRyYW5zZm9ybTpuZXcgbWF0aC5NYXRyaXgoKSwgd29ybGRBbHBoYToxLCBjaGlsZHJlbjpbXX07XHJcblxyXG5cclxuLyoqXHJcbiAqIFRoZSBiYXNlIGNsYXNzIGZvciBhbGwgb2JqZWN0cyB0aGF0IGFyZSByZW5kZXJlZCBvbiB0aGUgc2NyZWVuLlxyXG4gKiBUaGlzIGlzIGFuIGFic3RyYWN0IGNsYXNzIGFuZCBzaG91bGQgbm90IGJlIHVzZWQgb24gaXRzIG93biByYXRoZXIgaXQgc2hvdWxkIGJlIGV4dGVuZGVkLlxyXG4gKlxyXG4gKiBAY2xhc3NcclxuICogQGV4dGVuZHMgRXZlbnRFbWl0dGVyXHJcbiAqIEBtZW1iZXJvZiBQSVhJXHJcbiAqL1xyXG5mdW5jdGlvbiBEaXNwbGF5T2JqZWN0KClcclxue1xyXG4gICAgRXZlbnRFbWl0dGVyLmNhbGwodGhpcyk7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgY29vcmRpbmF0ZSBvZiB0aGUgb2JqZWN0IHJlbGF0aXZlIHRvIHRoZSBsb2NhbCBjb29yZGluYXRlcyBvZiB0aGUgcGFyZW50LlxyXG4gICAgICpcclxuICAgICAqIEBtZW1iZXIge1BJWEkuUG9pbnR9XHJcbiAgICAgKi9cclxuICAgIHRoaXMucG9zaXRpb24gPSBuZXcgbWF0aC5Qb2ludCgpO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogVGhlIHNjYWxlIGZhY3RvciBvZiB0aGUgb2JqZWN0LlxyXG4gICAgICpcclxuICAgICAqIEBtZW1iZXIge1BJWEkuUG9pbnR9XHJcbiAgICAgKi9cclxuICAgIHRoaXMuc2NhbGUgPSBuZXcgbWF0aC5Qb2ludCgxLCAxKTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFRoZSBwaXZvdCBwb2ludCBvZiB0aGUgZGlzcGxheU9iamVjdCB0aGF0IGl0IHJvdGF0ZXMgYXJvdW5kXHJcbiAgICAgKlxyXG4gICAgICogQG1lbWJlciB7UElYSS5Qb2ludH1cclxuICAgICAqL1xyXG4gICAgdGhpcy5waXZvdCA9IG5ldyBtYXRoLlBvaW50KDAsIDApO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogVGhlIHJvdGF0aW9uIG9mIHRoZSBvYmplY3QgaW4gcmFkaWFucy5cclxuICAgICAqXHJcbiAgICAgKiBAbWVtYmVyIHtudW1iZXJ9XHJcbiAgICAgKi9cclxuICAgIHRoaXMucm90YXRpb24gPSAwO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogVGhlIG9wYWNpdHkgb2YgdGhlIG9iamVjdC5cclxuICAgICAqXHJcbiAgICAgKiBAbWVtYmVyIHtudW1iZXJ9XHJcbiAgICAgKi9cclxuICAgIHRoaXMuYWxwaGEgPSAxO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogVGhlIHZpc2liaWxpdHkgb2YgdGhlIG9iamVjdC4gSWYgZmFsc2UgdGhlIG9iamVjdCB3aWxsIG5vdCBiZSBkcmF3biwgYW5kXHJcbiAgICAgKiB0aGUgdXBkYXRlVHJhbnNmb3JtIGZ1bmN0aW9uIHdpbGwgbm90IGJlIGNhbGxlZC5cclxuICAgICAqXHJcbiAgICAgKiBAbWVtYmVyIHtib29sZWFufVxyXG4gICAgICovXHJcbiAgICB0aGlzLnZpc2libGUgPSB0cnVlO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ2FuIHRoaXMgb2JqZWN0IGJlIHJlbmRlcmVkLCBpZiBmYWxzZSB0aGUgb2JqZWN0IHdpbGwgbm90IGJlIGRyYXduIGJ1dCB0aGUgdXBkYXRlVHJhbnNmb3JtXHJcbiAgICAgKiBtZXRob2RzIHdpbGwgc3RpbGwgYmUgY2FsbGVkLlxyXG4gICAgICpcclxuICAgICAqIEBtZW1iZXIge2Jvb2xlYW59XHJcbiAgICAgKi9cclxuICAgIHRoaXMucmVuZGVyYWJsZSA9IHRydWU7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgZGlzcGxheSBvYmplY3QgY29udGFpbmVyIHRoYXQgY29udGFpbnMgdGhpcyBkaXNwbGF5IG9iamVjdC5cclxuICAgICAqXHJcbiAgICAgKiBAbWVtYmVyIHtQSVhJLkNvbnRhaW5lcn1cclxuICAgICAqIEByZWFkT25seVxyXG4gICAgICovXHJcbiAgICB0aGlzLnBhcmVudCA9IG51bGw7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgbXVsdGlwbGllZCBhbHBoYSBvZiB0aGUgZGlzcGxheU9iamVjdFxyXG4gICAgICpcclxuICAgICAqIEBtZW1iZXIge251bWJlcn1cclxuICAgICAqIEByZWFkT25seVxyXG4gICAgICovXHJcbiAgICB0aGlzLndvcmxkQWxwaGEgPSAxO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ3VycmVudCB0cmFuc2Zvcm0gb2YgdGhlIG9iamVjdCBiYXNlZCBvbiB3b3JsZCAocGFyZW50KSBmYWN0b3JzXHJcbiAgICAgKlxyXG4gICAgICogQG1lbWJlciB7UElYSS5NYXRyaXh9XHJcbiAgICAgKiBAcmVhZE9ubHlcclxuICAgICAqL1xyXG4gICAgdGhpcy53b3JsZFRyYW5zZm9ybSA9IG5ldyBtYXRoLk1hdHJpeCgpO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogVGhlIGFyZWEgdGhlIGZpbHRlciBpcyBhcHBsaWVkIHRvLiBUaGlzIGlzIHVzZWQgYXMgbW9yZSBvZiBhbiBvcHRpbWlzYXRpb25cclxuICAgICAqIHJhdGhlciB0aGFuIGZpZ3VyaW5nIG91dCB0aGUgZGltZW5zaW9ucyBvZiB0aGUgZGlzcGxheU9iamVjdCBlYWNoIGZyYW1lIHlvdSBjYW4gc2V0IHRoaXMgcmVjdGFuZ2xlXHJcbiAgICAgKlxyXG4gICAgICogQG1lbWJlciB7UElYSS5SZWN0YW5nbGV9XHJcbiAgICAgKi9cclxuICAgIHRoaXMuZmlsdGVyQXJlYSA9IG51bGw7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBjYWNoZWQgc2luIHJvdGF0aW9uXHJcbiAgICAgKlxyXG4gICAgICogQG1lbWJlciB7bnVtYmVyfVxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgdGhpcy5fc3IgPSAwO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogY2FjaGVkIGNvcyByb3RhdGlvblxyXG4gICAgICpcclxuICAgICAqIEBtZW1iZXIge251bWJlcn1cclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIHRoaXMuX2NyID0gMTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFRoZSBvcmlnaW5hbCwgY2FjaGVkIGJvdW5kcyBvZiB0aGUgb2JqZWN0XHJcbiAgICAgKlxyXG4gICAgICogQG1lbWJlciB7UElYSS5SZWN0YW5nbGV9XHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICB0aGlzLl9ib3VuZHMgPSBuZXcgbWF0aC5SZWN0YW5nbGUoMCwgMCwgMSwgMSk7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgbW9zdCB1cC10by1kYXRlIGJvdW5kcyBvZiB0aGUgb2JqZWN0XHJcbiAgICAgKlxyXG4gICAgICogQG1lbWJlciB7UElYSS5SZWN0YW5nbGV9XHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICB0aGlzLl9jdXJyZW50Qm91bmRzID0gbnVsbDtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFRoZSBvcmlnaW5hbCwgY2FjaGVkIG1hc2sgb2YgdGhlIG9iamVjdFxyXG4gICAgICpcclxuICAgICAqIEBtZW1iZXIge1BJWEkuUmVjdGFuZ2xlfVxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgdGhpcy5fbWFzayA9IG51bGw7XHJcbn1cclxuXHJcbi8vIGNvbnN0cnVjdG9yXHJcbkRpc3BsYXlPYmplY3QucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShFdmVudEVtaXR0ZXIucHJvdG90eXBlKTtcclxuRGlzcGxheU9iamVjdC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBEaXNwbGF5T2JqZWN0O1xyXG5tb2R1bGUuZXhwb3J0cyA9IERpc3BsYXlPYmplY3Q7XHJcblxyXG5PYmplY3QuZGVmaW5lUHJvcGVydGllcyhEaXNwbGF5T2JqZWN0LnByb3RvdHlwZSwge1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgcG9zaXRpb24gb2YgdGhlIGRpc3BsYXlPYmplY3Qgb24gdGhlIHggYXhpcyByZWxhdGl2ZSB0byB0aGUgbG9jYWwgY29vcmRpbmF0ZXMgb2YgdGhlIHBhcmVudC5cclxuICAgICAqXHJcbiAgICAgKiBAbWVtYmVyIHtudW1iZXJ9XHJcbiAgICAgKiBAbWVtYmVyb2YgUElYSS5EaXNwbGF5T2JqZWN0I1xyXG4gICAgICovXHJcbiAgICB4OiB7XHJcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMucG9zaXRpb24ueDtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHNldDogZnVuY3Rpb24gKHZhbHVlKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5wb3NpdGlvbi54ID0gdmFsdWU7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIFRoZSBwb3NpdGlvbiBvZiB0aGUgZGlzcGxheU9iamVjdCBvbiB0aGUgeSBheGlzIHJlbGF0aXZlIHRvIHRoZSBsb2NhbCBjb29yZGluYXRlcyBvZiB0aGUgcGFyZW50LlxyXG4gICAgICpcclxuICAgICAqIEBtZW1iZXIge251bWJlcn1cclxuICAgICAqIEBtZW1iZXJvZiBQSVhJLkRpc3BsYXlPYmplY3QjXHJcbiAgICAgKi9cclxuICAgIHk6IHtcclxuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5wb3NpdGlvbi55O1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc2V0OiBmdW5jdGlvbiAodmFsdWUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnBvc2l0aW9uLnkgPSB2YWx1ZTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogSW5kaWNhdGVzIGlmIHRoZSBzcHJpdGUgaXMgZ2xvYmFsbHkgdmlzaWJsZS5cclxuICAgICAqXHJcbiAgICAgKiBAbWVtYmVyIHtib29sZWFufVxyXG4gICAgICogQG1lbWJlcm9mIFBJWEkuRGlzcGxheU9iamVjdCNcclxuICAgICAqIEByZWFkb25seVxyXG4gICAgICovXHJcbiAgICB3b3JsZFZpc2libGU6IHtcclxuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB2YXIgaXRlbSA9IHRoaXM7XHJcblxyXG4gICAgICAgICAgICBkbyB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIWl0ZW0udmlzaWJsZSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaXRlbSA9IGl0ZW0ucGFyZW50O1xyXG4gICAgICAgICAgICB9IHdoaWxlIChpdGVtKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZXRzIGEgbWFzayBmb3IgdGhlIGRpc3BsYXlPYmplY3QuIEEgbWFzayBpcyBhbiBvYmplY3QgdGhhdCBsaW1pdHMgdGhlIHZpc2liaWxpdHkgb2YgYW4gb2JqZWN0IHRvIHRoZSBzaGFwZSBvZiB0aGUgbWFzayBhcHBsaWVkIHRvIGl0LlxyXG4gICAgICogSW4gUElYSSBhIHJlZ3VsYXIgbWFzayBtdXN0IGJlIGEgUElYSS5HcmFwaGljcyBvciBhIFBJWEkuU3ByaXRlIG9iamVjdC4gVGhpcyBhbGxvd3MgZm9yIG11Y2ggZmFzdGVyIG1hc2tpbmcgaW4gY2FudmFzIGFzIGl0IHV0aWxpc2VzIHNoYXBlIGNsaXBwaW5nLlxyXG4gICAgICogVG8gcmVtb3ZlIGEgbWFzaywgc2V0IHRoaXMgcHJvcGVydHkgdG8gbnVsbC5cclxuICAgICAqXHJcbiAgICAgKiBAbWVtYmVyIHtQSVhJLkdyYXBoaWNzfFBJWEkuU3ByaXRlfVxyXG4gICAgICogQG1lbWJlcm9mIFBJWEkuRGlzcGxheU9iamVjdCNcclxuICAgICAqL1xyXG4gICAgbWFzazoge1xyXG4gICAgICAgIGdldDogZnVuY3Rpb24gKClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9tYXNrO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc2V0OiBmdW5jdGlvbiAodmFsdWUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5fbWFzaylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fbWFzay5yZW5kZXJhYmxlID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhpcy5fbWFzayA9IHZhbHVlO1xyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMuX21hc2spXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX21hc2sucmVuZGVyYWJsZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIFNldHMgdGhlIGZpbHRlcnMgZm9yIHRoZSBkaXNwbGF5T2JqZWN0LlxyXG4gICAgICogKiBJTVBPUlRBTlQ6IFRoaXMgaXMgYSB3ZWJHTCBvbmx5IGZlYXR1cmUgYW5kIHdpbGwgYmUgaWdub3JlZCBieSB0aGUgY2FudmFzIHJlbmRlcmVyLlxyXG4gICAgICogVG8gcmVtb3ZlIGZpbHRlcnMgc2ltcGx5IHNldCB0aGlzIHByb3BlcnR5IHRvICdudWxsJ1xyXG4gICAgICpcclxuICAgICAqIEBtZW1iZXIge1BJWEkuQWJzdHJhY3RGaWx0ZXJbXX1cclxuICAgICAqIEBtZW1iZXJvZiBQSVhJLkRpc3BsYXlPYmplY3QjXHJcbiAgICAgKi9cclxuICAgIGZpbHRlcnM6IHtcclxuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fZmlsdGVycyAmJiB0aGlzLl9maWx0ZXJzLnNsaWNlKCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBzZXQ6IGZ1bmN0aW9uICh2YWx1ZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuX2ZpbHRlcnMgPSB2YWx1ZSAmJiB2YWx1ZS5zbGljZSgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbn0pO1xyXG5cclxuLypcclxuICogVXBkYXRlcyB0aGUgb2JqZWN0IHRyYW5zZm9ybSBmb3IgcmVuZGVyaW5nXHJcbiAqXHJcbiAqIFRPRE8gLSBPcHRpbWl6YXRpb24gcGFzcyFcclxuICovXHJcbkRpc3BsYXlPYmplY3QucHJvdG90eXBlLnVwZGF0ZVRyYW5zZm9ybSA9IGZ1bmN0aW9uICgpXHJcbntcclxuXHJcbiAgICAvLyBjcmVhdGUgc29tZSBtYXRyaXggcmVmcyBmb3IgZWFzeSBhY2Nlc3NcclxuICAgIHZhciBwdCA9IHRoaXMucGFyZW50LndvcmxkVHJhbnNmb3JtO1xyXG4gICAgdmFyIHd0ID0gdGhpcy53b3JsZFRyYW5zZm9ybTtcclxuXHJcbiAgICAvLyB0ZW1wb3JhcnkgbWF0cml4IHZhcmlhYmxlc1xyXG4gICAgdmFyIGEsIGIsIGMsIGQsIHR4LCB0eTtcclxuXHJcbiAgICAvLyBzbyBpZiByb3RhdGlvbiBpcyBiZXR3ZWVuIDAgdGhlbiB3ZSBjYW4gc2ltcGxpZnkgdGhlIG11bHRpcGxpY2F0aW9uIHByb2Nlc3MuLi5cclxuICAgIGlmICh0aGlzLnJvdGF0aW9uICUgQ09OU1QuUElfMilcclxuICAgIHtcclxuICAgICAgICAvLyBjaGVjayB0byBzZWUgaWYgdGhlIHJvdGF0aW9uIGlzIHRoZSBzYW1lIGFzIHRoZSBwcmV2aW91cyByZW5kZXIuIFRoaXMgbWVhbnMgd2Ugb25seSBuZWVkIHRvIHVzZSBzaW4gYW5kIGNvcyB3aGVuIHJvdGF0aW9uIGFjdHVhbGx5IGNoYW5nZXNcclxuICAgICAgICBpZiAodGhpcy5yb3RhdGlvbiAhPT0gdGhpcy5yb3RhdGlvbkNhY2hlKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5yb3RhdGlvbkNhY2hlID0gdGhpcy5yb3RhdGlvbjtcclxuICAgICAgICAgICAgdGhpcy5fc3IgPSBNYXRoLnNpbih0aGlzLnJvdGF0aW9uKTtcclxuICAgICAgICAgICAgdGhpcy5fY3IgPSBNYXRoLmNvcyh0aGlzLnJvdGF0aW9uKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIGdldCB0aGUgbWF0cml4IHZhbHVlcyBvZiB0aGUgZGlzcGxheW9iamVjdCBiYXNlZCBvbiBpdHMgdHJhbnNmb3JtIHByb3BlcnRpZXMuLlxyXG4gICAgICAgIGEgID0gIHRoaXMuX2NyICogdGhpcy5zY2FsZS54O1xyXG4gICAgICAgIGIgID0gIHRoaXMuX3NyICogdGhpcy5zY2FsZS54O1xyXG4gICAgICAgIGMgID0gLXRoaXMuX3NyICogdGhpcy5zY2FsZS55O1xyXG4gICAgICAgIGQgID0gIHRoaXMuX2NyICogdGhpcy5zY2FsZS55O1xyXG4gICAgICAgIHR4ID0gIHRoaXMucG9zaXRpb24ueDtcclxuICAgICAgICB0eSA9ICB0aGlzLnBvc2l0aW9uLnk7XHJcblxyXG4gICAgICAgIC8vIGNoZWNrIGZvciBwaXZvdC4uIG5vdCBvZnRlbiB1c2VkIHNvIGdlYXJlZCB0b3dhcmRzIHRoYXQgZmFjdCFcclxuICAgICAgICBpZiAodGhpcy5waXZvdC54IHx8IHRoaXMucGl2b3QueSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHR4IC09IHRoaXMucGl2b3QueCAqIGEgKyB0aGlzLnBpdm90LnkgKiBjO1xyXG4gICAgICAgICAgICB0eSAtPSB0aGlzLnBpdm90LnggKiBiICsgdGhpcy5waXZvdC55ICogZDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIGNvbmNhdCB0aGUgcGFyZW50IG1hdHJpeCB3aXRoIHRoZSBvYmplY3RzIHRyYW5zZm9ybS5cclxuICAgICAgICB3dC5hICA9IGEgICogcHQuYSArIGIgICogcHQuYztcclxuICAgICAgICB3dC5iICA9IGEgICogcHQuYiArIGIgICogcHQuZDtcclxuICAgICAgICB3dC5jICA9IGMgICogcHQuYSArIGQgICogcHQuYztcclxuICAgICAgICB3dC5kICA9IGMgICogcHQuYiArIGQgICogcHQuZDtcclxuICAgICAgICB3dC50eCA9IHR4ICogcHQuYSArIHR5ICogcHQuYyArIHB0LnR4O1xyXG4gICAgICAgIHd0LnR5ID0gdHggKiBwdC5iICsgdHkgKiBwdC5kICsgcHQudHk7XHJcbiAgICB9XHJcbiAgICBlbHNlXHJcbiAgICB7XHJcbiAgICAgICAgLy8gbGV0cyBkbyB0aGUgZmFzdCB2ZXJzaW9uIGFzIHdlIGtub3cgdGhlcmUgaXMgbm8gcm90YXRpb24uLlxyXG4gICAgICAgIGEgID0gdGhpcy5zY2FsZS54O1xyXG4gICAgICAgIGQgID0gdGhpcy5zY2FsZS55O1xyXG5cclxuICAgICAgICB0eCA9IHRoaXMucG9zaXRpb24ueCAtIHRoaXMucGl2b3QueCAqIGE7XHJcbiAgICAgICAgdHkgPSB0aGlzLnBvc2l0aW9uLnkgLSB0aGlzLnBpdm90LnkgKiBkO1xyXG5cclxuICAgICAgICB3dC5hICA9IGEgICogcHQuYTtcclxuICAgICAgICB3dC5iICA9IGEgICogcHQuYjtcclxuICAgICAgICB3dC5jICA9IGQgICogcHQuYztcclxuICAgICAgICB3dC5kICA9IGQgICogcHQuZDtcclxuICAgICAgICB3dC50eCA9IHR4ICogcHQuYSArIHR5ICogcHQuYyArIHB0LnR4O1xyXG4gICAgICAgIHd0LnR5ID0gdHggKiBwdC5iICsgdHkgKiBwdC5kICsgcHQudHk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gbXVsdGlwbHkgdGhlIGFscGhhcy4uXHJcbiAgICB0aGlzLndvcmxkQWxwaGEgPSB0aGlzLmFscGhhICogdGhpcy5wYXJlbnQud29ybGRBbHBoYTtcclxuXHJcbiAgICAvLyByZXNldCB0aGUgYm91bmRzIGVhY2ggdGltZSB0aGlzIGlzIGNhbGxlZCFcclxuICAgIHRoaXMuX2N1cnJlbnRCb3VuZHMgPSBudWxsO1xyXG59O1xyXG5cclxuLy8gcGVyZm9ybWFuY2UgaW5jcmVhc2UgdG8gYXZvaWQgdXNpbmcgY2FsbC4uICgxMHggZmFzdGVyKVxyXG5EaXNwbGF5T2JqZWN0LnByb3RvdHlwZS5kaXNwbGF5T2JqZWN0VXBkYXRlVHJhbnNmb3JtID0gRGlzcGxheU9iamVjdC5wcm90b3R5cGUudXBkYXRlVHJhbnNmb3JtO1xyXG5cclxuLyoqXHJcbiAqXHJcbiAqXHJcbiAqIFJldHJpZXZlcyB0aGUgYm91bmRzIG9mIHRoZSBkaXNwbGF5T2JqZWN0IGFzIGEgcmVjdGFuZ2xlIG9iamVjdFxyXG4gKlxyXG4gKiBAcGFyYW0gbWF0cml4IHtQSVhJLk1hdHJpeH1cclxuICogQHJldHVybiB7UElYSS5SZWN0YW5nbGV9IHRoZSByZWN0YW5ndWxhciBib3VuZGluZyBhcmVhXHJcbiAqL1xyXG5EaXNwbGF5T2JqZWN0LnByb3RvdHlwZS5nZXRCb3VuZHMgPSBmdW5jdGlvbiAobWF0cml4KSAvLyBqc2hpbnQgdW51c2VkOmZhbHNlXHJcbntcclxuICAgIHJldHVybiBtYXRoLlJlY3RhbmdsZS5FTVBUWTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBSZXRyaWV2ZXMgdGhlIGxvY2FsIGJvdW5kcyBvZiB0aGUgZGlzcGxheU9iamVjdCBhcyBhIHJlY3RhbmdsZSBvYmplY3RcclxuICpcclxuICogQHJldHVybiB7UElYSS5SZWN0YW5nbGV9IHRoZSByZWN0YW5ndWxhciBib3VuZGluZyBhcmVhXHJcbiAqL1xyXG5EaXNwbGF5T2JqZWN0LnByb3RvdHlwZS5nZXRMb2NhbEJvdW5kcyA9IGZ1bmN0aW9uICgpXHJcbntcclxuICAgIHJldHVybiB0aGlzLmdldEJvdW5kcyhtYXRoLk1hdHJpeC5JREVOVElUWSk7XHJcbn07XHJcblxyXG4vKipcclxuICogQ2FsY3VsYXRlcyB0aGUgZ2xvYmFsIHBvc2l0aW9uIG9mIHRoZSBkaXNwbGF5IG9iamVjdFxyXG4gKlxyXG4gKiBAcGFyYW0gcG9zaXRpb24ge1BJWEkuUG9pbnR9IFRoZSB3b3JsZCBvcmlnaW4gdG8gY2FsY3VsYXRlIGZyb21cclxuICogQHJldHVybiB7UElYSS5Qb2ludH0gQSBwb2ludCBvYmplY3QgcmVwcmVzZW50aW5nIHRoZSBwb3NpdGlvbiBvZiB0aGlzIG9iamVjdFxyXG4gKi9cclxuRGlzcGxheU9iamVjdC5wcm90b3R5cGUudG9HbG9iYWwgPSBmdW5jdGlvbiAocG9zaXRpb24pXHJcbntcclxuICAgIC8vIHRoaXMgcGFyZW50IGNoZWNrIGlzIGZvciBqdXN0IGluIGNhc2UgdGhlIGl0ZW0gaXMgYSByb290IG9iamVjdC5cclxuICAgIC8vIElmIGl0IGlzIHdlIG5lZWQgdG8gZ2l2ZSBpdCBhIHRlbXBvcmFyeSBwYXJlbnQgc28gdGhhdCBkaXNwbGF5T2JqZWN0VXBkYXRlVHJhbnNmb3JtIHdvcmtzIGNvcnJlY3RseVxyXG4gICAgLy8gdGhpcyBpcyBtYWlubHkgdG8gYXZvaWQgYSBwYXJlbnQgY2hlY2sgaW4gdGhlIG1haW4gbG9vcC4gRXZlcnkgbGl0dGxlIGhlbHBzIGZvciBwZXJmb3JtYW5jZSA6KVxyXG4gICAgaWYoIXRoaXMucGFyZW50KVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMucGFyZW50ID0gX3RlbXBEaXNwbGF5T2JqZWN0UGFyZW50O1xyXG4gICAgICAgIHRoaXMuZGlzcGxheU9iamVjdFVwZGF0ZVRyYW5zZm9ybSgpO1xyXG4gICAgICAgIHRoaXMucGFyZW50ID0gbnVsbDtcclxuICAgIH1cclxuICAgIGVsc2VcclxuICAgIHtcclxuICAgICAgICB0aGlzLmRpc3BsYXlPYmplY3RVcGRhdGVUcmFuc2Zvcm0oKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBkb24ndCBuZWVkIHRvIHVwZGF0ZSB0aGUgbG90XHJcbiAgICByZXR1cm4gdGhpcy53b3JsZFRyYW5zZm9ybS5hcHBseShwb3NpdGlvbik7XHJcbn07XHJcblxyXG4vKipcclxuICogQ2FsY3VsYXRlcyB0aGUgbG9jYWwgcG9zaXRpb24gb2YgdGhlIGRpc3BsYXkgb2JqZWN0IHJlbGF0aXZlIHRvIGFub3RoZXIgcG9pbnRcclxuICpcclxuICogQHBhcmFtIHBvc2l0aW9uIHtQSVhJLlBvaW50fSBUaGUgd29ybGQgb3JpZ2luIHRvIGNhbGN1bGF0ZSBmcm9tXHJcbiAqIEBwYXJhbSBbZnJvbV0ge1BJWEkuRGlzcGxheU9iamVjdH0gVGhlIERpc3BsYXlPYmplY3QgdG8gY2FsY3VsYXRlIHRoZSBnbG9iYWwgcG9zaXRpb24gZnJvbVxyXG4gKiBAcmV0dXJuIHtQSVhJLlBvaW50fSBBIHBvaW50IG9iamVjdCByZXByZXNlbnRpbmcgdGhlIHBvc2l0aW9uIG9mIHRoaXMgb2JqZWN0XHJcbiAqL1xyXG5EaXNwbGF5T2JqZWN0LnByb3RvdHlwZS50b0xvY2FsID0gZnVuY3Rpb24gKHBvc2l0aW9uLCBmcm9tKVxyXG57XHJcbiAgICBpZiAoZnJvbSlcclxuICAgIHtcclxuICAgICAgICBwb3NpdGlvbiA9IGZyb20udG9HbG9iYWwocG9zaXRpb24pO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIHRoaXMgcGFyZW50IGNoZWNrIGlzIGZvciBqdXN0IGluIGNhc2UgdGhlIGl0ZW0gaXMgYSByb290IG9iamVjdC5cclxuICAgIC8vIElmIGl0IGlzIHdlIG5lZWQgdG8gZ2l2ZSBpdCBhIHRlbXBvcmFyeSBwYXJlbnQgc28gdGhhdCBkaXNwbGF5T2JqZWN0VXBkYXRlVHJhbnNmb3JtIHdvcmtzIGNvcnJlY3RseVxyXG4gICAgLy8gdGhpcyBpcyBtYWlubHkgdG8gYXZvaWQgYSBwYXJlbnQgY2hlY2sgaW4gdGhlIG1haW4gbG9vcC4gRXZlcnkgbGl0dGxlIGhlbHBzIGZvciBwZXJmb3JtYW5jZSA6KVxyXG4gICAgaWYoIXRoaXMucGFyZW50KVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMucGFyZW50ID0gX3RlbXBEaXNwbGF5T2JqZWN0UGFyZW50O1xyXG4gICAgICAgIHRoaXMuZGlzcGxheU9iamVjdFVwZGF0ZVRyYW5zZm9ybSgpO1xyXG4gICAgICAgIHRoaXMucGFyZW50ID0gbnVsbDtcclxuICAgIH1cclxuICAgIGVsc2VcclxuICAgIHtcclxuICAgICAgICB0aGlzLmRpc3BsYXlPYmplY3RVcGRhdGVUcmFuc2Zvcm0oKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBzaW1wbHkgYXBwbHkgdGhlIG1hdHJpeC4uXHJcbiAgICByZXR1cm4gdGhpcy53b3JsZFRyYW5zZm9ybS5hcHBseUludmVyc2UocG9zaXRpb24pO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFJlbmRlcnMgdGhlIG9iamVjdCB1c2luZyB0aGUgV2ViR0wgcmVuZGVyZXJcclxuICpcclxuICogQHBhcmFtIHJlbmRlcmVyIHtQSVhJLldlYkdMUmVuZGVyZXJ9IFRoZSByZW5kZXJlclxyXG4gKiBAcHJpdmF0ZVxyXG4gKi9cclxuRGlzcGxheU9iamVjdC5wcm90b3R5cGUucmVuZGVyV2ViR0wgPSBmdW5jdGlvbiAocmVuZGVyZXIpIC8vIGpzaGludCB1bnVzZWQ6ZmFsc2Vcclxue1xyXG4gICAgLy8gT1ZFUldSSVRFO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFJlbmRlcnMgdGhlIG9iamVjdCB1c2luZyB0aGUgQ2FudmFzIHJlbmRlcmVyXHJcbiAqXHJcbiAqIEBwYXJhbSByZW5kZXJlciB7UElYSS5DYW52YXNSZW5kZXJlcn0gVGhlIHJlbmRlcmVyXHJcbiAqIEBwcml2YXRlXHJcbiAqL1xyXG5EaXNwbGF5T2JqZWN0LnByb3RvdHlwZS5yZW5kZXJDYW52YXMgPSBmdW5jdGlvbiAocmVuZGVyZXIpIC8vIGpzaGludCB1bnVzZWQ6ZmFsc2Vcclxue1xyXG4gICAgLy8gT1ZFUldSSVRFO1xyXG59O1xyXG4vKipcclxuICogVXNlZnVsIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyBhIHRleHR1cmUgb2YgdGhlIGRpc3BsYXkgb2JqZWN0IHRoYXQgY2FuIHRoZW4gYmUgdXNlZCB0byBjcmVhdGUgc3ByaXRlc1xyXG4gKiBUaGlzIGNhbiBiZSBxdWl0ZSB1c2VmdWwgaWYgeW91ciBkaXNwbGF5T2JqZWN0IGlzIHN0YXRpYyAvIGNvbXBsaWNhdGVkIGFuZCBuZWVkcyB0byBiZSByZXVzZWQgbXVsdGlwbGUgdGltZXMuXHJcbiAqXHJcbiAqIEBwYXJhbSByZW5kZXJlciB7UElYSS5DYW52YXNSZW5kZXJlcnxQSVhJLldlYkdMUmVuZGVyZXJ9IFRoZSByZW5kZXJlciB1c2VkIHRvIGdlbmVyYXRlIHRoZSB0ZXh0dXJlLlxyXG4gKiBAcGFyYW0gc2NhbGVNb2RlIHtudW1iZXJ9IFNlZSB7QGxpbmsgUElYSS5TQ0FMRV9NT0RFU30gZm9yIHBvc3NpYmxlIHZhbHVlc1xyXG4gKiBAcGFyYW0gcmVzb2x1dGlvbiB7bnVtYmVyfSBUaGUgcmVzb2x1dGlvbiBvZiB0aGUgdGV4dHVyZSBiZWluZyBnZW5lcmF0ZWRcclxuICogQHJldHVybiB7UElYSS5UZXh0dXJlfSBhIHRleHR1cmUgb2YgdGhlIGRpc3BsYXkgb2JqZWN0XHJcbiAqL1xyXG5EaXNwbGF5T2JqZWN0LnByb3RvdHlwZS5nZW5lcmF0ZVRleHR1cmUgPSBmdW5jdGlvbiAocmVuZGVyZXIsIHNjYWxlTW9kZSwgcmVzb2x1dGlvbilcclxue1xyXG4gICAgdmFyIGJvdW5kcyA9IHRoaXMuZ2V0TG9jYWxCb3VuZHMoKTtcclxuXHJcbiAgICB2YXIgcmVuZGVyVGV4dHVyZSA9IG5ldyBSZW5kZXJUZXh0dXJlKHJlbmRlcmVyLCBib3VuZHMud2lkdGggfCAwLCBib3VuZHMuaGVpZ2h0IHwgMCwgc2NhbGVNb2RlLCByZXNvbHV0aW9uKTtcclxuXHJcbiAgICBfdGVtcE1hdHJpeC50eCA9IC1ib3VuZHMueDtcclxuICAgIF90ZW1wTWF0cml4LnR5ID0gLWJvdW5kcy55O1xyXG5cclxuICAgIHJlbmRlclRleHR1cmUucmVuZGVyKHRoaXMsIF90ZW1wTWF0cml4KTtcclxuXHJcbiAgICByZXR1cm4gcmVuZGVyVGV4dHVyZTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBTZXQgdGhlIHBhcmVudCBDb250YWluZXIgb2YgdGhpcyBEaXNwbGF5T2JqZWN0XHJcbiAqXHJcbiAqIEBwYXJhbSBjb250YWluZXIge0NvbnRhaW5lcn0gVGhlIENvbnRhaW5lciB0byBhZGQgdGhpcyBEaXNwbGF5T2JqZWN0IHRvXHJcbiAqIEByZXR1cm4ge0NvbnRhaW5lcn0gVGhlIENvbnRhaW5lciB0aGF0IHRoaXMgRGlzcGxheU9iamVjdCB3YXMgYWRkZWQgdG9cclxuICovXHJcbkRpc3BsYXlPYmplY3QucHJvdG90eXBlLnNldFBhcmVudCA9IGZ1bmN0aW9uIChjb250YWluZXIpXHJcbntcclxuICAgIGlmICghY29udGFpbmVyIHx8ICFjb250YWluZXIuYWRkQ2hpbGQpXHJcbiAgICB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdzZXRQYXJlbnQ6IEFyZ3VtZW50IG11c3QgYmUgYSBDb250YWluZXInKTtcclxuICAgIH1cclxuXHJcbiAgICBjb250YWluZXIuYWRkQ2hpbGQodGhpcyk7XHJcbiAgICByZXR1cm4gY29udGFpbmVyO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEJhc2UgZGVzdHJveSBtZXRob2QgZm9yIGdlbmVyaWMgZGlzcGxheSBvYmplY3RzXHJcbiAqXHJcbiAqL1xyXG5EaXNwbGF5T2JqZWN0LnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24gKClcclxue1xyXG5cclxuICAgIHRoaXMucG9zaXRpb24gPSBudWxsO1xyXG4gICAgdGhpcy5zY2FsZSA9IG51bGw7XHJcbiAgICB0aGlzLnBpdm90ID0gbnVsbDtcclxuXHJcbiAgICB0aGlzLnBhcmVudCA9IG51bGw7XHJcblxyXG4gICAgdGhpcy5fYm91bmRzID0gbnVsbDtcclxuICAgIHRoaXMuX2N1cnJlbnRCb3VuZHMgPSBudWxsO1xyXG4gICAgdGhpcy5fbWFzayA9IG51bGw7XHJcblxyXG4gICAgdGhpcy53b3JsZFRyYW5zZm9ybSA9IG51bGw7XHJcbiAgICB0aGlzLmZpbHRlckFyZWEgPSBudWxsO1xyXG59O1xyXG4iLCJ2YXIgQ29udGFpbmVyID0gcmVxdWlyZSgnLi4vZGlzcGxheS9Db250YWluZXInKSxcclxuICAgIFRleHR1cmUgPSByZXF1aXJlKCcuLi90ZXh0dXJlcy9UZXh0dXJlJyksXHJcbiAgICBDYW52YXNCdWZmZXIgPSByZXF1aXJlKCcuLi9yZW5kZXJlcnMvY2FudmFzL3V0aWxzL0NhbnZhc0J1ZmZlcicpLFxyXG4gICAgQ2FudmFzR3JhcGhpY3MgPSByZXF1aXJlKCcuLi9yZW5kZXJlcnMvY2FudmFzL3V0aWxzL0NhbnZhc0dyYXBoaWNzJyksXHJcbiAgICBHcmFwaGljc0RhdGEgPSByZXF1aXJlKCcuL0dyYXBoaWNzRGF0YScpLFxyXG4gICAgbWF0aCA9IHJlcXVpcmUoJy4uL21hdGgnKSxcclxuICAgIENPTlNUID0gcmVxdWlyZSgnLi4vY29uc3QnKSxcclxuICAgIHRlbXBQb2ludCA9IG5ldyBtYXRoLlBvaW50KCk7XHJcblxyXG4vKipcclxuICogVGhlIEdyYXBoaWNzIGNsYXNzIGNvbnRhaW5zIG1ldGhvZHMgdXNlZCB0byBkcmF3IHByaW1pdGl2ZSBzaGFwZXMgc3VjaCBhcyBsaW5lcywgY2lyY2xlcyBhbmRcclxuICogcmVjdGFuZ2xlcyB0byB0aGUgZGlzcGxheSwgYW5kIHRvIGNvbG9yIGFuZCBmaWxsIHRoZW0uXHJcbiAqXHJcbiAqIEBjbGFzc1xyXG4gKiBAZXh0ZW5kcyBQSVhJLkNvbnRhaW5lclxyXG4gKiBAbWVtYmVyb2YgUElYSVxyXG4gKi9cclxuZnVuY3Rpb24gR3JhcGhpY3MoKVxyXG57XHJcbiAgICBDb250YWluZXIuY2FsbCh0aGlzKTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFRoZSBhbHBoYSB2YWx1ZSB1c2VkIHdoZW4gZmlsbGluZyB0aGUgR3JhcGhpY3Mgb2JqZWN0LlxyXG4gICAgICpcclxuICAgICAqIEBtZW1iZXIge251bWJlcn1cclxuICAgICAqIEBkZWZhdWx0IDFcclxuICAgICAqL1xyXG4gICAgdGhpcy5maWxsQWxwaGEgPSAxO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogVGhlIHdpZHRoICh0aGlja25lc3MpIG9mIGFueSBsaW5lcyBkcmF3bi5cclxuICAgICAqXHJcbiAgICAgKiBAbWVtYmVyIHtudW1iZXJ9XHJcbiAgICAgKiBAZGVmYXVsdCAwXHJcbiAgICAgKi9cclxuICAgIHRoaXMubGluZVdpZHRoID0gMDtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFRoZSBjb2xvciBvZiBhbnkgbGluZXMgZHJhd24uXHJcbiAgICAgKlxyXG4gICAgICogQG1lbWJlciB7c3RyaW5nfVxyXG4gICAgICogQGRlZmF1bHQgMFxyXG4gICAgICovXHJcbiAgICB0aGlzLmxpbmVDb2xvciA9IDA7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHcmFwaGljcyBkYXRhXHJcbiAgICAgKlxyXG4gICAgICogQG1lbWJlciB7UElYSS5HcmFwaGljc0RhdGFbXX1cclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIHRoaXMuZ3JhcGhpY3NEYXRhID0gW107XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgdGludCBhcHBsaWVkIHRvIHRoZSBncmFwaGljIHNoYXBlLiBUaGlzIGlzIGEgaGV4IHZhbHVlLiBBcHBseSBhIHZhbHVlIG9mIDB4RkZGRkZGIHRvIHJlc2V0IHRoZSB0aW50LlxyXG4gICAgICpcclxuICAgICAqIEBtZW1iZXIge251bWJlcn1cclxuICAgICAqIEBkZWZhdWx0IDB4RkZGRkZGXHJcbiAgICAgKi9cclxuICAgIHRoaXMudGludCA9IDB4RkZGRkZGO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogVGhlIHByZXZpb3VzIHRpbnQgYXBwbGllZCB0byB0aGUgZ3JhcGhpYyBzaGFwZS4gVXNlZCB0byBjb21wYXJlIHRvIHRoZSBjdXJyZW50IHRpbnQgYW5kIGNoZWNrIGlmIHRoZXJlcyBjaGFuZ2UuXHJcbiAgICAgKlxyXG4gICAgICogQG1lbWJlciB7bnVtYmVyfVxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqIEBkZWZhdWx0IDB4RkZGRkZGXHJcbiAgICAgKi9cclxuICAgIHRoaXMuX3ByZXZUaW50ID0gMHhGRkZGRkY7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgYmxlbmQgbW9kZSB0byBiZSBhcHBsaWVkIHRvIHRoZSBncmFwaGljIHNoYXBlLiBBcHBseSBhIHZhbHVlIG9mIGBQSVhJLkJMRU5EX01PREVTLk5PUk1BTGAgdG8gcmVzZXQgdGhlIGJsZW5kIG1vZGUuXHJcbiAgICAgKlxyXG4gICAgICogQG1lbWJlciB7bnVtYmVyfVxyXG4gICAgICogQGRlZmF1bHQgUElYSS5CTEVORF9NT0RFUy5OT1JNQUw7XHJcbiAgICAgKiBAc2VlIFBJWEkuQkxFTkRfTU9ERVNcclxuICAgICAqL1xyXG4gICAgdGhpcy5ibGVuZE1vZGUgPSBDT05TVC5CTEVORF9NT0RFUy5OT1JNQUw7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDdXJyZW50IHBhdGhcclxuICAgICAqXHJcbiAgICAgKiBAbWVtYmVyIHtQSVhJLkdyYXBoaWNzRGF0YX1cclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIHRoaXMuY3VycmVudFBhdGggPSBudWxsO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogQXJyYXkgY29udGFpbmluZyBzb21lIFdlYkdMLXJlbGF0ZWQgcHJvcGVydGllcyB1c2VkIGJ5IHRoZSBXZWJHTCByZW5kZXJlci5cclxuICAgICAqXHJcbiAgICAgKiBAbWVtYmVyIHtvYmplY3Q8bnVtYmVyLCBvYmplY3Q+fVxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgLy8gVE9ETyAtIF93ZWJnbCBzaG91bGQgdXNlIGEgcHJvdG90eXBlIG9iamVjdCwgbm90IGEgcmFuZG9tIHVuZG9jdW1lbnRlZCBvYmplY3QuLi5cclxuICAgIHRoaXMuX3dlYkdMID0ge307XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBXaGV0aGVyIHRoaXMgc2hhcGUgaXMgYmVpbmcgdXNlZCBhcyBhIG1hc2suXHJcbiAgICAgKlxyXG4gICAgICogQG1lbWJlciB7Ym9vbGVhbn1cclxuICAgICAqL1xyXG4gICAgdGhpcy5pc01hc2sgPSBmYWxzZTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFRoZSBib3VuZHMnIHBhZGRpbmcgdXNlZCBmb3IgYm91bmRzIGNhbGN1bGF0aW9uLlxyXG4gICAgICpcclxuICAgICAqIEBtZW1iZXIge251bWJlcn1cclxuICAgICAqL1xyXG4gICAgdGhpcy5ib3VuZHNQYWRkaW5nID0gMDtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEEgY2FjaGUgb2YgdGhlIGxvY2FsIGJvdW5kcyB0byBwcmV2ZW50IHJlY2FsY3VsYXRpb24uXHJcbiAgICAgKlxyXG4gICAgICogQG1lbWJlciB7UElYSS5SZWN0YW5nbGV9XHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICB0aGlzLl9sb2NhbEJvdW5kcyA9IG5ldyBtYXRoLlJlY3RhbmdsZSgwLDAsMSwxKTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFVzZWQgdG8gZGV0ZWN0IGlmIHRoZSBncmFwaGljcyBvYmplY3QgaGFzIGNoYW5nZWQuIElmIHRoaXMgaXMgc2V0IHRvIHRydWUgdGhlbiB0aGUgZ3JhcGhpY3NcclxuICAgICAqIG9iamVjdCB3aWxsIGJlIHJlY2FsY3VsYXRlZC5cclxuICAgICAqXHJcbiAgICAgKiBAbWVtYmVyIHtib29sZWFufVxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgdGhpcy5kaXJ0eSA9IHRydWU7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBVc2VkIHRvIGRldGVjdCBpZiB0aGUgV2ViR0wgZ3JhcGhpY3Mgb2JqZWN0IGhhcyBjaGFuZ2VkLiBJZiB0aGlzIGlzIHNldCB0byB0cnVlIHRoZW4gdGhlXHJcbiAgICAgKiBncmFwaGljcyBvYmplY3Qgd2lsbCBiZSByZWNhbGN1bGF0ZWQuXHJcbiAgICAgKlxyXG4gICAgICogQG1lbWJlciB7Ym9vbGVhbn1cclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIHRoaXMuZ2xEaXJ0eSA9IGZhbHNlO1xyXG5cclxuICAgIHRoaXMuYm91bmRzRGlydHkgPSB0cnVlO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogVXNlZCB0byBkZXRlY3QgaWYgdGhlIGNhY2hlZCBzcHJpdGUgb2JqZWN0IG5lZWRzIHRvIGJlIHVwZGF0ZWQuXHJcbiAgICAgKlxyXG4gICAgICogQG1lbWJlciB7Ym9vbGVhbn1cclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIHRoaXMuY2FjaGVkU3ByaXRlRGlydHkgPSBmYWxzZTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFdoZW4gY2FjaGVBc0JpdG1hcCBpcyBzZXQgdG8gdHJ1ZSB0aGUgZ3JhcGhpY3Mgb2JqZWN0IHdpbGwgYmUgcmVuZGVyZWQgYXMgaWYgaXQgd2FzIGEgc3ByaXRlLlxyXG4gICAgICogVGhpcyBpcyB1c2VmdWwgaWYgeW91ciBncmFwaGljcyBlbGVtZW50IGRvZXMgbm90IGNoYW5nZSBvZnRlbiwgYXMgaXQgd2lsbCBzcGVlZCB1cCB0aGUgcmVuZGVyaW5nXHJcbiAgICAgKiBvZiB0aGUgb2JqZWN0IGluIGV4Y2hhbmdlIGZvciB0YWtpbmcgdXAgdGV4dHVyZSBtZW1vcnkuIEl0IGlzIGFsc28gdXNlZnVsIGlmIHlvdSBuZWVkIHRoZSBncmFwaGljc1xyXG4gICAgICogb2JqZWN0IHRvIGJlIGFudGktYWxpYXNlZCwgYmVjYXVzZSBpdCB3aWxsIGJlIHJlbmRlcmVkIHVzaW5nIGNhbnZhcy4gVGhpcyBpcyBub3QgcmVjb21tZW5kZWQgaWZcclxuICAgICAqIHlvdSBhcmUgY29uc3RhbnRseSByZWRyYXdpbmcgdGhlIGdyYXBoaWNzIGVsZW1lbnQuXHJcbiAgICAgKlxyXG4gICAgICogQG5hbWUgY2FjaGVBc0JpdG1hcFxyXG4gICAgICogQG1lbWJlciB7Ym9vbGVhbn1cclxuICAgICAqIEBtZW1iZXJvZiBQSVhJLkdyYXBoaWNzI1xyXG4gICAgICogQGRlZmF1bHQgZmFsc2VcclxuICAgICAqL1xyXG59XHJcblxyXG4vLyBjb25zdHJ1Y3RvclxyXG5HcmFwaGljcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKENvbnRhaW5lci5wcm90b3R5cGUpO1xyXG5HcmFwaGljcy5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBHcmFwaGljcztcclxubW9kdWxlLmV4cG9ydHMgPSBHcmFwaGljcztcclxuXHJcbi8qKlxyXG4gKiBDcmVhdGVzIGEgbmV3IEdyYXBoaWNzIG9iamVjdCB3aXRoIHRoZSBzYW1lIHZhbHVlcyBhcyB0aGlzIG9uZS5cclxuICogTm90ZSB0aGF0IHRoZSBvbmx5IHRoZSBwcm9wZXJ0aWVzIG9mIHRoZSBvYmplY3QgYXJlIGNsb25lZCwgbm90IGl0cyB0cmFuc2Zvcm0gKHBvc2l0aW9uLHNjYWxlLGV0YylcclxuICpcclxuICogQHJldHVybiB7UElYSS5HcmFwaGljc31cclxuICovXHJcbkdyYXBoaWNzLnByb3RvdHlwZS5jbG9uZSA9IGZ1bmN0aW9uICgpXHJcbntcclxuICAgIHZhciBjbG9uZSA9IG5ldyBHcmFwaGljcygpO1xyXG5cclxuICAgIGNsb25lLnJlbmRlcmFibGUgICAgPSB0aGlzLnJlbmRlcmFibGU7XHJcbiAgICBjbG9uZS5maWxsQWxwaGEgICAgID0gdGhpcy5maWxsQWxwaGE7XHJcbiAgICBjbG9uZS5saW5lV2lkdGggICAgID0gdGhpcy5saW5lV2lkdGg7XHJcbiAgICBjbG9uZS5saW5lQ29sb3IgICAgID0gdGhpcy5saW5lQ29sb3I7XHJcbiAgICBjbG9uZS50aW50ICAgICAgICAgID0gdGhpcy50aW50O1xyXG4gICAgY2xvbmUuYmxlbmRNb2RlICAgICA9IHRoaXMuYmxlbmRNb2RlO1xyXG4gICAgY2xvbmUuaXNNYXNrICAgICAgICA9IHRoaXMuaXNNYXNrO1xyXG4gICAgY2xvbmUuYm91bmRzUGFkZGluZyA9IHRoaXMuYm91bmRzUGFkZGluZztcclxuICAgIGNsb25lLmRpcnR5ICAgICAgICAgPSB0cnVlO1xyXG4gICAgY2xvbmUuZ2xEaXJ0eSAgICAgICA9IHRydWU7XHJcbiAgICBjbG9uZS5jYWNoZWRTcHJpdGVEaXJ0eSA9IHRoaXMuY2FjaGVkU3ByaXRlRGlydHk7XHJcblxyXG4gICAgLy8gY29weSBncmFwaGljcyBkYXRhXHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuZ3JhcGhpY3NEYXRhLmxlbmd0aDsgKytpKVxyXG4gICAge1xyXG4gICAgICAgIGNsb25lLmdyYXBoaWNzRGF0YS5wdXNoKHRoaXMuZ3JhcGhpY3NEYXRhW2ldLmNsb25lKCkpO1xyXG4gICAgfVxyXG5cclxuICAgIGNsb25lLmN1cnJlbnRQYXRoID0gY2xvbmUuZ3JhcGhpY3NEYXRhW2Nsb25lLmdyYXBoaWNzRGF0YS5sZW5ndGggLSAxXTtcclxuXHJcbiAgICBjbG9uZS51cGRhdGVMb2NhbEJvdW5kcygpO1xyXG5cclxuICAgIHJldHVybiBjbG9uZTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBTcGVjaWZpZXMgdGhlIGxpbmUgc3R5bGUgdXNlZCBmb3Igc3Vic2VxdWVudCBjYWxscyB0byBHcmFwaGljcyBtZXRob2RzIHN1Y2ggYXMgdGhlIGxpbmVUbygpIG1ldGhvZCBvciB0aGUgZHJhd0NpcmNsZSgpIG1ldGhvZC5cclxuICpcclxuICogQHBhcmFtIGxpbmVXaWR0aCB7bnVtYmVyfSB3aWR0aCBvZiB0aGUgbGluZSB0byBkcmF3LCB3aWxsIHVwZGF0ZSB0aGUgb2JqZWN0cyBzdG9yZWQgc3R5bGVcclxuICogQHBhcmFtIGNvbG9yIHtudW1iZXJ9IGNvbG9yIG9mIHRoZSBsaW5lIHRvIGRyYXcsIHdpbGwgdXBkYXRlIHRoZSBvYmplY3RzIHN0b3JlZCBzdHlsZVxyXG4gKiBAcGFyYW0gYWxwaGEge251bWJlcn0gYWxwaGEgb2YgdGhlIGxpbmUgdG8gZHJhdywgd2lsbCB1cGRhdGUgdGhlIG9iamVjdHMgc3RvcmVkIHN0eWxlXHJcbiAqIEByZXR1cm4ge1BJWEkuR3JhcGhpY3N9XHJcbiAqL1xyXG5HcmFwaGljcy5wcm90b3R5cGUubGluZVN0eWxlID0gZnVuY3Rpb24gKGxpbmVXaWR0aCwgY29sb3IsIGFscGhhKVxyXG57XHJcbiAgICB0aGlzLmxpbmVXaWR0aCA9IGxpbmVXaWR0aCB8fCAwO1xyXG4gICAgdGhpcy5saW5lQ29sb3IgPSBjb2xvciB8fCAwO1xyXG4gICAgdGhpcy5saW5lQWxwaGEgPSAoYWxwaGEgPT09IHVuZGVmaW5lZCkgPyAxIDogYWxwaGE7XHJcblxyXG4gICAgaWYgKHRoaXMuY3VycmVudFBhdGgpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMuY3VycmVudFBhdGguc2hhcGUucG9pbnRzLmxlbmd0aClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIC8vIGhhbGZ3YXkgdGhyb3VnaCBhIGxpbmU/IHN0YXJ0IGEgbmV3IG9uZSFcclxuICAgICAgICAgICAgdmFyIHNoYXBlID0gbmV3IG1hdGguUG9seWdvbih0aGlzLmN1cnJlbnRQYXRoLnNoYXBlLnBvaW50cy5zbGljZSgtMikpO1xyXG4gICAgICAgICAgICBzaGFwZS5jbG9zZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgdGhpcy5kcmF3U2hhcGUoc2hhcGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICAvLyBvdGhlcndpc2UgaXRzIGVtcHR5IHNvIGxldHMganVzdCBzZXQgdGhlIGxpbmUgcHJvcGVydGllc1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRQYXRoLmxpbmVXaWR0aCA9IHRoaXMubGluZVdpZHRoO1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRQYXRoLmxpbmVDb2xvciA9IHRoaXMubGluZUNvbG9yO1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRQYXRoLmxpbmVBbHBoYSA9IHRoaXMubGluZUFscGhhO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGhpcztcclxufTtcclxuXHJcbi8qKlxyXG4gKiBNb3ZlcyB0aGUgY3VycmVudCBkcmF3aW5nIHBvc2l0aW9uIHRvIHgsIHkuXHJcbiAqXHJcbiAqIEBwYXJhbSB4IHtudW1iZXJ9IHRoZSBYIGNvb3JkaW5hdGUgdG8gbW92ZSB0b1xyXG4gKiBAcGFyYW0geSB7bnVtYmVyfSB0aGUgWSBjb29yZGluYXRlIHRvIG1vdmUgdG9cclxuICogQHJldHVybiB7UElYSS5HcmFwaGljc31cclxuICAqL1xyXG5HcmFwaGljcy5wcm90b3R5cGUubW92ZVRvID0gZnVuY3Rpb24gKHgsIHkpXHJcbntcclxuICAgIHZhciBzaGFwZSA9IG5ldyBtYXRoLlBvbHlnb24oW3gseV0pO1xyXG4gICAgc2hhcGUuY2xvc2VkID0gZmFsc2U7XHJcbiAgICB0aGlzLmRyYXdTaGFwZShzaGFwZSk7XHJcblxyXG4gICAgcmV0dXJuIHRoaXM7XHJcbn07XHJcblxyXG4vKipcclxuICogRHJhd3MgYSBsaW5lIHVzaW5nIHRoZSBjdXJyZW50IGxpbmUgc3R5bGUgZnJvbSB0aGUgY3VycmVudCBkcmF3aW5nIHBvc2l0aW9uIHRvICh4LCB5KTtcclxuICogVGhlIGN1cnJlbnQgZHJhd2luZyBwb3NpdGlvbiBpcyB0aGVuIHNldCB0byAoeCwgeSkuXHJcbiAqXHJcbiAqIEBwYXJhbSB4IHtudW1iZXJ9IHRoZSBYIGNvb3JkaW5hdGUgdG8gZHJhdyB0b1xyXG4gKiBAcGFyYW0geSB7bnVtYmVyfSB0aGUgWSBjb29yZGluYXRlIHRvIGRyYXcgdG9cclxuICogQHJldHVybiB7UElYSS5HcmFwaGljc31cclxuICovXHJcbkdyYXBoaWNzLnByb3RvdHlwZS5saW5lVG8gPSBmdW5jdGlvbiAoeCwgeSlcclxue1xyXG4gICAgdGhpcy5jdXJyZW50UGF0aC5zaGFwZS5wb2ludHMucHVzaCh4LCB5KTtcclxuICAgIHRoaXMuZGlydHkgPSB0cnVlO1xyXG5cclxuICAgIHJldHVybiB0aGlzO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIENhbGN1bGF0ZSB0aGUgcG9pbnRzIGZvciBhIHF1YWRyYXRpYyBiZXppZXIgY3VydmUgYW5kIHRoZW4gZHJhd3MgaXQuXHJcbiAqIEJhc2VkIG9uOiBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy83ODUwOTcvaG93LWRvLWktaW1wbGVtZW50LWEtYmV6aWVyLWN1cnZlLWluLWNcclxuICpcclxuICogQHBhcmFtIGNwWCB7bnVtYmVyfSBDb250cm9sIHBvaW50IHhcclxuICogQHBhcmFtIGNwWSB7bnVtYmVyfSBDb250cm9sIHBvaW50IHlcclxuICogQHBhcmFtIHRvWCB7bnVtYmVyfSBEZXN0aW5hdGlvbiBwb2ludCB4XHJcbiAqIEBwYXJhbSB0b1kge251bWJlcn0gRGVzdGluYXRpb24gcG9pbnQgeVxyXG4gKiBAcmV0dXJuIHtQSVhJLkdyYXBoaWNzfVxyXG4gKi9cclxuR3JhcGhpY3MucHJvdG90eXBlLnF1YWRyYXRpY0N1cnZlVG8gPSBmdW5jdGlvbiAoY3BYLCBjcFksIHRvWCwgdG9ZKVxyXG57XHJcbiAgICBpZiAodGhpcy5jdXJyZW50UGF0aClcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy5jdXJyZW50UGF0aC5zaGFwZS5wb2ludHMubGVuZ3RoID09PSAwKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50UGF0aC5zaGFwZS5wb2ludHMgPSBbMCwgMF07XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZWxzZVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMubW92ZVRvKDAsMCk7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIHhhLFxyXG4gICAgICAgIHlhLFxyXG4gICAgICAgIG4gPSAyMCxcclxuICAgICAgICBwb2ludHMgPSB0aGlzLmN1cnJlbnRQYXRoLnNoYXBlLnBvaW50cztcclxuXHJcbiAgICBpZiAocG9pbnRzLmxlbmd0aCA9PT0gMClcclxuICAgIHtcclxuICAgICAgICB0aGlzLm1vdmVUbygwLCAwKTtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgZnJvbVggPSBwb2ludHNbcG9pbnRzLmxlbmd0aC0yXTtcclxuICAgIHZhciBmcm9tWSA9IHBvaW50c1twb2ludHMubGVuZ3RoLTFdO1xyXG5cclxuICAgIHZhciBqID0gMDtcclxuICAgIGZvciAodmFyIGkgPSAxOyBpIDw9IG47ICsraSlcclxuICAgIHtcclxuICAgICAgICBqID0gaSAvIG47XHJcblxyXG4gICAgICAgIHhhID0gZnJvbVggKyAoIChjcFggLSBmcm9tWCkgKiBqICk7XHJcbiAgICAgICAgeWEgPSBmcm9tWSArICggKGNwWSAtIGZyb21ZKSAqIGogKTtcclxuXHJcbiAgICAgICAgcG9pbnRzLnB1c2goIHhhICsgKCAoKGNwWCArICggKHRvWCAtIGNwWCkgKiBqICkpIC0geGEpICogaiApLFxyXG4gICAgICAgICAgICAgICAgICAgICB5YSArICggKChjcFkgKyAoICh0b1kgLSBjcFkpICogaiApKSAtIHlhKSAqIGogKSApO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuZGlydHkgPSB0aGlzLmJvdW5kc0RpcnR5ID0gdHJ1ZTtcclxuXHJcbiAgICByZXR1cm4gdGhpcztcclxufTtcclxuXHJcbi8qKlxyXG4gKiBDYWxjdWxhdGUgdGhlIHBvaW50cyBmb3IgYSBiZXppZXIgY3VydmUgYW5kIHRoZW4gZHJhd3MgaXQuXHJcbiAqXHJcbiAqIEBwYXJhbSBjcFgge251bWJlcn0gQ29udHJvbCBwb2ludCB4XHJcbiAqIEBwYXJhbSBjcFkge251bWJlcn0gQ29udHJvbCBwb2ludCB5XHJcbiAqIEBwYXJhbSBjcFgyIHtudW1iZXJ9IFNlY29uZCBDb250cm9sIHBvaW50IHhcclxuICogQHBhcmFtIGNwWTIge251bWJlcn0gU2Vjb25kIENvbnRyb2wgcG9pbnQgeVxyXG4gKiBAcGFyYW0gdG9YIHtudW1iZXJ9IERlc3RpbmF0aW9uIHBvaW50IHhcclxuICogQHBhcmFtIHRvWSB7bnVtYmVyfSBEZXN0aW5hdGlvbiBwb2ludCB5XHJcbiAqIEByZXR1cm4ge1BJWEkuR3JhcGhpY3N9XHJcbiAqL1xyXG5HcmFwaGljcy5wcm90b3R5cGUuYmV6aWVyQ3VydmVUbyA9IGZ1bmN0aW9uIChjcFgsIGNwWSwgY3BYMiwgY3BZMiwgdG9YLCB0b1kpXHJcbntcclxuICAgIGlmICh0aGlzLmN1cnJlbnRQYXRoKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLmN1cnJlbnRQYXRoLnNoYXBlLnBvaW50cy5sZW5ndGggPT09IDApXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRQYXRoLnNoYXBlLnBvaW50cyA9IFswLCAwXTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBlbHNlXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5tb3ZlVG8oMCwwKTtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgbiA9IDIwLFxyXG4gICAgICAgIGR0LFxyXG4gICAgICAgIGR0MixcclxuICAgICAgICBkdDMsXHJcbiAgICAgICAgdDIsXHJcbiAgICAgICAgdDMsXHJcbiAgICAgICAgcG9pbnRzID0gdGhpcy5jdXJyZW50UGF0aC5zaGFwZS5wb2ludHM7XHJcblxyXG4gICAgdmFyIGZyb21YID0gcG9pbnRzW3BvaW50cy5sZW5ndGgtMl07XHJcbiAgICB2YXIgZnJvbVkgPSBwb2ludHNbcG9pbnRzLmxlbmd0aC0xXTtcclxuXHJcbiAgICB2YXIgaiA9IDA7XHJcblxyXG4gICAgZm9yICh2YXIgaSA9IDE7IGkgPD0gbjsgKytpKVxyXG4gICAge1xyXG4gICAgICAgIGogPSBpIC8gbjtcclxuXHJcbiAgICAgICAgZHQgPSAoMSAtIGopO1xyXG4gICAgICAgIGR0MiA9IGR0ICogZHQ7XHJcbiAgICAgICAgZHQzID0gZHQyICogZHQ7XHJcblxyXG4gICAgICAgIHQyID0gaiAqIGo7XHJcbiAgICAgICAgdDMgPSB0MiAqIGo7XHJcblxyXG4gICAgICAgIHBvaW50cy5wdXNoKCBkdDMgKiBmcm9tWCArIDMgKiBkdDIgKiBqICogY3BYICsgMyAqIGR0ICogdDIgKiBjcFgyICsgdDMgKiB0b1gsXHJcbiAgICAgICAgICAgICAgICAgICAgIGR0MyAqIGZyb21ZICsgMyAqIGR0MiAqIGogKiBjcFkgKyAzICogZHQgKiB0MiAqIGNwWTIgKyB0MyAqIHRvWSk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5kaXJ0eSA9IHRoaXMuYm91bmRzRGlydHkgPSB0cnVlO1xyXG5cclxuICAgIHJldHVybiB0aGlzO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFRoZSBhcmNUbygpIG1ldGhvZCBjcmVhdGVzIGFuIGFyYy9jdXJ2ZSBiZXR3ZWVuIHR3byB0YW5nZW50cyBvbiB0aGUgY2FudmFzLlxyXG4gKlxyXG4gKiBcImJvcnJvd2VkXCIgZnJvbSBodHRwczovL2NvZGUuZ29vZ2xlLmNvbS9wL2Z4Y2FudmFzLyAtIHRoYW5rcyBnb29nbGUhXHJcbiAqXHJcbiAqIEBwYXJhbSB4MSB7bnVtYmVyfSBUaGUgeC1jb29yZGluYXRlIG9mIHRoZSBiZWdpbm5pbmcgb2YgdGhlIGFyY1xyXG4gKiBAcGFyYW0geTEge251bWJlcn0gVGhlIHktY29vcmRpbmF0ZSBvZiB0aGUgYmVnaW5uaW5nIG9mIHRoZSBhcmNcclxuICogQHBhcmFtIHgyIHtudW1iZXJ9IFRoZSB4LWNvb3JkaW5hdGUgb2YgdGhlIGVuZCBvZiB0aGUgYXJjXHJcbiAqIEBwYXJhbSB5MiB7bnVtYmVyfSBUaGUgeS1jb29yZGluYXRlIG9mIHRoZSBlbmQgb2YgdGhlIGFyY1xyXG4gKiBAcGFyYW0gcmFkaXVzIHtudW1iZXJ9IFRoZSByYWRpdXMgb2YgdGhlIGFyY1xyXG4gKiBAcmV0dXJuIHtQSVhJLkdyYXBoaWNzfVxyXG4gKi9cclxuR3JhcGhpY3MucHJvdG90eXBlLmFyY1RvID0gZnVuY3Rpb24gKHgxLCB5MSwgeDIsIHkyLCByYWRpdXMpXHJcbntcclxuICAgIGlmICh0aGlzLmN1cnJlbnRQYXRoKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLmN1cnJlbnRQYXRoLnNoYXBlLnBvaW50cy5sZW5ndGggPT09IDApXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRQYXRoLnNoYXBlLnBvaW50cy5wdXNoKHgxLCB5MSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZWxzZVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMubW92ZVRvKHgxLCB5MSk7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIHBvaW50cyA9IHRoaXMuY3VycmVudFBhdGguc2hhcGUucG9pbnRzLFxyXG4gICAgICAgIGZyb21YID0gcG9pbnRzW3BvaW50cy5sZW5ndGgtMl0sXHJcbiAgICAgICAgZnJvbVkgPSBwb2ludHNbcG9pbnRzLmxlbmd0aC0xXSxcclxuICAgICAgICBhMSA9IGZyb21ZIC0geTEsXHJcbiAgICAgICAgYjEgPSBmcm9tWCAtIHgxLFxyXG4gICAgICAgIGEyID0geTIgICAtIHkxLFxyXG4gICAgICAgIGIyID0geDIgICAtIHgxLFxyXG4gICAgICAgIG1tID0gTWF0aC5hYnMoYTEgKiBiMiAtIGIxICogYTIpO1xyXG5cclxuICAgIGlmIChtbSA8IDEuMGUtOCB8fCByYWRpdXMgPT09IDApXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHBvaW50c1twb2ludHMubGVuZ3RoLTJdICE9PSB4MSB8fCBwb2ludHNbcG9pbnRzLmxlbmd0aC0xXSAhPT0geTEpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBwb2ludHMucHVzaCh4MSwgeTEpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGVsc2VcclxuICAgIHtcclxuICAgICAgICB2YXIgZGQgPSBhMSAqIGExICsgYjEgKiBiMSxcclxuICAgICAgICAgICAgY2MgPSBhMiAqIGEyICsgYjIgKiBiMixcclxuICAgICAgICAgICAgdHQgPSBhMSAqIGEyICsgYjEgKiBiMixcclxuICAgICAgICAgICAgazEgPSByYWRpdXMgKiBNYXRoLnNxcnQoZGQpIC8gbW0sXHJcbiAgICAgICAgICAgIGsyID0gcmFkaXVzICogTWF0aC5zcXJ0KGNjKSAvIG1tLFxyXG4gICAgICAgICAgICBqMSA9IGsxICogdHQgLyBkZCxcclxuICAgICAgICAgICAgajIgPSBrMiAqIHR0IC8gY2MsXHJcbiAgICAgICAgICAgIGN4ID0gazEgKiBiMiArIGsyICogYjEsXHJcbiAgICAgICAgICAgIGN5ID0gazEgKiBhMiArIGsyICogYTEsXHJcbiAgICAgICAgICAgIHB4ID0gYjEgKiAoazIgKyBqMSksXHJcbiAgICAgICAgICAgIHB5ID0gYTEgKiAoazIgKyBqMSksXHJcbiAgICAgICAgICAgIHF4ID0gYjIgKiAoazEgKyBqMiksXHJcbiAgICAgICAgICAgIHF5ID0gYTIgKiAoazEgKyBqMiksXHJcbiAgICAgICAgICAgIHN0YXJ0QW5nbGUgPSBNYXRoLmF0YW4yKHB5IC0gY3ksIHB4IC0gY3gpLFxyXG4gICAgICAgICAgICBlbmRBbmdsZSAgID0gTWF0aC5hdGFuMihxeSAtIGN5LCBxeCAtIGN4KTtcclxuXHJcbiAgICAgICAgdGhpcy5hcmMoY3ggKyB4MSwgY3kgKyB5MSwgcmFkaXVzLCBzdGFydEFuZ2xlLCBlbmRBbmdsZSwgYjEgKiBhMiA+IGIyICogYTEpO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuZGlydHkgPSB0aGlzLmJvdW5kc0RpcnR5ID0gdHJ1ZTtcclxuXHJcbiAgICByZXR1cm4gdGhpcztcclxufTtcclxuXHJcbi8qKlxyXG4gKiBUaGUgYXJjIG1ldGhvZCBjcmVhdGVzIGFuIGFyYy9jdXJ2ZSAodXNlZCB0byBjcmVhdGUgY2lyY2xlcywgb3IgcGFydHMgb2YgY2lyY2xlcykuXHJcbiAqXHJcbiAqIEBwYXJhbSBjeCB7bnVtYmVyfSBUaGUgeC1jb29yZGluYXRlIG9mIHRoZSBjZW50ZXIgb2YgdGhlIGNpcmNsZVxyXG4gKiBAcGFyYW0gY3kge251bWJlcn0gVGhlIHktY29vcmRpbmF0ZSBvZiB0aGUgY2VudGVyIG9mIHRoZSBjaXJjbGVcclxuICogQHBhcmFtIHJhZGl1cyB7bnVtYmVyfSBUaGUgcmFkaXVzIG9mIHRoZSBjaXJjbGVcclxuICogQHBhcmFtIHN0YXJ0QW5nbGUge251bWJlcn0gVGhlIHN0YXJ0aW5nIGFuZ2xlLCBpbiByYWRpYW5zICgwIGlzIGF0IHRoZSAzIG8nY2xvY2sgcG9zaXRpb24gb2YgdGhlIGFyYydzIGNpcmNsZSlcclxuICogQHBhcmFtIGVuZEFuZ2xlIHtudW1iZXJ9IFRoZSBlbmRpbmcgYW5nbGUsIGluIHJhZGlhbnNcclxuICogQHBhcmFtIGFudGljbG9ja3dpc2Uge2Jvb2xlYW59IE9wdGlvbmFsLiBTcGVjaWZpZXMgd2hldGhlciB0aGUgZHJhd2luZyBzaG91bGQgYmUgY291bnRlcmNsb2Nrd2lzZSBvciBjbG9ja3dpc2UuIEZhbHNlIGlzIGRlZmF1bHQsIGFuZCBpbmRpY2F0ZXMgY2xvY2t3aXNlLCB3aGlsZSB0cnVlIGluZGljYXRlcyBjb3VudGVyLWNsb2Nrd2lzZS5cclxuICogQHJldHVybiB7UElYSS5HcmFwaGljc31cclxuICovXHJcbkdyYXBoaWNzLnByb3RvdHlwZS5hcmMgPSBmdW5jdGlvbihjeCwgY3ksIHJhZGl1cywgc3RhcnRBbmdsZSwgZW5kQW5nbGUsIGFudGljbG9ja3dpc2UpXHJcbntcclxuICAgIGFudGljbG9ja3dpc2UgPSBhbnRpY2xvY2t3aXNlIHx8IGZhbHNlO1xyXG5cclxuICAgIGlmIChzdGFydEFuZ2xlID09PSBlbmRBbmdsZSlcclxuICAgIHtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBpZiggIWFudGljbG9ja3dpc2UgJiYgZW5kQW5nbGUgPD0gc3RhcnRBbmdsZSApXHJcbiAgICB7XHJcbiAgICAgICAgZW5kQW5nbGUgKz0gTWF0aC5QSSAqIDI7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmKCBhbnRpY2xvY2t3aXNlICYmIHN0YXJ0QW5nbGUgPD0gZW5kQW5nbGUgKVxyXG4gICAge1xyXG4gICAgICAgIHN0YXJ0QW5nbGUgKz0gTWF0aC5QSSAqIDI7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIHN3ZWVwID0gYW50aWNsb2Nrd2lzZSA/IChzdGFydEFuZ2xlIC0gZW5kQW5nbGUpICogLTEgOiAoZW5kQW5nbGUgLSBzdGFydEFuZ2xlKTtcclxuICAgIHZhciBzZWdzID0gIE1hdGguY2VpbChNYXRoLmFicyhzd2VlcCkgLyAoTWF0aC5QSSAqIDIpKSAqIDQwO1xyXG5cclxuICAgIGlmKHN3ZWVwID09PSAwKVxyXG4gICAge1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBzdGFydFggPSBjeCArIE1hdGguY29zKHN0YXJ0QW5nbGUpICogcmFkaXVzO1xyXG4gICAgdmFyIHN0YXJ0WSA9IGN5ICsgTWF0aC5zaW4oc3RhcnRBbmdsZSkgKiByYWRpdXM7XHJcblxyXG4gICAgaWYgKHRoaXMuY3VycmVudFBhdGgpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50UGF0aC5zaGFwZS5wb2ludHMucHVzaChzdGFydFgsIHN0YXJ0WSk7XHJcbiAgICB9XHJcbiAgICBlbHNlXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5tb3ZlVG8oc3RhcnRYLCBzdGFydFkpO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBwb2ludHMgPSB0aGlzLmN1cnJlbnRQYXRoLnNoYXBlLnBvaW50cztcclxuXHJcbiAgICB2YXIgdGhldGEgPSBzd2VlcC8oc2VncyoyKTtcclxuICAgIHZhciB0aGV0YTIgPSB0aGV0YSoyO1xyXG5cclxuICAgIHZhciBjVGhldGEgPSBNYXRoLmNvcyh0aGV0YSk7XHJcbiAgICB2YXIgc1RoZXRhID0gTWF0aC5zaW4odGhldGEpO1xyXG5cclxuICAgIHZhciBzZWdNaW51cyA9IHNlZ3MgLSAxO1xyXG5cclxuICAgIHZhciByZW1haW5kZXIgPSAoIHNlZ01pbnVzICUgMSApIC8gc2VnTWludXM7XHJcblxyXG4gICAgZm9yKHZhciBpPTA7IGk8PXNlZ01pbnVzOyBpKyspXHJcbiAgICB7XHJcbiAgICAgICAgdmFyIHJlYWwgPSAgaSArIHJlbWFpbmRlciAqIGk7XHJcblxyXG5cclxuICAgICAgICB2YXIgYW5nbGUgPSAoKHRoZXRhKSArIHN0YXJ0QW5nbGUgKyAodGhldGEyICogcmVhbCkpO1xyXG5cclxuICAgICAgICB2YXIgYyA9IE1hdGguY29zKGFuZ2xlKTtcclxuICAgICAgICB2YXIgcyA9IC1NYXRoLnNpbihhbmdsZSk7XHJcblxyXG4gICAgICAgIHBvaW50cy5wdXNoKCggKGNUaGV0YSAqICBjKSArIChzVGhldGEgKiBzKSApICogcmFkaXVzICsgY3gsXHJcbiAgICAgICAgICAgICAgICAgICAgKCAoY1RoZXRhICogLXMpICsgKHNUaGV0YSAqIGMpICkgKiByYWRpdXMgKyBjeSk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5kaXJ0eSA9IHRoaXMuYm91bmRzRGlydHkgPSB0cnVlO1xyXG5cclxuICAgIHJldHVybiB0aGlzO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFNwZWNpZmllcyBhIHNpbXBsZSBvbmUtY29sb3IgZmlsbCB0aGF0IHN1YnNlcXVlbnQgY2FsbHMgdG8gb3RoZXIgR3JhcGhpY3MgbWV0aG9kc1xyXG4gKiAoc3VjaCBhcyBsaW5lVG8oKSBvciBkcmF3Q2lyY2xlKCkpIHVzZSB3aGVuIGRyYXdpbmcuXHJcbiAqXHJcbiAqIEBwYXJhbSBjb2xvciB7bnVtYmVyfSB0aGUgY29sb3Igb2YgdGhlIGZpbGxcclxuICogQHBhcmFtIGFscGhhIHtudW1iZXJ9IHRoZSBhbHBoYSBvZiB0aGUgZmlsbFxyXG4gKiBAcmV0dXJuIHtQSVhJLkdyYXBoaWNzfVxyXG4gKi9cclxuR3JhcGhpY3MucHJvdG90eXBlLmJlZ2luRmlsbCA9IGZ1bmN0aW9uIChjb2xvciwgYWxwaGEpXHJcbntcclxuICAgIHRoaXMuZmlsbGluZyA9IHRydWU7XHJcbiAgICB0aGlzLmZpbGxDb2xvciA9IGNvbG9yIHx8IDA7XHJcbiAgICB0aGlzLmZpbGxBbHBoYSA9IChhbHBoYSA9PT0gdW5kZWZpbmVkKSA/IDEgOiBhbHBoYTtcclxuXHJcbiAgICBpZiAodGhpcy5jdXJyZW50UGF0aClcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy5jdXJyZW50UGF0aC5zaGFwZS5wb2ludHMubGVuZ3RoIDw9IDIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRQYXRoLmZpbGwgPSB0aGlzLmZpbGxpbmc7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFBhdGguZmlsbENvbG9yID0gdGhpcy5maWxsQ29sb3I7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFBhdGguZmlsbEFscGhhID0gdGhpcy5maWxsQWxwaGE7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRoaXM7XHJcbn07XHJcblxyXG4vKipcclxuICogQXBwbGllcyBhIGZpbGwgdG8gdGhlIGxpbmVzIGFuZCBzaGFwZXMgdGhhdCB3ZXJlIGFkZGVkIHNpbmNlIHRoZSBsYXN0IGNhbGwgdG8gdGhlIGJlZ2luRmlsbCgpIG1ldGhvZC5cclxuICpcclxuICogQHJldHVybiB7R3JhcGhpY3N9XHJcbiAqL1xyXG5HcmFwaGljcy5wcm90b3R5cGUuZW5kRmlsbCA9IGZ1bmN0aW9uICgpXHJcbntcclxuICAgIHRoaXMuZmlsbGluZyA9IGZhbHNlO1xyXG4gICAgdGhpcy5maWxsQ29sb3IgPSBudWxsO1xyXG4gICAgdGhpcy5maWxsQWxwaGEgPSAxO1xyXG5cclxuICAgIHJldHVybiB0aGlzO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqXHJcbiAqIEBwYXJhbSB4IHtudW1iZXJ9IFRoZSBYIGNvb3JkIG9mIHRoZSB0b3AtbGVmdCBvZiB0aGUgcmVjdGFuZ2xlXHJcbiAqIEBwYXJhbSB5IHtudW1iZXJ9IFRoZSBZIGNvb3JkIG9mIHRoZSB0b3AtbGVmdCBvZiB0aGUgcmVjdGFuZ2xlXHJcbiAqIEBwYXJhbSB3aWR0aCB7bnVtYmVyfSBUaGUgd2lkdGggb2YgdGhlIHJlY3RhbmdsZVxyXG4gKiBAcGFyYW0gaGVpZ2h0IHtudW1iZXJ9IFRoZSBoZWlnaHQgb2YgdGhlIHJlY3RhbmdsZVxyXG4gKiBAcmV0dXJuIHtQSVhJLkdyYXBoaWNzfVxyXG4gKi9cclxuR3JhcGhpY3MucHJvdG90eXBlLmRyYXdSZWN0ID0gZnVuY3Rpb24gKCB4LCB5LCB3aWR0aCwgaGVpZ2h0IClcclxue1xyXG4gICAgdGhpcy5kcmF3U2hhcGUobmV3IG1hdGguUmVjdGFuZ2xlKHgseSwgd2lkdGgsIGhlaWdodCkpO1xyXG5cclxuICAgIHJldHVybiB0aGlzO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqXHJcbiAqIEBwYXJhbSB4IHtudW1iZXJ9IFRoZSBYIGNvb3JkIG9mIHRoZSB0b3AtbGVmdCBvZiB0aGUgcmVjdGFuZ2xlXHJcbiAqIEBwYXJhbSB5IHtudW1iZXJ9IFRoZSBZIGNvb3JkIG9mIHRoZSB0b3AtbGVmdCBvZiB0aGUgcmVjdGFuZ2xlXHJcbiAqIEBwYXJhbSB3aWR0aCB7bnVtYmVyfSBUaGUgd2lkdGggb2YgdGhlIHJlY3RhbmdsZVxyXG4gKiBAcGFyYW0gaGVpZ2h0IHtudW1iZXJ9IFRoZSBoZWlnaHQgb2YgdGhlIHJlY3RhbmdsZVxyXG4gKiBAcGFyYW0gcmFkaXVzIHtudW1iZXJ9IFJhZGl1cyBvZiB0aGUgcmVjdGFuZ2xlIGNvcm5lcnNcclxuICogQHJldHVybiB7UElYSS5HcmFwaGljc31cclxuICovXHJcbkdyYXBoaWNzLnByb3RvdHlwZS5kcmF3Um91bmRlZFJlY3QgPSBmdW5jdGlvbiAoIHgsIHksIHdpZHRoLCBoZWlnaHQsIHJhZGl1cyApXHJcbntcclxuICAgIHRoaXMuZHJhd1NoYXBlKG5ldyBtYXRoLlJvdW5kZWRSZWN0YW5nbGUoeCwgeSwgd2lkdGgsIGhlaWdodCwgcmFkaXVzKSk7XHJcblxyXG4gICAgcmV0dXJuIHRoaXM7XHJcbn07XHJcblxyXG4vKipcclxuICogRHJhd3MgYSBjaXJjbGUuXHJcbiAqXHJcbiAqIEBwYXJhbSB4IHtudW1iZXJ9IFRoZSBYIGNvb3JkaW5hdGUgb2YgdGhlIGNlbnRlciBvZiB0aGUgY2lyY2xlXHJcbiAqIEBwYXJhbSB5IHtudW1iZXJ9IFRoZSBZIGNvb3JkaW5hdGUgb2YgdGhlIGNlbnRlciBvZiB0aGUgY2lyY2xlXHJcbiAqIEBwYXJhbSByYWRpdXMge251bWJlcn0gVGhlIHJhZGl1cyBvZiB0aGUgY2lyY2xlXHJcbiAqIEByZXR1cm4ge1BJWEkuR3JhcGhpY3N9XHJcbiAqL1xyXG5HcmFwaGljcy5wcm90b3R5cGUuZHJhd0NpcmNsZSA9IGZ1bmN0aW9uICh4LCB5LCByYWRpdXMpXHJcbntcclxuICAgIHRoaXMuZHJhd1NoYXBlKG5ldyBtYXRoLkNpcmNsZSh4LHksIHJhZGl1cykpO1xyXG5cclxuICAgIHJldHVybiB0aGlzO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIERyYXdzIGFuIGVsbGlwc2UuXHJcbiAqXHJcbiAqIEBwYXJhbSB4IHtudW1iZXJ9IFRoZSBYIGNvb3JkaW5hdGUgb2YgdGhlIGNlbnRlciBvZiB0aGUgZWxsaXBzZVxyXG4gKiBAcGFyYW0geSB7bnVtYmVyfSBUaGUgWSBjb29yZGluYXRlIG9mIHRoZSBjZW50ZXIgb2YgdGhlIGVsbGlwc2VcclxuICogQHBhcmFtIHdpZHRoIHtudW1iZXJ9IFRoZSBoYWxmIHdpZHRoIG9mIHRoZSBlbGxpcHNlXHJcbiAqIEBwYXJhbSBoZWlnaHQge251bWJlcn0gVGhlIGhhbGYgaGVpZ2h0IG9mIHRoZSBlbGxpcHNlXHJcbiAqIEByZXR1cm4ge1BJWEkuR3JhcGhpY3N9XHJcbiAqL1xyXG5HcmFwaGljcy5wcm90b3R5cGUuZHJhd0VsbGlwc2UgPSBmdW5jdGlvbiAoeCwgeSwgd2lkdGgsIGhlaWdodClcclxue1xyXG4gICAgdGhpcy5kcmF3U2hhcGUobmV3IG1hdGguRWxsaXBzZSh4LCB5LCB3aWR0aCwgaGVpZ2h0KSk7XHJcblxyXG4gICAgcmV0dXJuIHRoaXM7XHJcbn07XHJcblxyXG4vKipcclxuICogRHJhd3MgYSBwb2x5Z29uIHVzaW5nIHRoZSBnaXZlbiBwYXRoLlxyXG4gKlxyXG4gKiBAcGFyYW0gcGF0aCB7bnVtYmVyW118UElYSS5Qb2ludFtdfSBUaGUgcGF0aCBkYXRhIHVzZWQgdG8gY29uc3RydWN0IHRoZSBwb2x5Z29uLlxyXG4gKiBAcmV0dXJuIHtQSVhJLkdyYXBoaWNzfVxyXG4gKi9cclxuR3JhcGhpY3MucHJvdG90eXBlLmRyYXdQb2x5Z29uID0gZnVuY3Rpb24gKHBhdGgpXHJcbntcclxuICAgIC8vIHByZXZlbnRzIGFuIGFyZ3VtZW50IGFzc2lnbm1lbnQgZGVvcHRcclxuICAgIC8vIHNlZSBzZWN0aW9uIDMuMTogaHR0cHM6Ly9naXRodWIuY29tL3BldGthYW50b25vdi9ibHVlYmlyZC93aWtpL09wdGltaXphdGlvbi1raWxsZXJzIzMtbWFuYWdpbmctYXJndW1lbnRzXHJcbiAgICB2YXIgcG9pbnRzID0gcGF0aDtcclxuXHJcbiAgICB2YXIgY2xvc2VkID0gdHJ1ZTtcclxuXHJcbiAgICBpZiAocG9pbnRzIGluc3RhbmNlb2YgbWF0aC5Qb2x5Z29uKVxyXG4gICAge1xyXG4gICAgICAgIGNsb3NlZCA9IHBvaW50cy5jbG9zZWQ7XHJcbiAgICAgICAgcG9pbnRzID0gcG9pbnRzLnBvaW50cztcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkocG9pbnRzKSlcclxuICAgIHtcclxuICAgICAgICAvLyBwcmV2ZW50cyBhbiBhcmd1bWVudCBsZWFrIGRlb3B0XHJcbiAgICAgICAgLy8gc2VlIHNlY3Rpb24gMy4yOiBodHRwczovL2dpdGh1Yi5jb20vcGV0a2FhbnRvbm92L2JsdWViaXJkL3dpa2kvT3B0aW1pemF0aW9uLWtpbGxlcnMjMy1tYW5hZ2luZy1hcmd1bWVudHNcclxuICAgICAgICBwb2ludHMgPSBuZXcgQXJyYXkoYXJndW1lbnRzLmxlbmd0aCk7XHJcblxyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcG9pbnRzLmxlbmd0aDsgKytpKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcG9pbnRzW2ldID0gYXJndW1lbnRzW2ldO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB2YXIgc2hhcGUgPSBuZXcgbWF0aC5Qb2x5Z29uKHBvaW50cyk7XHJcbiAgICBzaGFwZS5jbG9zZWQgPSBjbG9zZWQ7XHJcblxyXG4gICAgdGhpcy5kcmF3U2hhcGUoc2hhcGUpO1xyXG5cclxuICAgIHJldHVybiB0aGlzO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIENsZWFycyB0aGUgZ3JhcGhpY3MgdGhhdCB3ZXJlIGRyYXduIHRvIHRoaXMgR3JhcGhpY3Mgb2JqZWN0LCBhbmQgcmVzZXRzIGZpbGwgYW5kIGxpbmUgc3R5bGUgc2V0dGluZ3MuXHJcbiAqXHJcbiAqIEByZXR1cm4ge1BJWEkuR3JhcGhpY3N9XHJcbiAqL1xyXG5HcmFwaGljcy5wcm90b3R5cGUuY2xlYXIgPSBmdW5jdGlvbiAoKVxyXG57XHJcbiAgICB0aGlzLmxpbmVXaWR0aCA9IDA7XHJcbiAgICB0aGlzLmZpbGxpbmcgPSBmYWxzZTtcclxuXHJcbiAgICB0aGlzLmRpcnR5ID0gdHJ1ZTtcclxuICAgIHRoaXMuY2xlYXJEaXJ0eSA9IHRydWU7XHJcbiAgICB0aGlzLmdyYXBoaWNzRGF0YSA9IFtdO1xyXG5cclxuICAgIHJldHVybiB0aGlzO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFVzZWZ1bCBmdW5jdGlvbiB0aGF0IHJldHVybnMgYSB0ZXh0dXJlIG9mIHRoZSBncmFwaGljcyBvYmplY3QgdGhhdCBjYW4gdGhlbiBiZSB1c2VkIHRvIGNyZWF0ZSBzcHJpdGVzXHJcbiAqIFRoaXMgY2FuIGJlIHF1aXRlIHVzZWZ1bCBpZiB5b3VyIGdlb21ldHJ5IGlzIGNvbXBsaWNhdGVkIGFuZCBuZWVkcyB0byBiZSByZXVzZWQgbXVsdGlwbGUgdGltZXMuXHJcbiAqXHJcbiAqIEBwYXJhbSByZXNvbHV0aW9uIHtudW1iZXJ9IFRoZSByZXNvbHV0aW9uIG9mIHRoZSB0ZXh0dXJlIGJlaW5nIGdlbmVyYXRlZFxyXG4gKiBAcGFyYW0gc2NhbGVNb2RlIHtudW1iZXJ9IFNob3VsZCBiZSBvbmUgb2YgdGhlIHNjYWxlTW9kZSBjb25zdHNcclxuICogQHJldHVybiB7UElYSS5UZXh0dXJlfSBhIHRleHR1cmUgb2YgdGhlIGdyYXBoaWNzIG9iamVjdFxyXG4gKi9cclxuR3JhcGhpY3MucHJvdG90eXBlLmdlbmVyYXRlVGV4dHVyZSA9IGZ1bmN0aW9uIChyZW5kZXJlciwgcmVzb2x1dGlvbiwgc2NhbGVNb2RlKVxyXG57XHJcblxyXG4gICAgcmVzb2x1dGlvbiA9IHJlc29sdXRpb24gfHwgMTtcclxuXHJcbiAgICB2YXIgYm91bmRzID0gdGhpcy5nZXRMb2NhbEJvdW5kcygpO1xyXG5cclxuICAgIHZhciBjYW52YXNCdWZmZXIgPSBuZXcgQ2FudmFzQnVmZmVyKGJvdW5kcy53aWR0aCAqIHJlc29sdXRpb24sIGJvdW5kcy5oZWlnaHQgKiByZXNvbHV0aW9uKTtcclxuXHJcbiAgICB2YXIgdGV4dHVyZSA9IFRleHR1cmUuZnJvbUNhbnZhcyhjYW52YXNCdWZmZXIuY2FudmFzLCBzY2FsZU1vZGUpO1xyXG4gICAgdGV4dHVyZS5iYXNlVGV4dHVyZS5yZXNvbHV0aW9uID0gcmVzb2x1dGlvbjtcclxuXHJcbiAgICBjYW52YXNCdWZmZXIuY29udGV4dC5zY2FsZShyZXNvbHV0aW9uLCByZXNvbHV0aW9uKTtcclxuXHJcbiAgICBjYW52YXNCdWZmZXIuY29udGV4dC50cmFuc2xhdGUoLWJvdW5kcy54LC1ib3VuZHMueSk7XHJcblxyXG4gICAgQ2FudmFzR3JhcGhpY3MucmVuZGVyR3JhcGhpY3ModGhpcywgY2FudmFzQnVmZmVyLmNvbnRleHQpO1xyXG5cclxuICAgIHJldHVybiB0ZXh0dXJlO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFJlbmRlcnMgdGhlIG9iamVjdCB1c2luZyB0aGUgV2ViR0wgcmVuZGVyZXJcclxuICpcclxuICogQHBhcmFtIHJlbmRlcmVyIHtQSVhJLldlYkdMUmVuZGVyZXJ9XHJcbiAqIEBwcml2YXRlXHJcbiAqL1xyXG5HcmFwaGljcy5wcm90b3R5cGUuX3JlbmRlcldlYkdMID0gZnVuY3Rpb24gKHJlbmRlcmVyKVxyXG57XHJcbiAgICAvLyBpZiB0aGUgc3ByaXRlIGlzIG5vdCB2aXNpYmxlIG9yIHRoZSBhbHBoYSBpcyAwIHRoZW4gbm8gbmVlZCB0byByZW5kZXIgdGhpcyBlbGVtZW50XHJcblxyXG4gICAgLy8gdGhpcyBjb2RlIG1heSBzdGlsbCBiZSBuZWVkZWQgc28gbGVhdmluZyBmb3Igbm93Li5cclxuICAgIC8vXHJcbiAgICAvKlxyXG4gICAgaWYgKHRoaXMuX2NhY2hlQXNCaXRtYXApXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMuZGlydHkgfHwgdGhpcy5jYWNoZWRTcHJpdGVEaXJ0eSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuX2dlbmVyYXRlQ2FjaGVkU3ByaXRlKCk7XHJcblxyXG4gICAgICAgICAgICAvLyB3ZSB3aWxsIGFsc28gbmVlZCB0byB1cGRhdGUgdGhlIHRleHR1cmUgb24gdGhlIGdwdSB0b28hXHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlQ2FjaGVkU3ByaXRlVGV4dHVyZSgpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5jYWNoZWRTcHJpdGVEaXJ0eSA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLmRpcnR5ID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLl9jYWNoZWRTcHJpdGUud29ybGRBbHBoYSA9IHRoaXMud29ybGRBbHBoYTtcclxuXHJcbiAgICAgICAgU3ByaXRlLnByb3RvdHlwZS5yZW5kZXJXZWJHTC5jYWxsKHRoaXMuX2NhY2hlZFNwcml0ZSwgcmVuZGVyZXIpO1xyXG5cclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgKi9cclxuXHJcbiAgICBpZiAodGhpcy5nbERpcnR5KVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMuZGlydHkgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMuZ2xEaXJ0eSA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHJlbmRlcmVyLnNldE9iamVjdFJlbmRlcmVyKHJlbmRlcmVyLnBsdWdpbnMuZ3JhcGhpY3MpO1xyXG4gICAgcmVuZGVyZXIucGx1Z2lucy5ncmFwaGljcy5yZW5kZXIodGhpcyk7XHJcblxyXG59O1xyXG5cclxuLyoqXHJcbiAqIFJlbmRlcnMgdGhlIG9iamVjdCB1c2luZyB0aGUgQ2FudmFzIHJlbmRlcmVyXHJcbiAqXHJcbiAqIEBwYXJhbSByZW5kZXJlciB7UElYSS5DYW52YXNSZW5kZXJlcn1cclxuICogQHByaXZhdGVcclxuICovXHJcbkdyYXBoaWNzLnByb3RvdHlwZS5fcmVuZGVyQ2FudmFzID0gZnVuY3Rpb24gKHJlbmRlcmVyKVxyXG57XHJcbiAgICBpZiAodGhpcy5pc01hc2sgPT09IHRydWUpXHJcbiAgICB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGlmIHRoZSB0aW50IGhhcyBjaGFuZ2VkLCBzZXQgdGhlIGdyYXBoaWNzIG9iamVjdCB0byBkaXJ0eS5cclxuICAgIGlmICh0aGlzLl9wcmV2VGludCAhPT0gdGhpcy50aW50KSB7XHJcbiAgICAgICAgdGhpcy5kaXJ0eSA9IHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gdGhpcyBjb2RlIG1heSBzdGlsbCBiZSBuZWVkZWQgc28gbGVhdmluZyBmb3Igbm93Li5cclxuICAgIC8vXHJcbiAgICAvKlxyXG4gICAgaWYgKHRoaXMuX2NhY2hlQXNCaXRtYXApXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMuZGlydHkgfHwgdGhpcy5jYWNoZWRTcHJpdGVEaXJ0eSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuX2dlbmVyYXRlQ2FjaGVkU3ByaXRlKCk7XHJcblxyXG4gICAgICAgICAgICAvLyB3ZSB3aWxsIGFsc28gbmVlZCB0byB1cGRhdGUgdGhlIHRleHR1cmVcclxuICAgICAgICAgICAgdGhpcy51cGRhdGVDYWNoZWRTcHJpdGVUZXh0dXJlKCk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmNhY2hlZFNwcml0ZURpcnR5ID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMuZGlydHkgPSBmYWxzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuX2NhY2hlZFNwcml0ZS5hbHBoYSA9IHRoaXMuYWxwaGE7XHJcblxyXG4gICAgICAgIFNwcml0ZS5wcm90b3R5cGUuX3JlbmRlckNhbnZhcy5jYWxsKHRoaXMuX2NhY2hlZFNwcml0ZSwgcmVuZGVyZXIpO1xyXG5cclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICAqL1xyXG4gICAgdmFyIGNvbnRleHQgPSByZW5kZXJlci5jb250ZXh0O1xyXG4gICAgdmFyIHRyYW5zZm9ybSA9IHRoaXMud29ybGRUcmFuc2Zvcm07XHJcblxyXG4gICAgdmFyIGNvbXBvc2l0ZU9wZXJhdGlvbiA9IHJlbmRlcmVyLmJsZW5kTW9kZXNbdGhpcy5ibGVuZE1vZGVdO1xyXG4gICAgaWYgKGNvbXBvc2l0ZU9wZXJhdGlvbiAhPT0gY29udGV4dC5nbG9iYWxDb21wb3NpdGVPcGVyYXRpb24pXHJcbiAgICB7XHJcbiAgICAgICAgY29udGV4dC5nbG9iYWxDb21wb3NpdGVPcGVyYXRpb24gPSBjb21wb3NpdGVPcGVyYXRpb247XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIHJlc29sdXRpb24gPSByZW5kZXJlci5yZXNvbHV0aW9uO1xyXG4gICAgY29udGV4dC5zZXRUcmFuc2Zvcm0oXHJcbiAgICAgICAgdHJhbnNmb3JtLmEgKiByZXNvbHV0aW9uLFxyXG4gICAgICAgIHRyYW5zZm9ybS5iICogcmVzb2x1dGlvbixcclxuICAgICAgICB0cmFuc2Zvcm0uYyAqIHJlc29sdXRpb24sXHJcbiAgICAgICAgdHJhbnNmb3JtLmQgKiByZXNvbHV0aW9uLFxyXG4gICAgICAgIHRyYW5zZm9ybS50eCAqIHJlc29sdXRpb24sXHJcbiAgICAgICAgdHJhbnNmb3JtLnR5ICogcmVzb2x1dGlvblxyXG4gICAgKTtcclxuXHJcbiAgICBDYW52YXNHcmFwaGljcy5yZW5kZXJHcmFwaGljcyh0aGlzLCBjb250ZXh0KTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBSZXRyaWV2ZXMgdGhlIGJvdW5kcyBvZiB0aGUgZ3JhcGhpYyBzaGFwZSBhcyBhIHJlY3RhbmdsZSBvYmplY3RcclxuICpcclxuICogQHBhcmFtIFttYXRyaXhdIHtQSVhJLk1hdHJpeH0gVGhlIHdvcmxkIHRyYW5zZm9ybSBtYXRyaXggdG8gdXNlLCBkZWZhdWx0cyB0byB0aGlzXHJcbiAqICBvYmplY3QncyB3b3JsZFRyYW5zZm9ybS5cclxuICogQHJldHVybiB7UElYSS5SZWN0YW5nbGV9IHRoZSByZWN0YW5ndWxhciBib3VuZGluZyBhcmVhXHJcbiAqL1xyXG5HcmFwaGljcy5wcm90b3R5cGUuZ2V0Qm91bmRzID0gZnVuY3Rpb24gKG1hdHJpeClcclxue1xyXG4gICAgaWYoIXRoaXMuX2N1cnJlbnRCb3VuZHMpXHJcbiAgICB7XHJcblxyXG4gICAgICAgIC8vIHJldHVybiBhbiBlbXB0eSBvYmplY3QgaWYgdGhlIGl0ZW0gaXMgYSBtYXNrIVxyXG4gICAgICAgIGlmICghdGhpcy5yZW5kZXJhYmxlKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmV0dXJuIG1hdGguUmVjdGFuZ2xlLkVNUFRZO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMuYm91bmRzRGlydHkpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZUxvY2FsQm91bmRzKCk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmdsRGlydHkgPSB0cnVlO1xyXG4gICAgICAgICAgICB0aGlzLmNhY2hlZFNwcml0ZURpcnR5ID0gdHJ1ZTtcclxuICAgICAgICAgICAgdGhpcy5ib3VuZHNEaXJ0eSA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdmFyIGJvdW5kcyA9IHRoaXMuX2xvY2FsQm91bmRzO1xyXG5cclxuICAgICAgICB2YXIgdzAgPSBib3VuZHMueDtcclxuICAgICAgICB2YXIgdzEgPSBib3VuZHMud2lkdGggKyBib3VuZHMueDtcclxuXHJcbiAgICAgICAgdmFyIGgwID0gYm91bmRzLnk7XHJcbiAgICAgICAgdmFyIGgxID0gYm91bmRzLmhlaWdodCArIGJvdW5kcy55O1xyXG5cclxuICAgICAgICB2YXIgd29ybGRUcmFuc2Zvcm0gPSBtYXRyaXggfHwgdGhpcy53b3JsZFRyYW5zZm9ybTtcclxuXHJcbiAgICAgICAgdmFyIGEgPSB3b3JsZFRyYW5zZm9ybS5hO1xyXG4gICAgICAgIHZhciBiID0gd29ybGRUcmFuc2Zvcm0uYjtcclxuICAgICAgICB2YXIgYyA9IHdvcmxkVHJhbnNmb3JtLmM7XHJcbiAgICAgICAgdmFyIGQgPSB3b3JsZFRyYW5zZm9ybS5kO1xyXG4gICAgICAgIHZhciB0eCA9IHdvcmxkVHJhbnNmb3JtLnR4O1xyXG4gICAgICAgIHZhciB0eSA9IHdvcmxkVHJhbnNmb3JtLnR5O1xyXG5cclxuICAgICAgICB2YXIgeDEgPSBhICogdzEgKyBjICogaDEgKyB0eDtcclxuICAgICAgICB2YXIgeTEgPSBkICogaDEgKyBiICogdzEgKyB0eTtcclxuXHJcbiAgICAgICAgdmFyIHgyID0gYSAqIHcwICsgYyAqIGgxICsgdHg7XHJcbiAgICAgICAgdmFyIHkyID0gZCAqIGgxICsgYiAqIHcwICsgdHk7XHJcblxyXG4gICAgICAgIHZhciB4MyA9IGEgKiB3MCArIGMgKiBoMCArIHR4O1xyXG4gICAgICAgIHZhciB5MyA9IGQgKiBoMCArIGIgKiB3MCArIHR5O1xyXG5cclxuICAgICAgICB2YXIgeDQgPSAgYSAqIHcxICsgYyAqIGgwICsgdHg7XHJcbiAgICAgICAgdmFyIHk0ID0gIGQgKiBoMCArIGIgKiB3MSArIHR5O1xyXG5cclxuICAgICAgICB2YXIgbWF4WCA9IHgxO1xyXG4gICAgICAgIHZhciBtYXhZID0geTE7XHJcblxyXG4gICAgICAgIHZhciBtaW5YID0geDE7XHJcbiAgICAgICAgdmFyIG1pblkgPSB5MTtcclxuXHJcbiAgICAgICAgbWluWCA9IHgyIDwgbWluWCA/IHgyIDogbWluWDtcclxuICAgICAgICBtaW5YID0geDMgPCBtaW5YID8geDMgOiBtaW5YO1xyXG4gICAgICAgIG1pblggPSB4NCA8IG1pblggPyB4NCA6IG1pblg7XHJcblxyXG4gICAgICAgIG1pblkgPSB5MiA8IG1pblkgPyB5MiA6IG1pblk7XHJcbiAgICAgICAgbWluWSA9IHkzIDwgbWluWSA/IHkzIDogbWluWTtcclxuICAgICAgICBtaW5ZID0geTQgPCBtaW5ZID8geTQgOiBtaW5ZO1xyXG5cclxuICAgICAgICBtYXhYID0geDIgPiBtYXhYID8geDIgOiBtYXhYO1xyXG4gICAgICAgIG1heFggPSB4MyA+IG1heFggPyB4MyA6IG1heFg7XHJcbiAgICAgICAgbWF4WCA9IHg0ID4gbWF4WCA/IHg0IDogbWF4WDtcclxuXHJcbiAgICAgICAgbWF4WSA9IHkyID4gbWF4WSA/IHkyIDogbWF4WTtcclxuICAgICAgICBtYXhZID0geTMgPiBtYXhZID8geTMgOiBtYXhZO1xyXG4gICAgICAgIG1heFkgPSB5NCA+IG1heFkgPyB5NCA6IG1heFk7XHJcblxyXG4gICAgICAgIHRoaXMuX2JvdW5kcy54ID0gbWluWDtcclxuICAgICAgICB0aGlzLl9ib3VuZHMud2lkdGggPSBtYXhYIC0gbWluWDtcclxuXHJcbiAgICAgICAgdGhpcy5fYm91bmRzLnkgPSBtaW5ZO1xyXG4gICAgICAgIHRoaXMuX2JvdW5kcy5oZWlnaHQgPSBtYXhZIC0gbWluWTtcclxuXHJcbiAgICAgICAgdGhpcy5fY3VycmVudEJvdW5kcyA9IHRoaXMuX2JvdW5kcztcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGhpcy5fY3VycmVudEJvdW5kcztcclxufTtcclxuXHJcbi8qKlxyXG4qIFRlc3RzIGlmIGEgcG9pbnQgaXMgaW5zaWRlIHRoaXMgZ3JhcGhpY3Mgb2JqZWN0XHJcbipcclxuKiBAcGFyYW0gcG9pbnQge1BJWEkuUG9pbnR9IHRoZSBwb2ludCB0byB0ZXN0XHJcbiogQHJldHVybiB7Ym9vbGVhbn0gdGhlIHJlc3VsdCBvZiB0aGUgdGVzdFxyXG4qL1xyXG5HcmFwaGljcy5wcm90b3R5cGUuY29udGFpbnNQb2ludCA9IGZ1bmN0aW9uKCBwb2ludCApXHJcbntcclxuICAgIHRoaXMud29ybGRUcmFuc2Zvcm0uYXBwbHlJbnZlcnNlKHBvaW50LCAgdGVtcFBvaW50KTtcclxuXHJcbiAgICB2YXIgZ3JhcGhpY3NEYXRhID0gdGhpcy5ncmFwaGljc0RhdGE7XHJcblxyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBncmFwaGljc0RhdGEubGVuZ3RoOyBpKyspXHJcbiAgICB7XHJcbiAgICAgICAgdmFyIGRhdGEgPSBncmFwaGljc0RhdGFbaV07XHJcblxyXG4gICAgICAgIGlmICghZGF0YS5maWxsKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBvbmx5IGRlYWwgd2l0aCBmaWxscy4uXHJcbiAgICAgICAgaWYgKGRhdGEuc2hhcGUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAoIGRhdGEuc2hhcGUuY29udGFpbnMoIHRlbXBQb2ludC54LCB0ZW1wUG9pbnQueSApIClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFVwZGF0ZSB0aGUgYm91bmRzIG9mIHRoZSBvYmplY3RcclxuICpcclxuICovXHJcbkdyYXBoaWNzLnByb3RvdHlwZS51cGRhdGVMb2NhbEJvdW5kcyA9IGZ1bmN0aW9uICgpXHJcbntcclxuICAgIHZhciBtaW5YID0gSW5maW5pdHk7XHJcbiAgICB2YXIgbWF4WCA9IC1JbmZpbml0eTtcclxuXHJcbiAgICB2YXIgbWluWSA9IEluZmluaXR5O1xyXG4gICAgdmFyIG1heFkgPSAtSW5maW5pdHk7XHJcblxyXG4gICAgaWYgKHRoaXMuZ3JhcGhpY3NEYXRhLmxlbmd0aClcclxuICAgIHtcclxuICAgICAgICB2YXIgc2hhcGUsIHBvaW50cywgeCwgeSwgdywgaDtcclxuXHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmdyYXBoaWNzRGF0YS5sZW5ndGg7IGkrKylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHZhciBkYXRhID0gdGhpcy5ncmFwaGljc0RhdGFbaV07XHJcbiAgICAgICAgICAgIHZhciB0eXBlID0gZGF0YS50eXBlO1xyXG4gICAgICAgICAgICB2YXIgbGluZVdpZHRoID0gZGF0YS5saW5lV2lkdGg7XHJcbiAgICAgICAgICAgIHNoYXBlID0gZGF0YS5zaGFwZTtcclxuXHJcbiAgICAgICAgICAgIGlmICh0eXBlID09PSBDT05TVC5TSEFQRVMuUkVDVCB8fCB0eXBlID09PSBDT05TVC5TSEFQRVMuUlJFQylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgeCA9IHNoYXBlLnggLSBsaW5lV2lkdGgvMjtcclxuICAgICAgICAgICAgICAgIHkgPSBzaGFwZS55IC0gbGluZVdpZHRoLzI7XHJcbiAgICAgICAgICAgICAgICB3ID0gc2hhcGUud2lkdGggKyBsaW5lV2lkdGg7XHJcbiAgICAgICAgICAgICAgICBoID0gc2hhcGUuaGVpZ2h0ICsgbGluZVdpZHRoO1xyXG5cclxuICAgICAgICAgICAgICAgIG1pblggPSB4IDwgbWluWCA/IHggOiBtaW5YO1xyXG4gICAgICAgICAgICAgICAgbWF4WCA9IHggKyB3ID4gbWF4WCA/IHggKyB3IDogbWF4WDtcclxuXHJcbiAgICAgICAgICAgICAgICBtaW5ZID0geSA8IG1pblkgPyB5IDogbWluWTtcclxuICAgICAgICAgICAgICAgIG1heFkgPSB5ICsgaCA+IG1heFkgPyB5ICsgaCA6IG1heFk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAodHlwZSA9PT0gQ09OU1QuU0hBUEVTLkNJUkMpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHggPSBzaGFwZS54O1xyXG4gICAgICAgICAgICAgICAgeSA9IHNoYXBlLnk7XHJcbiAgICAgICAgICAgICAgICB3ID0gc2hhcGUucmFkaXVzICsgbGluZVdpZHRoLzI7XHJcbiAgICAgICAgICAgICAgICBoID0gc2hhcGUucmFkaXVzICsgbGluZVdpZHRoLzI7XHJcblxyXG4gICAgICAgICAgICAgICAgbWluWCA9IHggLSB3IDwgbWluWCA/IHggLSB3IDogbWluWDtcclxuICAgICAgICAgICAgICAgIG1heFggPSB4ICsgdyA+IG1heFggPyB4ICsgdyA6IG1heFg7XHJcblxyXG4gICAgICAgICAgICAgICAgbWluWSA9IHkgLSBoIDwgbWluWSA/IHkgLSBoIDogbWluWTtcclxuICAgICAgICAgICAgICAgIG1heFkgPSB5ICsgaCA+IG1heFkgPyB5ICsgaCA6IG1heFk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAodHlwZSA9PT0gQ09OU1QuU0hBUEVTLkVMSVApXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHggPSBzaGFwZS54O1xyXG4gICAgICAgICAgICAgICAgeSA9IHNoYXBlLnk7XHJcbiAgICAgICAgICAgICAgICB3ID0gc2hhcGUud2lkdGggKyBsaW5lV2lkdGgvMjtcclxuICAgICAgICAgICAgICAgIGggPSBzaGFwZS5oZWlnaHQgKyBsaW5lV2lkdGgvMjtcclxuXHJcbiAgICAgICAgICAgICAgICBtaW5YID0geCAtIHcgPCBtaW5YID8geCAtIHcgOiBtaW5YO1xyXG4gICAgICAgICAgICAgICAgbWF4WCA9IHggKyB3ID4gbWF4WCA/IHggKyB3IDogbWF4WDtcclxuXHJcbiAgICAgICAgICAgICAgICBtaW5ZID0geSAtIGggPCBtaW5ZID8geSAtIGggOiBtaW5ZO1xyXG4gICAgICAgICAgICAgICAgbWF4WSA9IHkgKyBoID4gbWF4WSA/IHkgKyBoIDogbWF4WTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIC8vIFBPTFlcclxuICAgICAgICAgICAgICAgIHBvaW50cyA9IHNoYXBlLnBvaW50cztcclxuXHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHBvaW50cy5sZW5ndGg7IGogKz0gMilcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB4ID0gcG9pbnRzW2pdO1xyXG4gICAgICAgICAgICAgICAgICAgIHkgPSBwb2ludHNbaisxXTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbWluWCA9IHgtbGluZVdpZHRoIDwgbWluWCA/IHgtbGluZVdpZHRoIDogbWluWDtcclxuICAgICAgICAgICAgICAgICAgICBtYXhYID0geCtsaW5lV2lkdGggPiBtYXhYID8geCtsaW5lV2lkdGggOiBtYXhYO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBtaW5ZID0geS1saW5lV2lkdGggPCBtaW5ZID8geS1saW5lV2lkdGggOiBtaW5ZO1xyXG4gICAgICAgICAgICAgICAgICAgIG1heFkgPSB5K2xpbmVXaWR0aCA+IG1heFkgPyB5K2xpbmVXaWR0aCA6IG1heFk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBlbHNlXHJcbiAgICB7XHJcbiAgICAgICAgbWluWCA9IDA7XHJcbiAgICAgICAgbWF4WCA9IDA7XHJcbiAgICAgICAgbWluWSA9IDA7XHJcbiAgICAgICAgbWF4WSA9IDA7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIHBhZGRpbmcgPSB0aGlzLmJvdW5kc1BhZGRpbmc7XHJcblxyXG4gICAgdGhpcy5fbG9jYWxCb3VuZHMueCA9IG1pblggLSBwYWRkaW5nO1xyXG4gICAgdGhpcy5fbG9jYWxCb3VuZHMud2lkdGggPSAobWF4WCAtIG1pblgpICsgcGFkZGluZyAqIDI7XHJcblxyXG4gICAgdGhpcy5fbG9jYWxCb3VuZHMueSA9IG1pblkgLSBwYWRkaW5nO1xyXG4gICAgdGhpcy5fbG9jYWxCb3VuZHMuaGVpZ2h0ID0gKG1heFkgLSBtaW5ZKSArIHBhZGRpbmcgKiAyO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEdlbmVyYXRlcyB0aGUgY2FjaGVkIHNwcml0ZSB3aGVuIHRoZSBzcHJpdGUgaGFzIGNhY2hlQXNCaXRtYXAgPSB0cnVlXHJcbiAqXHJcbiAqIEBwcml2YXRlXHJcbiAqL1xyXG4vKlxyXG5HcmFwaGljcy5wcm90b3R5cGUuX2dlbmVyYXRlQ2FjaGVkU3ByaXRlID0gZnVuY3Rpb24gKClcclxue1xyXG4gICAgdmFyIGJvdW5kcyA9IHRoaXMuZ2V0TG9jYWxCb3VuZHMoKTtcclxuXHJcbiAgICBpZiAoIXRoaXMuX2NhY2hlZFNwcml0ZSlcclxuICAgIHtcclxuICAgICAgICB2YXIgY2FudmFzQnVmZmVyID0gbmV3IENhbnZhc0J1ZmZlcihib3VuZHMud2lkdGgsIGJvdW5kcy5oZWlnaHQpO1xyXG4gICAgICAgIHZhciB0ZXh0dXJlID0gVGV4dHVyZS5mcm9tQ2FudmFzKGNhbnZhc0J1ZmZlci5jYW52YXMpO1xyXG5cclxuICAgICAgICB0aGlzLl9jYWNoZWRTcHJpdGUgPSBuZXcgU3ByaXRlKHRleHR1cmUpO1xyXG4gICAgICAgIHRoaXMuX2NhY2hlZFNwcml0ZS5idWZmZXIgPSBjYW52YXNCdWZmZXI7XHJcblxyXG4gICAgICAgIHRoaXMuX2NhY2hlZFNwcml0ZS53b3JsZFRyYW5zZm9ybSA9IHRoaXMud29ybGRUcmFuc2Zvcm07XHJcbiAgICB9XHJcbiAgICBlbHNlXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5fY2FjaGVkU3ByaXRlLmJ1ZmZlci5yZXNpemUoYm91bmRzLndpZHRoLCBib3VuZHMuaGVpZ2h0KTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBsZXZlcmFnZSB0aGUgYW5jaG9yIHRvIGFjY291bnQgZm9yIHRoZSBvZmZzZXQgb2YgdGhlIGVsZW1lbnRcclxuICAgIHRoaXMuX2NhY2hlZFNwcml0ZS5hbmNob3IueCA9IC0oIGJvdW5kcy54IC8gYm91bmRzLndpZHRoICk7XHJcbiAgICB0aGlzLl9jYWNoZWRTcHJpdGUuYW5jaG9yLnkgPSAtKCBib3VuZHMueSAvIGJvdW5kcy5oZWlnaHQgKTtcclxuXHJcbiAgICAvLyB0aGlzLl9jYWNoZWRTcHJpdGUuYnVmZmVyLmNvbnRleHQuc2F2ZSgpO1xyXG4gICAgdGhpcy5fY2FjaGVkU3ByaXRlLmJ1ZmZlci5jb250ZXh0LnRyYW5zbGF0ZSgtYm91bmRzLngsLWJvdW5kcy55KTtcclxuXHJcbiAgICAvLyBtYWtlIHN1cmUgd2Ugc2V0IHRoZSBhbHBoYSBvZiB0aGUgZ3JhcGhpY3MgdG8gMSBmb3IgdGhlIHJlbmRlci4uXHJcbiAgICB0aGlzLndvcmxkQWxwaGEgPSAxO1xyXG5cclxuICAgIC8vIG5vdyByZW5kZXIgdGhlIGdyYXBoaWMuLlxyXG4gICAgQ2FudmFzR3JhcGhpY3MucmVuZGVyR3JhcGhpY3ModGhpcywgdGhpcy5fY2FjaGVkU3ByaXRlLmJ1ZmZlci5jb250ZXh0KTtcclxuXHJcbiAgICB0aGlzLl9jYWNoZWRTcHJpdGUuYWxwaGEgPSB0aGlzLmFscGhhO1xyXG59O1xyXG4qL1xyXG4vKipcclxuICogVXBkYXRlcyB0ZXh0dXJlIHNpemUgYmFzZWQgb24gY2FudmFzIHNpemVcclxuICpcclxuICogQHByaXZhdGVcclxuICovXHJcbi8qXHJcbkdyYXBoaWNzLnByb3RvdHlwZS51cGRhdGVDYWNoZWRTcHJpdGVUZXh0dXJlID0gZnVuY3Rpb24gKClcclxue1xyXG4gICAgdmFyIGNhY2hlZFNwcml0ZSA9IHRoaXMuX2NhY2hlZFNwcml0ZTtcclxuICAgIHZhciB0ZXh0dXJlID0gY2FjaGVkU3ByaXRlLnRleHR1cmU7XHJcbiAgICB2YXIgY2FudmFzID0gY2FjaGVkU3ByaXRlLmJ1ZmZlci5jYW52YXM7XHJcblxyXG4gICAgdGV4dHVyZS5iYXNlVGV4dHVyZS53aWR0aCA9IGNhbnZhcy53aWR0aDtcclxuICAgIHRleHR1cmUuYmFzZVRleHR1cmUuaGVpZ2h0ID0gY2FudmFzLmhlaWdodDtcclxuICAgIHRleHR1cmUuY3JvcC53aWR0aCA9IHRleHR1cmUuZnJhbWUud2lkdGggPSBjYW52YXMud2lkdGg7XHJcbiAgICB0ZXh0dXJlLmNyb3AuaGVpZ2h0ID0gdGV4dHVyZS5mcmFtZS5oZWlnaHQgPSBjYW52YXMuaGVpZ2h0O1xyXG5cclxuICAgIGNhY2hlZFNwcml0ZS5fd2lkdGggPSBjYW52YXMud2lkdGg7XHJcbiAgICBjYWNoZWRTcHJpdGUuX2hlaWdodCA9IGNhbnZhcy5oZWlnaHQ7XHJcblxyXG4gICAgLy8gdXBkYXRlIHRoZSBkaXJ0eSBiYXNlIHRleHR1cmVzXHJcbiAgICB0ZXh0dXJlLmJhc2VUZXh0dXJlLmRpcnR5KCk7XHJcbn07Ki9cclxuXHJcbi8qKlxyXG4gKiBEZXN0cm95cyBhIHByZXZpb3VzIGNhY2hlZCBzcHJpdGUuXHJcbiAqXHJcbiAqL1xyXG4vKlxyXG5HcmFwaGljcy5wcm90b3R5cGUuZGVzdHJveUNhY2hlZFNwcml0ZSA9IGZ1bmN0aW9uICgpXHJcbntcclxuICAgIHRoaXMuX2NhY2hlZFNwcml0ZS50ZXh0dXJlLmRlc3Ryb3kodHJ1ZSk7XHJcblxyXG4gICAgLy8gbGV0IHRoZSBnYyBjb2xsZWN0IHRoZSB1bnVzZWQgc3ByaXRlXHJcbiAgICAvLyBUT0RPIGNvdWxkIGJlIG9iamVjdCBwb29sZWQhXHJcbiAgICB0aGlzLl9jYWNoZWRTcHJpdGUgPSBudWxsO1xyXG59OyovXHJcblxyXG4vKipcclxuICogRHJhd3MgdGhlIGdpdmVuIHNoYXBlIHRvIHRoaXMgR3JhcGhpY3Mgb2JqZWN0LiBDYW4gYmUgYW55IG9mIENpcmNsZSwgUmVjdGFuZ2xlLCBFbGxpcHNlLCBMaW5lIG9yIFBvbHlnb24uXHJcbiAqXHJcbiAqIEBwYXJhbSBzaGFwZSB7UElYSS5DaXJjbGV8UElYSS5SZWN0YW5nbGV8UElYSS5FbGxpcHNlfFBJWEkuTGluZXxQSVhJLlBvbHlnb259IFRoZSBzaGFwZSBvYmplY3QgdG8gZHJhdy5cclxuICogQHJldHVybiB7UElYSS5HcmFwaGljc0RhdGF9IFRoZSBnZW5lcmF0ZWQgR3JhcGhpY3NEYXRhIG9iamVjdC5cclxuICovXHJcbkdyYXBoaWNzLnByb3RvdHlwZS5kcmF3U2hhcGUgPSBmdW5jdGlvbiAoc2hhcGUpXHJcbntcclxuICAgIGlmICh0aGlzLmN1cnJlbnRQYXRoKVxyXG4gICAge1xyXG4gICAgICAgIC8vIGNoZWNrIGN1cnJlbnQgcGF0aCFcclxuICAgICAgICBpZiAodGhpcy5jdXJyZW50UGF0aC5zaGFwZS5wb2ludHMubGVuZ3RoIDw9IDIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLmdyYXBoaWNzRGF0YS5wb3AoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5jdXJyZW50UGF0aCA9IG51bGw7XHJcblxyXG4gICAgdmFyIGRhdGEgPSBuZXcgR3JhcGhpY3NEYXRhKHRoaXMubGluZVdpZHRoLCB0aGlzLmxpbmVDb2xvciwgdGhpcy5saW5lQWxwaGEsIHRoaXMuZmlsbENvbG9yLCB0aGlzLmZpbGxBbHBoYSwgdGhpcy5maWxsaW5nLCBzaGFwZSk7XHJcblxyXG4gICAgdGhpcy5ncmFwaGljc0RhdGEucHVzaChkYXRhKTtcclxuXHJcbiAgICBpZiAoZGF0YS50eXBlID09PSBDT05TVC5TSEFQRVMuUE9MWSlcclxuICAgIHtcclxuICAgICAgICBkYXRhLnNoYXBlLmNsb3NlZCA9IGRhdGEuc2hhcGUuY2xvc2VkIHx8IHRoaXMuZmlsbGluZztcclxuICAgICAgICB0aGlzLmN1cnJlbnRQYXRoID0gZGF0YTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmRpcnR5ID0gdGhpcy5ib3VuZHNEaXJ0eSA9IHRydWU7XHJcblxyXG4gICAgcmV0dXJuIGRhdGE7XHJcbn07XHJcblxyXG4vKipcclxuICogRGVzdHJveXMgdGhlIEdyYXBoaWNzIG9iamVjdC5cclxuICovXHJcbkdyYXBoaWNzLnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgQ29udGFpbmVyLnByb3RvdHlwZS5kZXN0cm95LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XHJcblxyXG4gICAgLy8gZGVzdHJveSBlYWNoIG9mIHRoZSBHcmFwaGljc0RhdGEgb2JqZWN0c1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmdyYXBoaWNzRGF0YS5sZW5ndGg7ICsraSkge1xyXG4gICAgICAgIHRoaXMuZ3JhcGhpY3NEYXRhW2ldLmRlc3Ryb3koKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBmb3IgZWFjaCB3ZWJnbCBkYXRhIGVudHJ5LCBkZXN0cm95IHRoZSBXZWJHTEdyYXBoaWNzRGF0YVxyXG4gICAgZm9yICh2YXIgaWQgaW4gdGhpcy5fd2ViZ2wpIHtcclxuICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHRoaXMuX3dlYmdsW2lkXS5kYXRhLmxlbmd0aDsgKytqKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3dlYmdsW2lkXS5kYXRhW2pdLmRlc3Ryb3koKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5ncmFwaGljc0RhdGEgPSBudWxsO1xyXG5cclxuICAgIHRoaXMuY3VycmVudFBhdGggPSBudWxsO1xyXG4gICAgdGhpcy5fd2ViZ2wgPSBudWxsO1xyXG4gICAgdGhpcy5fbG9jYWxCb3VuZHMgPSBudWxsO1xyXG59O1xyXG4iLCIvKipcclxuICogQSBHcmFwaGljc0RhdGEgb2JqZWN0LlxyXG4gKlxyXG4gKiBAY2xhc3NcclxuICogQG1lbWJlcm9mIFBJWElcclxuICogQHBhcmFtIGxpbmVXaWR0aCB7bnVtYmVyfSB0aGUgd2lkdGggb2YgdGhlIGxpbmUgdG8gZHJhd1xyXG4gKiBAcGFyYW0gbGluZUNvbG9yIHtudW1iZXJ9IHRoZSBjb2xvciBvZiB0aGUgbGluZSB0byBkcmF3XHJcbiAqIEBwYXJhbSBsaW5lQWxwaGEge251bWJlcn0gdGhlIGFscGhhIG9mIHRoZSBsaW5lIHRvIGRyYXdcclxuICogQHBhcmFtIGZpbGxDb2xvciB7bnVtYmVyfSB0aGUgY29sb3Igb2YgdGhlIGZpbGxcclxuICogQHBhcmFtIGZpbGxBbHBoYSB7bnVtYmVyfSB0aGUgYWxwaGEgb2YgdGhlIGZpbGxcclxuICogQHBhcmFtIGZpbGwgICAgICB7Ym9vbGVhbn0gd2hldGhlciBvciBub3QgdGhlIHNoYXBlIGlzIGZpbGxlZCB3aXRoIGEgY29sb3VyXHJcbiAqIEBwYXJhbSBzaGFwZSAgICAge0NpcmNsZXxSZWN0YW5nbGV8RWxsaXBzZXxMaW5lfFBvbHlnb259IFRoZSBzaGFwZSBvYmplY3QgdG8gZHJhdy5cclxuICovXHJcbmZ1bmN0aW9uIEdyYXBoaWNzRGF0YShsaW5lV2lkdGgsIGxpbmVDb2xvciwgbGluZUFscGhhLCBmaWxsQ29sb3IsIGZpbGxBbHBoYSwgZmlsbCwgc2hhcGUpXHJcbntcclxuICAgIC8qXHJcbiAgICAgKiBAbWVtYmVyIHtudW1iZXJ9IHRoZSB3aWR0aCBvZiB0aGUgbGluZSB0byBkcmF3XHJcbiAgICAgKi9cclxuICAgIHRoaXMubGluZVdpZHRoID0gbGluZVdpZHRoO1xyXG5cclxuICAgIC8qXHJcbiAgICAgKiBAbWVtYmVyIHtudW1iZXJ9IHRoZSBjb2xvciBvZiB0aGUgbGluZSB0byBkcmF3XHJcbiAgICAgKi9cclxuICAgIHRoaXMubGluZUNvbG9yID0gbGluZUNvbG9yO1xyXG4gICAgLypcclxuICAgICAqIEBtZW1iZXIge251bWJlcn0gdGhlIGFscGhhIG9mIHRoZSBsaW5lIHRvIGRyYXdcclxuICAgICAqL1xyXG4gICAgdGhpcy5saW5lQWxwaGEgPSBsaW5lQWxwaGE7XHJcbiAgICAvKlxyXG4gICAgICogQG1lbWJlciB7bnVtYmVyfSBjYWNoZWQgdGludCBvZiB0aGUgbGluZSB0byBkcmF3XHJcbiAgICAgKi9cclxuICAgIHRoaXMuX2xpbmVUaW50ID0gbGluZUNvbG9yO1xyXG5cclxuICAgIC8qXHJcbiAgICAgKiBAbWVtYmVyIHtudW1iZXJ9IHRoZSBjb2xvciBvZiB0aGUgZmlsbFxyXG4gICAgICovXHJcbiAgICB0aGlzLmZpbGxDb2xvciA9IGZpbGxDb2xvcjtcclxuXHJcbiAgICAvKlxyXG4gICAgICogQG1lbWJlciB7bnVtYmVyfSB0aGUgYWxwaGEgb2YgdGhlIGZpbGxcclxuICAgICAqL1xyXG4gICAgdGhpcy5maWxsQWxwaGEgPSBmaWxsQWxwaGE7XHJcblxyXG4gICAgLypcclxuICAgICAqIEBtZW1iZXIge251bWJlcn0gY2FjaGVkIHRpbnQgb2YgdGhlIGZpbGxcclxuICAgICAqL1xyXG4gICAgdGhpcy5fZmlsbFRpbnQgPSBmaWxsQ29sb3I7XHJcblxyXG4gICAgLypcclxuICAgICAqIEBtZW1iZXIge2Jvb2xlYW59IHdoZXRoZXIgb3Igbm90IHRoZSBzaGFwZSBpcyBmaWxsZWQgd2l0aCBhIGNvbG91clxyXG4gICAgICovXHJcbiAgICB0aGlzLmZpbGwgPSBmaWxsO1xyXG5cclxuICAgIC8qXHJcbiAgICAgKiBAbWVtYmVyIHtQSVhJLkNpcmNsZXxQSVhJLlJlY3RhbmdsZXxQSVhJLkVsbGlwc2V8UElYSS5MaW5lfFBJWEkuUG9seWdvbn0gVGhlIHNoYXBlIG9iamVjdCB0byBkcmF3LlxyXG4gICAgICovXHJcbiAgICB0aGlzLnNoYXBlID0gc2hhcGU7XHJcblxyXG4gICAgLypcclxuICAgICAqIEBtZW1iZXIge251bWJlcn0gVGhlIHR5cGUgb2YgdGhlIHNoYXBlLCBzZWUgdGhlIENvbnN0LlNoYXBlcyBmaWxlIGZvciBhbGwgdGhlIGV4aXN0aW5nIHR5cGVzLFxyXG4gICAgICovXHJcbiAgICB0aGlzLnR5cGUgPSBzaGFwZS50eXBlO1xyXG59XHJcblxyXG5HcmFwaGljc0RhdGEucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gR3JhcGhpY3NEYXRhO1xyXG5tb2R1bGUuZXhwb3J0cyA9IEdyYXBoaWNzRGF0YTtcclxuXHJcbi8qKlxyXG4gKiBDcmVhdGVzIGEgbmV3IEdyYXBoaWNzRGF0YSBvYmplY3Qgd2l0aCB0aGUgc2FtZSB2YWx1ZXMgYXMgdGhpcyBvbmUuXHJcbiAqXHJcbiAqIEByZXR1cm4ge1BJWEkuR3JhcGhpY3NEYXRhfVxyXG4gKi9cclxuR3JhcGhpY3NEYXRhLnByb3RvdHlwZS5jbG9uZSA9IGZ1bmN0aW9uICgpXHJcbntcclxuICAgIHJldHVybiBuZXcgR3JhcGhpY3NEYXRhKFxyXG4gICAgICAgIHRoaXMubGluZVdpZHRoLFxyXG4gICAgICAgIHRoaXMubGluZUNvbG9yLFxyXG4gICAgICAgIHRoaXMubGluZUFscGhhLFxyXG4gICAgICAgIHRoaXMuZmlsbENvbG9yLFxyXG4gICAgICAgIHRoaXMuZmlsbEFscGhhLFxyXG4gICAgICAgIHRoaXMuZmlsbCxcclxuICAgICAgICB0aGlzLnNoYXBlXHJcbiAgICApO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIERlc3Ryb3lzIHRoZSBHcmFwaGljcyBkYXRhLlxyXG4gKi9cclxuR3JhcGhpY3NEYXRhLnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgdGhpcy5zaGFwZSA9IG51bGw7XHJcbn07XHJcbiIsIi8qKlxyXG4gKiBAZmlsZSAgICAgICAgTWFpbiBleHBvcnQgb2YgdGhlIFBJWEkgY29yZSBsaWJyYXJ5XHJcbiAqIEBhdXRob3IgICAgICBNYXQgR3JvdmVzIDxtYXRAZ29vZGJveWRpZ2l0YWwuY29tPlxyXG4gKiBAY29weXJpZ2h0ICAgMjAxMy0yMDE1IEdvb2RCb3lEaWdpdGFsXHJcbiAqIEBsaWNlbnNlICAgICB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL3BpeGlqcy9waXhpLmpzL2Jsb2IvbWFzdGVyL0xJQ0VOU0V8TUlUIExpY2Vuc2V9XHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIEBuYW1lc3BhY2UgUElYSVxyXG4gKi9cclxuLy8gZXhwb3J0IGNvcmUgYW5kIGNvbnN0LiBXZSBhc3NpZ24gY29yZSB0byBjb25zdCBzbyB0aGF0IHRoZSBub24tcmVmZXJlbmNlIHR5cGVzIGluIGNvbnN0IHJlbWFpbiBpbi10YWN0XHJcbnZhciBjb3JlID0gbW9kdWxlLmV4cG9ydHMgPSBPYmplY3QuYXNzaWduKHJlcXVpcmUoJy4vY29uc3QnKSwgcmVxdWlyZSgnLi9tYXRoJyksIHtcclxuICAgIC8vIHV0aWxzXHJcbiAgICB1dGlsczogcmVxdWlyZSgnLi91dGlscycpLFxyXG4gICAgdGlja2VyOiByZXF1aXJlKCcuL3RpY2tlcicpLFxyXG5cclxuICAgIC8vIGRpc3BsYXlcclxuICAgIERpc3BsYXlPYmplY3Q6ICAgICAgICAgIHJlcXVpcmUoJy4vZGlzcGxheS9EaXNwbGF5T2JqZWN0JyksXHJcbiAgICBDb250YWluZXI6ICAgICAgICAgICAgICByZXF1aXJlKCcuL2Rpc3BsYXkvQ29udGFpbmVyJyksXHJcblxyXG4gICAgLy8gc3ByaXRlc1xyXG4gICAgU3ByaXRlOiAgICAgICAgICAgICAgICAgcmVxdWlyZSgnLi9zcHJpdGVzL1Nwcml0ZScpLFxyXG4gICAgUGFydGljbGVDb250YWluZXI6ICAgICAgcmVxdWlyZSgnLi9wYXJ0aWNsZXMvUGFydGljbGVDb250YWluZXInKSxcclxuICAgIFNwcml0ZVJlbmRlcmVyOiAgICAgICAgIHJlcXVpcmUoJy4vc3ByaXRlcy93ZWJnbC9TcHJpdGVSZW5kZXJlcicpLFxyXG4gICAgUGFydGljbGVSZW5kZXJlcjogICAgICAgcmVxdWlyZSgnLi9wYXJ0aWNsZXMvd2ViZ2wvUGFydGljbGVSZW5kZXJlcicpLFxyXG5cclxuICAgIC8vIHRleHRcclxuICAgIFRleHQ6ICAgICAgICAgICAgICAgICAgIHJlcXVpcmUoJy4vdGV4dC9UZXh0JyksXHJcblxyXG4gICAgLy8gcHJpbWl0aXZlc1xyXG4gICAgR3JhcGhpY3M6ICAgICAgICAgICAgICAgcmVxdWlyZSgnLi9ncmFwaGljcy9HcmFwaGljcycpLFxyXG4gICAgR3JhcGhpY3NEYXRhOiAgICAgICAgICAgcmVxdWlyZSgnLi9ncmFwaGljcy9HcmFwaGljc0RhdGEnKSxcclxuICAgIEdyYXBoaWNzUmVuZGVyZXI6ICAgICAgIHJlcXVpcmUoJy4vZ3JhcGhpY3Mvd2ViZ2wvR3JhcGhpY3NSZW5kZXJlcicpLFxyXG5cclxuICAgIC8vIHRleHR1cmVzXHJcbiAgICBUZXh0dXJlOiAgICAgICAgICAgICAgICByZXF1aXJlKCcuL3RleHR1cmVzL1RleHR1cmUnKSxcclxuICAgIEJhc2VUZXh0dXJlOiAgICAgICAgICAgIHJlcXVpcmUoJy4vdGV4dHVyZXMvQmFzZVRleHR1cmUnKSxcclxuICAgIFJlbmRlclRleHR1cmU6ICAgICAgICAgIHJlcXVpcmUoJy4vdGV4dHVyZXMvUmVuZGVyVGV4dHVyZScpLFxyXG4gICAgVmlkZW9CYXNlVGV4dHVyZTogICAgICAgcmVxdWlyZSgnLi90ZXh0dXJlcy9WaWRlb0Jhc2VUZXh0dXJlJyksXHJcbiAgICBUZXh0dXJlVXZzOiAgICAgICAgICAgICByZXF1aXJlKCcuL3RleHR1cmVzL1RleHR1cmVVdnMnKSxcclxuXHJcbiAgICAvLyByZW5kZXJlcnMgLSBjYW52YXNcclxuICAgIENhbnZhc1JlbmRlcmVyOiAgICAgICAgIHJlcXVpcmUoJy4vcmVuZGVyZXJzL2NhbnZhcy9DYW52YXNSZW5kZXJlcicpLFxyXG4gICAgQ2FudmFzR3JhcGhpY3M6ICAgICAgICAgcmVxdWlyZSgnLi9yZW5kZXJlcnMvY2FudmFzL3V0aWxzL0NhbnZhc0dyYXBoaWNzJyksXHJcbiAgICBDYW52YXNCdWZmZXI6ICAgICAgICAgICByZXF1aXJlKCcuL3JlbmRlcmVycy9jYW52YXMvdXRpbHMvQ2FudmFzQnVmZmVyJyksXHJcblxyXG4gICAgLy8gcmVuZGVyZXJzIC0gd2ViZ2xcclxuICAgIFdlYkdMUmVuZGVyZXI6ICAgICAgICAgIHJlcXVpcmUoJy4vcmVuZGVyZXJzL3dlYmdsL1dlYkdMUmVuZGVyZXInKSxcclxuICAgIFNoYWRlck1hbmFnZXI6ICAgICAgICAgIHJlcXVpcmUoJy4vcmVuZGVyZXJzL3dlYmdsL21hbmFnZXJzL1NoYWRlck1hbmFnZXInKSxcclxuICAgIFNoYWRlcjogICAgICAgICAgICAgICAgIHJlcXVpcmUoJy4vcmVuZGVyZXJzL3dlYmdsL3NoYWRlcnMvU2hhZGVyJyksXHJcbiAgICBPYmplY3RSZW5kZXJlcjogICAgICAgICByZXF1aXJlKCcuL3JlbmRlcmVycy93ZWJnbC91dGlscy9PYmplY3RSZW5kZXJlcicpLFxyXG4gICAgUmVuZGVyVGFyZ2V0OiAgICAgICAgICAgcmVxdWlyZSgnLi9yZW5kZXJlcnMvd2ViZ2wvdXRpbHMvUmVuZGVyVGFyZ2V0JyksXHJcblxyXG4gICAgLy8gZmlsdGVycyAtIHdlYmdsXHJcbiAgICBBYnN0cmFjdEZpbHRlcjogICAgICAgICByZXF1aXJlKCcuL3JlbmRlcmVycy93ZWJnbC9maWx0ZXJzL0Fic3RyYWN0RmlsdGVyJyksXHJcbiAgICBGWEFBRmlsdGVyOiAgICAgICAgICAgICByZXF1aXJlKCcuL3JlbmRlcmVycy93ZWJnbC9maWx0ZXJzL0ZYQUFGaWx0ZXInKSxcclxuICAgIFNwcml0ZU1hc2tGaWx0ZXI6ICAgICAgIHJlcXVpcmUoJy4vcmVuZGVyZXJzL3dlYmdsL2ZpbHRlcnMvU3ByaXRlTWFza0ZpbHRlcicpLFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVGhpcyBoZWxwZXIgZnVuY3Rpb24gd2lsbCBhdXRvbWF0aWNhbGx5IGRldGVjdCB3aGljaCByZW5kZXJlciB5b3Ugc2hvdWxkIGJlIHVzaW5nLlxyXG4gICAgICogV2ViR0wgaXMgdGhlIHByZWZlcnJlZCByZW5kZXJlciBhcyBpdCBpcyBhIGxvdCBmYXN0ZXIuIElmIHdlYkdMIGlzIG5vdCBzdXBwb3J0ZWQgYnlcclxuICAgICAqIHRoZSBicm93c2VyIHRoZW4gdGhpcyBmdW5jdGlvbiB3aWxsIHJldHVybiBhIGNhbnZhcyByZW5kZXJlclxyXG4gICAgICpcclxuICAgICAqIEBtZW1iZXJvZiBQSVhJXHJcbiAgICAgKiBAcGFyYW0gd2lkdGg9ODAwIHtudW1iZXJ9IHRoZSB3aWR0aCBvZiB0aGUgcmVuZGVyZXJzIHZpZXdcclxuICAgICAqIEBwYXJhbSBoZWlnaHQ9NjAwIHtudW1iZXJ9IHRoZSBoZWlnaHQgb2YgdGhlIHJlbmRlcmVycyB2aWV3XHJcbiAgICAgKiBAcGFyYW0gW29wdGlvbnNdIHtvYmplY3R9IFRoZSBvcHRpb25hbCByZW5kZXJlciBwYXJhbWV0ZXJzXHJcbiAgICAgKiBAcGFyYW0gW29wdGlvbnMudmlld10ge0hUTUxDYW52YXNFbGVtZW50fSB0aGUgY2FudmFzIHRvIHVzZSBhcyBhIHZpZXcsIG9wdGlvbmFsXHJcbiAgICAgKiBAcGFyYW0gW29wdGlvbnMudHJhbnNwYXJlbnQ9ZmFsc2VdIHtib29sZWFufSBJZiB0aGUgcmVuZGVyIHZpZXcgaXMgdHJhbnNwYXJlbnQsIGRlZmF1bHQgZmFsc2VcclxuICAgICAqIEBwYXJhbSBbb3B0aW9ucy5hbnRpYWxpYXM9ZmFsc2VdIHtib29sZWFufSBzZXRzIGFudGlhbGlhcyAob25seSBhcHBsaWNhYmxlIGluIGNocm9tZSBhdCB0aGUgbW9tZW50KVxyXG4gICAgICogQHBhcmFtIFtvcHRpb25zLnByZXNlcnZlRHJhd2luZ0J1ZmZlcj1mYWxzZV0ge2Jvb2xlYW59IGVuYWJsZXMgZHJhd2luZyBidWZmZXIgcHJlc2VydmF0aW9uLCBlbmFibGUgdGhpcyBpZiB5b3VcclxuICAgICAqICAgICAgbmVlZCB0byBjYWxsIHRvRGF0YVVybCBvbiB0aGUgd2ViZ2wgY29udGV4dFxyXG4gICAgICogQHBhcmFtIFtvcHRpb25zLnJlc29sdXRpb249MV0ge251bWJlcn0gdGhlIHJlc29sdXRpb24gb2YgdGhlIHJlbmRlcmVyLCByZXRpbmEgd291bGQgYmUgMlxyXG4gICAgICogQHBhcmFtIFtub1dlYkdMPWZhbHNlXSB7Ym9vbGVhbn0gcHJldmVudHMgc2VsZWN0aW9uIG9mIFdlYkdMIHJlbmRlcmVyLCBldmVuIGlmIHN1Y2ggaXMgcHJlc2VudFxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm4ge1dlYkdMUmVuZGVyZXJ8Q2FudmFzUmVuZGVyZXJ9IFJldHVybnMgV2ViR0wgcmVuZGVyZXIgaWYgYXZhaWxhYmxlLCBvdGhlcndpc2UgQ2FudmFzUmVuZGVyZXJcclxuICAgICAqL1xyXG4gICAgYXV0b0RldGVjdFJlbmRlcmVyOiBmdW5jdGlvbiAod2lkdGgsIGhlaWdodCwgb3B0aW9ucywgbm9XZWJHTClcclxuICAgIHtcclxuICAgICAgICB3aWR0aCA9IHdpZHRoIHx8IDgwMDtcclxuICAgICAgICBoZWlnaHQgPSBoZWlnaHQgfHwgNjAwO1xyXG5cclxuICAgICAgICBpZiAoIW5vV2ViR0wgJiYgY29yZS51dGlscy5pc1dlYkdMU3VwcG9ydGVkKCkpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IGNvcmUuV2ViR0xSZW5kZXJlcih3aWR0aCwgaGVpZ2h0LCBvcHRpb25zKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBuZXcgY29yZS5DYW52YXNSZW5kZXJlcih3aWR0aCwgaGVpZ2h0LCBvcHRpb25zKTtcclxuICAgIH1cclxufSk7XHJcbiIsInZhciBQb2ludCA9IHJlcXVpcmUoJy4vUG9pbnQnKTtcclxuXHJcbi8qKlxyXG4gKiBUaGUgcGl4aSBNYXRyaXggY2xhc3MgYXMgYW4gb2JqZWN0LCB3aGljaCBtYWtlcyBpdCBhIGxvdCBmYXN0ZXIsXHJcbiAqIGhlcmUgaXMgYSByZXByZXNlbnRhdGlvbiBvZiBpdCA6XHJcbiAqIHwgYSB8IGIgfCB0eHxcclxuICogfCBjIHwgZCB8IHR5fFxyXG4gKiB8IDAgfCAwIHwgMSB8XHJcbiAqXHJcbiAqIEBjbGFzc1xyXG4gKiBAbWVtYmVyb2YgUElYSVxyXG4gKi9cclxuZnVuY3Rpb24gTWF0cml4KClcclxue1xyXG4gICAgLyoqXHJcbiAgICAgKiBAbWVtYmVyIHtudW1iZXJ9XHJcbiAgICAgKiBAZGVmYXVsdCAxXHJcbiAgICAgKi9cclxuICAgIHRoaXMuYSA9IDE7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAbWVtYmVyIHtudW1iZXJ9XHJcbiAgICAgKiBAZGVmYXVsdCAwXHJcbiAgICAgKi9cclxuICAgIHRoaXMuYiA9IDA7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAbWVtYmVyIHtudW1iZXJ9XHJcbiAgICAgKiBAZGVmYXVsdCAwXHJcbiAgICAgKi9cclxuICAgIHRoaXMuYyA9IDA7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAbWVtYmVyIHtudW1iZXJ9XHJcbiAgICAgKiBAZGVmYXVsdCAxXHJcbiAgICAgKi9cclxuICAgIHRoaXMuZCA9IDE7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAbWVtYmVyIHtudW1iZXJ9XHJcbiAgICAgKiBAZGVmYXVsdCAwXHJcbiAgICAgKi9cclxuICAgIHRoaXMudHggPSAwO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogQG1lbWJlciB7bnVtYmVyfVxyXG4gICAgICogQGRlZmF1bHQgMFxyXG4gICAgICovXHJcbiAgICB0aGlzLnR5ID0gMDtcclxufVxyXG5cclxuTWF0cml4LnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IE1hdHJpeDtcclxubW9kdWxlLmV4cG9ydHMgPSBNYXRyaXg7XHJcblxyXG4vKipcclxuICogQ3JlYXRlcyBhIE1hdHJpeCBvYmplY3QgYmFzZWQgb24gdGhlIGdpdmVuIGFycmF5LiBUaGUgRWxlbWVudCB0byBNYXRyaXggbWFwcGluZyBvcmRlciBpcyBhcyBmb2xsb3dzOlxyXG4gKlxyXG4gKiBhID0gYXJyYXlbMF1cclxuICogYiA9IGFycmF5WzFdXHJcbiAqIGMgPSBhcnJheVszXVxyXG4gKiBkID0gYXJyYXlbNF1cclxuICogdHggPSBhcnJheVsyXVxyXG4gKiB0eSA9IGFycmF5WzVdXHJcbiAqXHJcbiAqIEBwYXJhbSBhcnJheSB7bnVtYmVyW119IFRoZSBhcnJheSB0aGF0IHRoZSBtYXRyaXggd2lsbCBiZSBwb3B1bGF0ZWQgZnJvbS5cclxuICovXHJcbk1hdHJpeC5wcm90b3R5cGUuZnJvbUFycmF5ID0gZnVuY3Rpb24gKGFycmF5KVxyXG57XHJcbiAgICB0aGlzLmEgPSBhcnJheVswXTtcclxuICAgIHRoaXMuYiA9IGFycmF5WzFdO1xyXG4gICAgdGhpcy5jID0gYXJyYXlbM107XHJcbiAgICB0aGlzLmQgPSBhcnJheVs0XTtcclxuICAgIHRoaXMudHggPSBhcnJheVsyXTtcclxuICAgIHRoaXMudHkgPSBhcnJheVs1XTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBDcmVhdGVzIGFuIGFycmF5IGZyb20gdGhlIGN1cnJlbnQgTWF0cml4IG9iamVjdC5cclxuICpcclxuICogQHBhcmFtIHRyYW5zcG9zZSB7Ym9vbGVhbn0gV2hldGhlciB3ZSBuZWVkIHRvIHRyYW5zcG9zZSB0aGUgbWF0cml4IG9yIG5vdFxyXG4gKiBAcmV0dXJuIHtudW1iZXJbXX0gdGhlIG5ld2x5IGNyZWF0ZWQgYXJyYXkgd2hpY2ggY29udGFpbnMgdGhlIG1hdHJpeFxyXG4gKi9cclxuTWF0cml4LnByb3RvdHlwZS50b0FycmF5ID0gZnVuY3Rpb24gKHRyYW5zcG9zZSwgb3V0KVxyXG57XHJcbiAgICBpZiAoIXRoaXMuYXJyYXkpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5hcnJheSA9IG5ldyBGbG9hdDMyQXJyYXkoOSk7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGFycmF5ID0gb3V0IHx8IHRoaXMuYXJyYXk7XHJcblxyXG4gICAgaWYgKHRyYW5zcG9zZSlcclxuICAgIHtcclxuICAgICAgICBhcnJheVswXSA9IHRoaXMuYTtcclxuICAgICAgICBhcnJheVsxXSA9IHRoaXMuYjtcclxuICAgICAgICBhcnJheVsyXSA9IDA7XHJcbiAgICAgICAgYXJyYXlbM10gPSB0aGlzLmM7XHJcbiAgICAgICAgYXJyYXlbNF0gPSB0aGlzLmQ7XHJcbiAgICAgICAgYXJyYXlbNV0gPSAwO1xyXG4gICAgICAgIGFycmF5WzZdID0gdGhpcy50eDtcclxuICAgICAgICBhcnJheVs3XSA9IHRoaXMudHk7XHJcbiAgICAgICAgYXJyYXlbOF0gPSAxO1xyXG4gICAgfVxyXG4gICAgZWxzZVxyXG4gICAge1xyXG4gICAgICAgIGFycmF5WzBdID0gdGhpcy5hO1xyXG4gICAgICAgIGFycmF5WzFdID0gdGhpcy5jO1xyXG4gICAgICAgIGFycmF5WzJdID0gdGhpcy50eDtcclxuICAgICAgICBhcnJheVszXSA9IHRoaXMuYjtcclxuICAgICAgICBhcnJheVs0XSA9IHRoaXMuZDtcclxuICAgICAgICBhcnJheVs1XSA9IHRoaXMudHk7XHJcbiAgICAgICAgYXJyYXlbNl0gPSAwO1xyXG4gICAgICAgIGFycmF5WzddID0gMDtcclxuICAgICAgICBhcnJheVs4XSA9IDE7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGFycmF5O1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEdldCBhIG5ldyBwb3NpdGlvbiB3aXRoIHRoZSBjdXJyZW50IHRyYW5zZm9ybWF0aW9uIGFwcGxpZWQuXHJcbiAqIENhbiBiZSB1c2VkIHRvIGdvIGZyb20gYSBjaGlsZCdzIGNvb3JkaW5hdGUgc3BhY2UgdG8gdGhlIHdvcmxkIGNvb3JkaW5hdGUgc3BhY2UuIChlLmcuIHJlbmRlcmluZylcclxuICpcclxuICogQHBhcmFtIHBvcyB7UElYSS5Qb2ludH0gVGhlIG9yaWdpblxyXG4gKiBAcGFyYW0gW25ld1Bvc10ge1BJWEkuUG9pbnR9IFRoZSBwb2ludCB0aGF0IHRoZSBuZXcgcG9zaXRpb24gaXMgYXNzaWduZWQgdG8gKGFsbG93ZWQgdG8gYmUgc2FtZSBhcyBpbnB1dClcclxuICogQHJldHVybiB7UElYSS5Qb2ludH0gVGhlIG5ldyBwb2ludCwgdHJhbnNmb3JtZWQgdGhyb3VnaCB0aGlzIG1hdHJpeFxyXG4gKi9cclxuTWF0cml4LnByb3RvdHlwZS5hcHBseSA9IGZ1bmN0aW9uIChwb3MsIG5ld1Bvcylcclxue1xyXG4gICAgbmV3UG9zID0gbmV3UG9zIHx8IG5ldyBQb2ludCgpO1xyXG5cclxuICAgIHZhciB4ID0gcG9zLng7XHJcbiAgICB2YXIgeSA9IHBvcy55O1xyXG5cclxuICAgIG5ld1Bvcy54ID0gdGhpcy5hICogeCArIHRoaXMuYyAqIHkgKyB0aGlzLnR4O1xyXG4gICAgbmV3UG9zLnkgPSB0aGlzLmIgKiB4ICsgdGhpcy5kICogeSArIHRoaXMudHk7XHJcblxyXG4gICAgcmV0dXJuIG5ld1BvcztcclxufTtcclxuXHJcbi8qKlxyXG4gKiBHZXQgYSBuZXcgcG9zaXRpb24gd2l0aCB0aGUgaW52ZXJzZSBvZiB0aGUgY3VycmVudCB0cmFuc2Zvcm1hdGlvbiBhcHBsaWVkLlxyXG4gKiBDYW4gYmUgdXNlZCB0byBnbyBmcm9tIHRoZSB3b3JsZCBjb29yZGluYXRlIHNwYWNlIHRvIGEgY2hpbGQncyBjb29yZGluYXRlIHNwYWNlLiAoZS5nLiBpbnB1dClcclxuICpcclxuICogQHBhcmFtIHBvcyB7UElYSS5Qb2ludH0gVGhlIG9yaWdpblxyXG4gKiBAcGFyYW0gW25ld1Bvc10ge1BJWEkuUG9pbnR9IFRoZSBwb2ludCB0aGF0IHRoZSBuZXcgcG9zaXRpb24gaXMgYXNzaWduZWQgdG8gKGFsbG93ZWQgdG8gYmUgc2FtZSBhcyBpbnB1dClcclxuICogQHJldHVybiB7UElYSS5Qb2ludH0gVGhlIG5ldyBwb2ludCwgaW52ZXJzZS10cmFuc2Zvcm1lZCB0aHJvdWdoIHRoaXMgbWF0cml4XHJcbiAqL1xyXG5NYXRyaXgucHJvdG90eXBlLmFwcGx5SW52ZXJzZSA9IGZ1bmN0aW9uIChwb3MsIG5ld1Bvcylcclxue1xyXG4gICAgbmV3UG9zID0gbmV3UG9zIHx8IG5ldyBQb2ludCgpO1xyXG5cclxuICAgIHZhciBpZCA9IDEgLyAodGhpcy5hICogdGhpcy5kICsgdGhpcy5jICogLXRoaXMuYik7XHJcblxyXG4gICAgdmFyIHggPSBwb3MueDtcclxuICAgIHZhciB5ID0gcG9zLnk7XHJcblxyXG4gICAgbmV3UG9zLnggPSB0aGlzLmQgKiBpZCAqIHggKyAtdGhpcy5jICogaWQgKiB5ICsgKHRoaXMudHkgKiB0aGlzLmMgLSB0aGlzLnR4ICogdGhpcy5kKSAqIGlkO1xyXG4gICAgbmV3UG9zLnkgPSB0aGlzLmEgKiBpZCAqIHkgKyAtdGhpcy5iICogaWQgKiB4ICsgKC10aGlzLnR5ICogdGhpcy5hICsgdGhpcy50eCAqIHRoaXMuYikgKiBpZDtcclxuXHJcbiAgICByZXR1cm4gbmV3UG9zO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFRyYW5zbGF0ZXMgdGhlIG1hdHJpeCBvbiB0aGUgeCBhbmQgeS5cclxuICpcclxuICogQHBhcmFtIHtudW1iZXJ9IHhcclxuICogQHBhcmFtIHtudW1iZXJ9IHlcclxuICogQHJldHVybiB7UElYSS5NYXRyaXh9IFRoaXMgbWF0cml4LiBHb29kIGZvciBjaGFpbmluZyBtZXRob2QgY2FsbHMuXHJcbiAqL1xyXG5NYXRyaXgucHJvdG90eXBlLnRyYW5zbGF0ZSA9IGZ1bmN0aW9uICh4LCB5KVxyXG57XHJcbiAgICB0aGlzLnR4ICs9IHg7XHJcbiAgICB0aGlzLnR5ICs9IHk7XHJcblxyXG4gICAgcmV0dXJuIHRoaXM7XHJcbn07XHJcblxyXG4vKipcclxuICogQXBwbGllcyBhIHNjYWxlIHRyYW5zZm9ybWF0aW9uIHRvIHRoZSBtYXRyaXguXHJcbiAqXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSB4IFRoZSBhbW91bnQgdG8gc2NhbGUgaG9yaXpvbnRhbGx5XHJcbiAqIEBwYXJhbSB7bnVtYmVyfSB5IFRoZSBhbW91bnQgdG8gc2NhbGUgdmVydGljYWxseVxyXG4gKiBAcmV0dXJuIHtQSVhJLk1hdHJpeH0gVGhpcyBtYXRyaXguIEdvb2QgZm9yIGNoYWluaW5nIG1ldGhvZCBjYWxscy5cclxuICovXHJcbk1hdHJpeC5wcm90b3R5cGUuc2NhbGUgPSBmdW5jdGlvbiAoeCwgeSlcclxue1xyXG4gICAgdGhpcy5hICo9IHg7XHJcbiAgICB0aGlzLmQgKj0geTtcclxuICAgIHRoaXMuYyAqPSB4O1xyXG4gICAgdGhpcy5iICo9IHk7XHJcbiAgICB0aGlzLnR4ICo9IHg7XHJcbiAgICB0aGlzLnR5ICo9IHk7XHJcblxyXG4gICAgcmV0dXJuIHRoaXM7XHJcbn07XHJcblxyXG5cclxuLyoqXHJcbiAqIEFwcGxpZXMgYSByb3RhdGlvbiB0cmFuc2Zvcm1hdGlvbiB0byB0aGUgbWF0cml4LlxyXG4gKlxyXG4gKiBAcGFyYW0ge251bWJlcn0gYW5nbGUgLSBUaGUgYW5nbGUgaW4gcmFkaWFucy5cclxuICogQHJldHVybiB7UElYSS5NYXRyaXh9IFRoaXMgbWF0cml4LiBHb29kIGZvciBjaGFpbmluZyBtZXRob2QgY2FsbHMuXHJcbiAqL1xyXG5NYXRyaXgucHJvdG90eXBlLnJvdGF0ZSA9IGZ1bmN0aW9uIChhbmdsZSlcclxue1xyXG4gICAgdmFyIGNvcyA9IE1hdGguY29zKCBhbmdsZSApO1xyXG4gICAgdmFyIHNpbiA9IE1hdGguc2luKCBhbmdsZSApO1xyXG5cclxuICAgIHZhciBhMSA9IHRoaXMuYTtcclxuICAgIHZhciBjMSA9IHRoaXMuYztcclxuICAgIHZhciB0eDEgPSB0aGlzLnR4O1xyXG5cclxuICAgIHRoaXMuYSA9IGExICogY29zLXRoaXMuYiAqIHNpbjtcclxuICAgIHRoaXMuYiA9IGExICogc2luK3RoaXMuYiAqIGNvcztcclxuICAgIHRoaXMuYyA9IGMxICogY29zLXRoaXMuZCAqIHNpbjtcclxuICAgIHRoaXMuZCA9IGMxICogc2luK3RoaXMuZCAqIGNvcztcclxuICAgIHRoaXMudHggPSB0eDEgKiBjb3MgLSB0aGlzLnR5ICogc2luO1xyXG4gICAgdGhpcy50eSA9IHR4MSAqIHNpbiArIHRoaXMudHkgKiBjb3M7XHJcblxyXG4gICAgcmV0dXJuIHRoaXM7XHJcbn07XHJcblxyXG4vKipcclxuICogQXBwZW5kcyB0aGUgZ2l2ZW4gTWF0cml4IHRvIHRoaXMgTWF0cml4LlxyXG4gKlxyXG4gKiBAcGFyYW0ge1BJWEkuTWF0cml4fSBtYXRyaXhcclxuICogQHJldHVybiB7UElYSS5NYXRyaXh9IFRoaXMgbWF0cml4LiBHb29kIGZvciBjaGFpbmluZyBtZXRob2QgY2FsbHMuXHJcbiAqL1xyXG5NYXRyaXgucHJvdG90eXBlLmFwcGVuZCA9IGZ1bmN0aW9uIChtYXRyaXgpXHJcbntcclxuICAgIHZhciBhMSA9IHRoaXMuYTtcclxuICAgIHZhciBiMSA9IHRoaXMuYjtcclxuICAgIHZhciBjMSA9IHRoaXMuYztcclxuICAgIHZhciBkMSA9IHRoaXMuZDtcclxuXHJcbiAgICB0aGlzLmEgID0gbWF0cml4LmEgKiBhMSArIG1hdHJpeC5iICogYzE7XHJcbiAgICB0aGlzLmIgID0gbWF0cml4LmEgKiBiMSArIG1hdHJpeC5iICogZDE7XHJcbiAgICB0aGlzLmMgID0gbWF0cml4LmMgKiBhMSArIG1hdHJpeC5kICogYzE7XHJcbiAgICB0aGlzLmQgID0gbWF0cml4LmMgKiBiMSArIG1hdHJpeC5kICogZDE7XHJcblxyXG4gICAgdGhpcy50eCA9IG1hdHJpeC50eCAqIGExICsgbWF0cml4LnR5ICogYzEgKyB0aGlzLnR4O1xyXG4gICAgdGhpcy50eSA9IG1hdHJpeC50eCAqIGIxICsgbWF0cml4LnR5ICogZDEgKyB0aGlzLnR5O1xyXG5cclxuICAgIHJldHVybiB0aGlzO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFByZXBlbmRzIHRoZSBnaXZlbiBNYXRyaXggdG8gdGhpcyBNYXRyaXguXHJcbiAqXHJcbiAqIEBwYXJhbSB7UElYSS5NYXRyaXh9IG1hdHJpeFxyXG4gKiBAcmV0dXJuIHtQSVhJLk1hdHJpeH0gVGhpcyBtYXRyaXguIEdvb2QgZm9yIGNoYWluaW5nIG1ldGhvZCBjYWxscy5cclxuICovXHJcbk1hdHJpeC5wcm90b3R5cGUucHJlcGVuZCA9IGZ1bmN0aW9uKG1hdHJpeClcclxue1xyXG4gICAgdmFyIHR4MSA9IHRoaXMudHg7XHJcblxyXG4gICAgaWYgKG1hdHJpeC5hICE9PSAxIHx8IG1hdHJpeC5iICE9PSAwIHx8IG1hdHJpeC5jICE9PSAwIHx8IG1hdHJpeC5kICE9PSAxKVxyXG4gICAge1xyXG4gICAgICAgIHZhciBhMSA9IHRoaXMuYTtcclxuICAgICAgICB2YXIgYzEgPSB0aGlzLmM7XHJcbiAgICAgICAgdGhpcy5hICA9IGExKm1hdHJpeC5hK3RoaXMuYiptYXRyaXguYztcclxuICAgICAgICB0aGlzLmIgID0gYTEqbWF0cml4LmIrdGhpcy5iKm1hdHJpeC5kO1xyXG4gICAgICAgIHRoaXMuYyAgPSBjMSptYXRyaXguYSt0aGlzLmQqbWF0cml4LmM7XHJcbiAgICAgICAgdGhpcy5kICA9IGMxKm1hdHJpeC5iK3RoaXMuZCptYXRyaXguZDtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLnR4ID0gdHgxKm1hdHJpeC5hK3RoaXMudHkqbWF0cml4LmMrbWF0cml4LnR4O1xyXG4gICAgdGhpcy50eSA9IHR4MSptYXRyaXguYit0aGlzLnR5Km1hdHJpeC5kK21hdHJpeC50eTtcclxuXHJcbiAgICByZXR1cm4gdGhpcztcclxufTtcclxuXHJcbi8qKlxyXG4gKiBJbnZlcnRzIHRoaXMgbWF0cml4XHJcbiAqXHJcbiAqIEByZXR1cm4ge1BJWEkuTWF0cml4fSBUaGlzIG1hdHJpeC4gR29vZCBmb3IgY2hhaW5pbmcgbWV0aG9kIGNhbGxzLlxyXG4gKi9cclxuTWF0cml4LnByb3RvdHlwZS5pbnZlcnQgPSBmdW5jdGlvbigpXHJcbntcclxuICAgIHZhciBhMSA9IHRoaXMuYTtcclxuICAgIHZhciBiMSA9IHRoaXMuYjtcclxuICAgIHZhciBjMSA9IHRoaXMuYztcclxuICAgIHZhciBkMSA9IHRoaXMuZDtcclxuICAgIHZhciB0eDEgPSB0aGlzLnR4O1xyXG4gICAgdmFyIG4gPSBhMSpkMS1iMSpjMTtcclxuXHJcbiAgICB0aGlzLmEgPSBkMS9uO1xyXG4gICAgdGhpcy5iID0gLWIxL247XHJcbiAgICB0aGlzLmMgPSAtYzEvbjtcclxuICAgIHRoaXMuZCA9IGExL247XHJcbiAgICB0aGlzLnR4ID0gKGMxKnRoaXMudHktZDEqdHgxKS9uO1xyXG4gICAgdGhpcy50eSA9IC0oYTEqdGhpcy50eS1iMSp0eDEpL247XHJcblxyXG4gICAgcmV0dXJuIHRoaXM7XHJcbn07XHJcblxyXG5cclxuLyoqXHJcbiAqIFJlc2V0cyB0aGlzIE1hdGl4IHRvIGFuIGlkZW50aXR5IChkZWZhdWx0KSBtYXRyaXguXHJcbiAqXHJcbiAqIEByZXR1cm4ge1BJWEkuTWF0cml4fSBUaGlzIG1hdHJpeC4gR29vZCBmb3IgY2hhaW5pbmcgbWV0aG9kIGNhbGxzLlxyXG4gKi9cclxuTWF0cml4LnByb3RvdHlwZS5pZGVudGl0eSA9IGZ1bmN0aW9uICgpXHJcbntcclxuICAgIHRoaXMuYSA9IDE7XHJcbiAgICB0aGlzLmIgPSAwO1xyXG4gICAgdGhpcy5jID0gMDtcclxuICAgIHRoaXMuZCA9IDE7XHJcbiAgICB0aGlzLnR4ID0gMDtcclxuICAgIHRoaXMudHkgPSAwO1xyXG5cclxuICAgIHJldHVybiB0aGlzO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIENyZWF0ZXMgYSBuZXcgTWF0cml4IG9iamVjdCB3aXRoIHRoZSBzYW1lIHZhbHVlcyBhcyB0aGlzIG9uZS5cclxuICpcclxuICogQHJldHVybiB7UElYSS5NYXRyaXh9IEEgY29weSBvZiB0aGlzIG1hdHJpeC4gR29vZCBmb3IgY2hhaW5pbmcgbWV0aG9kIGNhbGxzLlxyXG4gKi9cclxuTWF0cml4LnByb3RvdHlwZS5jbG9uZSA9IGZ1bmN0aW9uICgpXHJcbntcclxuICAgIHZhciBtYXRyaXggPSBuZXcgTWF0cml4KCk7XHJcbiAgICBtYXRyaXguYSA9IHRoaXMuYTtcclxuICAgIG1hdHJpeC5iID0gdGhpcy5iO1xyXG4gICAgbWF0cml4LmMgPSB0aGlzLmM7XHJcbiAgICBtYXRyaXguZCA9IHRoaXMuZDtcclxuICAgIG1hdHJpeC50eCA9IHRoaXMudHg7XHJcbiAgICBtYXRyaXgudHkgPSB0aGlzLnR5O1xyXG5cclxuICAgIHJldHVybiBtYXRyaXg7XHJcbn07XHJcblxyXG4vKipcclxuICogQ2hhbmdlcyB0aGUgdmFsdWVzIG9mIHRoZSBnaXZlbiBtYXRyaXggdG8gYmUgdGhlIHNhbWUgYXMgdGhlIG9uZXMgaW4gdGhpcyBtYXRyaXhcclxuICpcclxuICogQHJldHVybiB7UElYSS5NYXRyaXh9IFRoZSBtYXRyaXggZ2l2ZW4gaW4gcGFyYW1ldGVyIHdpdGggaXRzIHZhbHVlcyB1cGRhdGVkLlxyXG4gKi9cclxuTWF0cml4LnByb3RvdHlwZS5jb3B5ID0gZnVuY3Rpb24gKG1hdHJpeClcclxue1xyXG4gICAgbWF0cml4LmEgPSB0aGlzLmE7XHJcbiAgICBtYXRyaXguYiA9IHRoaXMuYjtcclxuICAgIG1hdHJpeC5jID0gdGhpcy5jO1xyXG4gICAgbWF0cml4LmQgPSB0aGlzLmQ7XHJcbiAgICBtYXRyaXgudHggPSB0aGlzLnR4O1xyXG4gICAgbWF0cml4LnR5ID0gdGhpcy50eTtcclxuXHJcbiAgICByZXR1cm4gbWF0cml4O1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEEgZGVmYXVsdCAoaWRlbnRpdHkpIG1hdHJpeFxyXG4gKlxyXG4gKiBAc3RhdGljXHJcbiAqIEBjb25zdFxyXG4gKi9cclxuTWF0cml4LklERU5USVRZID0gbmV3IE1hdHJpeCgpO1xyXG5cclxuLyoqXHJcbiAqIEEgdGVtcCBtYXRyaXhcclxuICpcclxuICogQHN0YXRpY1xyXG4gKiBAY29uc3RcclxuICovXHJcbk1hdHJpeC5URU1QX01BVFJJWCA9IG5ldyBNYXRyaXgoKTtcclxuIiwiLyoqXHJcbiAqIFRoZSBQb2ludCBvYmplY3QgcmVwcmVzZW50cyBhIGxvY2F0aW9uIGluIGEgdHdvLWRpbWVuc2lvbmFsIGNvb3JkaW5hdGUgc3lzdGVtLCB3aGVyZSB4IHJlcHJlc2VudHNcclxuICogdGhlIGhvcml6b250YWwgYXhpcyBhbmQgeSByZXByZXNlbnRzIHRoZSB2ZXJ0aWNhbCBheGlzLlxyXG4gKlxyXG4gKiBAY2xhc3NcclxuICogQG1lbWJlcm9mIFBJWElcclxuICogQHBhcmFtIFt4PTBdIHtudW1iZXJ9IHBvc2l0aW9uIG9mIHRoZSBwb2ludCBvbiB0aGUgeCBheGlzXHJcbiAqIEBwYXJhbSBbeT0wXSB7bnVtYmVyfSBwb3NpdGlvbiBvZiB0aGUgcG9pbnQgb24gdGhlIHkgYXhpc1xyXG4gKi9cclxuZnVuY3Rpb24gUG9pbnQoeCwgeSlcclxue1xyXG4gICAgLyoqXHJcbiAgICAgKiBAbWVtYmVyIHtudW1iZXJ9XHJcbiAgICAgKiBAZGVmYXVsdCAwXHJcbiAgICAgKi9cclxuICAgIHRoaXMueCA9IHggfHwgMDtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEBtZW1iZXIge251bWJlcn1cclxuICAgICAqIEBkZWZhdWx0IDBcclxuICAgICAqL1xyXG4gICAgdGhpcy55ID0geSB8fCAwO1xyXG59XHJcblxyXG5Qb2ludC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBQb2ludDtcclxubW9kdWxlLmV4cG9ydHMgPSBQb2ludDtcclxuXHJcbi8qKlxyXG4gKiBDcmVhdGVzIGEgY2xvbmUgb2YgdGhpcyBwb2ludFxyXG4gKlxyXG4gKiBAcmV0dXJuIHtQSVhJLlBvaW50fSBhIGNvcHkgb2YgdGhlIHBvaW50XHJcbiAqL1xyXG5Qb2ludC5wcm90b3R5cGUuY2xvbmUgPSBmdW5jdGlvbiAoKVxyXG57XHJcbiAgICByZXR1cm4gbmV3IFBvaW50KHRoaXMueCwgdGhpcy55KTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBDb3BpZXMgeCBhbmQgeSBmcm9tIHRoZSBnaXZlbiBwb2ludFxyXG4gKlxyXG4gKiBAcGFyYW0gcCB7UElYSS5Qb2ludH1cclxuICovXHJcblBvaW50LnByb3RvdHlwZS5jb3B5ID0gZnVuY3Rpb24gKHApIHtcclxuICAgIHRoaXMuc2V0KHAueCwgcC55KTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBSZXR1cm5zIHRydWUgaWYgdGhlIGdpdmVuIHBvaW50IGlzIGVxdWFsIHRvIHRoaXMgcG9pbnRcclxuICpcclxuICogQHBhcmFtIHAge1BJWEkuUG9pbnR9XHJcbiAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gKi9cclxuUG9pbnQucHJvdG90eXBlLmVxdWFscyA9IGZ1bmN0aW9uIChwKSB7XHJcbiAgICByZXR1cm4gKHAueCA9PT0gdGhpcy54KSAmJiAocC55ID09PSB0aGlzLnkpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFNldHMgdGhlIHBvaW50IHRvIGEgbmV3IHggYW5kIHkgcG9zaXRpb24uXHJcbiAqIElmIHkgaXMgb21pdHRlZCwgYm90aCB4IGFuZCB5IHdpbGwgYmUgc2V0IHRvIHguXHJcbiAqXHJcbiAqIEBwYXJhbSBbeD0wXSB7bnVtYmVyfSBwb3NpdGlvbiBvZiB0aGUgcG9pbnQgb24gdGhlIHggYXhpc1xyXG4gKiBAcGFyYW0gW3k9MF0ge251bWJlcn0gcG9zaXRpb24gb2YgdGhlIHBvaW50IG9uIHRoZSB5IGF4aXNcclxuICovXHJcblBvaW50LnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbiAoeCwgeSlcclxue1xyXG4gICAgdGhpcy54ID0geCB8fCAwO1xyXG4gICAgdGhpcy55ID0geSB8fCAoICh5ICE9PSAwKSA/IHRoaXMueCA6IDAgKSA7XHJcbn07XHJcbiIsIi8qKlxyXG4gKiBNYXRoIGNsYXNzZXMgYW5kIHV0aWxpdGllcyBtaXhlZCBpbnRvIFBJWEkgbmFtZXNwYWNlLlxyXG4gKlxyXG4gKiBAbGVuZHMgUElYSVxyXG4gKi9cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgICAvLyBUaGVzZSB3aWxsIGJlIG1peGVkIHRvIGJlIG1hZGUgcHVibGljbHkgYXZhaWxhYmxlLFxyXG4gICAgLy8gd2hpbGUgdGhpcyBtb2R1bGUgaXMgdXNlZCBpbnRlcm5hbGx5IGluIGNvcmVcclxuICAgIC8vIHRvIGF2b2lkIGNpcmN1bGFyIGRlcGVuZGVuY2llcyBhbmQgY3V0IGRvd24gb25cclxuICAgIC8vIGludGVybmFsIG1vZHVsZSByZXF1aXJlcy5cclxuXHJcbiAgICBQb2ludDogICAgICByZXF1aXJlKCcuL1BvaW50JyksXHJcbiAgICBNYXRyaXg6ICAgICByZXF1aXJlKCcuL01hdHJpeCcpLFxyXG5cclxuICAgIENpcmNsZTogICAgIHJlcXVpcmUoJy4vc2hhcGVzL0NpcmNsZScpLFxyXG4gICAgRWxsaXBzZTogICAgcmVxdWlyZSgnLi9zaGFwZXMvRWxsaXBzZScpLFxyXG4gICAgUG9seWdvbjogICAgcmVxdWlyZSgnLi9zaGFwZXMvUG9seWdvbicpLFxyXG4gICAgUmVjdGFuZ2xlOiAgcmVxdWlyZSgnLi9zaGFwZXMvUmVjdGFuZ2xlJyksXHJcbiAgICBSb3VuZGVkUmVjdGFuZ2xlOiByZXF1aXJlKCcuL3NoYXBlcy9Sb3VuZGVkUmVjdGFuZ2xlJylcclxufTtcclxuIiwidmFyIFJlY3RhbmdsZSA9IHJlcXVpcmUoJy4vUmVjdGFuZ2xlJyksXHJcbiAgICBDT05TVCA9IHJlcXVpcmUoJy4uLy4uL2NvbnN0Jyk7XHJcblxyXG4vKipcclxuICogVGhlIENpcmNsZSBvYmplY3QgY2FuIGJlIHVzZWQgdG8gc3BlY2lmeSBhIGhpdCBhcmVhIGZvciBkaXNwbGF5T2JqZWN0c1xyXG4gKlxyXG4gKiBAY2xhc3NcclxuICogQG1lbWJlcm9mIFBJWElcclxuICogQHBhcmFtIHgge251bWJlcn0gVGhlIFggY29vcmRpbmF0ZSBvZiB0aGUgY2VudGVyIG9mIHRoaXMgY2lyY2xlXHJcbiAqIEBwYXJhbSB5IHtudW1iZXJ9IFRoZSBZIGNvb3JkaW5hdGUgb2YgdGhlIGNlbnRlciBvZiB0aGlzIGNpcmNsZVxyXG4gKiBAcGFyYW0gcmFkaXVzIHtudW1iZXJ9IFRoZSByYWRpdXMgb2YgdGhlIGNpcmNsZVxyXG4gKi9cclxuZnVuY3Rpb24gQ2lyY2xlKHgsIHksIHJhZGl1cylcclxue1xyXG4gICAgLyoqXHJcbiAgICAgKiBAbWVtYmVyIHtudW1iZXJ9XHJcbiAgICAgKiBAZGVmYXVsdCAwXHJcbiAgICAgKi9cclxuICAgIHRoaXMueCA9IHggfHwgMDtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEBtZW1iZXIge251bWJlcn1cclxuICAgICAqIEBkZWZhdWx0IDBcclxuICAgICAqL1xyXG4gICAgdGhpcy55ID0geSB8fCAwO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogQG1lbWJlciB7bnVtYmVyfVxyXG4gICAgICogQGRlZmF1bHQgMFxyXG4gICAgICovXHJcbiAgICB0aGlzLnJhZGl1cyA9IHJhZGl1cyB8fCAwO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogVGhlIHR5cGUgb2YgdGhlIG9iamVjdCwgbWFpbmx5IHVzZWQgdG8gYXZvaWQgYGluc3RhbmNlb2ZgIGNoZWNrc1xyXG4gICAgICpcclxuICAgICAqIEBtZW1iZXIge251bWJlcn1cclxuICAgICAqL1xyXG4gICAgdGhpcy50eXBlID0gQ09OU1QuU0hBUEVTLkNJUkM7XHJcbn1cclxuXHJcbkNpcmNsZS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBDaXJjbGU7XHJcbm1vZHVsZS5leHBvcnRzID0gQ2lyY2xlO1xyXG5cclxuLyoqXHJcbiAqIENyZWF0ZXMgYSBjbG9uZSBvZiB0aGlzIENpcmNsZSBpbnN0YW5jZVxyXG4gKlxyXG4gKiBAcmV0dXJuIHtQSVhJLkNpcmNsZX0gYSBjb3B5IG9mIHRoZSBDaXJjbGVcclxuICovXHJcbkNpcmNsZS5wcm90b3R5cGUuY2xvbmUgPSBmdW5jdGlvbiAoKVxyXG57XHJcbiAgICByZXR1cm4gbmV3IENpcmNsZSh0aGlzLngsIHRoaXMueSwgdGhpcy5yYWRpdXMpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIENoZWNrcyB3aGV0aGVyIHRoZSB4IGFuZCB5IGNvb3JkaW5hdGVzIGdpdmVuIGFyZSBjb250YWluZWQgd2l0aGluIHRoaXMgY2lyY2xlXHJcbiAqXHJcbiAqIEBwYXJhbSB4IHtudW1iZXJ9IFRoZSBYIGNvb3JkaW5hdGUgb2YgdGhlIHBvaW50IHRvIHRlc3RcclxuICogQHBhcmFtIHkge251bWJlcn0gVGhlIFkgY29vcmRpbmF0ZSBvZiB0aGUgcG9pbnQgdG8gdGVzdFxyXG4gKiBAcmV0dXJuIHtib29sZWFufSBXaGV0aGVyIHRoZSB4L3kgY29vcmRpbmF0ZXMgYXJlIHdpdGhpbiB0aGlzIENpcmNsZVxyXG4gKi9cclxuQ2lyY2xlLnByb3RvdHlwZS5jb250YWlucyA9IGZ1bmN0aW9uICh4LCB5KVxyXG57XHJcbiAgICBpZiAodGhpcy5yYWRpdXMgPD0gMClcclxuICAgIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGR4ID0gKHRoaXMueCAtIHgpLFxyXG4gICAgICAgIGR5ID0gKHRoaXMueSAtIHkpLFxyXG4gICAgICAgIHIyID0gdGhpcy5yYWRpdXMgKiB0aGlzLnJhZGl1cztcclxuXHJcbiAgICBkeCAqPSBkeDtcclxuICAgIGR5ICo9IGR5O1xyXG5cclxuICAgIHJldHVybiAoZHggKyBkeSA8PSByMik7XHJcbn07XHJcblxyXG4vKipcclxuKiBSZXR1cm5zIHRoZSBmcmFtaW5nIHJlY3RhbmdsZSBvZiB0aGUgY2lyY2xlIGFzIGEgUmVjdGFuZ2xlIG9iamVjdFxyXG4qXHJcbiogQHJldHVybiB7UElYSS5SZWN0YW5nbGV9IHRoZSBmcmFtaW5nIHJlY3RhbmdsZVxyXG4qL1xyXG5DaXJjbGUucHJvdG90eXBlLmdldEJvdW5kcyA9IGZ1bmN0aW9uICgpXHJcbntcclxuICAgIHJldHVybiBuZXcgUmVjdGFuZ2xlKHRoaXMueCAtIHRoaXMucmFkaXVzLCB0aGlzLnkgLSB0aGlzLnJhZGl1cywgdGhpcy5yYWRpdXMgKiAyLCB0aGlzLnJhZGl1cyAqIDIpO1xyXG59O1xyXG4iLCJ2YXIgUG9pbnQgPSByZXF1aXJlKCcuLi9Qb2ludCcpLFxyXG4gICAgQ09OU1QgPSByZXF1aXJlKCcuLi8uLi9jb25zdCcpO1xyXG5cclxuLyoqXHJcbiAqIEBjbGFzc1xyXG4gKiBAbWVtYmVyb2YgUElYSVxyXG4gKiBAcGFyYW0gcG9pbnRzIHtQSVhJLlBvaW50W118bnVtYmVyW118Li4uUElYSS5Qb2ludHwuLi5udW1iZXJ9IFRoaXMgY2FuIGJlIGFuIGFycmF5IG9mIFBvaW50cyB0aGF0IGZvcm0gdGhlIHBvbHlnb24sXHJcbiAqICAgICAgYSBmbGF0IGFycmF5IG9mIG51bWJlcnMgdGhhdCB3aWxsIGJlIGludGVycHJldGVkIGFzIFt4LHksIHgseSwgLi4uXSwgb3IgdGhlIGFyZ3VtZW50cyBwYXNzZWQgY2FuIGJlXHJcbiAqICAgICAgYWxsIHRoZSBwb2ludHMgb2YgdGhlIHBvbHlnb24gZS5nLiBgbmV3IFBJWEkuUG9seWdvbihuZXcgUElYSS5Qb2ludCgpLCBuZXcgUElYSS5Qb2ludCgpLCAuLi4pYCwgb3IgdGhlXHJcbiAqICAgICAgYXJndW1lbnRzIHBhc3NlZCBjYW4gYmUgZmxhdCB4LHkgdmFsdWVzIGUuZy4gYG5ldyBQb2x5Z29uKHgseSwgeCx5LCB4LHksIC4uLilgIHdoZXJlIGB4YCBhbmQgYHlgIGFyZVxyXG4gKiAgICAgIE51bWJlcnMuXHJcbiAqL1xyXG5mdW5jdGlvbiBQb2x5Z29uKHBvaW50c18pXHJcbntcclxuICAgIC8vIHByZXZlbnRzIGFuIGFyZ3VtZW50IGFzc2lnbm1lbnQgZGVvcHRcclxuICAgIC8vIHNlZSBzZWN0aW9uIDMuMTogaHR0cHM6Ly9naXRodWIuY29tL3BldGthYW50b25vdi9ibHVlYmlyZC93aWtpL09wdGltaXphdGlvbi1raWxsZXJzIzMtbWFuYWdpbmctYXJndW1lbnRzXHJcbiAgICB2YXIgcG9pbnRzID0gcG9pbnRzXztcclxuXHJcbiAgICAvL2lmIHBvaW50cyBpc24ndCBhbiBhcnJheSwgdXNlIGFyZ3VtZW50cyBhcyB0aGUgYXJyYXlcclxuICAgIGlmICghQXJyYXkuaXNBcnJheShwb2ludHMpKVxyXG4gICAge1xyXG4gICAgICAgIC8vIHByZXZlbnRzIGFuIGFyZ3VtZW50IGxlYWsgZGVvcHRcclxuICAgICAgICAvLyBzZWUgc2VjdGlvbiAzLjI6IGh0dHBzOi8vZ2l0aHViLmNvbS9wZXRrYWFudG9ub3YvYmx1ZWJpcmQvd2lraS9PcHRpbWl6YXRpb24ta2lsbGVycyMzLW1hbmFnaW5nLWFyZ3VtZW50c1xyXG4gICAgICAgIHBvaW50cyA9IG5ldyBBcnJheShhcmd1bWVudHMubGVuZ3RoKTtcclxuXHJcbiAgICAgICAgZm9yICh2YXIgYSA9IDA7IGEgPCBwb2ludHMubGVuZ3RoOyArK2EpIHtcclxuICAgICAgICAgICAgcG9pbnRzW2FdID0gYXJndW1lbnRzW2FdO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBpZiB0aGlzIGlzIGFuIGFycmF5IG9mIHBvaW50cywgY29udmVydCBpdCB0byBhIGZsYXQgYXJyYXkgb2YgbnVtYmVyc1xyXG4gICAgaWYgKHBvaW50c1swXSBpbnN0YW5jZW9mIFBvaW50KVxyXG4gICAge1xyXG4gICAgICAgIHZhciBwID0gW107XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGlsID0gcG9pbnRzLmxlbmd0aDsgaSA8IGlsOyBpKyspXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBwLnB1c2gocG9pbnRzW2ldLngsIHBvaW50c1tpXS55KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHBvaW50cyA9IHA7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5jbG9zZWQgPSB0cnVlO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogQW4gYXJyYXkgb2YgdGhlIHBvaW50cyBvZiB0aGlzIHBvbHlnb25cclxuICAgICAqXHJcbiAgICAgKiBAbWVtYmVyIHtudW1iZXJbXX1cclxuICAgICAqL1xyXG4gICAgdGhpcy5wb2ludHMgPSBwb2ludHM7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgdHlwZSBvZiB0aGUgb2JqZWN0LCBtYWlubHkgdXNlZCB0byBhdm9pZCBgaW5zdGFuY2VvZmAgY2hlY2tzXHJcbiAgICAgKlxyXG4gICAgICogQG1lbWJlciB7bnVtYmVyfVxyXG4gICAgICovXHJcbiAgICB0aGlzLnR5cGUgPSBDT05TVC5TSEFQRVMuUE9MWTtcclxufVxyXG5cclxuUG9seWdvbi5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBQb2x5Z29uO1xyXG5tb2R1bGUuZXhwb3J0cyA9IFBvbHlnb247XHJcblxyXG4vKipcclxuICogQ3JlYXRlcyBhIGNsb25lIG9mIHRoaXMgcG9seWdvblxyXG4gKlxyXG4gKiBAcmV0dXJuIHtQSVhJLlBvbHlnb259IGEgY29weSBvZiB0aGUgcG9seWdvblxyXG4gKi9cclxuUG9seWdvbi5wcm90b3R5cGUuY2xvbmUgPSBmdW5jdGlvbiAoKVxyXG57XHJcbiAgICByZXR1cm4gbmV3IFBvbHlnb24odGhpcy5wb2ludHMuc2xpY2UoKSk7XHJcbn07XHJcblxyXG4vKipcclxuICogQ2hlY2tzIHdoZXRoZXIgdGhlIHggYW5kIHkgY29vcmRpbmF0ZXMgcGFzc2VkIHRvIHRoaXMgZnVuY3Rpb24gYXJlIGNvbnRhaW5lZCB3aXRoaW4gdGhpcyBwb2x5Z29uXHJcbiAqXHJcbiAqIEBwYXJhbSB4IHtudW1iZXJ9IFRoZSBYIGNvb3JkaW5hdGUgb2YgdGhlIHBvaW50IHRvIHRlc3RcclxuICogQHBhcmFtIHkge251bWJlcn0gVGhlIFkgY29vcmRpbmF0ZSBvZiB0aGUgcG9pbnQgdG8gdGVzdFxyXG4gKiBAcmV0dXJuIHtib29sZWFufSBXaGV0aGVyIHRoZSB4L3kgY29vcmRpbmF0ZXMgYXJlIHdpdGhpbiB0aGlzIHBvbHlnb25cclxuICovXHJcblBvbHlnb24ucHJvdG90eXBlLmNvbnRhaW5zID0gZnVuY3Rpb24gKHgsIHkpXHJcbntcclxuICAgIHZhciBpbnNpZGUgPSBmYWxzZTtcclxuXHJcbiAgICAvLyB1c2Ugc29tZSByYXljYXN0aW5nIHRvIHRlc3QgaGl0c1xyXG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL3N1YnN0YWNrL3BvaW50LWluLXBvbHlnb24vYmxvYi9tYXN0ZXIvaW5kZXguanNcclxuICAgIHZhciBsZW5ndGggPSB0aGlzLnBvaW50cy5sZW5ndGggLyAyO1xyXG5cclxuICAgIGZvciAodmFyIGkgPSAwLCBqID0gbGVuZ3RoIC0gMTsgaSA8IGxlbmd0aDsgaiA9IGkrKylcclxuICAgIHtcclxuICAgICAgICB2YXIgeGkgPSB0aGlzLnBvaW50c1tpICogMl0sIHlpID0gdGhpcy5wb2ludHNbaSAqIDIgKyAxXSxcclxuICAgICAgICAgICAgeGogPSB0aGlzLnBvaW50c1tqICogMl0sIHlqID0gdGhpcy5wb2ludHNbaiAqIDIgKyAxXSxcclxuICAgICAgICAgICAgaW50ZXJzZWN0ID0gKCh5aSA+IHkpICE9PSAoeWogPiB5KSkgJiYgKHggPCAoeGogLSB4aSkgKiAoeSAtIHlpKSAvICh5aiAtIHlpKSArIHhpKTtcclxuXHJcbiAgICAgICAgaWYgKGludGVyc2VjdClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGluc2lkZSA9ICFpbnNpZGU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBpbnNpZGU7XHJcbn07XHJcbiIsInZhciBDT05TVCA9IHJlcXVpcmUoJy4uLy4uL2NvbnN0Jyk7XHJcblxyXG4vKipcclxuICogdGhlIFJlY3RhbmdsZSBvYmplY3QgaXMgYW4gYXJlYSBkZWZpbmVkIGJ5IGl0cyBwb3NpdGlvbiwgYXMgaW5kaWNhdGVkIGJ5IGl0cyB0b3AtbGVmdCBjb3JuZXIgcG9pbnQgKHgsIHkpIGFuZCBieSBpdHMgd2lkdGggYW5kIGl0cyBoZWlnaHQuXHJcbiAqXHJcbiAqIEBjbGFzc1xyXG4gKiBAbWVtYmVyb2YgUElYSVxyXG4gKiBAcGFyYW0geCB7bnVtYmVyfSBUaGUgWCBjb29yZGluYXRlIG9mIHRoZSB1cHBlci1sZWZ0IGNvcm5lciBvZiB0aGUgcmVjdGFuZ2xlXHJcbiAqIEBwYXJhbSB5IHtudW1iZXJ9IFRoZSBZIGNvb3JkaW5hdGUgb2YgdGhlIHVwcGVyLWxlZnQgY29ybmVyIG9mIHRoZSByZWN0YW5nbGVcclxuICogQHBhcmFtIHdpZHRoIHtudW1iZXJ9IFRoZSBvdmVyYWxsIHdpZHRoIG9mIHRoaXMgcmVjdGFuZ2xlXHJcbiAqIEBwYXJhbSBoZWlnaHQge251bWJlcn0gVGhlIG92ZXJhbGwgaGVpZ2h0IG9mIHRoaXMgcmVjdGFuZ2xlXHJcbiAqL1xyXG5mdW5jdGlvbiBSZWN0YW5nbGUoeCwgeSwgd2lkdGgsIGhlaWdodClcclxue1xyXG4gICAgLyoqXHJcbiAgICAgKiBAbWVtYmVyIHtudW1iZXJ9XHJcbiAgICAgKiBAZGVmYXVsdCAwXHJcbiAgICAgKi9cclxuICAgIHRoaXMueCA9IHggfHwgMDtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEBtZW1iZXIge251bWJlcn1cclxuICAgICAqIEBkZWZhdWx0IDBcclxuICAgICAqL1xyXG4gICAgdGhpcy55ID0geSB8fCAwO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogQG1lbWJlciB7bnVtYmVyfVxyXG4gICAgICogQGRlZmF1bHQgMFxyXG4gICAgICovXHJcbiAgICB0aGlzLndpZHRoID0gd2lkdGggfHwgMDtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEBtZW1iZXIge251bWJlcn1cclxuICAgICAqIEBkZWZhdWx0IDBcclxuICAgICAqL1xyXG4gICAgdGhpcy5oZWlnaHQgPSBoZWlnaHQgfHwgMDtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFRoZSB0eXBlIG9mIHRoZSBvYmplY3QsIG1haW5seSB1c2VkIHRvIGF2b2lkIGBpbnN0YW5jZW9mYCBjaGVja3NcclxuICAgICAqXHJcbiAgICAgKiBAbWVtYmVyIHtudW1iZXJ9XHJcbiAgICAgKi9cclxuICAgIHRoaXMudHlwZSA9IENPTlNULlNIQVBFUy5SRUNUO1xyXG59XHJcblxyXG5SZWN0YW5nbGUucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gUmVjdGFuZ2xlO1xyXG5tb2R1bGUuZXhwb3J0cyA9IFJlY3RhbmdsZTtcclxuXHJcbi8qKlxyXG4gKiBBIGNvbnN0YW50IGVtcHR5IHJlY3RhbmdsZS5cclxuICpcclxuICogQHN0YXRpY1xyXG4gKiBAY29uc3RhbnRcclxuICovXHJcblJlY3RhbmdsZS5FTVBUWSA9IG5ldyBSZWN0YW5nbGUoMCwgMCwgMCwgMCk7XHJcblxyXG5cclxuLyoqXHJcbiAqIENyZWF0ZXMgYSBjbG9uZSBvZiB0aGlzIFJlY3RhbmdsZVxyXG4gKlxyXG4gKiBAcmV0dXJuIHtQSVhJLlJlY3RhbmdsZX0gYSBjb3B5IG9mIHRoZSByZWN0YW5nbGVcclxuICovXHJcblJlY3RhbmdsZS5wcm90b3R5cGUuY2xvbmUgPSBmdW5jdGlvbiAoKVxyXG57XHJcbiAgICByZXR1cm4gbmV3IFJlY3RhbmdsZSh0aGlzLngsIHRoaXMueSwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIENoZWNrcyB3aGV0aGVyIHRoZSB4IGFuZCB5IGNvb3JkaW5hdGVzIGdpdmVuIGFyZSBjb250YWluZWQgd2l0aGluIHRoaXMgUmVjdGFuZ2xlXHJcbiAqXHJcbiAqIEBwYXJhbSB4IHtudW1iZXJ9IFRoZSBYIGNvb3JkaW5hdGUgb2YgdGhlIHBvaW50IHRvIHRlc3RcclxuICogQHBhcmFtIHkge251bWJlcn0gVGhlIFkgY29vcmRpbmF0ZSBvZiB0aGUgcG9pbnQgdG8gdGVzdFxyXG4gKiBAcmV0dXJuIHtib29sZWFufSBXaGV0aGVyIHRoZSB4L3kgY29vcmRpbmF0ZXMgYXJlIHdpdGhpbiB0aGlzIFJlY3RhbmdsZVxyXG4gKi9cclxuUmVjdGFuZ2xlLnByb3RvdHlwZS5jb250YWlucyA9IGZ1bmN0aW9uICh4LCB5KVxyXG57XHJcbiAgICBpZiAodGhpcy53aWR0aCA8PSAwIHx8IHRoaXMuaGVpZ2h0IDw9IDApXHJcbiAgICB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh4ID49IHRoaXMueCAmJiB4IDwgdGhpcy54ICsgdGhpcy53aWR0aClcclxuICAgIHtcclxuICAgICAgICBpZiAoeSA+PSB0aGlzLnkgJiYgeSA8IHRoaXMueSArIHRoaXMuaGVpZ2h0KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBmYWxzZTtcclxufTtcclxuIiwidmFyIENPTlNUID0gcmVxdWlyZSgnLi4vLi4vY29uc3QnKTtcclxuXHJcbi8qKlxyXG4gKiBUaGUgUm91bmRlZCBSZWN0YW5nbGUgb2JqZWN0IGlzIGFuIGFyZWEgdGhhdCBoYXMgbmljZSByb3VuZGVkIGNvcm5lcnMsIGFzIGluZGljYXRlZCBieSBpdHMgdG9wLWxlZnQgY29ybmVyIHBvaW50ICh4LCB5KSBhbmQgYnkgaXRzIHdpZHRoIGFuZCBpdHMgaGVpZ2h0IGFuZCBpdHMgcmFkaXVzLlxyXG4gKlxyXG4gKiBAY2xhc3NcclxuICogQG1lbWJlcm9mIFBJWElcclxuICogQHBhcmFtIHgge251bWJlcn0gVGhlIFggY29vcmRpbmF0ZSBvZiB0aGUgdXBwZXItbGVmdCBjb3JuZXIgb2YgdGhlIHJvdW5kZWQgcmVjdGFuZ2xlXHJcbiAqIEBwYXJhbSB5IHtudW1iZXJ9IFRoZSBZIGNvb3JkaW5hdGUgb2YgdGhlIHVwcGVyLWxlZnQgY29ybmVyIG9mIHRoZSByb3VuZGVkIHJlY3RhbmdsZVxyXG4gKiBAcGFyYW0gd2lkdGgge251bWJlcn0gVGhlIG92ZXJhbGwgd2lkdGggb2YgdGhpcyByb3VuZGVkIHJlY3RhbmdsZVxyXG4gKiBAcGFyYW0gaGVpZ2h0IHtudW1iZXJ9IFRoZSBvdmVyYWxsIGhlaWdodCBvZiB0aGlzIHJvdW5kZWQgcmVjdGFuZ2xlXHJcbiAqIEBwYXJhbSByYWRpdXMge251bWJlcn0gQ29udHJvbHMgdGhlIHJhZGl1cyBvZiB0aGUgcm91bmRlZCBjb3JuZXJzXHJcbiAqL1xyXG5mdW5jdGlvbiBSb3VuZGVkUmVjdGFuZ2xlKHgsIHksIHdpZHRoLCBoZWlnaHQsIHJhZGl1cylcclxue1xyXG4gICAgLyoqXHJcbiAgICAgKiBAbWVtYmVyIHtudW1iZXJ9XHJcbiAgICAgKiBAZGVmYXVsdCAwXHJcbiAgICAgKi9cclxuICAgIHRoaXMueCA9IHggfHwgMDtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEBtZW1iZXIge251bWJlcn1cclxuICAgICAqIEBkZWZhdWx0IDBcclxuICAgICAqL1xyXG4gICAgdGhpcy55ID0geSB8fCAwO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogQG1lbWJlciB7bnVtYmVyfVxyXG4gICAgICogQGRlZmF1bHQgMFxyXG4gICAgICovXHJcbiAgICB0aGlzLndpZHRoID0gd2lkdGggfHwgMDtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEBtZW1iZXIge251bWJlcn1cclxuICAgICAqIEBkZWZhdWx0IDBcclxuICAgICAqL1xyXG4gICAgdGhpcy5oZWlnaHQgPSBoZWlnaHQgfHwgMDtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEBtZW1iZXIge251bWJlcn1cclxuICAgICAqIEBkZWZhdWx0IDIwXHJcbiAgICAgKi9cclxuICAgIHRoaXMucmFkaXVzID0gcmFkaXVzIHx8IDIwO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogVGhlIHR5cGUgb2YgdGhlIG9iamVjdCwgbWFpbmx5IHVzZWQgdG8gYXZvaWQgYGluc3RhbmNlb2ZgIGNoZWNrc1xyXG4gICAgICpcclxuICAgICAqIEBtZW1iZXIge251bWJlcn1cclxuICAgICAqL1xyXG4gICAgdGhpcy50eXBlID0gQ09OU1QuU0hBUEVTLlJSRUM7XHJcbn1cclxuXHJcblJvdW5kZWRSZWN0YW5nbGUucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gUm91bmRlZFJlY3RhbmdsZTtcclxubW9kdWxlLmV4cG9ydHMgPSBSb3VuZGVkUmVjdGFuZ2xlO1xyXG5cclxuLyoqXHJcbiAqIENyZWF0ZXMgYSBjbG9uZSBvZiB0aGlzIFJvdW5kZWQgUmVjdGFuZ2xlXHJcbiAqXHJcbiAqIEByZXR1cm4ge1BJWEkuUm91bmRlZFJlY3RhbmdsZX0gYSBjb3B5IG9mIHRoZSByb3VuZGVkIHJlY3RhbmdsZVxyXG4gKi9cclxuUm91bmRlZFJlY3RhbmdsZS5wcm90b3R5cGUuY2xvbmUgPSBmdW5jdGlvbiAoKVxyXG57XHJcbiAgICByZXR1cm4gbmV3IFJvdW5kZWRSZWN0YW5nbGUodGhpcy54LCB0aGlzLnksIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0LCB0aGlzLnJhZGl1cyk7XHJcbn07XHJcblxyXG4vKipcclxuICogQ2hlY2tzIHdoZXRoZXIgdGhlIHggYW5kIHkgY29vcmRpbmF0ZXMgZ2l2ZW4gYXJlIGNvbnRhaW5lZCB3aXRoaW4gdGhpcyBSb3VuZGVkIFJlY3RhbmdsZVxyXG4gKlxyXG4gKiBAcGFyYW0geCB7bnVtYmVyfSBUaGUgWCBjb29yZGluYXRlIG9mIHRoZSBwb2ludCB0byB0ZXN0XHJcbiAqIEBwYXJhbSB5IHtudW1iZXJ9IFRoZSBZIGNvb3JkaW5hdGUgb2YgdGhlIHBvaW50IHRvIHRlc3RcclxuICogQHJldHVybiB7Ym9vbGVhbn0gV2hldGhlciB0aGUgeC95IGNvb3JkaW5hdGVzIGFyZSB3aXRoaW4gdGhpcyBSb3VuZGVkIFJlY3RhbmdsZVxyXG4gKi9cclxuUm91bmRlZFJlY3RhbmdsZS5wcm90b3R5cGUuY29udGFpbnMgPSBmdW5jdGlvbiAoeCwgeSlcclxue1xyXG4gICAgaWYgKHRoaXMud2lkdGggPD0gMCB8fCB0aGlzLmhlaWdodCA8PSAwKVxyXG4gICAge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoeCA+PSB0aGlzLnggJiYgeCA8PSB0aGlzLnggKyB0aGlzLndpZHRoKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh5ID49IHRoaXMueSAmJiB5IDw9IHRoaXMueSArIHRoaXMuaGVpZ2h0KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBmYWxzZTtcclxufTtcclxuIiwidmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKSxcclxuICAgIG1hdGggPSByZXF1aXJlKCcuLi9tYXRoJyksXHJcbiAgICBDT05TVCA9IHJlcXVpcmUoJy4uL2NvbnN0JyksXHJcbiAgICBFdmVudEVtaXR0ZXIgPSByZXF1aXJlKCdldmVudGVtaXR0ZXIzJyk7XHJcblxyXG4vKipcclxuICogVGhlIENhbnZhc1JlbmRlcmVyIGRyYXdzIHRoZSBzY2VuZSBhbmQgYWxsIGl0cyBjb250ZW50IG9udG8gYSAyZCBjYW52YXMuIFRoaXMgcmVuZGVyZXIgc2hvdWxkIGJlIHVzZWQgZm9yIGJyb3dzZXJzIHRoYXQgZG8gbm90IHN1cHBvcnQgd2ViR0wuXHJcbiAqIERvbid0IGZvcmdldCB0byBhZGQgdGhlIENhbnZhc1JlbmRlcmVyLnZpZXcgdG8geW91ciBET00gb3IgeW91IHdpbGwgbm90IHNlZSBhbnl0aGluZyA6KVxyXG4gKlxyXG4gKiBAY2xhc3NcclxuICogQG1lbWJlcm9mIFBJWElcclxuICogQHBhcmFtIHN5c3RlbSB7c3RyaW5nfSBUaGUgbmFtZSBvZiB0aGUgc3lzdGVtIHRoaXMgcmVuZGVyZXIgaXMgZm9yLlxyXG4gKiBAcGFyYW0gW3dpZHRoPTgwMF0ge251bWJlcn0gdGhlIHdpZHRoIG9mIHRoZSBjYW52YXMgdmlld1xyXG4gKiBAcGFyYW0gW2hlaWdodD02MDBdIHtudW1iZXJ9IHRoZSBoZWlnaHQgb2YgdGhlIGNhbnZhcyB2aWV3XHJcbiAqIEBwYXJhbSBbb3B0aW9uc10ge29iamVjdH0gVGhlIG9wdGlvbmFsIHJlbmRlcmVyIHBhcmFtZXRlcnNcclxuICogQHBhcmFtIFtvcHRpb25zLnZpZXddIHtIVE1MQ2FudmFzRWxlbWVudH0gdGhlIGNhbnZhcyB0byB1c2UgYXMgYSB2aWV3LCBvcHRpb25hbFxyXG4gKiBAcGFyYW0gW29wdGlvbnMudHJhbnNwYXJlbnQ9ZmFsc2VdIHtib29sZWFufSBJZiB0aGUgcmVuZGVyIHZpZXcgaXMgdHJhbnNwYXJlbnQsIGRlZmF1bHQgZmFsc2VcclxuICogQHBhcmFtIFtvcHRpb25zLmF1dG9SZXNpemU9ZmFsc2VdIHtib29sZWFufSBJZiB0aGUgcmVuZGVyIHZpZXcgaXMgYXV0b21hdGljYWxseSByZXNpemVkLCBkZWZhdWx0IGZhbHNlXHJcbiAqIEBwYXJhbSBbb3B0aW9ucy5hbnRpYWxpYXM9ZmFsc2VdIHtib29sZWFufSBzZXRzIGFudGlhbGlhcyAob25seSBhcHBsaWNhYmxlIGluIGNocm9tZSBhdCB0aGUgbW9tZW50KVxyXG4gKiBAcGFyYW0gW29wdGlvbnMucmVzb2x1dGlvbj0xXSB7bnVtYmVyfSB0aGUgcmVzb2x1dGlvbiBvZiB0aGUgcmVuZGVyZXIgcmV0aW5hIHdvdWxkIGJlIDJcclxuICogQHBhcmFtIFtvcHRpb25zLmNsZWFyQmVmb3JlUmVuZGVyPXRydWVdIHtib29sZWFufSBUaGlzIHNldHMgaWYgdGhlIENhbnZhc1JlbmRlcmVyIHdpbGwgY2xlYXIgdGhlIGNhbnZhcyBvclxyXG4gKiAgICAgIG5vdCBiZWZvcmUgdGhlIG5ldyByZW5kZXIgcGFzcy5cclxuICogQHBhcmFtIFtvcHRpb25zLmJhY2tncm91bmRDb2xvcj0weDAwMDAwMF0ge251bWJlcn0gVGhlIGJhY2tncm91bmQgY29sb3Igb2YgdGhlIHJlbmRlcmVkIGFyZWEgKHNob3duIGlmIG5vdCB0cmFuc3BhcmVudCkuXHJcbiAqIEBwYXJhbSBbb3B0aW9ucy5yb3VuZFBpeGVscz1mYWxzZV0ge2Jvb2xlYW59IElmIHRydWUgUGl4aSB3aWxsIE1hdGguZmxvb3IoKSB4L3kgdmFsdWVzIHdoZW4gcmVuZGVyaW5nLCBzdG9wcGluZyBwaXhlbCBpbnRlcnBvbGF0aW9uLlxyXG4gKi9cclxuZnVuY3Rpb24gU3lzdGVtUmVuZGVyZXIoc3lzdGVtLCB3aWR0aCwgaGVpZ2h0LCBvcHRpb25zKVxyXG57XHJcbiAgICBFdmVudEVtaXR0ZXIuY2FsbCh0aGlzKTtcclxuXHJcbiAgICB1dGlscy5zYXlIZWxsbyhzeXN0ZW0pO1xyXG5cclxuICAgIC8vIHByZXBhcmUgb3B0aW9uc1xyXG4gICAgaWYgKG9wdGlvbnMpXHJcbiAgICB7XHJcbiAgICAgICAgZm9yICh2YXIgaSBpbiBDT05TVC5ERUZBVUxUX1JFTkRFUl9PUFRJT05TKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBvcHRpb25zW2ldID09PSAndW5kZWZpbmVkJylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgb3B0aW9uc1tpXSA9IENPTlNULkRFRkFVTFRfUkVOREVSX09QVElPTlNbaV07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBlbHNlXHJcbiAgICB7XHJcbiAgICAgICAgb3B0aW9ucyA9IENPTlNULkRFRkFVTFRfUkVOREVSX09QVElPTlM7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgdHlwZSBvZiB0aGUgcmVuZGVyZXIuXHJcbiAgICAgKlxyXG4gICAgICogQG1lbWJlciB7bnVtYmVyfVxyXG4gICAgICogQGRlZmF1bHQgUElYSS5SRU5ERVJFUl9UWVBFLlVOS05PV05cclxuICAgICAqIEBzZWUgUElYSS5SRU5ERVJFUl9UWVBFXHJcbiAgICAgKi9cclxuICAgIHRoaXMudHlwZSA9IENPTlNULlJFTkRFUkVSX1RZUEUuVU5LTk9XTjtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFRoZSB3aWR0aCBvZiB0aGUgY2FudmFzIHZpZXdcclxuICAgICAqXHJcbiAgICAgKiBAbWVtYmVyIHtudW1iZXJ9XHJcbiAgICAgKiBAZGVmYXVsdCA4MDBcclxuICAgICAqL1xyXG4gICAgdGhpcy53aWR0aCA9IHdpZHRoIHx8IDgwMDtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFRoZSBoZWlnaHQgb2YgdGhlIGNhbnZhcyB2aWV3XHJcbiAgICAgKlxyXG4gICAgICogQG1lbWJlciB7bnVtYmVyfVxyXG4gICAgICogQGRlZmF1bHQgNjAwXHJcbiAgICAgKi9cclxuICAgIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0IHx8IDYwMDtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFRoZSBjYW52YXMgZWxlbWVudCB0aGF0IGV2ZXJ5dGhpbmcgaXMgZHJhd24gdG9cclxuICAgICAqXHJcbiAgICAgKiBAbWVtYmVyIHtIVE1MQ2FudmFzRWxlbWVudH1cclxuICAgICAqL1xyXG4gICAgdGhpcy52aWV3ID0gb3B0aW9ucy52aWV3IHx8IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogVGhlIHJlc29sdXRpb24gb2YgdGhlIHJlbmRlcmVyXHJcbiAgICAgKlxyXG4gICAgICogQG1lbWJlciB7bnVtYmVyfVxyXG4gICAgICogQGRlZmF1bHQgMVxyXG4gICAgICovXHJcbiAgICB0aGlzLnJlc29sdXRpb24gPSBvcHRpb25zLnJlc29sdXRpb247XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBXaGV0aGVyIHRoZSByZW5kZXIgdmlldyBpcyB0cmFuc3BhcmVudFxyXG4gICAgICpcclxuICAgICAqIEBtZW1iZXIge2Jvb2xlYW59XHJcbiAgICAgKi9cclxuICAgIHRoaXMudHJhbnNwYXJlbnQgPSBvcHRpb25zLnRyYW5zcGFyZW50O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogV2hldGhlciB0aGUgcmVuZGVyIHZpZXcgc2hvdWxkIGJlIHJlc2l6ZWQgYXV0b21hdGljYWxseVxyXG4gICAgICpcclxuICAgICAqIEBtZW1iZXIge2Jvb2xlYW59XHJcbiAgICAgKi9cclxuICAgIHRoaXMuYXV0b1Jlc2l6ZSA9IG9wdGlvbnMuYXV0b1Jlc2l6ZSB8fCBmYWxzZTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFRyYWNrcyB0aGUgYmxlbmQgbW9kZXMgdXNlZnVsIGZvciB0aGlzIHJlbmRlcmVyLlxyXG4gICAgICpcclxuICAgICAqIEBtZW1iZXIge29iamVjdDxzdHJpbmcsIG1peGVkPn1cclxuICAgICAqL1xyXG4gICAgdGhpcy5ibGVuZE1vZGVzID0gbnVsbDtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFRoZSB2YWx1ZSBvZiB0aGUgcHJlc2VydmVEcmF3aW5nQnVmZmVyIGZsYWcgYWZmZWN0cyB3aGV0aGVyIG9yIG5vdCB0aGUgY29udGVudHMgb2YgdGhlIHN0ZW5jaWwgYnVmZmVyIGlzIHJldGFpbmVkIGFmdGVyIHJlbmRlcmluZy5cclxuICAgICAqXHJcbiAgICAgKiBAbWVtYmVyIHtib29sZWFufVxyXG4gICAgICovXHJcbiAgICB0aGlzLnByZXNlcnZlRHJhd2luZ0J1ZmZlciA9IG9wdGlvbnMucHJlc2VydmVEcmF3aW5nQnVmZmVyO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogVGhpcyBzZXRzIGlmIHRoZSBDYW52YXNSZW5kZXJlciB3aWxsIGNsZWFyIHRoZSBjYW52YXMgb3Igbm90IGJlZm9yZSB0aGUgbmV3IHJlbmRlciBwYXNzLlxyXG4gICAgICogSWYgdGhlIHNjZW5lIGlzIE5PVCB0cmFuc3BhcmVudCBQaXhpIHdpbGwgdXNlIGEgY2FudmFzIHNpemVkIGZpbGxSZWN0IG9wZXJhdGlvbiBldmVyeSBmcmFtZSB0byBzZXQgdGhlIGNhbnZhcyBiYWNrZ3JvdW5kIGNvbG9yLlxyXG4gICAgICogSWYgdGhlIHNjZW5lIGlzIHRyYW5zcGFyZW50IFBpeGkgd2lsbCB1c2UgY2xlYXJSZWN0IHRvIGNsZWFyIHRoZSBjYW52YXMgZXZlcnkgZnJhbWUuXHJcbiAgICAgKiBEaXNhYmxlIHRoaXMgYnkgc2V0dGluZyB0aGlzIHRvIGZhbHNlLiBGb3IgZXhhbXBsZSBpZiB5b3VyIGdhbWUgaGFzIGEgY2FudmFzIGZpbGxpbmcgYmFja2dyb3VuZCBpbWFnZSB5b3Ugb2Z0ZW4gZG9uJ3QgbmVlZCB0aGlzIHNldC5cclxuICAgICAqXHJcbiAgICAgKiBAbWVtYmVyIHtib29sZWFufVxyXG4gICAgICogQGRlZmF1bHRcclxuICAgICAqL1xyXG4gICAgdGhpcy5jbGVhckJlZm9yZVJlbmRlciA9IG9wdGlvbnMuY2xlYXJCZWZvcmVSZW5kZXI7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBJZiB0cnVlIFBpeGkgd2lsbCBNYXRoLmZsb29yKCkgeC95IHZhbHVlcyB3aGVuIHJlbmRlcmluZywgc3RvcHBpbmcgcGl4ZWwgaW50ZXJwb2xhdGlvbi5cclxuICAgICAqIEhhbmR5IGZvciBjcmlzcCBwaXhlbCBhcnQgYW5kIHNwZWVkIG9uIGxlZ2FjeSBkZXZpY2VzLlxyXG4gICAgICpcclxuICAgICAqIEBtZW1iZXIge2Jvb2xlYW59XHJcbiAgICAgKi9cclxuICAgIHRoaXMucm91bmRQaXhlbHMgPSBvcHRpb25zLnJvdW5kUGl4ZWxzO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogVGhlIGJhY2tncm91bmQgY29sb3IgYXMgYSBudW1iZXIuXHJcbiAgICAgKlxyXG4gICAgICogQG1lbWJlciB7bnVtYmVyfVxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgdGhpcy5fYmFja2dyb3VuZENvbG9yID0gMHgwMDAwMDA7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgYmFja2dyb3VuZCBjb2xvciBhcyBhbiBbUiwgRywgQl0gYXJyYXkuXHJcbiAgICAgKlxyXG4gICAgICogQG1lbWJlciB7bnVtYmVyW119XHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICB0aGlzLl9iYWNrZ3JvdW5kQ29sb3JSZ2IgPSBbMCwgMCwgMF07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgYmFja2dyb3VuZCBjb2xvciBhcyBhIHN0cmluZy5cclxuICAgICAqXHJcbiAgICAgKiBAbWVtYmVyIHtzdHJpbmd9XHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICB0aGlzLl9iYWNrZ3JvdW5kQ29sb3JTdHJpbmcgPSAnIzAwMDAwMCc7XHJcblxyXG4gICAgdGhpcy5iYWNrZ3JvdW5kQ29sb3IgPSBvcHRpb25zLmJhY2tncm91bmRDb2xvciB8fCB0aGlzLl9iYWNrZ3JvdW5kQ29sb3I7IC8vIHJ1biBiZyBjb2xvciBzZXR0ZXJcclxuXHJcbiAgICAvKipcclxuICAgICAqIFRoaXMgdGVtcG9yYXJ5IGRpc3BsYXkgb2JqZWN0IHVzZWQgYXMgdGhlIHBhcmVudCBvZiB0aGUgY3VycmVudGx5IGJlaW5nIHJlbmRlcmVkIGl0ZW1cclxuICAgICAqXHJcbiAgICAgKiBAbWVtYmVyIHtQSVhJLkRpc3BsYXlPYmplY3R9XHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICB0aGlzLl90ZW1wRGlzcGxheU9iamVjdFBhcmVudCA9IHt3b3JsZFRyYW5zZm9ybTpuZXcgbWF0aC5NYXRyaXgoKSwgd29ybGRBbHBoYToxLCBjaGlsZHJlbjpbXX07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgbGFzdCByb290IG9iamVjdCB0aGF0IHRoZSByZW5kZXJlciB0cmllZCB0byByZW5kZXIuXHJcbiAgICAgKlxyXG4gICAgICogQG1lbWJlciB7UElYSS5EaXNwbGF5T2JqZWN0fVxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgdGhpcy5fbGFzdE9iamVjdFJlbmRlcmVkID0gdGhpcy5fdGVtcERpc3BsYXlPYmplY3RQYXJlbnQ7XHJcbn1cclxuXHJcbi8vIGNvbnN0cnVjdG9yXHJcblN5c3RlbVJlbmRlcmVyLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoRXZlbnRFbWl0dGVyLnByb3RvdHlwZSk7XHJcblN5c3RlbVJlbmRlcmVyLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFN5c3RlbVJlbmRlcmVyO1xyXG5tb2R1bGUuZXhwb3J0cyA9IFN5c3RlbVJlbmRlcmVyO1xyXG5cclxuT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoU3lzdGVtUmVuZGVyZXIucHJvdG90eXBlLCB7XHJcbiAgICAvKipcclxuICAgICAqIFRoZSBiYWNrZ3JvdW5kIGNvbG9yIHRvIGZpbGwgaWYgbm90IHRyYW5zcGFyZW50XHJcbiAgICAgKlxyXG4gICAgICogQG1lbWJlciB7bnVtYmVyfVxyXG4gICAgICogQG1lbWJlcm9mIFBJWEkuU3lzdGVtUmVuZGVyZXIjXHJcbiAgICAgKi9cclxuICAgIGJhY2tncm91bmRDb2xvcjpcclxuICAgIHtcclxuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fYmFja2dyb3VuZENvbG9yO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc2V0OiBmdW5jdGlvbiAodmFsKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5fYmFja2dyb3VuZENvbG9yID0gdmFsO1xyXG4gICAgICAgICAgICB0aGlzLl9iYWNrZ3JvdW5kQ29sb3JTdHJpbmcgPSB1dGlscy5oZXgyc3RyaW5nKHZhbCk7XHJcbiAgICAgICAgICAgIHV0aWxzLmhleDJyZ2IodmFsLCB0aGlzLl9iYWNrZ3JvdW5kQ29sb3JSZ2IpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSk7XHJcblxyXG4vKipcclxuICogUmVzaXplcyB0aGUgY2FudmFzIHZpZXcgdG8gdGhlIHNwZWNpZmllZCB3aWR0aCBhbmQgaGVpZ2h0XHJcbiAqXHJcbiAqIEBwYXJhbSB3aWR0aCB7bnVtYmVyfSB0aGUgbmV3IHdpZHRoIG9mIHRoZSBjYW52YXMgdmlld1xyXG4gKiBAcGFyYW0gaGVpZ2h0IHtudW1iZXJ9IHRoZSBuZXcgaGVpZ2h0IG9mIHRoZSBjYW52YXMgdmlld1xyXG4gKi9cclxuU3lzdGVtUmVuZGVyZXIucHJvdG90eXBlLnJlc2l6ZSA9IGZ1bmN0aW9uICh3aWR0aCwgaGVpZ2h0KSB7XHJcbiAgICB0aGlzLndpZHRoID0gd2lkdGggKiB0aGlzLnJlc29sdXRpb247XHJcbiAgICB0aGlzLmhlaWdodCA9IGhlaWdodCAqIHRoaXMucmVzb2x1dGlvbjtcclxuXHJcbiAgICB0aGlzLnZpZXcud2lkdGggPSB0aGlzLndpZHRoO1xyXG4gICAgdGhpcy52aWV3LmhlaWdodCA9IHRoaXMuaGVpZ2h0O1xyXG5cclxuICAgIGlmICh0aGlzLmF1dG9SZXNpemUpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy52aWV3LnN0eWxlLndpZHRoID0gdGhpcy53aWR0aCAvIHRoaXMucmVzb2x1dGlvbiArICdweCc7XHJcbiAgICAgICAgdGhpcy52aWV3LnN0eWxlLmhlaWdodCA9IHRoaXMuaGVpZ2h0IC8gdGhpcy5yZXNvbHV0aW9uICsgJ3B4JztcclxuICAgIH1cclxufTtcclxuXHJcbi8qKlxyXG4gKiBSZW1vdmVzIGV2ZXJ5dGhpbmcgZnJvbSB0aGUgcmVuZGVyZXIgYW5kIG9wdGlvbmFsbHkgcmVtb3ZlcyB0aGUgQ2FudmFzIERPTSBlbGVtZW50LlxyXG4gKlxyXG4gKiBAcGFyYW0gW3JlbW92ZVZpZXc9ZmFsc2VdIHtib29sZWFufSBSZW1vdmVzIHRoZSBDYW52YXMgZWxlbWVudCBmcm9tIHRoZSBET00uXHJcbiAqL1xyXG5TeXN0ZW1SZW5kZXJlci5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uIChyZW1vdmVWaWV3KSB7XHJcbiAgICBpZiAocmVtb3ZlVmlldyAmJiB0aGlzLnZpZXcucGFyZW50Tm9kZSlcclxuICAgIHtcclxuICAgICAgICB0aGlzLnZpZXcucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0aGlzLnZpZXcpO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMudHlwZSA9IENPTlNULlJFTkRFUkVSX1RZUEUuVU5LTk9XTjtcclxuXHJcbiAgICB0aGlzLndpZHRoID0gMDtcclxuICAgIHRoaXMuaGVpZ2h0ID0gMDtcclxuXHJcbiAgICB0aGlzLnZpZXcgPSBudWxsO1xyXG5cclxuICAgIHRoaXMucmVzb2x1dGlvbiA9IDA7XHJcblxyXG4gICAgdGhpcy50cmFuc3BhcmVudCA9IGZhbHNlO1xyXG5cclxuICAgIHRoaXMuYXV0b1Jlc2l6ZSA9IGZhbHNlO1xyXG5cclxuICAgIHRoaXMuYmxlbmRNb2RlcyA9IG51bGw7XHJcblxyXG4gICAgdGhpcy5wcmVzZXJ2ZURyYXdpbmdCdWZmZXIgPSBmYWxzZTtcclxuICAgIHRoaXMuY2xlYXJCZWZvcmVSZW5kZXIgPSBmYWxzZTtcclxuXHJcbiAgICB0aGlzLnJvdW5kUGl4ZWxzID0gZmFsc2U7XHJcblxyXG4gICAgdGhpcy5fYmFja2dyb3VuZENvbG9yID0gMDtcclxuICAgIHRoaXMuX2JhY2tncm91bmRDb2xvclJnYiA9IG51bGw7XHJcbiAgICB0aGlzLl9iYWNrZ3JvdW5kQ29sb3JTdHJpbmcgPSBudWxsO1xyXG59O1xyXG4iLCJ2YXIgU3lzdGVtUmVuZGVyZXIgPSByZXF1aXJlKCcuLi9TeXN0ZW1SZW5kZXJlcicpLFxyXG4gICAgQ2FudmFzTWFza01hbmFnZXIgPSByZXF1aXJlKCcuL3V0aWxzL0NhbnZhc01hc2tNYW5hZ2VyJyksXHJcbiAgICB1dGlscyA9IHJlcXVpcmUoJy4uLy4uL3V0aWxzJyksXHJcbiAgICBtYXRoID0gcmVxdWlyZSgnLi4vLi4vbWF0aCcpLFxyXG4gICAgQ09OU1QgPSByZXF1aXJlKCcuLi8uLi9jb25zdCcpO1xyXG5cclxuLyoqXHJcbiAqIFRoZSBDYW52YXNSZW5kZXJlciBkcmF3cyB0aGUgc2NlbmUgYW5kIGFsbCBpdHMgY29udGVudCBvbnRvIGEgMmQgY2FudmFzLiBUaGlzIHJlbmRlcmVyIHNob3VsZCBiZSB1c2VkIGZvciBicm93c2VycyB0aGF0IGRvIG5vdCBzdXBwb3J0IHdlYkdMLlxyXG4gKiBEb24ndCBmb3JnZXQgdG8gYWRkIHRoZSBDYW52YXNSZW5kZXJlci52aWV3IHRvIHlvdXIgRE9NIG9yIHlvdSB3aWxsIG5vdCBzZWUgYW55dGhpbmcgOilcclxuICpcclxuICogQGNsYXNzXHJcbiAqIEBtZW1iZXJvZiBQSVhJXHJcbiAqIEBleHRlbmRzIFBJWEkuU3lzdGVtUmVuZGVyZXJcclxuICogQHBhcmFtIFt3aWR0aD04MDBdIHtudW1iZXJ9IHRoZSB3aWR0aCBvZiB0aGUgY2FudmFzIHZpZXdcclxuICogQHBhcmFtIFtoZWlnaHQ9NjAwXSB7bnVtYmVyfSB0aGUgaGVpZ2h0IG9mIHRoZSBjYW52YXMgdmlld1xyXG4gKiBAcGFyYW0gW29wdGlvbnNdIHtvYmplY3R9IFRoZSBvcHRpb25hbCByZW5kZXJlciBwYXJhbWV0ZXJzXHJcbiAqIEBwYXJhbSBbb3B0aW9ucy52aWV3XSB7SFRNTENhbnZhc0VsZW1lbnR9IHRoZSBjYW52YXMgdG8gdXNlIGFzIGEgdmlldywgb3B0aW9uYWxcclxuICogQHBhcmFtIFtvcHRpb25zLnRyYW5zcGFyZW50PWZhbHNlXSB7Ym9vbGVhbn0gSWYgdGhlIHJlbmRlciB2aWV3IGlzIHRyYW5zcGFyZW50LCBkZWZhdWx0IGZhbHNlXHJcbiAqIEBwYXJhbSBbb3B0aW9ucy5hdXRvUmVzaXplPWZhbHNlXSB7Ym9vbGVhbn0gSWYgdGhlIHJlbmRlciB2aWV3IGlzIGF1dG9tYXRpY2FsbHkgcmVzaXplZCwgZGVmYXVsdCBmYWxzZVxyXG4gKiBAcGFyYW0gW29wdGlvbnMuYW50aWFsaWFzPWZhbHNlXSB7Ym9vbGVhbn0gc2V0cyBhbnRpYWxpYXMgKG9ubHkgYXBwbGljYWJsZSBpbiBjaHJvbWUgYXQgdGhlIG1vbWVudClcclxuICogQHBhcmFtIFtvcHRpb25zLnJlc29sdXRpb249MV0ge251bWJlcn0gdGhlIHJlc29sdXRpb24gb2YgdGhlIHJlbmRlcmVyIHJldGluYSB3b3VsZCBiZSAyXHJcbiAqIEBwYXJhbSBbb3B0aW9ucy5jbGVhckJlZm9yZVJlbmRlcj10cnVlXSB7Ym9vbGVhbn0gVGhpcyBzZXRzIGlmIHRoZSBDYW52YXNSZW5kZXJlciB3aWxsIGNsZWFyIHRoZSBjYW52YXMgb3JcclxuICogICAgICBub3QgYmVmb3JlIHRoZSBuZXcgcmVuZGVyIHBhc3MuXHJcbiAqIEBwYXJhbSBbb3B0aW9ucy5yb3VuZFBpeGVscz1mYWxzZV0ge2Jvb2xlYW59IElmIHRydWUgUGl4aSB3aWxsIE1hdGguZmxvb3IoKSB4L3kgdmFsdWVzIHdoZW4gcmVuZGVyaW5nLCBzdG9wcGluZyBwaXhlbCBpbnRlcnBvbGF0aW9uLlxyXG4gKi9cclxuZnVuY3Rpb24gQ2FudmFzUmVuZGVyZXIod2lkdGgsIGhlaWdodCwgb3B0aW9ucylcclxue1xyXG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XHJcblxyXG4gICAgU3lzdGVtUmVuZGVyZXIuY2FsbCh0aGlzLCAnQ2FudmFzJywgd2lkdGgsIGhlaWdodCwgb3B0aW9ucyk7XHJcblxyXG4gICAgdGhpcy50eXBlID0gQ09OU1QuUkVOREVSRVJfVFlQRS5DQU5WQVM7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgY2FudmFzIDJkIGNvbnRleHQgdGhhdCBldmVyeXRoaW5nIGlzIGRyYXduIHdpdGguXHJcbiAgICAgKlxyXG4gICAgICogQG1lbWJlciB7Q2FudmFzUmVuZGVyaW5nQ29udGV4dDJEfVxyXG4gICAgICovXHJcbiAgICB0aGlzLmNvbnRleHQgPSB0aGlzLnZpZXcuZ2V0Q29udGV4dCgnMmQnLCB7IGFscGhhOiB0aGlzLnRyYW5zcGFyZW50IH0pO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogQm9vbGVhbiBmbGFnIGNvbnRyb2xsaW5nIGNhbnZhcyByZWZyZXNoLlxyXG4gICAgICpcclxuICAgICAqIEBtZW1iZXIge2Jvb2xlYW59XHJcbiAgICAgKi9cclxuICAgIHRoaXMucmVmcmVzaCA9IHRydWU7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBJbnN0YW5jZSBvZiBhIENhbnZhc01hc2tNYW5hZ2VyLCBoYW5kbGVzIG1hc2tpbmcgd2hlbiB1c2luZyB0aGUgY2FudmFzIHJlbmRlcmVyLlxyXG4gICAgICpcclxuICAgICAqIEBtZW1iZXIge1BJWEkuQ2FudmFzTWFza01hbmFnZXJ9XHJcbiAgICAgKi9cclxuICAgIHRoaXMubWFza01hbmFnZXIgPSBuZXcgQ2FudmFzTWFza01hbmFnZXIoKTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFRoZSBjYW52YXMgcHJvcGVydHkgdXNlZCB0byBzZXQgdGhlIGNhbnZhcyBzbW9vdGhpbmcgcHJvcGVydHkuXHJcbiAgICAgKlxyXG4gICAgICogQG1lbWJlciB7c3RyaW5nfVxyXG4gICAgICovXHJcbiAgICB0aGlzLnNtb290aFByb3BlcnR5ID0gJ2ltYWdlU21vb3RoaW5nRW5hYmxlZCc7XHJcblxyXG4gICAgaWYgKCF0aGlzLmNvbnRleHQuaW1hZ2VTbW9vdGhpbmdFbmFibGVkKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLmNvbnRleHQud2Via2l0SW1hZ2VTbW9vdGhpbmdFbmFibGVkKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5zbW9vdGhQcm9wZXJ0eSA9ICd3ZWJraXRJbWFnZVNtb290aGluZ0VuYWJsZWQnO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICh0aGlzLmNvbnRleHQubW96SW1hZ2VTbW9vdGhpbmdFbmFibGVkKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5zbW9vdGhQcm9wZXJ0eSA9ICdtb3pJbWFnZVNtb290aGluZ0VuYWJsZWQnO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICh0aGlzLmNvbnRleHQub0ltYWdlU21vb3RoaW5nRW5hYmxlZClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuc21vb3RoUHJvcGVydHkgPSAnb0ltYWdlU21vb3RoaW5nRW5hYmxlZCc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKHRoaXMuY29udGV4dC5tc0ltYWdlU21vb3RoaW5nRW5hYmxlZClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuc21vb3RoUHJvcGVydHkgPSAnbXNJbWFnZVNtb290aGluZ0VuYWJsZWQnO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmluaXRQbHVnaW5zKCk7XHJcblxyXG4gICAgdGhpcy5fbWFwQmxlbmRNb2RlcygpO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogVGhpcyB0ZW1wb3JhcnkgZGlzcGxheSBvYmplY3QgdXNlZCBhcyB0aGUgcGFyZW50IG9mIHRoZSBjdXJyZW50bHkgYmVpbmcgcmVuZGVyZWQgaXRlbVxyXG4gICAgICpcclxuICAgICAqIEBtZW1iZXIge1BJWEkuRGlzcGxheU9iamVjdH1cclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIHRoaXMuX3RlbXBEaXNwbGF5T2JqZWN0UGFyZW50ID0ge1xyXG4gICAgICAgIHdvcmxkVHJhbnNmb3JtOiBuZXcgbWF0aC5NYXRyaXgoKSxcclxuICAgICAgICB3b3JsZEFscGhhOiAxXHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICB0aGlzLnJlc2l6ZSh3aWR0aCwgaGVpZ2h0KTtcclxufVxyXG5cclxuLy8gY29uc3RydWN0b3JcclxuQ2FudmFzUmVuZGVyZXIucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShTeXN0ZW1SZW5kZXJlci5wcm90b3R5cGUpO1xyXG5DYW52YXNSZW5kZXJlci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBDYW52YXNSZW5kZXJlcjtcclxubW9kdWxlLmV4cG9ydHMgPSBDYW52YXNSZW5kZXJlcjtcclxudXRpbHMucGx1Z2luVGFyZ2V0Lm1peGluKENhbnZhc1JlbmRlcmVyKTtcclxuXHJcbi8qKlxyXG4gKiBSZW5kZXJzIHRoZSBvYmplY3QgdG8gdGhpcyBjYW52YXMgdmlld1xyXG4gKlxyXG4gKiBAcGFyYW0gb2JqZWN0IHtQSVhJLkRpc3BsYXlPYmplY3R9IHRoZSBvYmplY3QgdG8gYmUgcmVuZGVyZWRcclxuICovXHJcbkNhbnZhc1JlbmRlcmVyLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbiAob2JqZWN0KVxyXG57XHJcbiAgICB2YXIgY2FjaGVQYXJlbnQgPSBvYmplY3QucGFyZW50O1xyXG5cclxuICAgIHRoaXMuX2xhc3RPYmplY3RSZW5kZXJlZCA9IG9iamVjdDtcclxuXHJcbiAgICBvYmplY3QucGFyZW50ID0gdGhpcy5fdGVtcERpc3BsYXlPYmplY3RQYXJlbnQ7XHJcblxyXG4gICAgLy8gdXBkYXRlIHRoZSBzY2VuZSBncmFwaFxyXG4gICAgb2JqZWN0LnVwZGF0ZVRyYW5zZm9ybSgpO1xyXG5cclxuICAgIG9iamVjdC5wYXJlbnQgPSBjYWNoZVBhcmVudDtcclxuXHJcbiAgICB0aGlzLmNvbnRleHQuc2V0VHJhbnNmb3JtKDEsIDAsIDAsIDEsIDAsIDApO1xyXG5cclxuICAgIHRoaXMuY29udGV4dC5nbG9iYWxBbHBoYSA9IDE7XHJcblxyXG4gICAgdGhpcy5jb250ZXh0Lmdsb2JhbENvbXBvc2l0ZU9wZXJhdGlvbiA9IHRoaXMuYmxlbmRNb2Rlc1tDT05TVC5CTEVORF9NT0RFUy5OT1JNQUxdO1xyXG5cclxuICAgIGlmIChuYXZpZ2F0b3IuaXNDb2Nvb25KUyAmJiB0aGlzLnZpZXcuc2NyZWVuY2FudmFzKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMuY29udGV4dC5maWxsU3R5bGUgPSAnYmxhY2snO1xyXG4gICAgICAgIHRoaXMuY29udGV4dC5jbGVhcigpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0aGlzLmNsZWFyQmVmb3JlUmVuZGVyKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLnRyYW5zcGFyZW50KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5jb250ZXh0LmNsZWFyUmVjdCgwLCAwLCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuY29udGV4dC5maWxsU3R5bGUgPSB0aGlzLl9iYWNrZ3JvdW5kQ29sb3JTdHJpbmc7XHJcbiAgICAgICAgICAgIHRoaXMuY29udGV4dC5maWxsUmVjdCgwLCAwLCB0aGlzLndpZHRoICwgdGhpcy5oZWlnaHQpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB0aGlzLnJlbmRlckRpc3BsYXlPYmplY3Qob2JqZWN0LCB0aGlzLmNvbnRleHQpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFJlbW92ZXMgZXZlcnl0aGluZyBmcm9tIHRoZSByZW5kZXJlciBhbmQgb3B0aW9uYWxseSByZW1vdmVzIHRoZSBDYW52YXMgRE9NIGVsZW1lbnQuXHJcbiAqXHJcbiAqIEBwYXJhbSBbcmVtb3ZlVmlldz1mYWxzZV0ge2Jvb2xlYW59IFJlbW92ZXMgdGhlIENhbnZhcyBlbGVtZW50IGZyb20gdGhlIERPTS5cclxuICovXHJcbkNhbnZhc1JlbmRlcmVyLnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24gKHJlbW92ZVZpZXcpXHJcbntcclxuICAgIHRoaXMuZGVzdHJveVBsdWdpbnMoKTtcclxuXHJcbiAgICAvLyBjYWxsIHRoZSBiYXNlIGRlc3Ryb3lcclxuICAgIFN5c3RlbVJlbmRlcmVyLnByb3RvdHlwZS5kZXN0cm95LmNhbGwodGhpcywgcmVtb3ZlVmlldyk7XHJcblxyXG4gICAgdGhpcy5jb250ZXh0ID0gbnVsbDtcclxuXHJcbiAgICB0aGlzLnJlZnJlc2ggPSB0cnVlO1xyXG5cclxuICAgIHRoaXMubWFza01hbmFnZXIuZGVzdHJveSgpO1xyXG4gICAgdGhpcy5tYXNrTWFuYWdlciA9IG51bGw7XHJcblxyXG4gICAgdGhpcy5zbW9vdGhQcm9wZXJ0eSA9IG51bGw7XHJcbn07XHJcblxyXG4vKipcclxuICogUmVuZGVycyBhIGRpc3BsYXkgb2JqZWN0XHJcbiAqXHJcbiAqIEBwYXJhbSBkaXNwbGF5T2JqZWN0IHtQSVhJLkRpc3BsYXlPYmplY3R9IFRoZSBkaXNwbGF5T2JqZWN0IHRvIHJlbmRlclxyXG4gKiBAcHJpdmF0ZVxyXG4gKi9cclxuQ2FudmFzUmVuZGVyZXIucHJvdG90eXBlLnJlbmRlckRpc3BsYXlPYmplY3QgPSBmdW5jdGlvbiAoZGlzcGxheU9iamVjdCwgY29udGV4dClcclxue1xyXG4gICAgdmFyIHRlbXBDb250ZXh0ID0gdGhpcy5jb250ZXh0O1xyXG5cclxuICAgIHRoaXMuY29udGV4dCA9IGNvbnRleHQ7XHJcbiAgICBkaXNwbGF5T2JqZWN0LnJlbmRlckNhbnZhcyh0aGlzKTtcclxuICAgIHRoaXMuY29udGV4dCA9IHRlbXBDb250ZXh0O1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEBleHRlbmRzIFBJWEkuU3lzdGVtUmVuZGVyZXIjcmVzaXplXHJcbiAqXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSB3XHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBoXHJcbiAqL1xyXG5DYW52YXNSZW5kZXJlci5wcm90b3R5cGUucmVzaXplID0gZnVuY3Rpb24gKHcsIGgpXHJcbntcclxuICAgIFN5c3RlbVJlbmRlcmVyLnByb3RvdHlwZS5yZXNpemUuY2FsbCh0aGlzLCB3LCBoKTtcclxuXHJcbiAgICAvL3Jlc2V0IHRoZSBzY2FsZSBtb2RlLi4gb2RkbHkgdGhpcyBzZWVtcyB0byBiZSByZXNldCB3aGVuIHRoZSBjYW52YXMgaXMgcmVzaXplZC5cclxuICAgIC8vc3VyZWx5IGEgYnJvd3NlciBidWc/PyBMZXQgcGl4aSBmaXggdGhhdCBmb3IgeW91Li5cclxuICAgIGlmKHRoaXMuc21vb3RoUHJvcGVydHkpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5jb250ZXh0W3RoaXMuc21vb3RoUHJvcGVydHldID0gKENPTlNULlNDQUxFX01PREVTLkRFRkFVTFQgPT09IENPTlNULlNDQUxFX01PREVTLkxJTkVBUik7XHJcbiAgICB9XHJcblxyXG59O1xyXG5cclxuLyoqXHJcbiAqIE1hcHMgUGl4aSBibGVuZCBtb2RlcyB0byBjYW52YXMgYmxlbmQgbW9kZXMuXHJcbiAqXHJcbiAqIEBwcml2YXRlXHJcbiAqL1xyXG5DYW52YXNSZW5kZXJlci5wcm90b3R5cGUuX21hcEJsZW5kTW9kZXMgPSBmdW5jdGlvbiAoKVxyXG57XHJcbiAgICBpZiAoIXRoaXMuYmxlbmRNb2RlcylcclxuICAgIHtcclxuICAgICAgICB0aGlzLmJsZW5kTW9kZXMgPSB7fTtcclxuXHJcbiAgICAgICAgaWYgKHV0aWxzLmNhblVzZU5ld0NhbnZhc0JsZW5kTW9kZXMoKSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuYmxlbmRNb2Rlc1tDT05TVC5CTEVORF9NT0RFUy5OT1JNQUxdICAgICAgICA9ICdzb3VyY2Utb3Zlcic7XHJcbiAgICAgICAgICAgIHRoaXMuYmxlbmRNb2Rlc1tDT05TVC5CTEVORF9NT0RFUy5BRERdICAgICAgICAgICA9ICdsaWdodGVyJzsgLy9JUyBUSElTIE9LPz8/XHJcbiAgICAgICAgICAgIHRoaXMuYmxlbmRNb2Rlc1tDT05TVC5CTEVORF9NT0RFUy5NVUxUSVBMWV0gICAgICA9ICdtdWx0aXBseSc7XHJcbiAgICAgICAgICAgIHRoaXMuYmxlbmRNb2Rlc1tDT05TVC5CTEVORF9NT0RFUy5TQ1JFRU5dICAgICAgICA9ICdzY3JlZW4nO1xyXG4gICAgICAgICAgICB0aGlzLmJsZW5kTW9kZXNbQ09OU1QuQkxFTkRfTU9ERVMuT1ZFUkxBWV0gICAgICAgPSAnb3ZlcmxheSc7XHJcbiAgICAgICAgICAgIHRoaXMuYmxlbmRNb2Rlc1tDT05TVC5CTEVORF9NT0RFUy5EQVJLRU5dICAgICAgICA9ICdkYXJrZW4nO1xyXG4gICAgICAgICAgICB0aGlzLmJsZW5kTW9kZXNbQ09OU1QuQkxFTkRfTU9ERVMuTElHSFRFTl0gICAgICAgPSAnbGlnaHRlbic7XHJcbiAgICAgICAgICAgIHRoaXMuYmxlbmRNb2Rlc1tDT05TVC5CTEVORF9NT0RFUy5DT0xPUl9ET0RHRV0gICA9ICdjb2xvci1kb2RnZSc7XHJcbiAgICAgICAgICAgIHRoaXMuYmxlbmRNb2Rlc1tDT05TVC5CTEVORF9NT0RFUy5DT0xPUl9CVVJOXSAgICA9ICdjb2xvci1idXJuJztcclxuICAgICAgICAgICAgdGhpcy5ibGVuZE1vZGVzW0NPTlNULkJMRU5EX01PREVTLkhBUkRfTElHSFRdICAgID0gJ2hhcmQtbGlnaHQnO1xyXG4gICAgICAgICAgICB0aGlzLmJsZW5kTW9kZXNbQ09OU1QuQkxFTkRfTU9ERVMuU09GVF9MSUdIVF0gICAgPSAnc29mdC1saWdodCc7XHJcbiAgICAgICAgICAgIHRoaXMuYmxlbmRNb2Rlc1tDT05TVC5CTEVORF9NT0RFUy5ESUZGRVJFTkNFXSAgICA9ICdkaWZmZXJlbmNlJztcclxuICAgICAgICAgICAgdGhpcy5ibGVuZE1vZGVzW0NPTlNULkJMRU5EX01PREVTLkVYQ0xVU0lPTl0gICAgID0gJ2V4Y2x1c2lvbic7XHJcbiAgICAgICAgICAgIHRoaXMuYmxlbmRNb2Rlc1tDT05TVC5CTEVORF9NT0RFUy5IVUVdICAgICAgICAgICA9ICdodWUnO1xyXG4gICAgICAgICAgICB0aGlzLmJsZW5kTW9kZXNbQ09OU1QuQkxFTkRfTU9ERVMuU0FUVVJBVElPTl0gICAgPSAnc2F0dXJhdGUnO1xyXG4gICAgICAgICAgICB0aGlzLmJsZW5kTW9kZXNbQ09OU1QuQkxFTkRfTU9ERVMuQ09MT1JdICAgICAgICAgPSAnY29sb3InO1xyXG4gICAgICAgICAgICB0aGlzLmJsZW5kTW9kZXNbQ09OU1QuQkxFTkRfTU9ERVMuTFVNSU5PU0lUWV0gICAgPSAnbHVtaW5vc2l0eSc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIC8vIHRoaXMgbWVhbnMgdGhhdCB0aGUgYnJvd3NlciBkb2VzIG5vdCBzdXBwb3J0IHRoZSBjb29sIG5ldyBibGVuZCBtb2RlcyBpbiBjYW52YXMgJ2NvdWdoJyBpZSAnY291Z2gnXHJcbiAgICAgICAgICAgIHRoaXMuYmxlbmRNb2Rlc1tDT05TVC5CTEVORF9NT0RFUy5OT1JNQUxdICAgICAgICA9ICdzb3VyY2Utb3Zlcic7XHJcbiAgICAgICAgICAgIHRoaXMuYmxlbmRNb2Rlc1tDT05TVC5CTEVORF9NT0RFUy5BRERdICAgICAgICAgICA9ICdsaWdodGVyJzsgLy9JUyBUSElTIE9LPz8/XHJcbiAgICAgICAgICAgIHRoaXMuYmxlbmRNb2Rlc1tDT05TVC5CTEVORF9NT0RFUy5NVUxUSVBMWV0gICAgICA9ICdzb3VyY2Utb3Zlcic7XHJcbiAgICAgICAgICAgIHRoaXMuYmxlbmRNb2Rlc1tDT05TVC5CTEVORF9NT0RFUy5TQ1JFRU5dICAgICAgICA9ICdzb3VyY2Utb3Zlcic7XHJcbiAgICAgICAgICAgIHRoaXMuYmxlbmRNb2Rlc1tDT05TVC5CTEVORF9NT0RFUy5PVkVSTEFZXSAgICAgICA9ICdzb3VyY2Utb3Zlcic7XHJcbiAgICAgICAgICAgIHRoaXMuYmxlbmRNb2Rlc1tDT05TVC5CTEVORF9NT0RFUy5EQVJLRU5dICAgICAgICA9ICdzb3VyY2Utb3Zlcic7XHJcbiAgICAgICAgICAgIHRoaXMuYmxlbmRNb2Rlc1tDT05TVC5CTEVORF9NT0RFUy5MSUdIVEVOXSAgICAgICA9ICdzb3VyY2Utb3Zlcic7XHJcbiAgICAgICAgICAgIHRoaXMuYmxlbmRNb2Rlc1tDT05TVC5CTEVORF9NT0RFUy5DT0xPUl9ET0RHRV0gICA9ICdzb3VyY2Utb3Zlcic7XHJcbiAgICAgICAgICAgIHRoaXMuYmxlbmRNb2Rlc1tDT05TVC5CTEVORF9NT0RFUy5DT0xPUl9CVVJOXSAgICA9ICdzb3VyY2Utb3Zlcic7XHJcbiAgICAgICAgICAgIHRoaXMuYmxlbmRNb2Rlc1tDT05TVC5CTEVORF9NT0RFUy5IQVJEX0xJR0hUXSAgICA9ICdzb3VyY2Utb3Zlcic7XHJcbiAgICAgICAgICAgIHRoaXMuYmxlbmRNb2Rlc1tDT05TVC5CTEVORF9NT0RFUy5TT0ZUX0xJR0hUXSAgICA9ICdzb3VyY2Utb3Zlcic7XHJcbiAgICAgICAgICAgIHRoaXMuYmxlbmRNb2Rlc1tDT05TVC5CTEVORF9NT0RFUy5ESUZGRVJFTkNFXSAgICA9ICdzb3VyY2Utb3Zlcic7XHJcbiAgICAgICAgICAgIHRoaXMuYmxlbmRNb2Rlc1tDT05TVC5CTEVORF9NT0RFUy5FWENMVVNJT05dICAgICA9ICdzb3VyY2Utb3Zlcic7XHJcbiAgICAgICAgICAgIHRoaXMuYmxlbmRNb2Rlc1tDT05TVC5CTEVORF9NT0RFUy5IVUVdICAgICAgICAgICA9ICdzb3VyY2Utb3Zlcic7XHJcbiAgICAgICAgICAgIHRoaXMuYmxlbmRNb2Rlc1tDT05TVC5CTEVORF9NT0RFUy5TQVRVUkFUSU9OXSAgICA9ICdzb3VyY2Utb3Zlcic7XHJcbiAgICAgICAgICAgIHRoaXMuYmxlbmRNb2Rlc1tDT05TVC5CTEVORF9NT0RFUy5DT0xPUl0gICAgICAgICA9ICdzb3VyY2Utb3Zlcic7XHJcbiAgICAgICAgICAgIHRoaXMuYmxlbmRNb2Rlc1tDT05TVC5CTEVORF9NT0RFUy5MVU1JTk9TSVRZXSAgICA9ICdzb3VyY2Utb3Zlcic7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG4iLCJ2YXIgQ09OU1QgPSByZXF1aXJlKCcuLi8uLi8uLi9jb25zdCcpO1xyXG5cclxuLyoqXHJcbiAqIEEgc2V0IG9mIGZ1bmN0aW9ucyB1c2VkIGJ5IHRoZSBjYW52YXMgcmVuZGVyZXIgdG8gZHJhdyB0aGUgcHJpbWl0aXZlIGdyYXBoaWNzIGRhdGEuXHJcbiAqIEBzdGF0aWNcclxuICogQGNsYXNzXHJcbiAqIEBtZW1iZXJvZiBQSVhJXHJcbiAqL1xyXG52YXIgQ2FudmFzR3JhcGhpY3MgPSB7fTtcclxubW9kdWxlLmV4cG9ydHMgPSBDYW52YXNHcmFwaGljcztcclxuXHJcbi8qXHJcbiAqIFJlbmRlcnMgYSBHcmFwaGljcyBvYmplY3QgdG8gYSBjYW52YXMuXHJcbiAqXHJcbiAqIEBwYXJhbSBncmFwaGljcyB7UElYSS5HcmFwaGljc30gdGhlIGFjdHVhbCBncmFwaGljcyBvYmplY3QgdG8gcmVuZGVyXHJcbiAqIEBwYXJhbSBjb250ZXh0IHtDYW52YXNSZW5kZXJpbmdDb250ZXh0MkR9IHRoZSAyZCBkcmF3aW5nIG1ldGhvZCBvZiB0aGUgY2FudmFzXHJcbiAqL1xyXG5DYW52YXNHcmFwaGljcy5yZW5kZXJHcmFwaGljcyA9IGZ1bmN0aW9uIChncmFwaGljcywgY29udGV4dClcclxue1xyXG4gICAgdmFyIHdvcmxkQWxwaGEgPSBncmFwaGljcy53b3JsZEFscGhhO1xyXG5cclxuICAgIGlmIChncmFwaGljcy5kaXJ0eSlcclxuICAgIHtcclxuICAgICAgICB0aGlzLnVwZGF0ZUdyYXBoaWNzVGludChncmFwaGljcyk7XHJcbiAgICAgICAgZ3JhcGhpY3MuZGlydHkgPSBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGdyYXBoaWNzLmdyYXBoaWNzRGF0YS5sZW5ndGg7IGkrKylcclxuICAgIHtcclxuICAgICAgICB2YXIgZGF0YSA9IGdyYXBoaWNzLmdyYXBoaWNzRGF0YVtpXTtcclxuICAgICAgICB2YXIgc2hhcGUgPSBkYXRhLnNoYXBlO1xyXG5cclxuICAgICAgICB2YXIgZmlsbENvbG9yID0gZGF0YS5fZmlsbFRpbnQ7XHJcbiAgICAgICAgdmFyIGxpbmVDb2xvciA9IGRhdGEuX2xpbmVUaW50O1xyXG5cclxuICAgICAgICBjb250ZXh0LmxpbmVXaWR0aCA9IGRhdGEubGluZVdpZHRoO1xyXG5cclxuICAgICAgICBpZiAoZGF0YS50eXBlID09PSBDT05TVC5TSEFQRVMuUE9MWSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnRleHQuYmVnaW5QYXRoKCk7XHJcblxyXG4gICAgICAgICAgICB2YXIgcG9pbnRzID0gc2hhcGUucG9pbnRzO1xyXG5cclxuICAgICAgICAgICAgY29udGV4dC5tb3ZlVG8ocG9pbnRzWzBdLCBwb2ludHNbMV0pO1xyXG5cclxuICAgICAgICAgICAgZm9yICh2YXIgaj0xOyBqIDwgcG9pbnRzLmxlbmd0aC8yOyBqKyspXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGNvbnRleHQubGluZVRvKHBvaW50c1tqICogMl0sIHBvaW50c1tqICogMiArIDFdKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKHNoYXBlLmNsb3NlZClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY29udGV4dC5saW5lVG8ocG9pbnRzWzBdLCBwb2ludHNbMV0pO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBpZiB0aGUgZmlyc3QgYW5kIGxhc3QgcG9pbnQgYXJlIHRoZSBzYW1lIGNsb3NlIHRoZSBwYXRoIC0gbXVjaCBuZWF0ZXIgOilcclxuICAgICAgICAgICAgaWYgKHBvaW50c1swXSA9PT0gcG9pbnRzW3BvaW50cy5sZW5ndGgtMl0gJiYgcG9pbnRzWzFdID09PSBwb2ludHNbcG9pbnRzLmxlbmd0aC0xXSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY29udGV4dC5jbG9zZVBhdGgoKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKGRhdGEuZmlsbClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY29udGV4dC5nbG9iYWxBbHBoYSA9IGRhdGEuZmlsbEFscGhhICogd29ybGRBbHBoYTtcclxuICAgICAgICAgICAgICAgIGNvbnRleHQuZmlsbFN0eWxlID0gJyMnICsgKCcwMDAwMCcgKyAoIGZpbGxDb2xvciB8IDApLnRvU3RyaW5nKDE2KSkuc3Vic3RyKC02KTtcclxuICAgICAgICAgICAgICAgIGNvbnRleHQuZmlsbCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChkYXRhLmxpbmVXaWR0aClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY29udGV4dC5nbG9iYWxBbHBoYSA9IGRhdGEubGluZUFscGhhICogd29ybGRBbHBoYTtcclxuICAgICAgICAgICAgICAgIGNvbnRleHQuc3Ryb2tlU3R5bGUgPSAnIycgKyAoJzAwMDAwJyArICggbGluZUNvbG9yIHwgMCkudG9TdHJpbmcoMTYpKS5zdWJzdHIoLTYpO1xyXG4gICAgICAgICAgICAgICAgY29udGV4dC5zdHJva2UoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmIChkYXRhLnR5cGUgPT09IENPTlNULlNIQVBFUy5SRUNUKVxyXG4gICAgICAgIHtcclxuXHJcbiAgICAgICAgICAgIGlmIChkYXRhLmZpbGxDb2xvciB8fCBkYXRhLmZpbGxDb2xvciA9PT0gMClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY29udGV4dC5nbG9iYWxBbHBoYSA9IGRhdGEuZmlsbEFscGhhICogd29ybGRBbHBoYTtcclxuICAgICAgICAgICAgICAgIGNvbnRleHQuZmlsbFN0eWxlID0gJyMnICsgKCcwMDAwMCcgKyAoIGZpbGxDb2xvciB8IDApLnRvU3RyaW5nKDE2KSkuc3Vic3RyKC02KTtcclxuICAgICAgICAgICAgICAgIGNvbnRleHQuZmlsbFJlY3Qoc2hhcGUueCwgc2hhcGUueSwgc2hhcGUud2lkdGgsIHNoYXBlLmhlaWdodCk7XHJcblxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChkYXRhLmxpbmVXaWR0aClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY29udGV4dC5nbG9iYWxBbHBoYSA9IGRhdGEubGluZUFscGhhICogd29ybGRBbHBoYTtcclxuICAgICAgICAgICAgICAgIGNvbnRleHQuc3Ryb2tlU3R5bGUgPSAnIycgKyAoJzAwMDAwJyArICggbGluZUNvbG9yIHwgMCkudG9TdHJpbmcoMTYpKS5zdWJzdHIoLTYpO1xyXG4gICAgICAgICAgICAgICAgY29udGV4dC5zdHJva2VSZWN0KHNoYXBlLngsIHNoYXBlLnksIHNoYXBlLndpZHRoLCBzaGFwZS5oZWlnaHQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKGRhdGEudHlwZSA9PT0gQ09OU1QuU0hBUEVTLkNJUkMpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICAvLyBUT0RPIC0gbmVlZCB0byBiZSBVbmRlZmluZWQhXHJcbiAgICAgICAgICAgIGNvbnRleHQuYmVnaW5QYXRoKCk7XHJcbiAgICAgICAgICAgIGNvbnRleHQuYXJjKHNoYXBlLngsIHNoYXBlLnksIHNoYXBlLnJhZGl1cywwLDIqTWF0aC5QSSk7XHJcbiAgICAgICAgICAgIGNvbnRleHQuY2xvc2VQYXRoKCk7XHJcblxyXG4gICAgICAgICAgICBpZiAoZGF0YS5maWxsKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBjb250ZXh0Lmdsb2JhbEFscGhhID0gZGF0YS5maWxsQWxwaGEgKiB3b3JsZEFscGhhO1xyXG4gICAgICAgICAgICAgICAgY29udGV4dC5maWxsU3R5bGUgPSAnIycgKyAoJzAwMDAwJyArICggZmlsbENvbG9yIHwgMCkudG9TdHJpbmcoMTYpKS5zdWJzdHIoLTYpO1xyXG4gICAgICAgICAgICAgICAgY29udGV4dC5maWxsKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGRhdGEubGluZVdpZHRoKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBjb250ZXh0Lmdsb2JhbEFscGhhID0gZGF0YS5saW5lQWxwaGEgKiB3b3JsZEFscGhhO1xyXG4gICAgICAgICAgICAgICAgY29udGV4dC5zdHJva2VTdHlsZSA9ICcjJyArICgnMDAwMDAnICsgKCBsaW5lQ29sb3IgfCAwKS50b1N0cmluZygxNikpLnN1YnN0cigtNik7XHJcbiAgICAgICAgICAgICAgICBjb250ZXh0LnN0cm9rZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKGRhdGEudHlwZSA9PT0gQ09OU1QuU0hBUEVTLkVMSVApXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICAvLyBlbGxpcHNlIGNvZGUgdGFrZW4gZnJvbTogaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8yMTcyNzk4L2hvdy10by1kcmF3LWFuLW92YWwtaW4taHRtbDUtY2FudmFzXHJcblxyXG4gICAgICAgICAgICB2YXIgdyA9IHNoYXBlLndpZHRoICogMjtcclxuICAgICAgICAgICAgdmFyIGggPSBzaGFwZS5oZWlnaHQgKiAyO1xyXG5cclxuICAgICAgICAgICAgdmFyIHggPSBzaGFwZS54IC0gdy8yO1xyXG4gICAgICAgICAgICB2YXIgeSA9IHNoYXBlLnkgLSBoLzI7XHJcblxyXG4gICAgICAgICAgICBjb250ZXh0LmJlZ2luUGF0aCgpO1xyXG5cclxuICAgICAgICAgICAgdmFyIGthcHBhID0gMC41NTIyODQ4LFxyXG4gICAgICAgICAgICAgICAgb3ggPSAodyAvIDIpICoga2FwcGEsIC8vIGNvbnRyb2wgcG9pbnQgb2Zmc2V0IGhvcml6b250YWxcclxuICAgICAgICAgICAgICAgIG95ID0gKGggLyAyKSAqIGthcHBhLCAvLyBjb250cm9sIHBvaW50IG9mZnNldCB2ZXJ0aWNhbFxyXG4gICAgICAgICAgICAgICAgeGUgPSB4ICsgdywgICAgICAgICAgIC8vIHgtZW5kXHJcbiAgICAgICAgICAgICAgICB5ZSA9IHkgKyBoLCAgICAgICAgICAgLy8geS1lbmRcclxuICAgICAgICAgICAgICAgIHhtID0geCArIHcgLyAyLCAgICAgICAvLyB4LW1pZGRsZVxyXG4gICAgICAgICAgICAgICAgeW0gPSB5ICsgaCAvIDI7ICAgICAgIC8vIHktbWlkZGxlXHJcblxyXG4gICAgICAgICAgICBjb250ZXh0Lm1vdmVUbyh4LCB5bSk7XHJcbiAgICAgICAgICAgIGNvbnRleHQuYmV6aWVyQ3VydmVUbyh4LCB5bSAtIG95LCB4bSAtIG94LCB5LCB4bSwgeSk7XHJcbiAgICAgICAgICAgIGNvbnRleHQuYmV6aWVyQ3VydmVUbyh4bSArIG94LCB5LCB4ZSwgeW0gLSBveSwgeGUsIHltKTtcclxuICAgICAgICAgICAgY29udGV4dC5iZXppZXJDdXJ2ZVRvKHhlLCB5bSArIG95LCB4bSArIG94LCB5ZSwgeG0sIHllKTtcclxuICAgICAgICAgICAgY29udGV4dC5iZXppZXJDdXJ2ZVRvKHhtIC0gb3gsIHllLCB4LCB5bSArIG95LCB4LCB5bSk7XHJcblxyXG4gICAgICAgICAgICBjb250ZXh0LmNsb3NlUGF0aCgpO1xyXG5cclxuICAgICAgICAgICAgaWYgKGRhdGEuZmlsbClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY29udGV4dC5nbG9iYWxBbHBoYSA9IGRhdGEuZmlsbEFscGhhICogd29ybGRBbHBoYTtcclxuICAgICAgICAgICAgICAgIGNvbnRleHQuZmlsbFN0eWxlID0gJyMnICsgKCcwMDAwMCcgKyAoIGZpbGxDb2xvciB8IDApLnRvU3RyaW5nKDE2KSkuc3Vic3RyKC02KTtcclxuICAgICAgICAgICAgICAgIGNvbnRleHQuZmlsbCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChkYXRhLmxpbmVXaWR0aClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY29udGV4dC5nbG9iYWxBbHBoYSA9IGRhdGEubGluZUFscGhhICogd29ybGRBbHBoYTtcclxuICAgICAgICAgICAgICAgIGNvbnRleHQuc3Ryb2tlU3R5bGUgPSAnIycgKyAoJzAwMDAwJyArICggbGluZUNvbG9yIHwgMCkudG9TdHJpbmcoMTYpKS5zdWJzdHIoLTYpO1xyXG4gICAgICAgICAgICAgICAgY29udGV4dC5zdHJva2UoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmIChkYXRhLnR5cGUgPT09IENPTlNULlNIQVBFUy5SUkVDKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdmFyIHJ4ID0gc2hhcGUueDtcclxuICAgICAgICAgICAgdmFyIHJ5ID0gc2hhcGUueTtcclxuICAgICAgICAgICAgdmFyIHdpZHRoID0gc2hhcGUud2lkdGg7XHJcbiAgICAgICAgICAgIHZhciBoZWlnaHQgPSBzaGFwZS5oZWlnaHQ7XHJcbiAgICAgICAgICAgIHZhciByYWRpdXMgPSBzaGFwZS5yYWRpdXM7XHJcblxyXG4gICAgICAgICAgICB2YXIgbWF4UmFkaXVzID0gTWF0aC5taW4od2lkdGgsIGhlaWdodCkgLyAyIHwgMDtcclxuICAgICAgICAgICAgcmFkaXVzID0gcmFkaXVzID4gbWF4UmFkaXVzID8gbWF4UmFkaXVzIDogcmFkaXVzO1xyXG5cclxuICAgICAgICAgICAgY29udGV4dC5iZWdpblBhdGgoKTtcclxuICAgICAgICAgICAgY29udGV4dC5tb3ZlVG8ocngsIHJ5ICsgcmFkaXVzKTtcclxuICAgICAgICAgICAgY29udGV4dC5saW5lVG8ocngsIHJ5ICsgaGVpZ2h0IC0gcmFkaXVzKTtcclxuICAgICAgICAgICAgY29udGV4dC5xdWFkcmF0aWNDdXJ2ZVRvKHJ4LCByeSArIGhlaWdodCwgcnggKyByYWRpdXMsIHJ5ICsgaGVpZ2h0KTtcclxuICAgICAgICAgICAgY29udGV4dC5saW5lVG8ocnggKyB3aWR0aCAtIHJhZGl1cywgcnkgKyBoZWlnaHQpO1xyXG4gICAgICAgICAgICBjb250ZXh0LnF1YWRyYXRpY0N1cnZlVG8ocnggKyB3aWR0aCwgcnkgKyBoZWlnaHQsIHJ4ICsgd2lkdGgsIHJ5ICsgaGVpZ2h0IC0gcmFkaXVzKTtcclxuICAgICAgICAgICAgY29udGV4dC5saW5lVG8ocnggKyB3aWR0aCwgcnkgKyByYWRpdXMpO1xyXG4gICAgICAgICAgICBjb250ZXh0LnF1YWRyYXRpY0N1cnZlVG8ocnggKyB3aWR0aCwgcnksIHJ4ICsgd2lkdGggLSByYWRpdXMsIHJ5KTtcclxuICAgICAgICAgICAgY29udGV4dC5saW5lVG8ocnggKyByYWRpdXMsIHJ5KTtcclxuICAgICAgICAgICAgY29udGV4dC5xdWFkcmF0aWNDdXJ2ZVRvKHJ4LCByeSwgcngsIHJ5ICsgcmFkaXVzKTtcclxuICAgICAgICAgICAgY29udGV4dC5jbG9zZVBhdGgoKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChkYXRhLmZpbGxDb2xvciB8fCBkYXRhLmZpbGxDb2xvciA9PT0gMClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY29udGV4dC5nbG9iYWxBbHBoYSA9IGRhdGEuZmlsbEFscGhhICogd29ybGRBbHBoYTtcclxuICAgICAgICAgICAgICAgIGNvbnRleHQuZmlsbFN0eWxlID0gJyMnICsgKCcwMDAwMCcgKyAoIGZpbGxDb2xvciB8IDApLnRvU3RyaW5nKDE2KSkuc3Vic3RyKC02KTtcclxuICAgICAgICAgICAgICAgIGNvbnRleHQuZmlsbCgpO1xyXG5cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoZGF0YS5saW5lV2lkdGgpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGNvbnRleHQuZ2xvYmFsQWxwaGEgPSBkYXRhLmxpbmVBbHBoYSAqIHdvcmxkQWxwaGE7XHJcbiAgICAgICAgICAgICAgICBjb250ZXh0LnN0cm9rZVN0eWxlID0gJyMnICsgKCcwMDAwMCcgKyAoIGxpbmVDb2xvciB8IDApLnRvU3RyaW5nKDE2KSkuc3Vic3RyKC02KTtcclxuICAgICAgICAgICAgICAgIGNvbnRleHQuc3Ryb2tlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG4vKlxyXG4gKiBSZW5kZXJzIGEgZ3JhcGhpY3MgbWFza1xyXG4gKlxyXG4gKiBAcHJpdmF0ZVxyXG4gKiBAcGFyYW0gZ3JhcGhpY3Mge1BJWEkuR3JhcGhpY3N9IHRoZSBncmFwaGljcyB3aGljaCB3aWxsIGJlIHVzZWQgYXMgYSBtYXNrXHJcbiAqIEBwYXJhbSBjb250ZXh0IHtDYW52YXNSZW5kZXJpbmdDb250ZXh0MkR9IHRoZSBjb250ZXh0IDJkIG1ldGhvZCBvZiB0aGUgY2FudmFzXHJcbiAqL1xyXG5DYW52YXNHcmFwaGljcy5yZW5kZXJHcmFwaGljc01hc2sgPSBmdW5jdGlvbiAoZ3JhcGhpY3MsIGNvbnRleHQpXHJcbntcclxuICAgIHZhciBsZW4gPSBncmFwaGljcy5ncmFwaGljc0RhdGEubGVuZ3RoO1xyXG5cclxuICAgIGlmIChsZW4gPT09IDApXHJcbiAgICB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnRleHQuYmVnaW5QYXRoKCk7XHJcblxyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkrKylcclxuICAgIHtcclxuICAgICAgICB2YXIgZGF0YSA9IGdyYXBoaWNzLmdyYXBoaWNzRGF0YVtpXTtcclxuICAgICAgICB2YXIgc2hhcGUgPSBkYXRhLnNoYXBlO1xyXG5cclxuICAgICAgICBpZiAoZGF0YS50eXBlID09PSBDT05TVC5TSEFQRVMuUE9MWSlcclxuICAgICAgICB7XHJcblxyXG4gICAgICAgICAgICB2YXIgcG9pbnRzID0gc2hhcGUucG9pbnRzO1xyXG5cclxuICAgICAgICAgICAgY29udGV4dC5tb3ZlVG8ocG9pbnRzWzBdLCBwb2ludHNbMV0pO1xyXG5cclxuICAgICAgICAgICAgZm9yICh2YXIgaj0xOyBqIDwgcG9pbnRzLmxlbmd0aC8yOyBqKyspXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGNvbnRleHQubGluZVRvKHBvaW50c1tqICogMl0sIHBvaW50c1tqICogMiArIDFdKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gaWYgdGhlIGZpcnN0IGFuZCBsYXN0IHBvaW50IGFyZSB0aGUgc2FtZSBjbG9zZSB0aGUgcGF0aCAtIG11Y2ggbmVhdGVyIDopXHJcbiAgICAgICAgICAgIGlmIChwb2ludHNbMF0gPT09IHBvaW50c1twb2ludHMubGVuZ3RoLTJdICYmIHBvaW50c1sxXSA9PT0gcG9pbnRzW3BvaW50cy5sZW5ndGgtMV0pXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGNvbnRleHQuY2xvc2VQYXRoKCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKGRhdGEudHlwZSA9PT0gQ09OU1QuU0hBUEVTLlJFQ1QpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjb250ZXh0LnJlY3Qoc2hhcGUueCwgc2hhcGUueSwgc2hhcGUud2lkdGgsIHNoYXBlLmhlaWdodCk7XHJcbiAgICAgICAgICAgIGNvbnRleHQuY2xvc2VQYXRoKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKGRhdGEudHlwZSA9PT0gQ09OU1QuU0hBUEVTLkNJUkMpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICAvLyBUT0RPIC0gbmVlZCB0byBiZSBVbmRlZmluZWQhXHJcbiAgICAgICAgICAgIGNvbnRleHQuYXJjKHNoYXBlLngsIHNoYXBlLnksIHNoYXBlLnJhZGl1cywgMCwgMiAqIE1hdGguUEkpO1xyXG4gICAgICAgICAgICBjb250ZXh0LmNsb3NlUGF0aCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmIChkYXRhLnR5cGUgPT09IENPTlNULlNIQVBFUy5FTElQKVxyXG4gICAgICAgIHtcclxuXHJcbiAgICAgICAgICAgIC8vIGVsbGlwc2UgY29kZSB0YWtlbiBmcm9tOiBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzIxNzI3OTgvaG93LXRvLWRyYXctYW4tb3ZhbC1pbi1odG1sNS1jYW52YXNcclxuXHJcbiAgICAgICAgICAgIHZhciB3ID0gc2hhcGUud2lkdGggKiAyO1xyXG4gICAgICAgICAgICB2YXIgaCA9IHNoYXBlLmhlaWdodCAqIDI7XHJcblxyXG4gICAgICAgICAgICB2YXIgeCA9IHNoYXBlLnggLSB3LzI7XHJcbiAgICAgICAgICAgIHZhciB5ID0gc2hhcGUueSAtIGgvMjtcclxuXHJcbiAgICAgICAgICAgIHZhciBrYXBwYSA9IDAuNTUyMjg0OCxcclxuICAgICAgICAgICAgICAgIG94ID0gKHcgLyAyKSAqIGthcHBhLCAvLyBjb250cm9sIHBvaW50IG9mZnNldCBob3Jpem9udGFsXHJcbiAgICAgICAgICAgICAgICBveSA9IChoIC8gMikgKiBrYXBwYSwgLy8gY29udHJvbCBwb2ludCBvZmZzZXQgdmVydGljYWxcclxuICAgICAgICAgICAgICAgIHhlID0geCArIHcsICAgICAgICAgICAvLyB4LWVuZFxyXG4gICAgICAgICAgICAgICAgeWUgPSB5ICsgaCwgICAgICAgICAgIC8vIHktZW5kXHJcbiAgICAgICAgICAgICAgICB4bSA9IHggKyB3IC8gMiwgICAgICAgLy8geC1taWRkbGVcclxuICAgICAgICAgICAgICAgIHltID0geSArIGggLyAyOyAgICAgICAvLyB5LW1pZGRsZVxyXG5cclxuICAgICAgICAgICAgY29udGV4dC5tb3ZlVG8oeCwgeW0pO1xyXG4gICAgICAgICAgICBjb250ZXh0LmJlemllckN1cnZlVG8oeCwgeW0gLSBveSwgeG0gLSBveCwgeSwgeG0sIHkpO1xyXG4gICAgICAgICAgICBjb250ZXh0LmJlemllckN1cnZlVG8oeG0gKyBveCwgeSwgeGUsIHltIC0gb3ksIHhlLCB5bSk7XHJcbiAgICAgICAgICAgIGNvbnRleHQuYmV6aWVyQ3VydmVUbyh4ZSwgeW0gKyBveSwgeG0gKyBveCwgeWUsIHhtLCB5ZSk7XHJcbiAgICAgICAgICAgIGNvbnRleHQuYmV6aWVyQ3VydmVUbyh4bSAtIG94LCB5ZSwgeCwgeW0gKyBveSwgeCwgeW0pO1xyXG4gICAgICAgICAgICBjb250ZXh0LmNsb3NlUGF0aCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmIChkYXRhLnR5cGUgPT09IENPTlNULlNIQVBFUy5SUkVDKVxyXG4gICAgICAgIHtcclxuXHJcbiAgICAgICAgICAgIHZhciByeCA9IHNoYXBlLng7XHJcbiAgICAgICAgICAgIHZhciByeSA9IHNoYXBlLnk7XHJcbiAgICAgICAgICAgIHZhciB3aWR0aCA9IHNoYXBlLndpZHRoO1xyXG4gICAgICAgICAgICB2YXIgaGVpZ2h0ID0gc2hhcGUuaGVpZ2h0O1xyXG4gICAgICAgICAgICB2YXIgcmFkaXVzID0gc2hhcGUucmFkaXVzO1xyXG5cclxuICAgICAgICAgICAgdmFyIG1heFJhZGl1cyA9IE1hdGgubWluKHdpZHRoLCBoZWlnaHQpIC8gMiB8IDA7XHJcbiAgICAgICAgICAgIHJhZGl1cyA9IHJhZGl1cyA+IG1heFJhZGl1cyA/IG1heFJhZGl1cyA6IHJhZGl1cztcclxuXHJcbiAgICAgICAgICAgIGNvbnRleHQubW92ZVRvKHJ4LCByeSArIHJhZGl1cyk7XHJcbiAgICAgICAgICAgIGNvbnRleHQubGluZVRvKHJ4LCByeSArIGhlaWdodCAtIHJhZGl1cyk7XHJcbiAgICAgICAgICAgIGNvbnRleHQucXVhZHJhdGljQ3VydmVUbyhyeCwgcnkgKyBoZWlnaHQsIHJ4ICsgcmFkaXVzLCByeSArIGhlaWdodCk7XHJcbiAgICAgICAgICAgIGNvbnRleHQubGluZVRvKHJ4ICsgd2lkdGggLSByYWRpdXMsIHJ5ICsgaGVpZ2h0KTtcclxuICAgICAgICAgICAgY29udGV4dC5xdWFkcmF0aWNDdXJ2ZVRvKHJ4ICsgd2lkdGgsIHJ5ICsgaGVpZ2h0LCByeCArIHdpZHRoLCByeSArIGhlaWdodCAtIHJhZGl1cyk7XHJcbiAgICAgICAgICAgIGNvbnRleHQubGluZVRvKHJ4ICsgd2lkdGgsIHJ5ICsgcmFkaXVzKTtcclxuICAgICAgICAgICAgY29udGV4dC5xdWFkcmF0aWNDdXJ2ZVRvKHJ4ICsgd2lkdGgsIHJ5LCByeCArIHdpZHRoIC0gcmFkaXVzLCByeSk7XHJcbiAgICAgICAgICAgIGNvbnRleHQubGluZVRvKHJ4ICsgcmFkaXVzLCByeSk7XHJcbiAgICAgICAgICAgIGNvbnRleHQucXVhZHJhdGljQ3VydmVUbyhyeCwgcnksIHJ4LCByeSArIHJhZGl1cyk7XHJcbiAgICAgICAgICAgIGNvbnRleHQuY2xvc2VQYXRoKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuLypcclxuICogVXBkYXRlcyB0aGUgdGludCBvZiBhIGdyYXBoaWNzIG9iamVjdFxyXG4gKlxyXG4gKiBAcHJpdmF0ZVxyXG4gKiBAcGFyYW0gZ3JhcGhpY3Mge1BJWEkuR3JhcGhpY3N9IHRoZSBncmFwaGljcyB0aGF0IHdpbGwgaGF2ZSBpdHMgdGludCB1cGRhdGVkXHJcbiAqXHJcbiAqL1xyXG5DYW52YXNHcmFwaGljcy51cGRhdGVHcmFwaGljc1RpbnQgPSBmdW5jdGlvbiAoZ3JhcGhpY3MpXHJcbntcclxuICAgIGlmIChncmFwaGljcy50aW50ID09PSAweEZGRkZGRiAmJiBncmFwaGljcy5fcHJldlRpbnQgPT09IGdyYXBoaWNzLnRpbnQpXHJcbiAgICB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgZ3JhcGhpY3MuX3ByZXZUaW50ID0gZ3JhcGhpY3MudGludDtcclxuXHJcbiAgICB2YXIgdGludFIgPSAoZ3JhcGhpY3MudGludCA+PiAxNiAmIDB4RkYpIC8gMjU1O1xyXG4gICAgdmFyIHRpbnRHID0gKGdyYXBoaWNzLnRpbnQgPj4gOCAmIDB4RkYpIC8gMjU1O1xyXG4gICAgdmFyIHRpbnRCID0gKGdyYXBoaWNzLnRpbnQgJiAweEZGKS8gMjU1O1xyXG5cclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZ3JhcGhpY3MuZ3JhcGhpY3NEYXRhLmxlbmd0aDsgaSsrKVxyXG4gICAge1xyXG4gICAgICAgIHZhciBkYXRhID0gZ3JhcGhpY3MuZ3JhcGhpY3NEYXRhW2ldO1xyXG5cclxuICAgICAgICB2YXIgZmlsbENvbG9yID0gZGF0YS5maWxsQ29sb3IgfCAwO1xyXG4gICAgICAgIHZhciBsaW5lQ29sb3IgPSBkYXRhLmxpbmVDb2xvciB8IDA7XHJcblxyXG4gICAgICAgIC8qXHJcbiAgICAgICAgdmFyIGNvbG9yUiA9IChmaWxsQ29sb3IgPj4gMTYgJiAweEZGKSAvIDI1NTtcclxuICAgICAgICB2YXIgY29sb3JHID0gKGZpbGxDb2xvciA+PiA4ICYgMHhGRikgLyAyNTU7XHJcbiAgICAgICAgdmFyIGNvbG9yQiA9IChmaWxsQ29sb3IgJiAweEZGKSAvIDI1NTtcclxuXHJcbiAgICAgICAgY29sb3JSICo9IHRpbnRSO1xyXG4gICAgICAgIGNvbG9yRyAqPSB0aW50RztcclxuICAgICAgICBjb2xvckIgKj0gdGludEI7XHJcblxyXG4gICAgICAgIGZpbGxDb2xvciA9ICgoY29sb3JSKjI1NSA8PCAxNikgKyAoY29sb3JHKjI1NSA8PCA4KSArIGNvbG9yQioyNTUpO1xyXG5cclxuICAgICAgICBjb2xvclIgPSAobGluZUNvbG9yID4+IDE2ICYgMHhGRikgLyAyNTU7XHJcbiAgICAgICAgY29sb3JHID0gKGxpbmVDb2xvciA+PiA4ICYgMHhGRikgLyAyNTU7XHJcbiAgICAgICAgY29sb3JCID0gKGxpbmVDb2xvciAmIDB4RkYpIC8gMjU1O1xyXG5cclxuICAgICAgICBjb2xvclIgKj0gdGludFI7XHJcbiAgICAgICAgY29sb3JHICo9IHRpbnRHO1xyXG4gICAgICAgIGNvbG9yQiAqPSB0aW50QjtcclxuXHJcbiAgICAgICAgbGluZUNvbG9yID0gKChjb2xvclIqMjU1IDw8IDE2KSArIChjb2xvckcqMjU1IDw8IDgpICsgY29sb3JCKjI1NSk7XHJcbiAgICAgICAgKi9cclxuXHJcbiAgICAgICAgLy8gc3VwZXIgaW5saW5lIGNvcyBpbSBhbiBvcHRpbWl6YXRpb24gTkFaSSA6KVxyXG4gICAgICAgIGRhdGEuX2ZpbGxUaW50ID0gKCgoZmlsbENvbG9yID4+IDE2ICYgMHhGRikgLyAyNTUgKiB0aW50UioyNTUgPDwgMTYpICsgKChmaWxsQ29sb3IgPj4gOCAmIDB4RkYpIC8gMjU1ICogdGludEcqMjU1IDw8IDgpICsgIChmaWxsQ29sb3IgJiAweEZGKSAvIDI1NSAqIHRpbnRCKjI1NSk7XHJcbiAgICAgICAgZGF0YS5fbGluZVRpbnQgPSAoKChsaW5lQ29sb3IgPj4gMTYgJiAweEZGKSAvIDI1NSAqIHRpbnRSKjI1NSA8PCAxNikgKyAoKGxpbmVDb2xvciA+PiA4ICYgMHhGRikgLyAyNTUgKiB0aW50RyoyNTUgPDwgOCkgKyAgKGxpbmVDb2xvciAmIDB4RkYpIC8gMjU1ICogdGludEIqMjU1KTtcclxuXHJcbiAgICB9XHJcbn07XHJcblxyXG4iLCJ2YXIgQ2FudmFzR3JhcGhpY3MgPSByZXF1aXJlKCcuL0NhbnZhc0dyYXBoaWNzJyk7XHJcblxyXG4vKipcclxuICogQSBzZXQgb2YgZnVuY3Rpb25zIHVzZWQgdG8gaGFuZGxlIG1hc2tpbmcuXHJcbiAqXHJcbiAqIEBjbGFzc1xyXG4gKiBAbWVtYmVyb2YgUElYSVxyXG4gKi9cclxuZnVuY3Rpb24gQ2FudmFzTWFza01hbmFnZXIoKVxyXG57fVxyXG5cclxuQ2FudmFzTWFza01hbmFnZXIucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gQ2FudmFzTWFza01hbmFnZXI7XHJcbm1vZHVsZS5leHBvcnRzID0gQ2FudmFzTWFza01hbmFnZXI7XHJcblxyXG4vKipcclxuICogVGhpcyBtZXRob2QgYWRkcyBpdCB0byB0aGUgY3VycmVudCBzdGFjayBvZiBtYXNrcy5cclxuICpcclxuICogQHBhcmFtIG1hc2tEYXRhIHtvYmplY3R9IHRoZSBtYXNrRGF0YSB0aGF0IHdpbGwgYmUgcHVzaGVkXHJcbiAqIEBwYXJhbSByZW5kZXJlciB7UElYSS5XZWJHTFJlbmRlcmVyfFBJWEkuQ2FudmFzUmVuZGVyZXJ9IFRoZSByZW5kZXJlciBjb250ZXh0IHRvIHVzZS5cclxuICovXHJcbkNhbnZhc01hc2tNYW5hZ2VyLnByb3RvdHlwZS5wdXNoTWFzayA9IGZ1bmN0aW9uIChtYXNrRGF0YSwgcmVuZGVyZXIpXHJcbntcclxuXHJcbiAgICByZW5kZXJlci5jb250ZXh0LnNhdmUoKTtcclxuXHJcbiAgICB2YXIgY2FjaGVBbHBoYSA9IG1hc2tEYXRhLmFscGhhO1xyXG4gICAgdmFyIHRyYW5zZm9ybSA9IG1hc2tEYXRhLndvcmxkVHJhbnNmb3JtO1xyXG4gICAgdmFyIHJlc29sdXRpb24gPSByZW5kZXJlci5yZXNvbHV0aW9uO1xyXG5cclxuICAgIHJlbmRlcmVyLmNvbnRleHQuc2V0VHJhbnNmb3JtKFxyXG4gICAgICAgIHRyYW5zZm9ybS5hICogcmVzb2x1dGlvbixcclxuICAgICAgICB0cmFuc2Zvcm0uYiAqIHJlc29sdXRpb24sXHJcbiAgICAgICAgdHJhbnNmb3JtLmMgKiByZXNvbHV0aW9uLFxyXG4gICAgICAgIHRyYW5zZm9ybS5kICogcmVzb2x1dGlvbixcclxuICAgICAgICB0cmFuc2Zvcm0udHggKiByZXNvbHV0aW9uLFxyXG4gICAgICAgIHRyYW5zZm9ybS50eSAqIHJlc29sdXRpb25cclxuICAgICk7XHJcblxyXG4gICAgLy9UT0RPIHN1cG9ydCBzcHJpdGUgYWxwaGEgbWFza3M/P1xyXG4gICAgLy9sb3RzIG9mIGVmZm9ydCByZXF1aXJlZC4gSWYgZGVtYW5kIGlzIGdyZWF0IGVub3VnaC4uXHJcbiAgICBpZighbWFza0RhdGEudGV4dHVyZSlcclxuICAgIHtcclxuICAgICAgICBDYW52YXNHcmFwaGljcy5yZW5kZXJHcmFwaGljc01hc2sobWFza0RhdGEsIHJlbmRlcmVyLmNvbnRleHQpO1xyXG4gICAgICAgIHJlbmRlcmVyLmNvbnRleHQuY2xpcCgpO1xyXG4gICAgfVxyXG5cclxuICAgIG1hc2tEYXRhLndvcmxkQWxwaGEgPSBjYWNoZUFscGhhO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFJlc3RvcmVzIHRoZSBjdXJyZW50IGRyYXdpbmcgY29udGV4dCB0byB0aGUgc3RhdGUgaXQgd2FzIGJlZm9yZSB0aGUgbWFzayB3YXMgYXBwbGllZC5cclxuICpcclxuICogQHBhcmFtIHJlbmRlcmVyIHtQSVhJLldlYkdMUmVuZGVyZXJ8UElYSS5DYW52YXNSZW5kZXJlcn0gVGhlIHJlbmRlcmVyIGNvbnRleHQgdG8gdXNlLlxyXG4gKi9cclxuQ2FudmFzTWFza01hbmFnZXIucHJvdG90eXBlLnBvcE1hc2sgPSBmdW5jdGlvbiAocmVuZGVyZXIpXHJcbntcclxuICAgIHJlbmRlcmVyLmNvbnRleHQucmVzdG9yZSgpO1xyXG59O1xyXG5cclxuQ2FudmFzTWFza01hbmFnZXIucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbiAoKSB7fTtcclxuIiwidmFyIG1hdGggPSByZXF1aXJlKCcuLi9tYXRoJyksXHJcbiAgICBUZXh0dXJlID0gcmVxdWlyZSgnLi4vdGV4dHVyZXMvVGV4dHVyZScpLFxyXG4gICAgQ29udGFpbmVyID0gcmVxdWlyZSgnLi4vZGlzcGxheS9Db250YWluZXInKSxcclxuICAgIENhbnZhc1RpbnRlciA9IHJlcXVpcmUoJy4uL3JlbmRlcmVycy9jYW52YXMvdXRpbHMvQ2FudmFzVGludGVyJyksXHJcbiAgICB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJyksXHJcbiAgICBDT05TVCA9IHJlcXVpcmUoJy4uL2NvbnN0JyksXHJcbiAgICB0ZW1wUG9pbnQgPSBuZXcgbWF0aC5Qb2ludCgpO1xyXG5cclxuLyoqXHJcbiAqIFRoZSBTcHJpdGUgb2JqZWN0IGlzIHRoZSBiYXNlIGZvciBhbGwgdGV4dHVyZWQgb2JqZWN0cyB0aGF0IGFyZSByZW5kZXJlZCB0byB0aGUgc2NyZWVuXHJcbiAqXHJcbiAqIEEgc3ByaXRlIGNhbiBiZSBjcmVhdGVkIGRpcmVjdGx5IGZyb20gYW4gaW1hZ2UgbGlrZSB0aGlzOlxyXG4gKlxyXG4gKiBgYGBqc1xyXG4gKiB2YXIgc3ByaXRlID0gbmV3IFBJWEkuU3ByaXRlLmZyb21JbWFnZSgnYXNzZXRzL2ltYWdlLnBuZycpO1xyXG4gKiBgYGBcclxuICpcclxuICogQGNsYXNzXHJcbiAqIEBleHRlbmRzIFBJWEkuQ29udGFpbmVyXHJcbiAqIEBtZW1iZXJvZiBQSVhJXHJcbiAqIEBwYXJhbSB0ZXh0dXJlIHtQSVhJLlRleHR1cmV9IFRoZSB0ZXh0dXJlIGZvciB0aGlzIHNwcml0ZVxyXG4gKi9cclxuZnVuY3Rpb24gU3ByaXRlKHRleHR1cmUpXHJcbntcclxuICAgIENvbnRhaW5lci5jYWxsKHRoaXMpO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogVGhlIGFuY2hvciBzZXRzIHRoZSBvcmlnaW4gcG9pbnQgb2YgdGhlIHRleHR1cmUuXHJcbiAgICAgKiBUaGUgZGVmYXVsdCBpcyAwLDAgdGhpcyBtZWFucyB0aGUgdGV4dHVyZSdzIG9yaWdpbiBpcyB0aGUgdG9wIGxlZnRcclxuICAgICAqIFNldHRpbmcgdGhlIGFuY2hvciB0byAwLjUsMC41IG1lYW5zIHRoZSB0ZXh0dXJlJ3Mgb3JpZ2luIGlzIGNlbnRlcmVkXHJcbiAgICAgKiBTZXR0aW5nIHRoZSBhbmNob3IgdG8gMSwxIHdvdWxkIG1lYW4gdGhlIHRleHR1cmUncyBvcmlnaW4gcG9pbnQgd2lsbCBiZSB0aGUgYm90dG9tIHJpZ2h0IGNvcm5lclxyXG4gICAgICpcclxuICAgICAqIEBtZW1iZXIge1BJWEkuUG9pbnR9XHJcbiAgICAgKi9cclxuICAgIHRoaXMuYW5jaG9yID0gbmV3IG1hdGguUG9pbnQoKTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFRoZSB0ZXh0dXJlIHRoYXQgdGhlIHNwcml0ZSBpcyB1c2luZ1xyXG4gICAgICpcclxuICAgICAqIEBtZW1iZXIge1BJWEkuVGV4dHVyZX1cclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIHRoaXMuX3RleHR1cmUgPSBudWxsO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogVGhlIHdpZHRoIG9mIHRoZSBzcHJpdGUgKHRoaXMgaXMgaW5pdGlhbGx5IHNldCBieSB0aGUgdGV4dHVyZSlcclxuICAgICAqXHJcbiAgICAgKiBAbWVtYmVyIHtudW1iZXJ9XHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICB0aGlzLl93aWR0aCA9IDA7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgaGVpZ2h0IG9mIHRoZSBzcHJpdGUgKHRoaXMgaXMgaW5pdGlhbGx5IHNldCBieSB0aGUgdGV4dHVyZSlcclxuICAgICAqXHJcbiAgICAgKiBAbWVtYmVyIHtudW1iZXJ9XHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICB0aGlzLl9oZWlnaHQgPSAwO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogVGhlIHRpbnQgYXBwbGllZCB0byB0aGUgc3ByaXRlLiBUaGlzIGlzIGEgaGV4IHZhbHVlLiBBIHZhbHVlIG9mIDB4RkZGRkZGIHdpbGwgcmVtb3ZlIGFueSB0aW50IGVmZmVjdC5cclxuICAgICAqXHJcbiAgICAgKiBAbWVtYmVyIHtudW1iZXJ9XHJcbiAgICAgKiBAZGVmYXVsdCAweEZGRkZGRlxyXG4gICAgICovXHJcbiAgICB0aGlzLnRpbnQgPSAweEZGRkZGRjtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFRoZSBibGVuZCBtb2RlIHRvIGJlIGFwcGxpZWQgdG8gdGhlIHNwcml0ZS4gQXBwbHkgYSB2YWx1ZSBvZiBgUElYSS5CTEVORF9NT0RFUy5OT1JNQUxgIHRvIHJlc2V0IHRoZSBibGVuZCBtb2RlLlxyXG4gICAgICpcclxuICAgICAqIEBtZW1iZXIge251bWJlcn1cclxuICAgICAqIEBkZWZhdWx0IFBJWEkuQkxFTkRfTU9ERVMuTk9STUFMXHJcbiAgICAgKiBAc2VlIFBJWEkuQkxFTkRfTU9ERVNcclxuICAgICAqL1xyXG4gICAgdGhpcy5ibGVuZE1vZGUgPSBDT05TVC5CTEVORF9NT0RFUy5OT1JNQUw7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgc2hhZGVyIHRoYXQgd2lsbCBiZSB1c2VkIHRvIHJlbmRlciB0aGUgc3ByaXRlLiBTZXQgdG8gbnVsbCB0byByZW1vdmUgYSBjdXJyZW50IHNoYWRlci5cclxuICAgICAqXHJcbiAgICAgKiBAbWVtYmVyIHtQSVhJLkFic3RyYWN0RmlsdGVyfFBJWEkuU2hhZGVyfVxyXG4gICAgICovXHJcbiAgICB0aGlzLnNoYWRlciA9IG51bGw7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBbiBpbnRlcm5hbCBjYWNoZWQgdmFsdWUgb2YgdGhlIHRpbnQuXHJcbiAgICAgKlxyXG4gICAgICogQG1lbWJlciB7bnVtYmVyfVxyXG4gICAgICogQGRlZmF1bHQgMHhGRkZGRkZcclxuICAgICAqL1xyXG4gICAgdGhpcy5jYWNoZWRUaW50ID0gMHhGRkZGRkY7XHJcblxyXG4gICAgLy8gY2FsbCB0ZXh0dXJlIHNldHRlclxyXG4gICAgdGhpcy50ZXh0dXJlID0gdGV4dHVyZSB8fCBUZXh0dXJlLkVNUFRZO1xyXG59XHJcblxyXG4vLyBjb25zdHJ1Y3RvclxyXG5TcHJpdGUucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShDb250YWluZXIucHJvdG90eXBlKTtcclxuU3ByaXRlLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFNwcml0ZTtcclxubW9kdWxlLmV4cG9ydHMgPSBTcHJpdGU7XHJcblxyXG5PYmplY3QuZGVmaW5lUHJvcGVydGllcyhTcHJpdGUucHJvdG90eXBlLCB7XHJcbiAgICAvKipcclxuICAgICAqIFRoZSB3aWR0aCBvZiB0aGUgc3ByaXRlLCBzZXR0aW5nIHRoaXMgd2lsbCBhY3R1YWxseSBtb2RpZnkgdGhlIHNjYWxlIHRvIGFjaGlldmUgdGhlIHZhbHVlIHNldFxyXG4gICAgICpcclxuICAgICAqIEBtZW1iZXIge251bWJlcn1cclxuICAgICAqIEBtZW1iZXJvZiBQSVhJLlNwcml0ZSNcclxuICAgICAqL1xyXG4gICAgd2lkdGg6IHtcclxuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICByZXR1cm4gTWF0aC5hYnModGhpcy5zY2FsZS54KSAqIHRoaXMudGV4dHVyZS5fZnJhbWUud2lkdGg7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBzZXQ6IGZ1bmN0aW9uICh2YWx1ZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuc2NhbGUueCA9IHV0aWxzLnNpZ24odGhpcy5zY2FsZS54KSAqIHZhbHVlIC8gdGhpcy50ZXh0dXJlLl9mcmFtZS53aWR0aDtcclxuICAgICAgICAgICAgdGhpcy5fd2lkdGggPSB2YWx1ZTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVGhlIGhlaWdodCBvZiB0aGUgc3ByaXRlLCBzZXR0aW5nIHRoaXMgd2lsbCBhY3R1YWxseSBtb2RpZnkgdGhlIHNjYWxlIHRvIGFjaGlldmUgdGhlIHZhbHVlIHNldFxyXG4gICAgICpcclxuICAgICAqIEBtZW1iZXIge251bWJlcn1cclxuICAgICAqIEBtZW1iZXJvZiBQSVhJLlNwcml0ZSNcclxuICAgICAqL1xyXG4gICAgaGVpZ2h0OiB7XHJcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmV0dXJuICBNYXRoLmFicyh0aGlzLnNjYWxlLnkpICogdGhpcy50ZXh0dXJlLl9mcmFtZS5oZWlnaHQ7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBzZXQ6IGZ1bmN0aW9uICh2YWx1ZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuc2NhbGUueSA9IHV0aWxzLnNpZ24odGhpcy5zY2FsZS55KSAqIHZhbHVlIC8gdGhpcy50ZXh0dXJlLl9mcmFtZS5oZWlnaHQ7XHJcbiAgICAgICAgICAgIHRoaXMuX2hlaWdodCA9IHZhbHVlO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgdGV4dHVyZSB0aGF0IHRoZSBzcHJpdGUgaXMgdXNpbmdcclxuICAgICAqXHJcbiAgICAgKiBAbWVtYmVyIHtQSVhJLlRleHR1cmV9XHJcbiAgICAgKiBAbWVtYmVyb2YgUElYSS5TcHJpdGUjXHJcbiAgICAgKi9cclxuICAgIHRleHR1cmU6IHtcclxuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICByZXR1cm4gIHRoaXMuX3RleHR1cmU7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBzZXQ6IGZ1bmN0aW9uICh2YWx1ZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLl90ZXh0dXJlID09PSB2YWx1ZSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGlzLl90ZXh0dXJlID0gdmFsdWU7XHJcbiAgICAgICAgICAgIHRoaXMuY2FjaGVkVGludCA9IDB4RkZGRkZGO1xyXG5cclxuICAgICAgICAgICAgaWYgKHZhbHVlKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAvLyB3YWl0IGZvciB0aGUgdGV4dHVyZSB0byBsb2FkXHJcbiAgICAgICAgICAgICAgICBpZiAodmFsdWUuYmFzZVRleHR1cmUuaGFzTG9hZGVkKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX29uVGV4dHVyZVVwZGF0ZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlLm9uY2UoJ3VwZGF0ZScsIHRoaXMuX29uVGV4dHVyZVVwZGF0ZSwgdGhpcyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pO1xyXG5cclxuLyoqXHJcbiAqIFdoZW4gdGhlIHRleHR1cmUgaXMgdXBkYXRlZCwgdGhpcyBldmVudCB3aWxsIGZpcmUgdG8gdXBkYXRlIHRoZSBzY2FsZSBhbmQgZnJhbWVcclxuICpcclxuICogQHByaXZhdGVcclxuICovXHJcblNwcml0ZS5wcm90b3R5cGUuX29uVGV4dHVyZVVwZGF0ZSA9IGZ1bmN0aW9uICgpXHJcbntcclxuICAgIC8vIHNvIGlmIF93aWR0aCBpcyAwIHRoZW4gd2lkdGggd2FzIG5vdCBzZXQuLlxyXG4gICAgaWYgKHRoaXMuX3dpZHRoKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMuc2NhbGUueCA9IHV0aWxzLnNpZ24odGhpcy5zY2FsZS54KSAqIHRoaXMuX3dpZHRoIC8gdGhpcy50ZXh0dXJlLmZyYW1lLndpZHRoO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0aGlzLl9oZWlnaHQpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5zY2FsZS55ID0gdXRpbHMuc2lnbih0aGlzLnNjYWxlLnkpICogdGhpcy5faGVpZ2h0IC8gdGhpcy50ZXh0dXJlLmZyYW1lLmhlaWdodDtcclxuICAgIH1cclxufTtcclxuXHJcbi8qKlxyXG4qXHJcbiogUmVuZGVycyB0aGUgb2JqZWN0IHVzaW5nIHRoZSBXZWJHTCByZW5kZXJlclxyXG4qXHJcbiogQHBhcmFtIHJlbmRlcmVyIHtQSVhJLldlYkdMUmVuZGVyZXJ9XHJcbiogQHByaXZhdGVcclxuKi9cclxuU3ByaXRlLnByb3RvdHlwZS5fcmVuZGVyV2ViR0wgPSBmdW5jdGlvbiAocmVuZGVyZXIpXHJcbntcclxuICAgIHJlbmRlcmVyLnNldE9iamVjdFJlbmRlcmVyKHJlbmRlcmVyLnBsdWdpbnMuc3ByaXRlKTtcclxuICAgIHJlbmRlcmVyLnBsdWdpbnMuc3ByaXRlLnJlbmRlcih0aGlzKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBSZXR1cm5zIHRoZSBib3VuZHMgb2YgdGhlIFNwcml0ZSBhcyBhIHJlY3RhbmdsZS4gVGhlIGJvdW5kcyBjYWxjdWxhdGlvbiB0YWtlcyB0aGUgd29ybGRUcmFuc2Zvcm0gaW50byBhY2NvdW50LlxyXG4gKlxyXG4gKiBAcGFyYW0gbWF0cml4IHtQSVhJLk1hdHJpeH0gdGhlIHRyYW5zZm9ybWF0aW9uIG1hdHJpeCBvZiB0aGUgc3ByaXRlXHJcbiAqIEByZXR1cm4ge1BJWEkuUmVjdGFuZ2xlfSB0aGUgZnJhbWluZyByZWN0YW5nbGVcclxuICovXHJcblNwcml0ZS5wcm90b3R5cGUuZ2V0Qm91bmRzID0gZnVuY3Rpb24gKG1hdHJpeClcclxue1xyXG4gICAgaWYoIXRoaXMuX2N1cnJlbnRCb3VuZHMpXHJcbiAgICB7XHJcblxyXG4gICAgICAgIHZhciB3aWR0aCA9IHRoaXMuX3RleHR1cmUuX2ZyYW1lLndpZHRoO1xyXG4gICAgICAgIHZhciBoZWlnaHQgPSB0aGlzLl90ZXh0dXJlLl9mcmFtZS5oZWlnaHQ7XHJcblxyXG4gICAgICAgIHZhciB3MCA9IHdpZHRoICogKDEtdGhpcy5hbmNob3IueCk7XHJcbiAgICAgICAgdmFyIHcxID0gd2lkdGggKiAtdGhpcy5hbmNob3IueDtcclxuXHJcbiAgICAgICAgdmFyIGgwID0gaGVpZ2h0ICogKDEtdGhpcy5hbmNob3IueSk7XHJcbiAgICAgICAgdmFyIGgxID0gaGVpZ2h0ICogLXRoaXMuYW5jaG9yLnk7XHJcblxyXG4gICAgICAgIHZhciB3b3JsZFRyYW5zZm9ybSA9IG1hdHJpeCB8fCB0aGlzLndvcmxkVHJhbnNmb3JtIDtcclxuXHJcbiAgICAgICAgdmFyIGEgPSB3b3JsZFRyYW5zZm9ybS5hO1xyXG4gICAgICAgIHZhciBiID0gd29ybGRUcmFuc2Zvcm0uYjtcclxuICAgICAgICB2YXIgYyA9IHdvcmxkVHJhbnNmb3JtLmM7XHJcbiAgICAgICAgdmFyIGQgPSB3b3JsZFRyYW5zZm9ybS5kO1xyXG4gICAgICAgIHZhciB0eCA9IHdvcmxkVHJhbnNmb3JtLnR4O1xyXG4gICAgICAgIHZhciB0eSA9IHdvcmxkVHJhbnNmb3JtLnR5O1xyXG5cclxuICAgICAgICB2YXIgbWluWCxcclxuICAgICAgICAgICAgbWF4WCxcclxuICAgICAgICAgICAgbWluWSxcclxuICAgICAgICAgICAgbWF4WTtcclxuXHJcblxyXG4gICAgICAgIGlmIChiID09PSAwICYmIGMgPT09IDApXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICAvLyBzY2FsZSBtYXkgYmUgbmVnYXRpdmUhXHJcbiAgICAgICAgICAgIGlmIChhIDwgMClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgYSAqPSAtMTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKGQgPCAwKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBkICo9IC0xO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyB0aGlzIG1lYW5zIHRoZXJlIGlzIG5vIHJvdGF0aW9uIGdvaW5nIG9uIHJpZ2h0PyBSSUdIVD9cclxuICAgICAgICAgICAgLy8gaWYgdGhhdHMgdGhlIGNhc2UgdGhlbiB3ZSBjYW4gYXZvaWQgY2hlY2tpbmcgdGhlIGJvdW5kIHZhbHVlcyEgeWF5XHJcbiAgICAgICAgICAgIG1pblggPSBhICogdzEgKyB0eDtcclxuICAgICAgICAgICAgbWF4WCA9IGEgKiB3MCArIHR4O1xyXG4gICAgICAgICAgICBtaW5ZID0gZCAqIGgxICsgdHk7XHJcbiAgICAgICAgICAgIG1heFkgPSBkICogaDAgKyB0eTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdmFyIHgxID0gYSAqIHcxICsgYyAqIGgxICsgdHg7XHJcbiAgICAgICAgICAgIHZhciB5MSA9IGQgKiBoMSArIGIgKiB3MSArIHR5O1xyXG5cclxuICAgICAgICAgICAgdmFyIHgyID0gYSAqIHcwICsgYyAqIGgxICsgdHg7XHJcbiAgICAgICAgICAgIHZhciB5MiA9IGQgKiBoMSArIGIgKiB3MCArIHR5O1xyXG5cclxuICAgICAgICAgICAgdmFyIHgzID0gYSAqIHcwICsgYyAqIGgwICsgdHg7XHJcbiAgICAgICAgICAgIHZhciB5MyA9IGQgKiBoMCArIGIgKiB3MCArIHR5O1xyXG5cclxuICAgICAgICAgICAgdmFyIHg0ID0gIGEgKiB3MSArIGMgKiBoMCArIHR4O1xyXG4gICAgICAgICAgICB2YXIgeTQgPSAgZCAqIGgwICsgYiAqIHcxICsgdHk7XHJcblxyXG4gICAgICAgICAgICBtaW5YID0geDE7XHJcbiAgICAgICAgICAgIG1pblggPSB4MiA8IG1pblggPyB4MiA6IG1pblg7XHJcbiAgICAgICAgICAgIG1pblggPSB4MyA8IG1pblggPyB4MyA6IG1pblg7XHJcbiAgICAgICAgICAgIG1pblggPSB4NCA8IG1pblggPyB4NCA6IG1pblg7XHJcblxyXG4gICAgICAgICAgICBtaW5ZID0geTE7XHJcbiAgICAgICAgICAgIG1pblkgPSB5MiA8IG1pblkgPyB5MiA6IG1pblk7XHJcbiAgICAgICAgICAgIG1pblkgPSB5MyA8IG1pblkgPyB5MyA6IG1pblk7XHJcbiAgICAgICAgICAgIG1pblkgPSB5NCA8IG1pblkgPyB5NCA6IG1pblk7XHJcblxyXG4gICAgICAgICAgICBtYXhYID0geDE7XHJcbiAgICAgICAgICAgIG1heFggPSB4MiA+IG1heFggPyB4MiA6IG1heFg7XHJcbiAgICAgICAgICAgIG1heFggPSB4MyA+IG1heFggPyB4MyA6IG1heFg7XHJcbiAgICAgICAgICAgIG1heFggPSB4NCA+IG1heFggPyB4NCA6IG1heFg7XHJcblxyXG4gICAgICAgICAgICBtYXhZID0geTE7XHJcbiAgICAgICAgICAgIG1heFkgPSB5MiA+IG1heFkgPyB5MiA6IG1heFk7XHJcbiAgICAgICAgICAgIG1heFkgPSB5MyA+IG1heFkgPyB5MyA6IG1heFk7XHJcbiAgICAgICAgICAgIG1heFkgPSB5NCA+IG1heFkgPyB5NCA6IG1heFk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBjaGVjayBmb3IgY2hpbGRyZW5cclxuICAgICAgICBpZih0aGlzLmNoaWxkcmVuLmxlbmd0aClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHZhciBjaGlsZEJvdW5kcyA9IHRoaXMuY29udGFpbmVyR2V0Qm91bmRzKCk7XHJcblxyXG4gICAgICAgICAgICB3MCA9IGNoaWxkQm91bmRzLng7XHJcbiAgICAgICAgICAgIHcxID0gY2hpbGRCb3VuZHMueCArIGNoaWxkQm91bmRzLndpZHRoO1xyXG4gICAgICAgICAgICBoMCA9IGNoaWxkQm91bmRzLnk7XHJcbiAgICAgICAgICAgIGgxID0gY2hpbGRCb3VuZHMueSArIGNoaWxkQm91bmRzLmhlaWdodDtcclxuXHJcbiAgICAgICAgICAgIG1pblggPSAobWluWCA8IHcwKSA/IG1pblggOiB3MDtcclxuICAgICAgICAgICAgbWluWSA9IChtaW5ZIDwgaDApID8gbWluWSA6IGgwO1xyXG5cclxuICAgICAgICAgICAgbWF4WCA9IChtYXhYID4gdzEpID8gbWF4WCA6IHcxO1xyXG4gICAgICAgICAgICBtYXhZID0gKG1heFkgPiBoMSkgPyBtYXhZIDogaDE7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgYm91bmRzID0gdGhpcy5fYm91bmRzO1xyXG5cclxuICAgICAgICBib3VuZHMueCA9IG1pblg7XHJcbiAgICAgICAgYm91bmRzLndpZHRoID0gbWF4WCAtIG1pblg7XHJcblxyXG4gICAgICAgIGJvdW5kcy55ID0gbWluWTtcclxuICAgICAgICBib3VuZHMuaGVpZ2h0ID0gbWF4WSAtIG1pblk7XHJcblxyXG4gICAgICAgIC8vIHN0b3JlIGEgcmVmZXJlbmNlIHNvIHRoYXQgaWYgdGhpcyBmdW5jdGlvbiBnZXRzIGNhbGxlZCBhZ2FpbiBpbiB0aGUgcmVuZGVyIGN5Y2xlIHdlIGRvIG5vdCBoYXZlIHRvIHJlY2FsY3VsYXRlXHJcbiAgICAgICAgdGhpcy5fY3VycmVudEJvdW5kcyA9IGJvdW5kcztcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGhpcy5fY3VycmVudEJvdW5kcztcclxufTtcclxuXHJcbi8qKlxyXG4gKiBHZXRzIHRoZSBsb2NhbCBib3VuZHMgb2YgdGhlIHNwcml0ZSBvYmplY3QuXHJcbiAqXHJcbiAqL1xyXG5TcHJpdGUucHJvdG90eXBlLmdldExvY2FsQm91bmRzID0gZnVuY3Rpb24gKClcclxue1xyXG4gICAgdGhpcy5fYm91bmRzLnggPSAtdGhpcy5fdGV4dHVyZS5fZnJhbWUud2lkdGggKiB0aGlzLmFuY2hvci54O1xyXG4gICAgdGhpcy5fYm91bmRzLnkgPSAtdGhpcy5fdGV4dHVyZS5fZnJhbWUuaGVpZ2h0ICogdGhpcy5hbmNob3IueTtcclxuICAgIHRoaXMuX2JvdW5kcy53aWR0aCA9IHRoaXMuX3RleHR1cmUuX2ZyYW1lLndpZHRoO1xyXG4gICAgdGhpcy5fYm91bmRzLmhlaWdodCA9IHRoaXMuX3RleHR1cmUuX2ZyYW1lLmhlaWdodDtcclxuICAgIHJldHVybiB0aGlzLl9ib3VuZHM7XHJcbn07XHJcblxyXG4vKipcclxuKiBUZXN0cyBpZiBhIHBvaW50IGlzIGluc2lkZSB0aGlzIHNwcml0ZVxyXG4qXHJcbiogQHBhcmFtIHBvaW50IHtQSVhJLlBvaW50fSB0aGUgcG9pbnQgdG8gdGVzdFxyXG4qIEByZXR1cm4ge2Jvb2xlYW59IHRoZSByZXN1bHQgb2YgdGhlIHRlc3RcclxuKi9cclxuU3ByaXRlLnByb3RvdHlwZS5jb250YWluc1BvaW50ID0gZnVuY3Rpb24oIHBvaW50IClcclxue1xyXG4gICAgdGhpcy53b3JsZFRyYW5zZm9ybS5hcHBseUludmVyc2UocG9pbnQsICB0ZW1wUG9pbnQpO1xyXG5cclxuICAgIHZhciB3aWR0aCA9IHRoaXMuX3RleHR1cmUuX2ZyYW1lLndpZHRoO1xyXG4gICAgdmFyIGhlaWdodCA9IHRoaXMuX3RleHR1cmUuX2ZyYW1lLmhlaWdodDtcclxuICAgIHZhciB4MSA9IC13aWR0aCAqIHRoaXMuYW5jaG9yLng7XHJcbiAgICB2YXIgeTE7XHJcblxyXG4gICAgaWYgKCB0ZW1wUG9pbnQueCA+IHgxICYmIHRlbXBQb2ludC54IDwgeDEgKyB3aWR0aCApXHJcbiAgICB7XHJcbiAgICAgICAgeTEgPSAtaGVpZ2h0ICogdGhpcy5hbmNob3IueTtcclxuXHJcbiAgICAgICAgaWYgKCB0ZW1wUG9pbnQueSA+IHkxICYmIHRlbXBQb2ludC55IDwgeTEgKyBoZWlnaHQgKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBmYWxzZTtcclxufTtcclxuXHJcbi8qKlxyXG4qIFJlbmRlcnMgdGhlIG9iamVjdCB1c2luZyB0aGUgQ2FudmFzIHJlbmRlcmVyXHJcbipcclxuKiBAcGFyYW0gcmVuZGVyZXIge1BJWEkuQ2FudmFzUmVuZGVyZXJ9IFRoZSByZW5kZXJlclxyXG4qIEBwcml2YXRlXHJcbiovXHJcblNwcml0ZS5wcm90b3R5cGUuX3JlbmRlckNhbnZhcyA9IGZ1bmN0aW9uIChyZW5kZXJlcilcclxue1xyXG4gICAgaWYgKHRoaXMudGV4dHVyZS5jcm9wLndpZHRoIDw9IDAgfHwgdGhpcy50ZXh0dXJlLmNyb3AuaGVpZ2h0IDw9IDApXHJcbiAgICB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBjb21wb3NpdGVPcGVyYXRpb24gPSByZW5kZXJlci5ibGVuZE1vZGVzW3RoaXMuYmxlbmRNb2RlXTtcclxuICAgIGlmIChjb21wb3NpdGVPcGVyYXRpb24gIT09IHJlbmRlcmVyLmNvbnRleHQuZ2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uKVxyXG4gICAge1xyXG4gICAgICAgIHJlbmRlcmVyLmNvbnRleHQuZ2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uID0gY29tcG9zaXRlT3BlcmF0aW9uO1xyXG4gICAgfVxyXG5cclxuICAgIC8vICBJZ25vcmUgbnVsbCBzb3VyY2VzXHJcbiAgICBpZiAodGhpcy50ZXh0dXJlLnZhbGlkKVxyXG4gICAge1xyXG4gICAgICAgIHZhciB0ZXh0dXJlID0gdGhpcy5fdGV4dHVyZSxcclxuICAgICAgICAgICAgd3QgPSB0aGlzLndvcmxkVHJhbnNmb3JtLFxyXG4gICAgICAgICAgICBkeCxcclxuICAgICAgICAgICAgZHksXHJcbiAgICAgICAgICAgIHdpZHRoLFxyXG4gICAgICAgICAgICBoZWlnaHQ7XHJcblxyXG4gICAgICAgIHJlbmRlcmVyLmNvbnRleHQuZ2xvYmFsQWxwaGEgPSB0aGlzLndvcmxkQWxwaGE7XHJcblxyXG4gICAgICAgIC8vIElmIHNtb290aGluZ0VuYWJsZWQgaXMgc3VwcG9ydGVkIGFuZCB3ZSBuZWVkIHRvIGNoYW5nZSB0aGUgc21vb3RoaW5nIHByb3BlcnR5IGZvciB0aGlzIHRleHR1cmVcclxuICAgICAgICB2YXIgc21vb3RoaW5nRW5hYmxlZCA9IHRleHR1cmUuYmFzZVRleHR1cmUuc2NhbGVNb2RlID09PSBDT05TVC5TQ0FMRV9NT0RFUy5MSU5FQVI7XHJcbiAgICAgICAgaWYgKHJlbmRlcmVyLnNtb290aFByb3BlcnR5ICYmIHJlbmRlcmVyLmNvbnRleHRbcmVuZGVyZXIuc21vb3RoUHJvcGVydHldICE9PSBzbW9vdGhpbmdFbmFibGVkKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmVuZGVyZXIuY29udGV4dFtyZW5kZXJlci5zbW9vdGhQcm9wZXJ0eV0gPSBzbW9vdGhpbmdFbmFibGVkO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gSWYgdGhlIHRleHR1cmUgaXMgdHJpbW1lZCB3ZSBvZmZzZXQgYnkgdGhlIHRyaW0geC95LCBvdGhlcndpc2Ugd2UgdXNlIHRoZSBmcmFtZSBkaW1lbnNpb25zXHJcblxyXG4gICAgICAgIGlmKHRleHR1cmUucm90YXRlKVxyXG4gICAgICAgIHtcclxuXHJcbiAgICAgICAgICAgIC8vIGNoZWVreSByb3RhdGlvbiFcclxuICAgICAgICAgICAgdmFyIGEgPSB3dC5hO1xyXG4gICAgICAgICAgICB2YXIgYiA9IHd0LmI7XHJcblxyXG4gICAgICAgICAgICB3dC5hICA9IC13dC5jO1xyXG4gICAgICAgICAgICB3dC5iICA9IC13dC5kO1xyXG4gICAgICAgICAgICB3dC5jICA9ICBhO1xyXG4gICAgICAgICAgICB3dC5kICA9ICBiO1xyXG5cclxuICAgICAgICAgICAgd2lkdGggPSB0ZXh0dXJlLmNyb3AuaGVpZ2h0O1xyXG4gICAgICAgICAgICBoZWlnaHQgPSB0ZXh0dXJlLmNyb3Aud2lkdGg7XHJcblxyXG4gICAgICAgICAgICBkeCA9ICh0ZXh0dXJlLnRyaW0pID8gdGV4dHVyZS50cmltLnkgLSB0aGlzLmFuY2hvci55ICogdGV4dHVyZS50cmltLmhlaWdodCA6IHRoaXMuYW5jaG9yLnkgKiAtdGV4dHVyZS5fZnJhbWUuaGVpZ2h0O1xyXG4gICAgICAgICAgICBkeSA9ICh0ZXh0dXJlLnRyaW0pID8gdGV4dHVyZS50cmltLnggLSB0aGlzLmFuY2hvci54ICogdGV4dHVyZS50cmltLndpZHRoIDogdGhpcy5hbmNob3IueCAqIC10ZXh0dXJlLl9mcmFtZS53aWR0aDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgd2lkdGggPSB0ZXh0dXJlLmNyb3Aud2lkdGg7XHJcbiAgICAgICAgICAgIGhlaWdodCA9IHRleHR1cmUuY3JvcC5oZWlnaHQ7XHJcblxyXG4gICAgICAgICAgICBkeCA9ICh0ZXh0dXJlLnRyaW0pID8gdGV4dHVyZS50cmltLnggLSB0aGlzLmFuY2hvci54ICogdGV4dHVyZS50cmltLndpZHRoIDogdGhpcy5hbmNob3IueCAqIC10ZXh0dXJlLl9mcmFtZS53aWR0aDtcclxuICAgICAgICAgICAgZHkgPSAodGV4dHVyZS50cmltKSA/IHRleHR1cmUudHJpbS55IC0gdGhpcy5hbmNob3IueSAqIHRleHR1cmUudHJpbS5oZWlnaHQgOiB0aGlzLmFuY2hvci55ICogLXRleHR1cmUuX2ZyYW1lLmhlaWdodDtcclxuICAgICAgICB9XHJcblxyXG5cclxuXHJcbiAgICAgICAgLy8gQWxsb3cgZm9yIHBpeGVsIHJvdW5kaW5nXHJcbiAgICAgICAgaWYgKHJlbmRlcmVyLnJvdW5kUGl4ZWxzKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmVuZGVyZXIuY29udGV4dC5zZXRUcmFuc2Zvcm0oXHJcbiAgICAgICAgICAgICAgICB3dC5hLFxyXG4gICAgICAgICAgICAgICAgd3QuYixcclxuICAgICAgICAgICAgICAgIHd0LmMsXHJcbiAgICAgICAgICAgICAgICB3dC5kLFxyXG4gICAgICAgICAgICAgICAgKHd0LnR4ICogcmVuZGVyZXIucmVzb2x1dGlvbikgfCAwLFxyXG4gICAgICAgICAgICAgICAgKHd0LnR5ICogcmVuZGVyZXIucmVzb2x1dGlvbikgfCAwXHJcbiAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICBkeCA9IGR4IHwgMDtcclxuICAgICAgICAgICAgZHkgPSBkeSB8IDA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcblxyXG4gICAgICAgICAgICByZW5kZXJlci5jb250ZXh0LnNldFRyYW5zZm9ybShcclxuICAgICAgICAgICAgICAgIHd0LmEsXHJcbiAgICAgICAgICAgICAgICB3dC5iLFxyXG4gICAgICAgICAgICAgICAgd3QuYyxcclxuICAgICAgICAgICAgICAgIHd0LmQsXHJcbiAgICAgICAgICAgICAgICB3dC50eCAqIHJlbmRlcmVyLnJlc29sdXRpb24sXHJcbiAgICAgICAgICAgICAgICB3dC50eSAqIHJlbmRlcmVyLnJlc29sdXRpb25cclxuICAgICAgICAgICAgKTtcclxuXHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdmFyIHJlc29sdXRpb24gPSB0ZXh0dXJlLmJhc2VUZXh0dXJlLnJlc29sdXRpb247XHJcblxyXG4gICAgICAgIGlmICh0aGlzLnRpbnQgIT09IDB4RkZGRkZGKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuY2FjaGVkVGludCAhPT0gdGhpcy50aW50KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNhY2hlZFRpbnQgPSB0aGlzLnRpbnQ7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gVE9ETyBjbGVhbiB1cCBjYWNoaW5nIC0gaG93IHRvIGNsZWFuIHVwIHRoZSBjYWNoZXM/XHJcbiAgICAgICAgICAgICAgICB0aGlzLnRpbnRlZFRleHR1cmUgPSBDYW52YXNUaW50ZXIuZ2V0VGludGVkVGV4dHVyZSh0aGlzLCB0aGlzLnRpbnQpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZW5kZXJlci5jb250ZXh0LmRyYXdJbWFnZShcclxuICAgICAgICAgICAgICAgIHRoaXMudGludGVkVGV4dHVyZSxcclxuICAgICAgICAgICAgICAgIDAsXHJcbiAgICAgICAgICAgICAgICAwLFxyXG4gICAgICAgICAgICAgICAgd2lkdGggKiByZXNvbHV0aW9uLFxyXG4gICAgICAgICAgICAgICAgaGVpZ2h0ICogcmVzb2x1dGlvbixcclxuICAgICAgICAgICAgICAgIGR4ICogcmVuZGVyZXIucmVzb2x1dGlvbixcclxuICAgICAgICAgICAgICAgIGR5ICogcmVuZGVyZXIucmVzb2x1dGlvbixcclxuICAgICAgICAgICAgICAgIHdpZHRoICogcmVuZGVyZXIucmVzb2x1dGlvbixcclxuICAgICAgICAgICAgICAgIGhlaWdodCAqIHJlbmRlcmVyLnJlc29sdXRpb25cclxuICAgICAgICAgICAgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmVuZGVyZXIuY29udGV4dC5kcmF3SW1hZ2UoXHJcbiAgICAgICAgICAgICAgICB0ZXh0dXJlLmJhc2VUZXh0dXJlLnNvdXJjZSxcclxuICAgICAgICAgICAgICAgIHRleHR1cmUuY3JvcC54ICogcmVzb2x1dGlvbixcclxuICAgICAgICAgICAgICAgIHRleHR1cmUuY3JvcC55ICogcmVzb2x1dGlvbixcclxuICAgICAgICAgICAgICAgIHdpZHRoICogcmVzb2x1dGlvbixcclxuICAgICAgICAgICAgICAgIGhlaWdodCAqIHJlc29sdXRpb24sXHJcbiAgICAgICAgICAgICAgICBkeCAgKiByZW5kZXJlci5yZXNvbHV0aW9uLFxyXG4gICAgICAgICAgICAgICAgZHkgICogcmVuZGVyZXIucmVzb2x1dGlvbixcclxuICAgICAgICAgICAgICAgIHdpZHRoICogcmVuZGVyZXIucmVzb2x1dGlvbixcclxuICAgICAgICAgICAgICAgIGhlaWdodCAqIHJlbmRlcmVyLnJlc29sdXRpb25cclxuICAgICAgICAgICAgKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG4vKipcclxuICogRGVzdHJveXMgdGhpcyBzcHJpdGUgYW5kIG9wdGlvbmFsbHkgaXRzIHRleHR1cmVcclxuICpcclxuICogQHBhcmFtIFtkZXN0cm95VGV4dHVyZT1mYWxzZV0ge2Jvb2xlYW59IFNob3VsZCBpdCBkZXN0cm95IHRoZSBjdXJyZW50IHRleHR1cmUgb2YgdGhlIHNwcml0ZSBhcyB3ZWxsXHJcbiAqIEBwYXJhbSBbZGVzdHJveUJhc2VUZXh0dXJlPWZhbHNlXSB7Ym9vbGVhbn0gU2hvdWxkIGl0IGRlc3Ryb3kgdGhlIGJhc2UgdGV4dHVyZSBvZiB0aGUgc3ByaXRlIGFzIHdlbGxcclxuICovXHJcblNwcml0ZS5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uIChkZXN0cm95VGV4dHVyZSwgZGVzdHJveUJhc2VUZXh0dXJlKVxyXG57XHJcbiAgICBDb250YWluZXIucHJvdG90eXBlLmRlc3Ryb3kuY2FsbCh0aGlzKTtcclxuXHJcbiAgICB0aGlzLmFuY2hvciA9IG51bGw7XHJcblxyXG4gICAgaWYgKGRlc3Ryb3lUZXh0dXJlKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMuX3RleHR1cmUuZGVzdHJveShkZXN0cm95QmFzZVRleHR1cmUpO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuX3RleHR1cmUgPSBudWxsO1xyXG4gICAgdGhpcy5zaGFkZXIgPSBudWxsO1xyXG59O1xyXG5cclxuLy8gc29tZSBoZWxwZXIgZnVuY3Rpb25zLi5cclxuXHJcbi8qKlxyXG4gKiBIZWxwZXIgZnVuY3Rpb24gdGhhdCBjcmVhdGVzIGEgc3ByaXRlIHRoYXQgd2lsbCBjb250YWluIGEgdGV4dHVyZSBmcm9tIHRoZSBUZXh0dXJlQ2FjaGUgYmFzZWQgb24gdGhlIGZyYW1lSWRcclxuICogVGhlIGZyYW1lIGlkcyBhcmUgY3JlYXRlZCB3aGVuIGEgVGV4dHVyZSBwYWNrZXIgZmlsZSBoYXMgYmVlbiBsb2FkZWRcclxuICpcclxuICogQHN0YXRpY1xyXG4gKiBAcGFyYW0gZnJhbWVJZCB7c3RyaW5nfSBUaGUgZnJhbWUgSWQgb2YgdGhlIHRleHR1cmUgaW4gdGhlIGNhY2hlXHJcbiAqIEBwYXJhbSBbY3Jvc3NvcmlnaW49KGF1dG8pXSB7Ym9vbGVhbn0gaWYgeW91IHdhbnQgdG8gc3BlY2lmeSB0aGUgY3Jvc3Mtb3JpZ2luIHBhcmFtZXRlclxyXG4gKiBAcGFyYW0gW3NjYWxlTW9kZT1QSVhJLlNDQUxFX01PREVTLkRFRkFVTFRdIHtudW1iZXJ9IGlmIHlvdSB3YW50IHRvIHNwZWNpZnkgdGhlIHNjYWxlIG1vZGUsIHNlZSB7QGxpbmsgUElYSS5TQ0FMRV9NT0RFU30gZm9yIHBvc3NpYmxlIHZhbHVlc1xyXG4gKiBAcmV0dXJuIHtQSVhJLlNwcml0ZX0gQSBuZXcgU3ByaXRlIHVzaW5nIGEgdGV4dHVyZSBmcm9tIHRoZSB0ZXh0dXJlIGNhY2hlIG1hdGNoaW5nIHRoZSBmcmFtZUlkXHJcbiAqL1xyXG5TcHJpdGUuZnJvbUZyYW1lID0gZnVuY3Rpb24gKGZyYW1lSWQpXHJcbntcclxuICAgIHZhciB0ZXh0dXJlID0gdXRpbHMuVGV4dHVyZUNhY2hlW2ZyYW1lSWRdO1xyXG5cclxuICAgIGlmICghdGV4dHVyZSlcclxuICAgIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1RoZSBmcmFtZUlkIFwiJyArIGZyYW1lSWQgKyAnXCIgZG9lcyBub3QgZXhpc3QgaW4gdGhlIHRleHR1cmUgY2FjaGUnKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gbmV3IFNwcml0ZSh0ZXh0dXJlKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBIZWxwZXIgZnVuY3Rpb24gdGhhdCBjcmVhdGVzIGEgc3ByaXRlIHRoYXQgd2lsbCBjb250YWluIGEgdGV4dHVyZSBiYXNlZCBvbiBhbiBpbWFnZSB1cmxcclxuICogSWYgdGhlIGltYWdlIGlzIG5vdCBpbiB0aGUgdGV4dHVyZSBjYWNoZSBpdCB3aWxsIGJlIGxvYWRlZFxyXG4gKlxyXG4gKiBAc3RhdGljXHJcbiAqIEBwYXJhbSBpbWFnZUlkIHtzdHJpbmd9IFRoZSBpbWFnZSB1cmwgb2YgdGhlIHRleHR1cmVcclxuICogQHJldHVybiB7UElYSS5TcHJpdGV9IEEgbmV3IFNwcml0ZSB1c2luZyBhIHRleHR1cmUgZnJvbSB0aGUgdGV4dHVyZSBjYWNoZSBtYXRjaGluZyB0aGUgaW1hZ2UgaWRcclxuICovXHJcblNwcml0ZS5mcm9tSW1hZ2UgPSBmdW5jdGlvbiAoaW1hZ2VJZCwgY3Jvc3NvcmlnaW4sIHNjYWxlTW9kZSlcclxue1xyXG4gICAgcmV0dXJuIG5ldyBTcHJpdGUoVGV4dHVyZS5mcm9tSW1hZ2UoaW1hZ2VJZCwgY3Jvc3NvcmlnaW4sIHNjYWxlTW9kZSkpO1xyXG59O1xyXG4iLCJ2YXIgU3ByaXRlID0gcmVxdWlyZSgnLi4vc3ByaXRlcy9TcHJpdGUnKSxcclxuICAgIFRleHR1cmUgPSByZXF1aXJlKCcuLi90ZXh0dXJlcy9UZXh0dXJlJyksXHJcbiAgICBtYXRoID0gcmVxdWlyZSgnLi4vbWF0aCcpLFxyXG4gICAgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscycpLFxyXG4gICAgQ09OU1QgPSByZXF1aXJlKCcuLi9jb25zdCcpO1xyXG5cclxuLyoqXHJcbiAqIEEgVGV4dCBPYmplY3Qgd2lsbCBjcmVhdGUgYSBsaW5lIG9yIG11bHRpcGxlIGxpbmVzIG9mIHRleHQuIFRvIHNwbGl0IGEgbGluZSB5b3UgY2FuIHVzZSAnXFxuJyBpbiB5b3VyIHRleHQgc3RyaW5nLFxyXG4gKiBvciBhZGQgYSB3b3JkV3JhcCBwcm9wZXJ0eSBzZXQgdG8gdHJ1ZSBhbmQgYW5kIHdvcmRXcmFwV2lkdGggcHJvcGVydHkgd2l0aCBhIHZhbHVlIGluIHRoZSBzdHlsZSBvYmplY3QuXHJcbiAqXHJcbiAqIEEgVGV4dCBjYW4gYmUgY3JlYXRlZCBkaXJlY3RseSBmcm9tIGEgc3RyaW5nIGFuZCBhIHN0eWxlIG9iamVjdFxyXG4gKlxyXG4gKiBgYGBqc1xyXG4gKiB2YXIgdGV4dCA9IG5ldyBQSVhJLlRleHQoJ1RoaXMgaXMgYSBwaXhpIHRleHQnLHtmb250IDogJzI0cHggQXJpYWwnLCBmaWxsIDogMHhmZjEwMTAsIGFsaWduIDogJ2NlbnRlcid9KTtcclxuICogYGBgXHJcbiAqXHJcbiAqIEBjbGFzc1xyXG4gKiBAZXh0ZW5kcyBQSVhJLlNwcml0ZVxyXG4gKiBAbWVtYmVyb2YgUElYSVxyXG4gKiBAcGFyYW0gdGV4dCB7c3RyaW5nfSBUaGUgY29weSB0aGF0IHlvdSB3b3VsZCBsaWtlIHRoZSB0ZXh0IHRvIGRpc3BsYXlcclxuICogQHBhcmFtIFtzdHlsZV0ge29iamVjdH0gVGhlIHN0eWxlIHBhcmFtZXRlcnNcclxuICogQHBhcmFtIFtzdHlsZS5mb250XSB7c3RyaW5nfSBkZWZhdWx0ICdib2xkIDIwcHggQXJpYWwnIFRoZSBzdHlsZSBhbmQgc2l6ZSBvZiB0aGUgZm9udFxyXG4gKiBAcGFyYW0gW3N0eWxlLmZpbGw9J2JsYWNrJ10ge1N0cmluZ3xOdW1iZXJ9IEEgY2FudmFzIGZpbGxzdHlsZSB0aGF0IHdpbGwgYmUgdXNlZCBvbiB0aGUgdGV4dCBlLmcgJ3JlZCcsICcjMDBGRjAwJ1xyXG4gKiBAcGFyYW0gW3N0eWxlLmFsaWduPSdsZWZ0J10ge3N0cmluZ30gQWxpZ25tZW50IGZvciBtdWx0aWxpbmUgdGV4dCAoJ2xlZnQnLCAnY2VudGVyJyBvciAncmlnaHQnKSwgZG9lcyBub3QgYWZmZWN0IHNpbmdsZSBsaW5lIHRleHRcclxuICogQHBhcmFtIFtzdHlsZS5zdHJva2VdIHtTdHJpbmd8TnVtYmVyfSBBIGNhbnZhcyBmaWxsc3R5bGUgdGhhdCB3aWxsIGJlIHVzZWQgb24gdGhlIHRleHQgc3Ryb2tlIGUuZyAnYmx1ZScsICcjRkNGRjAwJ1xyXG4gKiBAcGFyYW0gW3N0eWxlLnN0cm9rZVRoaWNrbmVzcz0wXSB7bnVtYmVyfSBBIG51bWJlciB0aGF0IHJlcHJlc2VudHMgdGhlIHRoaWNrbmVzcyBvZiB0aGUgc3Ryb2tlLiBEZWZhdWx0IGlzIDAgKG5vIHN0cm9rZSlcclxuICogQHBhcmFtIFtzdHlsZS53b3JkV3JhcD1mYWxzZV0ge2Jvb2xlYW59IEluZGljYXRlcyBpZiB3b3JkIHdyYXAgc2hvdWxkIGJlIHVzZWRcclxuICogQHBhcmFtIFtzdHlsZS53b3JkV3JhcFdpZHRoPTEwMF0ge251bWJlcn0gVGhlIHdpZHRoIGF0IHdoaWNoIHRleHQgd2lsbCB3cmFwLCBpdCBuZWVkcyB3b3JkV3JhcCB0byBiZSBzZXQgdG8gdHJ1ZVxyXG4gKiBAcGFyYW0gW3N0eWxlLmxpbmVIZWlnaHRdIHtudW1iZXJ9IFRoZSBsaW5lIGhlaWdodCwgYSBudW1iZXIgdGhhdCByZXByZXNlbnRzIHRoZSB2ZXJ0aWNhbCBzcGFjZSB0aGF0IGEgbGV0dGVyIHVzZXNcclxuICogQHBhcmFtIFtzdHlsZS5kcm9wU2hhZG93PWZhbHNlXSB7Ym9vbGVhbn0gU2V0IGEgZHJvcCBzaGFkb3cgZm9yIHRoZSB0ZXh0XHJcbiAqIEBwYXJhbSBbc3R5bGUuZHJvcFNoYWRvd0NvbG9yPScjMDAwMDAwJ10ge3N0cmluZ30gQSBmaWxsIHN0eWxlIHRvIGJlIHVzZWQgb24gdGhlIGRyb3BzaGFkb3cgZS5nICdyZWQnLCAnIzAwRkYwMCdcclxuICogQHBhcmFtIFtzdHlsZS5kcm9wU2hhZG93QW5nbGU9TWF0aC5QSS80XSB7bnVtYmVyfSBTZXQgYSBhbmdsZSBvZiB0aGUgZHJvcCBzaGFkb3dcclxuICogQHBhcmFtIFtzdHlsZS5kcm9wU2hhZG93RGlzdGFuY2U9NV0ge251bWJlcn0gU2V0IGEgZGlzdGFuY2Ugb2YgdGhlIGRyb3Agc2hhZG93XHJcbiAqIEBwYXJhbSBbc3R5bGUucGFkZGluZz0wXSB7bnVtYmVyfSBPY2Nhc2lvbmFsbHkgc29tZSBmb250cyBhcmUgY3JvcHBlZCBvbiB0b3Agb3IgYm90dG9tLiBBZGRpbmcgc29tZSBwYWRkaW5nIHdpbGxcclxuICogICAgICBwcmV2ZW50IHRoaXMgZnJvbSBoYXBwZW5pbmcgYnkgYWRkaW5nIHBhZGRpbmcgdG8gdGhlIHRvcCBhbmQgYm90dG9tIG9mIHRleHQgaGVpZ2h0LlxyXG4gKiBAcGFyYW0gW3N0eWxlLnRleHRCYXNlbGluZT0nYWxwaGFiZXRpYyddIHtzdHJpbmd9IFRoZSBiYXNlbGluZSBvZiB0aGUgdGV4dCB0aGF0IGlzIHJlbmRlcmVkLlxyXG4gKiBAcGFyYW0gW3N0eWxlLmxpbmVKb2luPSdtaXRlciddIHtzdHJpbmd9IFRoZSBsaW5lSm9pbiBwcm9wZXJ0eSBzZXRzIHRoZSB0eXBlIG9mIGNvcm5lciBjcmVhdGVkLCBpdCBjYW4gcmVzb2x2ZVxyXG4gKiAgICAgIHNwaWtlZCB0ZXh0IGlzc3Vlcy4gRGVmYXVsdCBpcyAnbWl0ZXInIChjcmVhdGVzIGEgc2hhcnAgY29ybmVyKS5cclxuICogQHBhcmFtIFtzdHlsZS5taXRlckxpbWl0PTEwXSB7bnVtYmVyfSBUaGUgbWl0ZXIgbGltaXQgdG8gdXNlIHdoZW4gdXNpbmcgdGhlICdtaXRlcicgbGluZUpvaW4gbW9kZS4gVGhpcyBjYW4gcmVkdWNlXHJcbiAqICAgICAgb3IgaW5jcmVhc2UgdGhlIHNwaWtpbmVzcyBvZiByZW5kZXJlZCB0ZXh0LlxyXG4gKi9cclxuZnVuY3Rpb24gVGV4dCh0ZXh0LCBzdHlsZSwgcmVzb2x1dGlvbilcclxue1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgY2FudmFzIGVsZW1lbnQgdGhhdCBldmVyeXRoaW5nIGlzIGRyYXduIHRvXHJcbiAgICAgKlxyXG4gICAgICogQG1lbWJlciB7SFRNTENhbnZhc0VsZW1lbnR9XHJcbiAgICAgKi9cclxuICAgIHRoaXMuY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgY2FudmFzIDJkIGNvbnRleHQgdGhhdCBldmVyeXRoaW5nIGlzIGRyYXduIHdpdGhcclxuICAgICAqIEBtZW1iZXIge0hUTUxDYW52YXNFbGVtZW50fVxyXG4gICAgICovXHJcbiAgICB0aGlzLmNvbnRleHQgPSB0aGlzLmNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogVGhlIHJlc29sdXRpb24gb2YgdGhlIGNhbnZhcy5cclxuICAgICAqIEBtZW1iZXIge251bWJlcn1cclxuICAgICAqL1xyXG4gICAgdGhpcy5yZXNvbHV0aW9uID0gcmVzb2x1dGlvbiB8fCBDT05TVC5SRVNPTFVUSU9OO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUHJpdmF0ZSB0cmFja2VyIGZvciB0aGUgY3VycmVudCB0ZXh0LlxyXG4gICAgICpcclxuICAgICAqIEBtZW1iZXIge3N0cmluZ31cclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIHRoaXMuX3RleHQgPSBudWxsO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUHJpdmF0ZSB0cmFja2VyIGZvciB0aGUgY3VycmVudCBzdHlsZS5cclxuICAgICAqXHJcbiAgICAgKiBAbWVtYmVyIHtvYmplY3R9XHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICB0aGlzLl9zdHlsZSA9IG51bGw7XHJcblxyXG4gICAgdmFyIHRleHR1cmUgPSBUZXh0dXJlLmZyb21DYW52YXModGhpcy5jYW52YXMpO1xyXG4gICAgdGV4dHVyZS50cmltID0gbmV3IG1hdGguUmVjdGFuZ2xlKCk7XHJcbiAgICBTcHJpdGUuY2FsbCh0aGlzLCB0ZXh0dXJlKTtcclxuXHJcbiAgICB0aGlzLnRleHQgPSB0ZXh0O1xyXG4gICAgdGhpcy5zdHlsZSA9IHN0eWxlO1xyXG59XHJcblxyXG4vLyBjb25zdHJ1Y3RvclxyXG5UZXh0LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoU3ByaXRlLnByb3RvdHlwZSk7XHJcblRleHQucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gVGV4dDtcclxubW9kdWxlLmV4cG9ydHMgPSBUZXh0O1xyXG5cclxuVGV4dC5mb250UHJvcGVydGllc0NhY2hlID0ge307XHJcblRleHQuZm9udFByb3BlcnRpZXNDYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcclxuVGV4dC5mb250UHJvcGVydGllc0NvbnRleHQgPSBUZXh0LmZvbnRQcm9wZXJ0aWVzQ2FudmFzLmdldENvbnRleHQoJzJkJyk7XHJcblxyXG5PYmplY3QuZGVmaW5lUHJvcGVydGllcyhUZXh0LnByb3RvdHlwZSwge1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgd2lkdGggb2YgdGhlIFRleHQsIHNldHRpbmcgdGhpcyB3aWxsIGFjdHVhbGx5IG1vZGlmeSB0aGUgc2NhbGUgdG8gYWNoaWV2ZSB0aGUgdmFsdWUgc2V0XHJcbiAgICAgKlxyXG4gICAgICogQG1lbWJlciB7bnVtYmVyfVxyXG4gICAgICogQG1lbWJlcm9mIFBJWEkuVGV4dCNcclxuICAgICAqL1xyXG4gICAgd2lkdGg6IHtcclxuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5kaXJ0eSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVUZXh0KCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNjYWxlLnggKiB0aGlzLl90ZXh0dXJlLl9mcmFtZS53aWR0aDtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHNldDogZnVuY3Rpb24gKHZhbHVlKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5zY2FsZS54ID0gdmFsdWUgLyB0aGlzLl90ZXh0dXJlLl9mcmFtZS53aWR0aDtcclxuICAgICAgICAgICAgdGhpcy5fd2lkdGggPSB2YWx1ZTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVGhlIGhlaWdodCBvZiB0aGUgVGV4dCwgc2V0dGluZyB0aGlzIHdpbGwgYWN0dWFsbHkgbW9kaWZ5IHRoZSBzY2FsZSB0byBhY2hpZXZlIHRoZSB2YWx1ZSBzZXRcclxuICAgICAqXHJcbiAgICAgKiBAbWVtYmVyIHtudW1iZXJ9XHJcbiAgICAgKiBAbWVtYmVyb2YgUElYSS5UZXh0I1xyXG4gICAgICovXHJcbiAgICBoZWlnaHQ6IHtcclxuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5kaXJ0eSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVUZXh0KCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiAgdGhpcy5zY2FsZS55ICogdGhpcy5fdGV4dHVyZS5fZnJhbWUuaGVpZ2h0O1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc2V0OiBmdW5jdGlvbiAodmFsdWUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnNjYWxlLnkgPSB2YWx1ZSAvIHRoaXMuX3RleHR1cmUuX2ZyYW1lLmhlaWdodDtcclxuICAgICAgICAgICAgdGhpcy5faGVpZ2h0ID0gdmFsdWU7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIFNldCB0aGUgc3R5bGUgb2YgdGhlIHRleHRcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gW3N0eWxlXSB7b2JqZWN0fSBUaGUgc3R5bGUgcGFyYW1ldGVyc1xyXG4gICAgICogQHBhcmFtIFtzdHlsZS5mb250PSdib2xkIDIwcHQgQXJpYWwnXSB7c3RyaW5nfSBUaGUgc3R5bGUgYW5kIHNpemUgb2YgdGhlIGZvbnRcclxuICAgICAqIEBwYXJhbSBbc3R5bGUuZmlsbD0nYmxhY2snXSB7c3RyaW5nfG51bWJlcn0gQSBjYW52YXMgZmlsbHN0eWxlIHRoYXQgd2lsbCBiZSB1c2VkIG9uIHRoZSB0ZXh0IGVnICdyZWQnLCAnIzAwRkYwMCdcclxuICAgICAqIEBwYXJhbSBbc3R5bGUuYWxpZ249J2xlZnQnXSB7c3RyaW5nfSBBbGlnbm1lbnQgZm9yIG11bHRpbGluZSB0ZXh0ICgnbGVmdCcsICdjZW50ZXInIG9yICdyaWdodCcpLCBkb2VzIG5vdCBhZmZlY3Qgc2luZ2xlIGxpbmUgdGV4dFxyXG4gICAgICogQHBhcmFtIFtzdHlsZS5zdHJva2U9J2JsYWNrJ10ge3N0cmluZ3xudW1iZXJ9IEEgY2FudmFzIGZpbGxzdHlsZSB0aGF0IHdpbGwgYmUgdXNlZCBvbiB0aGUgdGV4dCBzdHJva2UgZWcgJ2JsdWUnLCAnI0ZDRkYwMCdcclxuICAgICAqIEBwYXJhbSBbc3R5bGUuc3Ryb2tlVGhpY2tuZXNzPTBdIHtudW1iZXJ9IEEgbnVtYmVyIHRoYXQgcmVwcmVzZW50cyB0aGUgdGhpY2tuZXNzIG9mIHRoZSBzdHJva2UuIERlZmF1bHQgaXMgMCAobm8gc3Ryb2tlKVxyXG4gICAgICogQHBhcmFtIFtzdHlsZS53b3JkV3JhcD1mYWxzZV0ge2Jvb2xlYW59IEluZGljYXRlcyBpZiB3b3JkIHdyYXAgc2hvdWxkIGJlIHVzZWRcclxuICAgICAqIEBwYXJhbSBbc3R5bGUud29yZFdyYXBXaWR0aD0xMDBdIHtudW1iZXJ9IFRoZSB3aWR0aCBhdCB3aGljaCB0ZXh0IHdpbGwgd3JhcFxyXG4gICAgICogQHBhcmFtIFtzdHlsZS5saW5lSGVpZ2h0XSB7bnVtYmVyfSBUaGUgbGluZSBoZWlnaHQsIGEgbnVtYmVyIHRoYXQgcmVwcmVzZW50cyB0aGUgdmVydGljYWwgc3BhY2UgdGhhdCBhIGxldHRlciB1c2VzXHJcbiAgICAgKiBAcGFyYW0gW3N0eWxlLmRyb3BTaGFkb3c9ZmFsc2VdIHtib29sZWFufSBTZXQgYSBkcm9wIHNoYWRvdyBmb3IgdGhlIHRleHRcclxuICAgICAqIEBwYXJhbSBbc3R5bGUuZHJvcFNoYWRvd0NvbG9yPScjMDAwMDAwJ10ge3N0cmluZ3xudW1iZXJ9IEEgZmlsbCBzdHlsZSB0byBiZSB1c2VkIG9uIHRoZSBkcm9wc2hhZG93IGUuZyAncmVkJywgJyMwMEZGMDAnXHJcbiAgICAgKiBAcGFyYW0gW3N0eWxlLmRyb3BTaGFkb3dBbmdsZT1NYXRoLlBJLzZdIHtudW1iZXJ9IFNldCBhIGFuZ2xlIG9mIHRoZSBkcm9wIHNoYWRvd1xyXG4gICAgICogQHBhcmFtIFtzdHlsZS5kcm9wU2hhZG93RGlzdGFuY2U9NV0ge251bWJlcn0gU2V0IGEgZGlzdGFuY2Ugb2YgdGhlIGRyb3Agc2hhZG93XHJcbiAgICAgKiBAcGFyYW0gW3N0eWxlLnBhZGRpbmc9MF0ge251bWJlcn0gT2NjYXNpb25hbGx5IHNvbWUgZm9udHMgYXJlIGNyb3BwZWQgb24gdG9wIG9yIGJvdHRvbS4gQWRkaW5nIHNvbWUgcGFkZGluZyB3aWxsXHJcbiAgICAgKiAgICAgIHByZXZlbnQgdGhpcyBmcm9tIGhhcHBlbmluZyBieSBhZGRpbmcgcGFkZGluZyB0byB0aGUgdG9wIGFuZCBib3R0b20gb2YgdGV4dCBoZWlnaHQuXHJcbiAgICAgKiBAcGFyYW0gW3N0eWxlLnRleHRCYXNlbGluZT0nYWxwaGFiZXRpYyddIHtzdHJpbmd9IFRoZSBiYXNlbGluZSBvZiB0aGUgdGV4dCB0aGF0IGlzIHJlbmRlcmVkLlxyXG4gICAgICogQHBhcmFtIFtzdHlsZS5saW5lSm9pbj0nbWl0ZXInXSB7c3RyaW5nfSBUaGUgbGluZUpvaW4gcHJvcGVydHkgc2V0cyB0aGUgdHlwZSBvZiBjb3JuZXIgY3JlYXRlZCwgaXQgY2FuIHJlc29sdmVcclxuICAgICAqICAgICAgc3Bpa2VkIHRleHQgaXNzdWVzLiBEZWZhdWx0IGlzICdtaXRlcicgKGNyZWF0ZXMgYSBzaGFycCBjb3JuZXIpLlxyXG4gICAgICogQHBhcmFtIFtzdHlsZS5taXRlckxpbWl0PTEwXSB7bnVtYmVyfSBUaGUgbWl0ZXIgbGltaXQgdG8gdXNlIHdoZW4gdXNpbmcgdGhlICdtaXRlcicgbGluZUpvaW4gbW9kZS4gVGhpcyBjYW4gcmVkdWNlXHJcbiAgICAgKiAgICAgIG9yIGluY3JlYXNlIHRoZSBzcGlraW5lc3Mgb2YgcmVuZGVyZWQgdGV4dC5cclxuICAgICAqIEBtZW1iZXJvZiBQSVhJLlRleHQjXHJcbiAgICAgKi9cclxuICAgIHN0eWxlOiB7XHJcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3N0eWxlO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc2V0OiBmdW5jdGlvbiAoc3R5bGUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBzdHlsZSA9IHN0eWxlIHx8IHt9O1xyXG5cclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBzdHlsZS5maWxsID09PSAnbnVtYmVyJykge1xyXG4gICAgICAgICAgICAgICAgc3R5bGUuZmlsbCA9IHV0aWxzLmhleDJzdHJpbmcoc3R5bGUuZmlsbCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICh0eXBlb2Ygc3R5bGUuc3Ryb2tlID09PSAnbnVtYmVyJykge1xyXG4gICAgICAgICAgICAgICAgc3R5bGUuc3Ryb2tlID0gdXRpbHMuaGV4MnN0cmluZyhzdHlsZS5zdHJva2UpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAodHlwZW9mIHN0eWxlLmRyb3BTaGFkb3dDb2xvciA9PT0gJ251bWJlcicpIHtcclxuICAgICAgICAgICAgICAgIHN0eWxlLmRyb3BTaGFkb3dDb2xvciA9IHV0aWxzLmhleDJzdHJpbmcoc3R5bGUuZHJvcFNoYWRvd0NvbG9yKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgc3R5bGUuZm9udCA9IHN0eWxlLmZvbnQgfHwgJ2JvbGQgMjBwdCBBcmlhbCc7XHJcbiAgICAgICAgICAgIHN0eWxlLmZpbGwgPSBzdHlsZS5maWxsIHx8ICdibGFjayc7XHJcbiAgICAgICAgICAgIHN0eWxlLmFsaWduID0gc3R5bGUuYWxpZ24gfHwgJ2xlZnQnO1xyXG4gICAgICAgICAgICBzdHlsZS5zdHJva2UgPSBzdHlsZS5zdHJva2UgfHwgJ2JsYWNrJzsgLy9wcm92aWRlIGEgZGVmYXVsdCwgc2VlOiBodHRwczovL2dpdGh1Yi5jb20vcGl4aWpzL3BpeGkuanMvaXNzdWVzLzEzNlxyXG4gICAgICAgICAgICBzdHlsZS5zdHJva2VUaGlja25lc3MgPSBzdHlsZS5zdHJva2VUaGlja25lc3MgfHwgMDtcclxuICAgICAgICAgICAgc3R5bGUud29yZFdyYXAgPSBzdHlsZS53b3JkV3JhcCB8fCBmYWxzZTtcclxuICAgICAgICAgICAgc3R5bGUud29yZFdyYXBXaWR0aCA9IHN0eWxlLndvcmRXcmFwV2lkdGggfHwgMTAwO1xyXG5cclxuICAgICAgICAgICAgc3R5bGUuZHJvcFNoYWRvdyA9IHN0eWxlLmRyb3BTaGFkb3cgfHwgZmFsc2U7XHJcbiAgICAgICAgICAgIHN0eWxlLmRyb3BTaGFkb3dDb2xvciA9IHN0eWxlLmRyb3BTaGFkb3dDb2xvciB8fCAnIzAwMDAwMCc7XHJcbiAgICAgICAgICAgIHN0eWxlLmRyb3BTaGFkb3dBbmdsZSA9IHN0eWxlLmRyb3BTaGFkb3dBbmdsZSB8fCBNYXRoLlBJIC8gNjtcclxuICAgICAgICAgICAgc3R5bGUuZHJvcFNoYWRvd0Rpc3RhbmNlID0gc3R5bGUuZHJvcFNoYWRvd0Rpc3RhbmNlIHx8IDU7XHJcblxyXG4gICAgICAgICAgICBzdHlsZS5wYWRkaW5nID0gc3R5bGUucGFkZGluZyB8fCAwO1xyXG5cclxuICAgICAgICAgICAgc3R5bGUudGV4dEJhc2VsaW5lID0gc3R5bGUudGV4dEJhc2VsaW5lIHx8ICdhbHBoYWJldGljJztcclxuXHJcbiAgICAgICAgICAgIHN0eWxlLmxpbmVKb2luID0gc3R5bGUubGluZUpvaW4gfHwgJ21pdGVyJztcclxuICAgICAgICAgICAgc3R5bGUubWl0ZXJMaW1pdCA9IHN0eWxlLm1pdGVyTGltaXQgfHwgMTA7XHJcblxyXG4gICAgICAgICAgICB0aGlzLl9zdHlsZSA9IHN0eWxlO1xyXG4gICAgICAgICAgICB0aGlzLmRpcnR5ID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2V0IHRoZSBjb3B5IGZvciB0aGUgdGV4dCBvYmplY3QuIFRvIHNwbGl0IGEgbGluZSB5b3UgY2FuIHVzZSAnXFxuJy5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gdGV4dCB7c3RyaW5nfSBUaGUgY29weSB0aGF0IHlvdSB3b3VsZCBsaWtlIHRoZSB0ZXh0IHRvIGRpc3BsYXlcclxuICAgICAqIEBtZW1iZXJvZiBQSVhJLlRleHQjXHJcbiAgICAgKi9cclxuICAgIHRleHQ6IHtcclxuICAgICAgICBnZXQ6IGZ1bmN0aW9uKClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl90ZXh0O1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc2V0OiBmdW5jdGlvbiAodGV4dCl7XHJcbiAgICAgICAgICAgIHRleHQgPSB0ZXh0LnRvU3RyaW5nKCkgfHwgJyAnO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5fdGV4dCA9PT0gdGV4dClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuX3RleHQgPSB0ZXh0O1xyXG4gICAgICAgICAgICB0aGlzLmRpcnR5ID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pO1xyXG5cclxuLyoqXHJcbiAqIFJlbmRlcnMgdGV4dCBhbmQgdXBkYXRlcyBpdCB3aGVuIG5lZWRlZFxyXG4gKlxyXG4gKiBAcHJpdmF0ZVxyXG4gKi9cclxuVGV4dC5wcm90b3R5cGUudXBkYXRlVGV4dCA9IGZ1bmN0aW9uICgpXHJcbntcclxuICAgIHZhciBzdHlsZSA9IHRoaXMuX3N0eWxlO1xyXG4gICAgdGhpcy5jb250ZXh0LmZvbnQgPSBzdHlsZS5mb250O1xyXG5cclxuICAgIC8vIHdvcmQgd3JhcFxyXG4gICAgLy8gcHJlc2VydmUgb3JpZ2luYWwgdGV4dFxyXG4gICAgdmFyIG91dHB1dFRleHQgPSBzdHlsZS53b3JkV3JhcCA/IHRoaXMud29yZFdyYXAodGhpcy5fdGV4dCkgOiB0aGlzLl90ZXh0O1xyXG5cclxuICAgIC8vIHNwbGl0IHRleHQgaW50byBsaW5lc1xyXG4gICAgdmFyIGxpbmVzID0gb3V0cHV0VGV4dC5zcGxpdCgvKD86XFxyXFxufFxccnxcXG4pLyk7XHJcblxyXG4gICAgLy8gY2FsY3VsYXRlIHRleHQgd2lkdGhcclxuICAgIHZhciBsaW5lV2lkdGhzID0gbmV3IEFycmF5KGxpbmVzLmxlbmd0aCk7XHJcbiAgICB2YXIgbWF4TGluZVdpZHRoID0gMDtcclxuICAgIHZhciBmb250UHJvcGVydGllcyA9IHRoaXMuZGV0ZXJtaW5lRm9udFByb3BlcnRpZXMoc3R5bGUuZm9udCk7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxpbmVzLmxlbmd0aDsgaSsrKVxyXG4gICAge1xyXG4gICAgICAgIHZhciBsaW5lV2lkdGggPSB0aGlzLmNvbnRleHQubWVhc3VyZVRleHQobGluZXNbaV0pLndpZHRoO1xyXG4gICAgICAgIGxpbmVXaWR0aHNbaV0gPSBsaW5lV2lkdGg7XHJcbiAgICAgICAgbWF4TGluZVdpZHRoID0gTWF0aC5tYXgobWF4TGluZVdpZHRoLCBsaW5lV2lkdGgpO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciB3aWR0aCA9IG1heExpbmVXaWR0aCArIHN0eWxlLnN0cm9rZVRoaWNrbmVzcztcclxuICAgIGlmIChzdHlsZS5kcm9wU2hhZG93KVxyXG4gICAge1xyXG4gICAgICAgIHdpZHRoICs9IHN0eWxlLmRyb3BTaGFkb3dEaXN0YW5jZTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmNhbnZhcy53aWR0aCA9ICggd2lkdGggKyB0aGlzLmNvbnRleHQubGluZVdpZHRoICkgKiB0aGlzLnJlc29sdXRpb247XHJcblxyXG4gICAgLy8gY2FsY3VsYXRlIHRleHQgaGVpZ2h0XHJcbiAgICB2YXIgbGluZUhlaWdodCA9IHRoaXMuc3R5bGUubGluZUhlaWdodCB8fCBmb250UHJvcGVydGllcy5mb250U2l6ZSArIHN0eWxlLnN0cm9rZVRoaWNrbmVzcztcclxuXHJcbiAgICB2YXIgaGVpZ2h0ID0gbGluZUhlaWdodCAqIGxpbmVzLmxlbmd0aDtcclxuICAgIGlmIChzdHlsZS5kcm9wU2hhZG93KVxyXG4gICAge1xyXG4gICAgICAgIGhlaWdodCArPSBzdHlsZS5kcm9wU2hhZG93RGlzdGFuY2U7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5jYW52YXMuaGVpZ2h0ID0gKCBoZWlnaHQgKyB0aGlzLl9zdHlsZS5wYWRkaW5nICogMiApICogdGhpcy5yZXNvbHV0aW9uO1xyXG5cclxuICAgIHRoaXMuY29udGV4dC5zY2FsZSggdGhpcy5yZXNvbHV0aW9uLCB0aGlzLnJlc29sdXRpb24pO1xyXG5cclxuICAgIGlmIChuYXZpZ2F0b3IuaXNDb2Nvb25KUylcclxuICAgIHtcclxuICAgICAgICB0aGlzLmNvbnRleHQuY2xlYXJSZWN0KDAsIDAsIHRoaXMuY2FudmFzLndpZHRoLCB0aGlzLmNhbnZhcy5oZWlnaHQpO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICAvL3RoaXMuY29udGV4dC5maWxsU3R5bGU9XCIjRkYwMDAwXCI7XHJcbiAgICAvL3RoaXMuY29udGV4dC5maWxsUmVjdCgwLCAwLCB0aGlzLmNhbnZhcy53aWR0aCwgdGhpcy5jYW52YXMuaGVpZ2h0KTtcclxuXHJcbiAgICB0aGlzLmNvbnRleHQuZm9udCA9IHN0eWxlLmZvbnQ7XHJcbiAgICB0aGlzLmNvbnRleHQuc3Ryb2tlU3R5bGUgPSBzdHlsZS5zdHJva2U7XHJcbiAgICB0aGlzLmNvbnRleHQubGluZVdpZHRoID0gc3R5bGUuc3Ryb2tlVGhpY2tuZXNzO1xyXG4gICAgdGhpcy5jb250ZXh0LnRleHRCYXNlbGluZSA9IHN0eWxlLnRleHRCYXNlbGluZTtcclxuICAgIHRoaXMuY29udGV4dC5saW5lSm9pbiA9IHN0eWxlLmxpbmVKb2luO1xyXG4gICAgdGhpcy5jb250ZXh0Lm1pdGVyTGltaXQgPSBzdHlsZS5taXRlckxpbWl0O1xyXG5cclxuICAgIHZhciBsaW5lUG9zaXRpb25YO1xyXG4gICAgdmFyIGxpbmVQb3NpdGlvblk7XHJcblxyXG4gICAgaWYgKHN0eWxlLmRyb3BTaGFkb3cpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5jb250ZXh0LmZpbGxTdHlsZSA9IHN0eWxlLmRyb3BTaGFkb3dDb2xvcjtcclxuXHJcbiAgICAgICAgdmFyIHhTaGFkb3dPZmZzZXQgPSBNYXRoLmNvcyhzdHlsZS5kcm9wU2hhZG93QW5nbGUpICogc3R5bGUuZHJvcFNoYWRvd0Rpc3RhbmNlO1xyXG4gICAgICAgIHZhciB5U2hhZG93T2Zmc2V0ID0gTWF0aC5zaW4oc3R5bGUuZHJvcFNoYWRvd0FuZ2xlKSAqIHN0eWxlLmRyb3BTaGFkb3dEaXN0YW5jZTtcclxuXHJcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGxpbmVzLmxlbmd0aDsgaSsrKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgbGluZVBvc2l0aW9uWCA9IHN0eWxlLnN0cm9rZVRoaWNrbmVzcyAvIDI7XHJcbiAgICAgICAgICAgIGxpbmVQb3NpdGlvblkgPSAoc3R5bGUuc3Ryb2tlVGhpY2tuZXNzIC8gMiArIGkgKiBsaW5lSGVpZ2h0KSArIGZvbnRQcm9wZXJ0aWVzLmFzY2VudDtcclxuXHJcbiAgICAgICAgICAgIGlmIChzdHlsZS5hbGlnbiA9PT0gJ3JpZ2h0JylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgbGluZVBvc2l0aW9uWCArPSBtYXhMaW5lV2lkdGggLSBsaW5lV2lkdGhzW2ldO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKHN0eWxlLmFsaWduID09PSAnY2VudGVyJylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgbGluZVBvc2l0aW9uWCArPSAobWF4TGluZVdpZHRoIC0gbGluZVdpZHRoc1tpXSkgLyAyO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoc3R5bGUuZmlsbClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jb250ZXh0LmZpbGxUZXh0KGxpbmVzW2ldLCBsaW5lUG9zaXRpb25YICsgeFNoYWRvd09mZnNldCwgbGluZVBvc2l0aW9uWSArIHlTaGFkb3dPZmZzZXQgKyB0aGlzLl9zdHlsZS5wYWRkaW5nKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvL3NldCBjYW52YXMgdGV4dCBzdHlsZXNcclxuICAgIHRoaXMuY29udGV4dC5maWxsU3R5bGUgPSBzdHlsZS5maWxsO1xyXG5cclxuICAgIC8vZHJhdyBsaW5lcyBsaW5lIGJ5IGxpbmVcclxuICAgIGZvciAoaSA9IDA7IGkgPCBsaW5lcy5sZW5ndGg7IGkrKylcclxuICAgIHtcclxuICAgICAgICBsaW5lUG9zaXRpb25YID0gc3R5bGUuc3Ryb2tlVGhpY2tuZXNzIC8gMjtcclxuICAgICAgICBsaW5lUG9zaXRpb25ZID0gKHN0eWxlLnN0cm9rZVRoaWNrbmVzcyAvIDIgKyBpICogbGluZUhlaWdodCkgKyBmb250UHJvcGVydGllcy5hc2NlbnQ7XHJcblxyXG4gICAgICAgIGlmIChzdHlsZS5hbGlnbiA9PT0gJ3JpZ2h0JylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGxpbmVQb3NpdGlvblggKz0gbWF4TGluZVdpZHRoIC0gbGluZVdpZHRoc1tpXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoc3R5bGUuYWxpZ24gPT09ICdjZW50ZXInKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgbGluZVBvc2l0aW9uWCArPSAobWF4TGluZVdpZHRoIC0gbGluZVdpZHRoc1tpXSkgLyAyO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHN0eWxlLnN0cm9rZSAmJiBzdHlsZS5zdHJva2VUaGlja25lc3MpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLmNvbnRleHQuc3Ryb2tlVGV4dChsaW5lc1tpXSwgbGluZVBvc2l0aW9uWCwgbGluZVBvc2l0aW9uWSArIHRoaXMuX3N0eWxlLnBhZGRpbmcpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHN0eWxlLmZpbGwpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLmNvbnRleHQuZmlsbFRleHQobGluZXNbaV0sIGxpbmVQb3NpdGlvblgsIGxpbmVQb3NpdGlvblkgKyB0aGlzLl9zdHlsZS5wYWRkaW5nKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy51cGRhdGVUZXh0dXJlKCk7XHJcbn07XHJcblxyXG4vKipcclxuICogVXBkYXRlcyB0ZXh0dXJlIHNpemUgYmFzZWQgb24gY2FudmFzIHNpemVcclxuICpcclxuICogQHByaXZhdGVcclxuICovXHJcblRleHQucHJvdG90eXBlLnVwZGF0ZVRleHR1cmUgPSBmdW5jdGlvbiAoKVxyXG57XHJcbiAgICB2YXIgdGV4dHVyZSA9IHRoaXMuX3RleHR1cmU7XHJcblxyXG4gICAgdGV4dHVyZS5iYXNlVGV4dHVyZS5oYXNMb2FkZWQgPSB0cnVlO1xyXG4gICAgdGV4dHVyZS5iYXNlVGV4dHVyZS5yZXNvbHV0aW9uID0gdGhpcy5yZXNvbHV0aW9uO1xyXG5cclxuICAgIHRleHR1cmUuYmFzZVRleHR1cmUud2lkdGggPSB0aGlzLmNhbnZhcy53aWR0aCAvIHRoaXMucmVzb2x1dGlvbjtcclxuICAgIHRleHR1cmUuYmFzZVRleHR1cmUuaGVpZ2h0ID0gdGhpcy5jYW52YXMuaGVpZ2h0IC8gdGhpcy5yZXNvbHV0aW9uO1xyXG4gICAgdGV4dHVyZS5jcm9wLndpZHRoID0gdGV4dHVyZS5fZnJhbWUud2lkdGggPSB0aGlzLmNhbnZhcy53aWR0aCAvIHRoaXMucmVzb2x1dGlvbjtcclxuICAgIHRleHR1cmUuY3JvcC5oZWlnaHQgPSB0ZXh0dXJlLl9mcmFtZS5oZWlnaHQgPSB0aGlzLmNhbnZhcy5oZWlnaHQgLyB0aGlzLnJlc29sdXRpb247XHJcblxyXG4gICAgdGV4dHVyZS50cmltLnggPSAwO1xyXG4gICAgdGV4dHVyZS50cmltLnkgPSAtdGhpcy5fc3R5bGUucGFkZGluZztcclxuXHJcbiAgICB0ZXh0dXJlLnRyaW0ud2lkdGggPSB0ZXh0dXJlLl9mcmFtZS53aWR0aDtcclxuICAgIHRleHR1cmUudHJpbS5oZWlnaHQgPSB0ZXh0dXJlLl9mcmFtZS5oZWlnaHQgLSB0aGlzLl9zdHlsZS5wYWRkaW5nKjI7XHJcblxyXG4gICAgdGhpcy5fd2lkdGggPSB0aGlzLmNhbnZhcy53aWR0aCAvIHRoaXMucmVzb2x1dGlvbjtcclxuICAgIHRoaXMuX2hlaWdodCA9IHRoaXMuY2FudmFzLmhlaWdodCAvIHRoaXMucmVzb2x1dGlvbjtcclxuXHJcbiAgICB0ZXh0dXJlLmJhc2VUZXh0dXJlLmVtaXQoJ3VwZGF0ZScsICB0ZXh0dXJlLmJhc2VUZXh0dXJlKTtcclxuXHJcbiAgICB0aGlzLmRpcnR5ID0gZmFsc2U7XHJcbn07XHJcblxyXG4vKipcclxuICogUmVuZGVycyB0aGUgb2JqZWN0IHVzaW5nIHRoZSBXZWJHTCByZW5kZXJlclxyXG4gKlxyXG4gKiBAcGFyYW0gcmVuZGVyZXIge1BJWEkuV2ViR0xSZW5kZXJlcn1cclxuICovXHJcblRleHQucHJvdG90eXBlLnJlbmRlcldlYkdMID0gZnVuY3Rpb24gKHJlbmRlcmVyKVxyXG57XHJcbiAgICBpZiAodGhpcy5kaXJ0eSlcclxuICAgIHtcclxuICAgICAgICAvL3RoaXMucmVzb2x1dGlvbiA9IDEvL3JlbmRlcmVyLnJlc29sdXRpb247XHJcblxyXG4gICAgICAgIHRoaXMudXBkYXRlVGV4dCgpO1xyXG4gICAgfVxyXG5cclxuICAgIFNwcml0ZS5wcm90b3R5cGUucmVuZGVyV2ViR0wuY2FsbCh0aGlzLCByZW5kZXJlcik7XHJcbn07XHJcblxyXG4vKipcclxuICogUmVuZGVycyB0aGUgb2JqZWN0IHVzaW5nIHRoZSBDYW52YXMgcmVuZGVyZXJcclxuICpcclxuICogQHBhcmFtIHJlbmRlcmVyIHtQSVhJLkNhbnZhc1JlbmRlcmVyfVxyXG4gKiBAcHJpdmF0ZVxyXG4gKi9cclxuVGV4dC5wcm90b3R5cGUuX3JlbmRlckNhbnZhcyA9IGZ1bmN0aW9uIChyZW5kZXJlcilcclxue1xyXG4gICAgaWYgKHRoaXMuZGlydHkpXHJcbiAgICB7XHJcbiAgICAgLy8gICB0aGlzLnJlc29sdXRpb24gPSAxLy9yZW5kZXJlci5yZXNvbHV0aW9uO1xyXG5cclxuICAgICAgICB0aGlzLnVwZGF0ZVRleHQoKTtcclxuICAgIH1cclxuXHJcbiAgICBTcHJpdGUucHJvdG90eXBlLl9yZW5kZXJDYW52YXMuY2FsbCh0aGlzLCByZW5kZXJlcik7XHJcbn07XHJcblxyXG4vKipcclxuICogQ2FsY3VsYXRlcyB0aGUgYXNjZW50LCBkZXNjZW50IGFuZCBmb250U2l6ZSBvZiBhIGdpdmVuIGZvbnRTdHlsZVxyXG4gKlxyXG4gKiBAcGFyYW0gZm9udFN0eWxlIHtvYmplY3R9XHJcbiAqIEBwcml2YXRlXHJcbiAqL1xyXG5UZXh0LnByb3RvdHlwZS5kZXRlcm1pbmVGb250UHJvcGVydGllcyA9IGZ1bmN0aW9uIChmb250U3R5bGUpXHJcbntcclxuICAgIHZhciBwcm9wZXJ0aWVzID0gVGV4dC5mb250UHJvcGVydGllc0NhY2hlW2ZvbnRTdHlsZV07XHJcblxyXG4gICAgaWYgKCFwcm9wZXJ0aWVzKVxyXG4gICAge1xyXG4gICAgICAgIHByb3BlcnRpZXMgPSB7fTtcclxuXHJcbiAgICAgICAgdmFyIGNhbnZhcyA9IFRleHQuZm9udFByb3BlcnRpZXNDYW52YXM7XHJcbiAgICAgICAgdmFyIGNvbnRleHQgPSBUZXh0LmZvbnRQcm9wZXJ0aWVzQ29udGV4dDtcclxuXHJcbiAgICAgICAgY29udGV4dC5mb250ID0gZm9udFN0eWxlO1xyXG5cclxuICAgICAgICB2YXIgd2lkdGggPSBNYXRoLmNlaWwoY29udGV4dC5tZWFzdXJlVGV4dCgnfE3DiXEnKS53aWR0aCk7XHJcbiAgICAgICAgdmFyIGJhc2VsaW5lID0gTWF0aC5jZWlsKGNvbnRleHQubWVhc3VyZVRleHQoJ00nKS53aWR0aCk7XHJcbiAgICAgICAgdmFyIGhlaWdodCA9IDIgKiBiYXNlbGluZTtcclxuXHJcbiAgICAgICAgYmFzZWxpbmUgPSBiYXNlbGluZSAqIDEuNCB8IDA7XHJcblxyXG4gICAgICAgIGNhbnZhcy53aWR0aCA9IHdpZHRoO1xyXG4gICAgICAgIGNhbnZhcy5oZWlnaHQgPSBoZWlnaHQ7XHJcblxyXG4gICAgICAgIGNvbnRleHQuZmlsbFN0eWxlID0gJyNmMDAnO1xyXG4gICAgICAgIGNvbnRleHQuZmlsbFJlY3QoMCwgMCwgd2lkdGgsIGhlaWdodCk7XHJcblxyXG4gICAgICAgIGNvbnRleHQuZm9udCA9IGZvbnRTdHlsZTtcclxuXHJcbiAgICAgICAgY29udGV4dC50ZXh0QmFzZWxpbmUgPSAnYWxwaGFiZXRpYyc7XHJcbiAgICAgICAgY29udGV4dC5maWxsU3R5bGUgPSAnIzAwMCc7XHJcbiAgICAgICAgY29udGV4dC5maWxsVGV4dCgnfE3DiXEnLCAwLCBiYXNlbGluZSk7XHJcblxyXG4gICAgICAgIHZhciBpbWFnZWRhdGEgPSBjb250ZXh0LmdldEltYWdlRGF0YSgwLCAwLCB3aWR0aCwgaGVpZ2h0KS5kYXRhO1xyXG4gICAgICAgIHZhciBwaXhlbHMgPSBpbWFnZWRhdGEubGVuZ3RoO1xyXG4gICAgICAgIHZhciBsaW5lID0gd2lkdGggKiA0O1xyXG5cclxuICAgICAgICB2YXIgaSwgajtcclxuXHJcbiAgICAgICAgdmFyIGlkeCA9IDA7XHJcbiAgICAgICAgdmFyIHN0b3AgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgLy8gYXNjZW50LiBzY2FuIGZyb20gdG9wIHRvIGJvdHRvbSB1bnRpbCB3ZSBmaW5kIGEgbm9uIHJlZCBwaXhlbFxyXG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBiYXNlbGluZTsgaSsrKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZm9yIChqID0gMDsgaiA8IGxpbmU7IGogKz0gNClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKGltYWdlZGF0YVtpZHggKyBqXSAhPT0gMjU1KVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHN0b3AgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICghc3RvcClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWR4ICs9IGxpbmU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJvcGVydGllcy5hc2NlbnQgPSBiYXNlbGluZSAtIGk7XHJcblxyXG4gICAgICAgIGlkeCA9IHBpeGVscyAtIGxpbmU7XHJcbiAgICAgICAgc3RvcCA9IGZhbHNlO1xyXG5cclxuICAgICAgICAvLyBkZXNjZW50LiBzY2FuIGZyb20gYm90dG9tIHRvIHRvcCB1bnRpbCB3ZSBmaW5kIGEgbm9uIHJlZCBwaXhlbFxyXG4gICAgICAgIGZvciAoaSA9IGhlaWdodDsgaSA+IGJhc2VsaW5lOyBpLS0pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBmb3IgKGogPSAwOyBqIDwgbGluZTsgaiArPSA0KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAoaW1hZ2VkYXRhW2lkeCArIGpdICE9PSAyNTUpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgc3RvcCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCFzdG9wKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZHggLT0gbGluZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcm9wZXJ0aWVzLmRlc2NlbnQgPSBpIC0gYmFzZWxpbmU7XHJcbiAgICAgICAgcHJvcGVydGllcy5mb250U2l6ZSA9IHByb3BlcnRpZXMuYXNjZW50ICsgcHJvcGVydGllcy5kZXNjZW50O1xyXG5cclxuICAgICAgICBUZXh0LmZvbnRQcm9wZXJ0aWVzQ2FjaGVbZm9udFN0eWxlXSA9IHByb3BlcnRpZXM7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHByb3BlcnRpZXM7XHJcbn07XHJcblxyXG4vKipcclxuICogQXBwbGllcyBuZXdsaW5lcyB0byBhIHN0cmluZyB0byBoYXZlIGl0IG9wdGltYWxseSBmaXQgaW50byB0aGUgaG9yaXpvbnRhbFxyXG4gKiBib3VuZHMgc2V0IGJ5IHRoZSBUZXh0IG9iamVjdCdzIHdvcmRXcmFwV2lkdGggcHJvcGVydHkuXHJcbiAqXHJcbiAqIEBwYXJhbSB0ZXh0IHtzdHJpbmd9XHJcbiAqIEBwcml2YXRlXHJcbiAqL1xyXG5UZXh0LnByb3RvdHlwZS53b3JkV3JhcCA9IGZ1bmN0aW9uICh0ZXh0KVxyXG57XHJcbiAgICAvLyBHcmVlZHkgd3JhcHBpbmcgYWxnb3JpdGhtIHRoYXQgd2lsbCB3cmFwIHdvcmRzIGFzIHRoZSBsaW5lIGdyb3dzIGxvbmdlclxyXG4gICAgLy8gdGhhbiBpdHMgaG9yaXpvbnRhbCBib3VuZHMuXHJcbiAgICB2YXIgcmVzdWx0ID0gJyc7XHJcbiAgICB2YXIgbGluZXMgPSB0ZXh0LnNwbGl0KCdcXG4nKTtcclxuICAgIHZhciB3b3JkV3JhcFdpZHRoID0gdGhpcy5fc3R5bGUud29yZFdyYXBXaWR0aDtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGluZXMubGVuZ3RoOyBpKyspXHJcbiAgICB7XHJcbiAgICAgICAgdmFyIHNwYWNlTGVmdCA9IHdvcmRXcmFwV2lkdGg7XHJcbiAgICAgICAgdmFyIHdvcmRzID0gbGluZXNbaV0uc3BsaXQoJyAnKTtcclxuICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHdvcmRzLmxlbmd0aDsgaisrKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdmFyIHdvcmRXaWR0aCA9IHRoaXMuY29udGV4dC5tZWFzdXJlVGV4dCh3b3Jkc1tqXSkud2lkdGg7XHJcbiAgICAgICAgICAgIHZhciB3b3JkV2lkdGhXaXRoU3BhY2UgPSB3b3JkV2lkdGggKyB0aGlzLmNvbnRleHQubWVhc3VyZVRleHQoJyAnKS53aWR0aDtcclxuICAgICAgICAgICAgaWYgKGogPT09IDAgfHwgd29yZFdpZHRoV2l0aFNwYWNlID4gc3BhY2VMZWZ0KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAvLyBTa2lwIHByaW50aW5nIHRoZSBuZXdsaW5lIGlmIGl0J3MgdGhlIGZpcnN0IHdvcmQgb2YgdGhlIGxpbmUgdGhhdCBpc1xyXG4gICAgICAgICAgICAgICAgLy8gZ3JlYXRlciB0aGFuIHRoZSB3b3JkIHdyYXAgd2lkdGguXHJcbiAgICAgICAgICAgICAgICBpZiAoaiA+IDApXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ICs9ICdcXG4nO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmVzdWx0ICs9IHdvcmRzW2pdO1xyXG4gICAgICAgICAgICAgICAgc3BhY2VMZWZ0ID0gd29yZFdyYXBXaWR0aCAtIHdvcmRXaWR0aDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHNwYWNlTGVmdCAtPSB3b3JkV2lkdGhXaXRoU3BhY2U7XHJcbiAgICAgICAgICAgICAgICByZXN1bHQgKz0gJyAnICsgd29yZHNbal07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChpIDwgbGluZXMubGVuZ3RoLTEpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICByZXN1bHQgKz0gJ1xcbic7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBSZXR1cm5zIHRoZSBib3VuZHMgb2YgdGhlIFRleHQgYXMgYSByZWN0YW5nbGUuIFRoZSBib3VuZHMgY2FsY3VsYXRpb24gdGFrZXMgdGhlIHdvcmxkVHJhbnNmb3JtIGludG8gYWNjb3VudC5cclxuICpcclxuICogQHBhcmFtIG1hdHJpeCB7UElYSS5NYXRyaXh9IHRoZSB0cmFuc2Zvcm1hdGlvbiBtYXRyaXggb2YgdGhlIFRleHRcclxuICogQHJldHVybiB7UElYSS5SZWN0YW5nbGV9IHRoZSBmcmFtaW5nIHJlY3RhbmdsZVxyXG4gKi9cclxuVGV4dC5wcm90b3R5cGUuZ2V0Qm91bmRzID0gZnVuY3Rpb24gKG1hdHJpeClcclxue1xyXG4gICAgaWYgKHRoaXMuZGlydHkpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy51cGRhdGVUZXh0KCk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIFNwcml0ZS5wcm90b3R5cGUuZ2V0Qm91bmRzLmNhbGwodGhpcywgbWF0cml4KTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBEZXN0cm95cyB0aGlzIHRleHQgb2JqZWN0LlxyXG4gKlxyXG4gKiBAcGFyYW0gW2Rlc3Ryb3lCYXNlVGV4dHVyZT10cnVlXSB7Ym9vbGVhbn0gd2hldGhlciB0byBkZXN0cm95IHRoZSBiYXNlIHRleHR1cmUgYXMgd2VsbFxyXG4gKi9cclxuVGV4dC5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uIChkZXN0cm95QmFzZVRleHR1cmUpXHJcbntcclxuICAgIC8vIG1ha2Ugc3VyZSB0byByZXNldCB0aGUgdGhlIGNvbnRleHQgYW5kIGNhbnZhcy4uIGRvbnQgd2FudCB0aGlzIGhhbmdpbmcgYXJvdW5kIGluIG1lbW9yeSFcclxuICAgIHRoaXMuY29udGV4dCA9IG51bGw7XHJcbiAgICB0aGlzLmNhbnZhcyA9IG51bGw7XHJcblxyXG4gICAgdGhpcy5fc3R5bGUgPSBudWxsO1xyXG5cclxuICAgIHRoaXMuX3RleHR1cmUuZGVzdHJveShkZXN0cm95QmFzZVRleHR1cmUgPT09IHVuZGVmaW5lZCA/IHRydWUgOiBkZXN0cm95QmFzZVRleHR1cmUpO1xyXG59O1xyXG4iLCJ2YXIgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscycpLFxyXG4gICAgQ09OU1QgPSByZXF1aXJlKCcuLi9jb25zdCcpLFxyXG4gICAgRXZlbnRFbWl0dGVyID0gcmVxdWlyZSgnZXZlbnRlbWl0dGVyMycpO1xyXG5cclxuLyoqXHJcbiAqIEEgdGV4dHVyZSBzdG9yZXMgdGhlIGluZm9ybWF0aW9uIHRoYXQgcmVwcmVzZW50cyBhbiBpbWFnZS4gQWxsIHRleHR1cmVzIGhhdmUgYSBiYXNlIHRleHR1cmUuXHJcbiAqXHJcbiAqIEBjbGFzc1xyXG4gKiBAbWVtYmVyb2YgUElYSVxyXG4gKiBAcGFyYW0gc291cmNlIHtJbWFnZXxDYW52YXN9IHRoZSBzb3VyY2Ugb2JqZWN0IG9mIHRoZSB0ZXh0dXJlLlxyXG4gKiBAcGFyYW0gW3NjYWxlTW9kZT1QSVhJLlNDQUxFX01PREVTLkRFRkFVTFRdIHtudW1iZXJ9IFNlZSB7QGxpbmsgUElYSS5TQ0FMRV9NT0RFU30gZm9yIHBvc3NpYmxlIHZhbHVlc1xyXG4gKiBAcGFyYW0gcmVzb2x1dGlvbiB7bnVtYmVyfSB0aGUgcmVzb2x1dGlvbiBvZiB0aGUgdGV4dHVyZSBmb3IgZGV2aWNlcyB3aXRoIGRpZmZlcmVudCBwaXhlbCByYXRpb3NcclxuICovXHJcbmZ1bmN0aW9uIEJhc2VUZXh0dXJlKHNvdXJjZSwgc2NhbGVNb2RlLCByZXNvbHV0aW9uKVxyXG57XHJcbiAgICBFdmVudEVtaXR0ZXIuY2FsbCh0aGlzKTtcclxuXHJcbiAgICB0aGlzLnVpZCA9IHV0aWxzLnVpZCgpO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogVGhlIFJlc29sdXRpb24gb2YgdGhlIHRleHR1cmUuXHJcbiAgICAgKlxyXG4gICAgICogQG1lbWJlciB7bnVtYmVyfVxyXG4gICAgICovXHJcbiAgICB0aGlzLnJlc29sdXRpb24gPSByZXNvbHV0aW9uIHx8IDE7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgd2lkdGggb2YgdGhlIGJhc2UgdGV4dHVyZSBzZXQgd2hlbiB0aGUgaW1hZ2UgaGFzIGxvYWRlZFxyXG4gICAgICpcclxuICAgICAqIEBtZW1iZXIge251bWJlcn1cclxuICAgICAqIEByZWFkT25seVxyXG4gICAgICovXHJcbiAgICB0aGlzLndpZHRoID0gMTAwO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogVGhlIGhlaWdodCBvZiB0aGUgYmFzZSB0ZXh0dXJlIHNldCB3aGVuIHRoZSBpbWFnZSBoYXMgbG9hZGVkXHJcbiAgICAgKlxyXG4gICAgICogQG1lbWJlciB7bnVtYmVyfVxyXG4gICAgICogQHJlYWRPbmx5XHJcbiAgICAgKi9cclxuICAgIHRoaXMuaGVpZ2h0ID0gMTAwO1xyXG5cclxuICAgIC8vIFRPRE8gZG9jc1xyXG4gICAgLy8gdXNlZCB0byBzdG9yZSB0aGUgYWN0dWFsIGRpbWVuc2lvbnMgb2YgdGhlIHNvdXJjZVxyXG4gICAgLyoqXHJcbiAgICAgKiBVc2VkIHRvIHN0b3JlIHRoZSBhY3R1YWwgd2lkdGggb2YgdGhlIHNvdXJjZSBvZiB0aGlzIHRleHR1cmVcclxuICAgICAqXHJcbiAgICAgKiBAbWVtYmVyIHtudW1iZXJ9XHJcbiAgICAgKiBAcmVhZE9ubHlcclxuICAgICAqL1xyXG4gICAgdGhpcy5yZWFsV2lkdGggPSAxMDA7XHJcbiAgICAvKipcclxuICAgICAqIFVzZWQgdG8gc3RvcmUgdGhlIGFjdHVhbCBoZWlnaHQgb2YgdGhlIHNvdXJjZSBvZiB0aGlzIHRleHR1cmVcclxuICAgICAqXHJcbiAgICAgKiBAbWVtYmVyIHtudW1iZXJ9XHJcbiAgICAgKiBAcmVhZE9ubHlcclxuICAgICAqL1xyXG4gICAgdGhpcy5yZWFsSGVpZ2h0ID0gMTAwO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogVGhlIHNjYWxlIG1vZGUgdG8gYXBwbHkgd2hlbiBzY2FsaW5nIHRoaXMgdGV4dHVyZVxyXG4gICAgICpcclxuICAgICAqIEBtZW1iZXIge251bWJlcn1cclxuICAgICAqIEBkZWZhdWx0IFBJWEkuU0NBTEVfTU9ERVMuTElORUFSXHJcbiAgICAgKiBAc2VlIFBJWEkuU0NBTEVfTU9ERVNcclxuICAgICAqL1xyXG4gICAgdGhpcy5zY2FsZU1vZGUgPSBzY2FsZU1vZGUgfHwgQ09OU1QuU0NBTEVfTU9ERVMuREVGQVVMVDtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFNldCB0byB0cnVlIG9uY2UgdGhlIGJhc2UgdGV4dHVyZSBoYXMgc3VjY2Vzc2Z1bGx5IGxvYWRlZC5cclxuICAgICAqXHJcbiAgICAgKiBUaGlzIGlzIG5ldmVyIHRydWUgaWYgdGhlIHVuZGVybHlpbmcgc291cmNlIGZhaWxzIHRvIGxvYWQgb3IgaGFzIG5vIHRleHR1cmUgZGF0YS5cclxuICAgICAqXHJcbiAgICAgKiBAbWVtYmVyIHtib29sZWFufVxyXG4gICAgICogQHJlYWRPbmx5XHJcbiAgICAgKi9cclxuICAgIHRoaXMuaGFzTG9hZGVkID0gZmFsc2U7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZXQgdG8gdHJ1ZSBpZiB0aGUgc291cmNlIGlzIGN1cnJlbnRseSBsb2FkaW5nLlxyXG4gICAgICpcclxuICAgICAqIElmIGFuIEltYWdlIHNvdXJjZSBpcyBsb2FkaW5nIHRoZSAnbG9hZGVkJyBvciAnZXJyb3InIGV2ZW50IHdpbGwgYmVcclxuICAgICAqIGRpc3BhdGNoZWQgd2hlbiB0aGUgb3BlcmF0aW9uIGVuZHMuIEFuIHVuZGVyeWxpbmcgc291cmNlIHRoYXQgaXNcclxuICAgICAqIGltbWVkaWF0ZWx5LWF2YWlsYWJsZSBieXBhc3NlcyBsb2FkaW5nIGVudGlyZWx5LlxyXG4gICAgICpcclxuICAgICAqIEBtZW1iZXIge2Jvb2xlYW59XHJcbiAgICAgKiBAcmVhZG9ubHlcclxuICAgICAqL1xyXG4gICAgdGhpcy5pc0xvYWRpbmcgPSBmYWxzZTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFRoZSBpbWFnZSBzb3VyY2UgdGhhdCBpcyB1c2VkIHRvIGNyZWF0ZSB0aGUgdGV4dHVyZS5cclxuICAgICAqXHJcbiAgICAgKiBUT0RPOiBNYWtlIHRoaXMgYSBzZXR0ZXIgdGhhdCBjYWxscyBsb2FkU291cmNlKCk7XHJcbiAgICAgKlxyXG4gICAgICogQG1lbWJlciB7SW1hZ2V8Q2FudmFzfVxyXG4gICAgICogQHJlYWRvbmx5XHJcbiAgICAgKi9cclxuICAgIHRoaXMuc291cmNlID0gbnVsbDsgLy8gc2V0IGluIGxvYWRTb3VyY2UsIGlmIGF0IGFsbFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ29udHJvbHMgaWYgUkdCIGNoYW5uZWxzIHNob3VsZCBiZSBwcmUtbXVsdGlwbGllZCBieSBBbHBoYSAgKFdlYkdMIG9ubHkpXHJcbiAgICAgKlxyXG4gICAgICogQG1lbWJlciB7Ym9vbGVhbn1cclxuICAgICAqIEBkZWZhdWx0IHRydWVcclxuICAgICAqL1xyXG4gICAgdGhpcy5wcmVtdWx0aXBsaWVkQWxwaGEgPSB0cnVlO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogQG1lbWJlciB7c3RyaW5nfVxyXG4gICAgICovXHJcbiAgICB0aGlzLmltYWdlVXJsID0gbnVsbDtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFdldGhlciBvciBub3QgdGhlIHRleHR1cmUgaXMgYSBwb3dlciBvZiB0d28sIHRyeSB0byB1c2UgcG93ZXIgb2YgdHdvIHRleHR1cmVzIGFzIG11Y2ggYXMgeW91IGNhblxyXG4gICAgICogQG1lbWJlciB7Ym9vbGVhbn1cclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIHRoaXMuaXNQb3dlck9mVHdvID0gZmFsc2U7XHJcblxyXG4gICAgLy8gdXNlZCBmb3Igd2ViR0xcclxuXHJcbiAgICAvKipcclxuICAgICAqXHJcbiAgICAgKiBTZXQgdGhpcyB0byB0cnVlIGlmIGEgbWlwbWFwIG9mIHRoaXMgdGV4dHVyZSBuZWVkcyB0byBiZSBnZW5lcmF0ZWQuIFRoaXMgdmFsdWUgbmVlZHMgdG8gYmUgc2V0IGJlZm9yZSB0aGUgdGV4dHVyZSBpcyB1c2VkXHJcbiAgICAgKiBBbHNvIHRoZSB0ZXh0dXJlIG11c3QgYmUgYSBwb3dlciBvZiB0d28gc2l6ZSB0byB3b3JrXHJcbiAgICAgKlxyXG4gICAgICogQG1lbWJlciB7Ym9vbGVhbn1cclxuICAgICAqL1xyXG4gICAgdGhpcy5taXBtYXAgPSBmYWxzZTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEEgbWFwIG9mIHJlbmRlcmVyIElEcyB0byB3ZWJnbCB0ZXh0dXJlc1xyXG4gICAgICpcclxuICAgICAqIEBtZW1iZXIge29iamVjdDxudW1iZXIsIFdlYkdMVGV4dHVyZT59XHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICB0aGlzLl9nbFRleHR1cmVzID0gW107XHJcblxyXG4gICAgLy8gaWYgbm8gc291cmNlIHBhc3NlZCBkb24ndCB0cnkgdG8gbG9hZFxyXG4gICAgaWYgKHNvdXJjZSlcclxuICAgIHtcclxuICAgICAgICB0aGlzLmxvYWRTb3VyY2Uoc291cmNlKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEZpcmVkIHdoZW4gYSBub3QtaW1tZWRpYXRlbHktYXZhaWxhYmxlIHNvdXJjZSBmaW5pc2hlcyBsb2FkaW5nLlxyXG4gICAgICpcclxuICAgICAqIEBldmVudCBsb2FkZWRcclxuICAgICAqIEBtZW1iZXJvZiBQSVhJLkJhc2VUZXh0dXJlI1xyXG4gICAgICogQHByb3RlY3RlZFxyXG4gICAgICovXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBGaXJlZCB3aGVuIGEgbm90LWltbWVkaWF0ZWx5LWF2YWlsYWJsZSBzb3VyY2UgZmFpbHMgdG8gbG9hZC5cclxuICAgICAqXHJcbiAgICAgKiBAZXZlbnQgZXJyb3JcclxuICAgICAqIEBtZW1iZXJvZiBQSVhJLkJhc2VUZXh0dXJlI1xyXG4gICAgICogQHByb3RlY3RlZFxyXG4gICAgICovXHJcbn1cclxuXHJcbkJhc2VUZXh0dXJlLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoRXZlbnRFbWl0dGVyLnByb3RvdHlwZSk7XHJcbkJhc2VUZXh0dXJlLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEJhc2VUZXh0dXJlO1xyXG5tb2R1bGUuZXhwb3J0cyA9IEJhc2VUZXh0dXJlO1xyXG5cclxuLyoqXHJcbiAqIFVwZGF0ZXMgdGhlIHRleHR1cmUgb24gYWxsIHRoZSB3ZWJnbCByZW5kZXJlcnMsIHRoaXMgYWxzbyBhc3N1bWVzIHRoZSBzcmMgaGFzIGNoYW5nZWQuXHJcbiAqXHJcbiAqIEBmaXJlcyB1cGRhdGVcclxuICovXHJcbkJhc2VUZXh0dXJlLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbiAoKVxyXG57XHJcbiAgICB0aGlzLnJlYWxXaWR0aCA9IHRoaXMuc291cmNlLm5hdHVyYWxXaWR0aCB8fCB0aGlzLnNvdXJjZS53aWR0aDtcclxuICAgIHRoaXMucmVhbEhlaWdodCA9IHRoaXMuc291cmNlLm5hdHVyYWxIZWlnaHQgfHwgdGhpcy5zb3VyY2UuaGVpZ2h0O1xyXG5cclxuICAgIHRoaXMud2lkdGggPSB0aGlzLnJlYWxXaWR0aCAvIHRoaXMucmVzb2x1dGlvbjtcclxuICAgIHRoaXMuaGVpZ2h0ID0gdGhpcy5yZWFsSGVpZ2h0IC8gdGhpcy5yZXNvbHV0aW9uO1xyXG5cclxuICAgIHRoaXMuaXNQb3dlck9mVHdvID0gdXRpbHMuaXNQb3dlck9mVHdvKHRoaXMucmVhbFdpZHRoLCB0aGlzLnJlYWxIZWlnaHQpO1xyXG5cclxuICAgIHRoaXMuZW1pdCgndXBkYXRlJywgdGhpcyk7XHJcbn07XHJcblxyXG4vKipcclxuICogTG9hZCBhIHNvdXJjZS5cclxuICpcclxuICogSWYgdGhlIHNvdXJjZSBpcyBub3QtaW1tZWRpYXRlbHktYXZhaWxhYmxlLCBzdWNoIGFzIGFuIGltYWdlIHRoYXQgbmVlZHMgdG8gYmVcclxuICogZG93bmxvYWRlZCwgdGhlbiB0aGUgJ2xvYWRlZCcgb3IgJ2Vycm9yJyBldmVudCB3aWxsIGJlIGRpc3BhdGNoZWQgaW4gdGhlIGZ1dHVyZVxyXG4gKiBhbmQgYGhhc0xvYWRlZGAgd2lsbCByZW1haW4gZmFsc2UgYWZ0ZXIgdGhpcyBjYWxsLlxyXG4gKlxyXG4gKiBUaGUgbG9naWMgc3RhdGUgYWZ0ZXIgY2FsbGluZyBgbG9hZFNvdXJjZWAgZGlyZWN0bHkgb3IgaW5kaXJlY3RseSAoZWcuIGBmcm9tSW1hZ2VgLCBgbmV3IEJhc2VUZXh0dXJlYCkgaXM6XHJcbiAqXHJcbiAqICAgICBpZiAodGV4dHVyZS5oYXNMb2FkZWQpXHJcbiB7XHJcbiAqICAgICAgICAvLyB0ZXh0dXJlIHJlYWR5IGZvciB1c2VcclxuICogICAgIH0gZWxzZSBpZiAodGV4dHVyZS5pc0xvYWRpbmcpXHJcbiB7XHJcbiAqICAgICAgICAvLyBsaXN0ZW4gdG8gJ2xvYWRlZCcgYW5kL29yICdlcnJvcicgZXZlbnRzIG9uIHRleHR1cmVcclxuICogICAgIH0gZWxzZSB7XHJcbiAqICAgICAgICAvLyBub3QgbG9hZGluZywgbm90IGdvaW5nIHRvIGxvYWQgVU5MRVNTIHRoZSBzb3VyY2UgaXMgcmVsb2FkZWRcclxuICogICAgICAgIC8vIChpdCBtYXkgc3RpbGwgbWFrZSBzZW5zZSB0byBsaXN0ZW4gdG8gdGhlIGV2ZW50cylcclxuICogICAgIH1cclxuICpcclxuICogQHByb3RlY3RlZFxyXG4gKiBAcGFyYW0gc291cmNlIHtJbWFnZXxDYW52YXN9IHRoZSBzb3VyY2Ugb2JqZWN0IG9mIHRoZSB0ZXh0dXJlLlxyXG4gKi9cclxuQmFzZVRleHR1cmUucHJvdG90eXBlLmxvYWRTb3VyY2UgPSBmdW5jdGlvbiAoc291cmNlKVxyXG57XHJcbiAgICB2YXIgd2FzTG9hZGluZyA9IHRoaXMuaXNMb2FkaW5nO1xyXG4gICAgdGhpcy5oYXNMb2FkZWQgPSBmYWxzZTtcclxuICAgIHRoaXMuaXNMb2FkaW5nID0gZmFsc2U7XHJcblxyXG4gICAgaWYgKHdhc0xvYWRpbmcgJiYgdGhpcy5zb3VyY2UpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5zb3VyY2Uub25sb2FkID0gbnVsbDtcclxuICAgICAgICB0aGlzLnNvdXJjZS5vbmVycm9yID0gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLnNvdXJjZSA9IHNvdXJjZTtcclxuXHJcbiAgICAvLyBBcHBseSBzb3VyY2UgaWYgbG9hZGVkLiBPdGhlcndpc2Ugc2V0dXAgYXBwcm9wcmlhdGUgbG9hZGluZyBtb25pdG9ycy5cclxuICAgIGlmICgodGhpcy5zb3VyY2UuY29tcGxldGUgfHwgdGhpcy5zb3VyY2UuZ2V0Q29udGV4dCkgJiYgdGhpcy5zb3VyY2Uud2lkdGggJiYgdGhpcy5zb3VyY2UuaGVpZ2h0KVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMuX3NvdXJjZUxvYWRlZCgpO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIXNvdXJjZS5nZXRDb250ZXh0KVxyXG4gICAge1xyXG5cclxuICAgICAgICAvLyBJbWFnZSBmYWlsIC8gbm90IHJlYWR5XHJcbiAgICAgICAgdGhpcy5pc0xvYWRpbmcgPSB0cnVlO1xyXG5cclxuICAgICAgICB2YXIgc2NvcGUgPSB0aGlzO1xyXG5cclxuICAgICAgICBzb3VyY2Uub25sb2FkID0gZnVuY3Rpb24gKClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHNvdXJjZS5vbmxvYWQgPSBudWxsO1xyXG4gICAgICAgICAgICBzb3VyY2Uub25lcnJvciA9IG51bGw7XHJcblxyXG4gICAgICAgICAgICBpZiAoIXNjb3BlLmlzTG9hZGluZylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBzY29wZS5pc0xvYWRpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgc2NvcGUuX3NvdXJjZUxvYWRlZCgpO1xyXG5cclxuICAgICAgICAgICAgc2NvcGUuZW1pdCgnbG9hZGVkJywgc2NvcGUpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHNvdXJjZS5vbmVycm9yID0gZnVuY3Rpb24gKClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHNvdXJjZS5vbmxvYWQgPSBudWxsO1xyXG4gICAgICAgICAgICBzb3VyY2Uub25lcnJvciA9IG51bGw7XHJcblxyXG4gICAgICAgICAgICBpZiAoIXNjb3BlLmlzTG9hZGluZylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBzY29wZS5pc0xvYWRpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgc2NvcGUuZW1pdCgnZXJyb3InLCBzY29wZSk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLy8gUGVyIGh0dHA6Ly93d3cudzMub3JnL1RSL2h0bWw1L2VtYmVkZGVkLWNvbnRlbnQtMC5odG1sI3RoZS1pbWctZWxlbWVudFxyXG4gICAgICAgIC8vICAgXCJUaGUgdmFsdWUgb2YgYGNvbXBsZXRlYCBjYW4gdGh1cyBjaGFuZ2Ugd2hpbGUgYSBzY3JpcHQgaXMgZXhlY3V0aW5nLlwiXHJcbiAgICAgICAgLy8gU28gY29tcGxldGUgbmVlZHMgdG8gYmUgcmUtY2hlY2tlZCBhZnRlciB0aGUgY2FsbGJhY2tzIGhhdmUgYmVlbiBhZGRlZC4uXHJcbiAgICAgICAgLy8gTk9URTogY29tcGxldGUgd2lsbCBiZSB0cnVlIGlmIHRoZSBpbWFnZSBoYXMgbm8gc3JjIHNvIGJlc3QgdG8gY2hlY2sgaWYgdGhlIHNyYyBpcyBzZXQuXHJcbiAgICAgICAgaWYgKHNvdXJjZS5jb21wbGV0ZSAmJiBzb3VyY2Uuc3JjKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5pc0xvYWRpbmcgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgICAgIC8vIC4uYW5kIGlmIHdlJ3JlIGNvbXBsZXRlIG5vdywgbm8gbmVlZCBmb3IgY2FsbGJhY2tzXHJcbiAgICAgICAgICAgIHNvdXJjZS5vbmxvYWQgPSBudWxsO1xyXG4gICAgICAgICAgICBzb3VyY2Uub25lcnJvciA9IG51bGw7XHJcblxyXG4gICAgICAgICAgICBpZiAoc291cmNlLndpZHRoICYmIHNvdXJjZS5oZWlnaHQpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3NvdXJjZUxvYWRlZCgpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIElmIGFueSBwcmV2aW91cyBzdWJzY3JpYmVycyBwb3NzaWJsZVxyXG4gICAgICAgICAgICAgICAgaWYgKHdhc0xvYWRpbmcpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5lbWl0KCdsb2FkZWQnLCB0aGlzKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIC8vIElmIGFueSBwcmV2aW91cyBzdWJzY3JpYmVycyBwb3NzaWJsZVxyXG4gICAgICAgICAgICAgICAgaWYgKHdhc0xvYWRpbmcpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5lbWl0KCdlcnJvcicsIHRoaXMpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuLyoqXHJcbiAqIFVzZWQgaW50ZXJuYWxseSB0byB1cGRhdGUgdGhlIHdpZHRoLCBoZWlnaHQsIGFuZCBzb21lIG90aGVyIHRyYWNraW5nIHZhcnMgb25jZVxyXG4gKiBhIHNvdXJjZSBoYXMgc3VjY2Vzc2Z1bGx5IGxvYWRlZC5cclxuICpcclxuICogQHByaXZhdGVcclxuICovXHJcbkJhc2VUZXh0dXJlLnByb3RvdHlwZS5fc291cmNlTG9hZGVkID0gZnVuY3Rpb24gKClcclxue1xyXG4gICAgdGhpcy5oYXNMb2FkZWQgPSB0cnVlO1xyXG4gICAgdGhpcy51cGRhdGUoKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBEZXN0cm95cyB0aGlzIGJhc2UgdGV4dHVyZVxyXG4gKlxyXG4gKi9cclxuQmFzZVRleHR1cmUucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbiAoKVxyXG57XHJcbiAgICBpZiAodGhpcy5pbWFnZVVybClcclxuICAgIHtcclxuICAgICAgICBkZWxldGUgdXRpbHMuQmFzZVRleHR1cmVDYWNoZVt0aGlzLmltYWdlVXJsXTtcclxuICAgICAgICBkZWxldGUgdXRpbHMuVGV4dHVyZUNhY2hlW3RoaXMuaW1hZ2VVcmxdO1xyXG5cclxuICAgICAgICB0aGlzLmltYWdlVXJsID0gbnVsbDtcclxuXHJcbiAgICAgICAgaWYgKCFuYXZpZ2F0b3IuaXNDb2Nvb25KUylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuc291cmNlLnNyYyA9ICcnO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGVsc2UgaWYgKHRoaXMuc291cmNlICYmIHRoaXMuc291cmNlLl9waXhpSWQpXHJcbiAgICB7XHJcbiAgICAgICAgZGVsZXRlIHV0aWxzLkJhc2VUZXh0dXJlQ2FjaGVbdGhpcy5zb3VyY2UuX3BpeGlJZF07XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5zb3VyY2UgPSBudWxsO1xyXG5cclxuICAgIHRoaXMuZGlzcG9zZSgpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZyZWVzIHRoZSB0ZXh0dXJlIGZyb20gV2ViR0wgbWVtb3J5IHdpdGhvdXQgZGVzdHJveWluZyB0aGlzIHRleHR1cmUgb2JqZWN0LlxyXG4gKiBUaGlzIG1lYW5zIHlvdSBjYW4gc3RpbGwgdXNlIHRoZSB0ZXh0dXJlIGxhdGVyIHdoaWNoIHdpbGwgdXBsb2FkIGl0IHRvIEdQVVxyXG4gKiBtZW1vcnkgYWdhaW4uXHJcbiAqXHJcbiAqL1xyXG5CYXNlVGV4dHVyZS5wcm90b3R5cGUuZGlzcG9zZSA9IGZ1bmN0aW9uICgpXHJcbntcclxuICAgIHRoaXMuZW1pdCgnZGlzcG9zZScsIHRoaXMpO1xyXG5cclxuICAgIHRoaXMuX2dsVGV4dHVyZXMubGVuZ3RoID0gMDtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBDaGFuZ2VzIHRoZSBzb3VyY2UgaW1hZ2Ugb2YgdGhlIHRleHR1cmUuXHJcbiAqIFRoZSBvcmlnaW5hbCBzb3VyY2UgbXVzdCBiZSBhbiBJbWFnZSBlbGVtZW50LlxyXG4gKlxyXG4gKiBAcGFyYW0gbmV3U3JjIHtzdHJpbmd9IHRoZSBwYXRoIG9mIHRoZSBpbWFnZVxyXG4gKi9cclxuQmFzZVRleHR1cmUucHJvdG90eXBlLnVwZGF0ZVNvdXJjZUltYWdlID0gZnVuY3Rpb24gKG5ld1NyYylcclxue1xyXG4gICAgdGhpcy5zb3VyY2Uuc3JjID0gbmV3U3JjO1xyXG5cclxuICAgIHRoaXMubG9hZFNvdXJjZSh0aGlzLnNvdXJjZSk7XHJcbn07XHJcblxyXG4vKipcclxuICogSGVscGVyIGZ1bmN0aW9uIHRoYXQgY3JlYXRlcyBhIGJhc2UgdGV4dHVyZSBmcm9tIHRoZSBnaXZlbiBpbWFnZSB1cmwuXHJcbiAqIElmIHRoZSBpbWFnZSBpcyBub3QgaW4gdGhlIGJhc2UgdGV4dHVyZSBjYWNoZSBpdCB3aWxsIGJlIGNyZWF0ZWQgYW5kIGxvYWRlZC5cclxuICpcclxuICogQHN0YXRpY1xyXG4gKiBAcGFyYW0gaW1hZ2VVcmwge3N0cmluZ30gVGhlIGltYWdlIHVybCBvZiB0aGUgdGV4dHVyZVxyXG4gKiBAcGFyYW0gW2Nyb3Nzb3JpZ2luPShhdXRvKV0ge2Jvb2xlYW59IFNob3VsZCB1c2UgYW5vbnltb3VzIENPUlM/IERlZmF1bHRzIHRvIHRydWUgaWYgdGhlIFVSTCBpcyBub3QgYSBkYXRhLVVSSS5cclxuICogQHBhcmFtIFtzY2FsZU1vZGU9UElYSS5TQ0FMRV9NT0RFUy5ERUZBVUxUXSB7bnVtYmVyfSBTZWUge0BsaW5rIFBJWEkuU0NBTEVfTU9ERVN9IGZvciBwb3NzaWJsZSB2YWx1ZXNcclxuICogQHJldHVybiBQSVhJLkJhc2VUZXh0dXJlXHJcbiAqL1xyXG5CYXNlVGV4dHVyZS5mcm9tSW1hZ2UgPSBmdW5jdGlvbiAoaW1hZ2VVcmwsIGNyb3Nzb3JpZ2luLCBzY2FsZU1vZGUpXHJcbntcclxuICAgIHZhciBiYXNlVGV4dHVyZSA9IHV0aWxzLkJhc2VUZXh0dXJlQ2FjaGVbaW1hZ2VVcmxdO1xyXG5cclxuICAgIGlmIChjcm9zc29yaWdpbiA9PT0gdW5kZWZpbmVkICYmIGltYWdlVXJsLmluZGV4T2YoJ2RhdGE6JykgIT09IDApXHJcbiAgICB7XHJcbiAgICAgICAgY3Jvc3NvcmlnaW4gPSB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICghYmFzZVRleHR1cmUpXHJcbiAgICB7XHJcbiAgICAgICAgLy8gbmV3IEltYWdlKCkgYnJlYWtzIHRleCBsb2FkaW5nIGluIHNvbWUgdmVyc2lvbnMgb2YgQ2hyb21lLlxyXG4gICAgICAgIC8vIFNlZSBodHRwczovL2NvZGUuZ29vZ2xlLmNvbS9wL2Nocm9taXVtL2lzc3Vlcy9kZXRhaWw/aWQ9MjM4MDcxXHJcbiAgICAgICAgdmFyIGltYWdlID0gbmV3IEltYWdlKCk7Ly9kb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbWcnKTtcclxuICAgICAgICBpZiAoY3Jvc3NvcmlnaW4pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpbWFnZS5jcm9zc09yaWdpbiA9ICcnO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgYmFzZVRleHR1cmUgPSBuZXcgQmFzZVRleHR1cmUoaW1hZ2UsIHNjYWxlTW9kZSk7XHJcbiAgICAgICAgYmFzZVRleHR1cmUuaW1hZ2VVcmwgPSBpbWFnZVVybDtcclxuXHJcbiAgICAgICAgaW1hZ2Uuc3JjID0gaW1hZ2VVcmw7XHJcblxyXG4gICAgICAgIHV0aWxzLkJhc2VUZXh0dXJlQ2FjaGVbaW1hZ2VVcmxdID0gYmFzZVRleHR1cmU7XHJcblxyXG4gICAgICAgIC8vIGlmIHRoZXJlIGlzIGFuIEAyeCBhdCB0aGUgZW5kIG9mIHRoZSB1cmwgd2UgYXJlIGdvaW5nIHRvIGFzc3VtZSBpdHMgYSBoaWdocmVzIGltYWdlXHJcbiAgICAgICAgYmFzZVRleHR1cmUucmVzb2x1dGlvbiA9IHV0aWxzLmdldFJlc29sdXRpb25PZlVybChpbWFnZVVybCk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGJhc2VUZXh0dXJlO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEhlbHBlciBmdW5jdGlvbiB0aGF0IGNyZWF0ZXMgYSBiYXNlIHRleHR1cmUgZnJvbSB0aGUgZ2l2ZW4gY2FudmFzIGVsZW1lbnQuXHJcbiAqXHJcbiAqIEBzdGF0aWNcclxuICogQHBhcmFtIGNhbnZhcyB7Q2FudmFzfSBUaGUgY2FudmFzIGVsZW1lbnQgc291cmNlIG9mIHRoZSB0ZXh0dXJlXHJcbiAqIEBwYXJhbSBzY2FsZU1vZGUge251bWJlcn0gU2VlIHtAbGluayBQSVhJLlNDQUxFX01PREVTfSBmb3IgcG9zc2libGUgdmFsdWVzXHJcbiAqIEByZXR1cm4gUElYSS5CYXNlVGV4dHVyZVxyXG4gKi9cclxuQmFzZVRleHR1cmUuZnJvbUNhbnZhcyA9IGZ1bmN0aW9uIChjYW52YXMsIHNjYWxlTW9kZSlcclxue1xyXG4gICAgaWYgKCFjYW52YXMuX3BpeGlJZClcclxuICAgIHtcclxuICAgICAgICBjYW52YXMuX3BpeGlJZCA9ICdjYW52YXNfJyArIHV0aWxzLnVpZCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBiYXNlVGV4dHVyZSA9IHV0aWxzLkJhc2VUZXh0dXJlQ2FjaGVbY2FudmFzLl9waXhpSWRdO1xyXG5cclxuICAgIGlmICghYmFzZVRleHR1cmUpXHJcbiAgICB7XHJcbiAgICAgICAgYmFzZVRleHR1cmUgPSBuZXcgQmFzZVRleHR1cmUoY2FudmFzLCBzY2FsZU1vZGUpO1xyXG4gICAgICAgIHV0aWxzLkJhc2VUZXh0dXJlQ2FjaGVbY2FudmFzLl9waXhpSWRdID0gYmFzZVRleHR1cmU7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGJhc2VUZXh0dXJlO1xyXG59O1xyXG4iLCJ2YXIgQmFzZVRleHR1cmUgPSByZXF1aXJlKCcuL0Jhc2VUZXh0dXJlJyksXHJcbiAgICBUZXh0dXJlID0gcmVxdWlyZSgnLi9UZXh0dXJlJyksXHJcbiAgICBSZW5kZXJUYXJnZXQgPSByZXF1aXJlKCcuLi9yZW5kZXJlcnMvd2ViZ2wvdXRpbHMvUmVuZGVyVGFyZ2V0JyksXHJcbiAgICBGaWx0ZXJNYW5hZ2VyID0gcmVxdWlyZSgnLi4vcmVuZGVyZXJzL3dlYmdsL21hbmFnZXJzL0ZpbHRlck1hbmFnZXInKSxcclxuICAgIENhbnZhc0J1ZmZlciA9IHJlcXVpcmUoJy4uL3JlbmRlcmVycy9jYW52YXMvdXRpbHMvQ2FudmFzQnVmZmVyJyksXHJcbiAgICBtYXRoID0gcmVxdWlyZSgnLi4vbWF0aCcpLFxyXG4gICAgQ09OU1QgPSByZXF1aXJlKCcuLi9jb25zdCcpLFxyXG4gICAgdGVtcE1hdHJpeCA9IG5ldyBtYXRoLk1hdHJpeCgpO1xyXG5cclxuLyoqXHJcbiAqIEEgUmVuZGVyVGV4dHVyZSBpcyBhIHNwZWNpYWwgdGV4dHVyZSB0aGF0IGFsbG93cyBhbnkgUGl4aSBkaXNwbGF5IG9iamVjdCB0byBiZSByZW5kZXJlZCB0byBpdC5cclxuICpcclxuICogX19IaW50X186IEFsbCBEaXNwbGF5T2JqZWN0cyAoaS5lLiBTcHJpdGVzKSB0aGF0IHJlbmRlciB0byBhIFJlbmRlclRleHR1cmUgc2hvdWxkIGJlIHByZWxvYWRlZFxyXG4gKiBvdGhlcndpc2UgYmxhY2sgcmVjdGFuZ2xlcyB3aWxsIGJlIGRyYXduIGluc3RlYWQuXHJcbiAqXHJcbiAqIEEgUmVuZGVyVGV4dHVyZSB0YWtlcyBhIHNuYXBzaG90IG9mIGFueSBEaXNwbGF5IE9iamVjdCBnaXZlbiB0byBpdHMgcmVuZGVyIG1ldGhvZC4gVGhlIHBvc2l0aW9uXHJcbiAqIGFuZCByb3RhdGlvbiBvZiB0aGUgZ2l2ZW4gRGlzcGxheSBPYmplY3RzIGlzIGlnbm9yZWQuIEZvciBleGFtcGxlOlxyXG4gKlxyXG4gKiBgYGBqc1xyXG4gKiB2YXIgcmVuZGVyZXIgPSBQSVhJLmF1dG9EZXRlY3RSZW5kZXJlcigxMDI0LCAxMDI0LCB7IHZpZXc6IGNhbnZhcywgcmF0aW86IDEgfSk7XHJcbiAqIHZhciByZW5kZXJUZXh0dXJlID0gbmV3IFBJWEkuUmVuZGVyVGV4dHVyZShyZW5kZXJlciwgODAwLCA2MDApO1xyXG4gKiB2YXIgc3ByaXRlID0gUElYSS5TcHJpdGUuZnJvbUltYWdlKFwic3Bpbk9ial8wMS5wbmdcIik7XHJcbiAqXHJcbiAqIHNwcml0ZS5wb3NpdGlvbi54ID0gODAwLzI7XHJcbiAqIHNwcml0ZS5wb3NpdGlvbi55ID0gNjAwLzI7XHJcbiAqIHNwcml0ZS5hbmNob3IueCA9IDAuNTtcclxuICogc3ByaXRlLmFuY2hvci55ID0gMC41O1xyXG4gKlxyXG4gKiByZW5kZXJUZXh0dXJlLnJlbmRlcihzcHJpdGUpO1xyXG4gKiBgYGBcclxuICpcclxuICogVGhlIFNwcml0ZSBpbiB0aGlzIGNhc2Ugd2lsbCBiZSByZW5kZXJlZCB0byBhIHBvc2l0aW9uIG9mIDAsMC4gVG8gcmVuZGVyIHRoaXMgc3ByaXRlIGF0IGl0cyBhY3R1YWxcclxuICogcG9zaXRpb24gYSBDb250YWluZXIgc2hvdWxkIGJlIHVzZWQ6XHJcbiAqXHJcbiAqIGBgYGpzXHJcbiAqIHZhciBkb2MgPSBuZXcgUElYSS5Db250YWluZXIoKTtcclxuICpcclxuICogZG9jLmFkZENoaWxkKHNwcml0ZSk7XHJcbiAqXHJcbiAqIHJlbmRlclRleHR1cmUucmVuZGVyKGRvYyk7ICAvLyBSZW5kZXJzIHRvIGNlbnRlciBvZiByZW5kZXJUZXh0dXJlXHJcbiAqIGBgYFxyXG4gKlxyXG4gKiBAY2xhc3NcclxuICogQGV4dGVuZHMgUElYSS5UZXh0dXJlXHJcbiAqIEBtZW1iZXJvZiBQSVhJXHJcbiAqIEBwYXJhbSByZW5kZXJlciB7UElYSS5DYW52YXNSZW5kZXJlcnxQSVhJLldlYkdMUmVuZGVyZXJ9IFRoZSByZW5kZXJlciB1c2VkIGZvciB0aGlzIFJlbmRlclRleHR1cmVcclxuICogQHBhcmFtIFt3aWR0aD0xMDBdIHtudW1iZXJ9IFRoZSB3aWR0aCBvZiB0aGUgcmVuZGVyIHRleHR1cmVcclxuICogQHBhcmFtIFtoZWlnaHQ9MTAwXSB7bnVtYmVyfSBUaGUgaGVpZ2h0IG9mIHRoZSByZW5kZXIgdGV4dHVyZVxyXG4gKiBAcGFyYW0gW3NjYWxlTW9kZV0ge251bWJlcn0gU2VlIHtAbGluayBQSVhJLlNDQUxFX01PREVTfSBmb3IgcG9zc2libGUgdmFsdWVzXHJcbiAqIEBwYXJhbSBbcmVzb2x1dGlvbj0xXSB7bnVtYmVyfSBUaGUgcmVzb2x1dGlvbiBvZiB0aGUgdGV4dHVyZSBiZWluZyBnZW5lcmF0ZWRcclxuICovXHJcbmZ1bmN0aW9uIFJlbmRlclRleHR1cmUocmVuZGVyZXIsIHdpZHRoLCBoZWlnaHQsIHNjYWxlTW9kZSwgcmVzb2x1dGlvbilcclxue1xyXG4gICAgaWYgKCFyZW5kZXJlcilcclxuICAgIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VuYWJsZSB0byBjcmVhdGUgUmVuZGVyVGV4dHVyZSwgeW91IG11c3QgcGFzcyBhIHJlbmRlcmVyIGludG8gdGhlIGNvbnN0cnVjdG9yLicpO1xyXG4gICAgfVxyXG5cclxuICAgIHdpZHRoID0gd2lkdGggfHwgMTAwO1xyXG4gICAgaGVpZ2h0ID0gaGVpZ2h0IHx8IDEwMDtcclxuICAgIHJlc29sdXRpb24gPSByZXNvbHV0aW9uIHx8IENPTlNULlJFU09MVVRJT047XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgYmFzZSB0ZXh0dXJlIG9iamVjdCB0aGF0IHRoaXMgdGV4dHVyZSB1c2VzXHJcbiAgICAgKlxyXG4gICAgICogQG1lbWJlciB7QmFzZVRleHR1cmV9XHJcbiAgICAgKi9cclxuICAgIHZhciBiYXNlVGV4dHVyZSA9IG5ldyBCYXNlVGV4dHVyZSgpO1xyXG4gICAgYmFzZVRleHR1cmUud2lkdGggPSB3aWR0aDtcclxuICAgIGJhc2VUZXh0dXJlLmhlaWdodCA9IGhlaWdodDtcclxuICAgIGJhc2VUZXh0dXJlLnJlc29sdXRpb24gPSByZXNvbHV0aW9uO1xyXG4gICAgYmFzZVRleHR1cmUuc2NhbGVNb2RlID0gc2NhbGVNb2RlIHx8IENPTlNULlNDQUxFX01PREVTLkRFRkFVTFQ7XHJcbiAgICBiYXNlVGV4dHVyZS5oYXNMb2FkZWQgPSB0cnVlO1xyXG5cclxuXHJcbiAgICBUZXh0dXJlLmNhbGwodGhpcyxcclxuICAgICAgICBiYXNlVGV4dHVyZSxcclxuICAgICAgICBuZXcgbWF0aC5SZWN0YW5nbGUoMCwgMCwgd2lkdGgsIGhlaWdodClcclxuICAgICk7XHJcblxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVGhlIHdpdGggb2YgdGhlIHJlbmRlciB0ZXh0dXJlXHJcbiAgICAgKlxyXG4gICAgICogQG1lbWJlciB7bnVtYmVyfVxyXG4gICAgICovXHJcbiAgICB0aGlzLndpZHRoID0gd2lkdGg7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgaGVpZ2h0IG9mIHRoZSByZW5kZXIgdGV4dHVyZVxyXG4gICAgICpcclxuICAgICAqIEBtZW1iZXIge251bWJlcn1cclxuICAgICAqL1xyXG4gICAgdGhpcy5oZWlnaHQgPSBoZWlnaHQ7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgUmVzb2x1dGlvbiBvZiB0aGUgdGV4dHVyZS5cclxuICAgICAqXHJcbiAgICAgKiBAbWVtYmVyIHtudW1iZXJ9XHJcbiAgICAgKi9cclxuICAgIHRoaXMucmVzb2x1dGlvbiA9IHJlc29sdXRpb247XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBEcmF3L3JlbmRlciB0aGUgZ2l2ZW4gRGlzcGxheU9iamVjdCBvbnRvIHRoZSB0ZXh0dXJlLlxyXG4gICAgICpcclxuICAgICAqIFRoZSBkaXNwbGF5T2JqZWN0IGFuZCBkZXNjZW5kZW50cyBhcmUgdHJhbnNmb3JtZWQgZHVyaW5nIHRoaXMgb3BlcmF0aW9uLlxyXG4gICAgICogSWYgYHVwZGF0ZVRyYW5zZm9ybWAgaXMgdHJ1ZSB0aGVuIHRoZSB0cmFuc2Zvcm1hdGlvbnMgd2lsbCBiZSByZXN0b3JlZCBiZWZvcmUgdGhlXHJcbiAgICAgKiBtZXRob2QgcmV0dXJucy4gT3RoZXJ3aXNlIGl0IGlzIHVwIHRvIHRoZSBjYWxsaW5nIGNvZGUgdG8gY29ycmVjdGx5IHVzZSBvciByZXNldFxyXG4gICAgICogdGhlIHRyYW5zZm9ybWVkIGRpc3BsYXkgb2JqZWN0cy5cclxuICAgICAqXHJcbiAgICAgKiBUaGUgZGlzcGxheSBvYmplY3QgaXMgYWx3YXlzIHJlbmRlcmVkIHdpdGggYSB3b3JsZEFscGhhIHZhbHVlIG9mIDEuXHJcbiAgICAgKlxyXG4gICAgICogQG1ldGhvZFxyXG4gICAgICogQHBhcmFtIGRpc3BsYXlPYmplY3Qge1BJWEkuRGlzcGxheU9iamVjdH0gVGhlIGRpc3BsYXkgb2JqZWN0IHRvIHJlbmRlciB0aGlzIHRleHR1cmUgb25cclxuICAgICAqIEBwYXJhbSBbbWF0cml4XSB7UElYSS5NYXRyaXh9IE9wdGlvbmFsIG1hdHJpeCB0byBhcHBseSB0byB0aGUgZGlzcGxheSBvYmplY3QgYmVmb3JlIHJlbmRlcmluZy5cclxuICAgICAqIEBwYXJhbSBbY2xlYXI9ZmFsc2VdIHtib29sZWFufSBJZiB0cnVlIHRoZSB0ZXh0dXJlIHdpbGwgYmUgY2xlYXJlZCBiZWZvcmUgdGhlIGRpc3BsYXlPYmplY3QgaXMgZHJhd25cclxuICAgICAqIEBwYXJhbSBbdXBkYXRlVHJhbnNmb3JtPXRydWVdIHtib29sZWFufSBJZiB0cnVlIHRoZSBkaXNwbGF5T2JqZWN0J3Mgd29ybGRUcmFuc2Zvcm0vd29ybGRBbHBoYSBhbmQgYWxsIGNoaWxkcmVuXHJcbiAgICAgKiAgdHJhbnNmb3JtYXRpb25zIHdpbGwgYmUgcmVzdG9yZWQuIE5vdCByZXN0b3JpbmcgdGhpcyBpbmZvcm1hdGlvbiB3aWxsIGJlIGEgbGl0dGxlIGZhc3Rlci5cclxuICAgICAqL1xyXG4gICAgdGhpcy5yZW5kZXIgPSBudWxsO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogVGhlIHJlbmRlcmVyIHRoaXMgUmVuZGVyVGV4dHVyZSB1c2VzLiBBIFJlbmRlclRleHR1cmUgY2FuIG9ubHkgYmVsb25nIHRvIG9uZSByZW5kZXJlciBhdCB0aGUgbW9tZW50IGlmIGl0cyB3ZWJHTC5cclxuICAgICAqXHJcbiAgICAgKiBAbWVtYmVyIHtQSVhJLkNhbnZhc1JlbmRlcmVyfFBJWEkuV2ViR0xSZW5kZXJlcn1cclxuICAgICAqL1xyXG4gICAgdGhpcy5yZW5kZXJlciA9IHJlbmRlcmVyO1xyXG5cclxuICAgIGlmICh0aGlzLnJlbmRlcmVyLnR5cGUgPT09IENPTlNULlJFTkRFUkVSX1RZUEUuV0VCR0wpXHJcbiAgICB7XHJcbiAgICAgICAgdmFyIGdsID0gdGhpcy5yZW5kZXJlci5nbDtcclxuXHJcbiAgICAgICAgdGhpcy50ZXh0dXJlQnVmZmVyID0gbmV3IFJlbmRlclRhcmdldChnbCwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQsIGJhc2VUZXh0dXJlLnNjYWxlTW9kZSwgdGhpcy5yZXNvbHV0aW9uKTsvLywgdGhpcy5iYXNlVGV4dHVyZS5zY2FsZU1vZGUpO1xyXG4gICAgICAgIHRoaXMuYmFzZVRleHR1cmUuX2dsVGV4dHVyZXNbZ2wuaWRdID0gIHRoaXMudGV4dHVyZUJ1ZmZlci50ZXh0dXJlO1xyXG5cclxuICAgICAgICAvL1RPRE8gcmVmYWN0b3IgZmlsdGVyIG1hbmFnZXIuLiBhcyByZWFsbHkgaXRzIG5vIGxvbmdlciBhIG1hbmFnZXIgaWYgd2UgdXNlIGl0IGhlcmUuLlxyXG4gICAgICAgIHRoaXMuZmlsdGVyTWFuYWdlciA9IG5ldyBGaWx0ZXJNYW5hZ2VyKHRoaXMucmVuZGVyZXIpO1xyXG4gICAgICAgIHRoaXMuZmlsdGVyTWFuYWdlci5vbkNvbnRleHRDaGFuZ2UoKTtcclxuICAgICAgICB0aGlzLmZpbHRlck1hbmFnZXIucmVzaXplKHdpZHRoLCBoZWlnaHQpO1xyXG4gICAgICAgIHRoaXMucmVuZGVyID0gdGhpcy5yZW5kZXJXZWJHTDtcclxuXHJcbiAgICAgICAgLy8gdGhlIGNyZWF0aW9uIG9mIGEgZmlsdGVyIG1hbmFnZXIgdW5iaW5kcyB0aGUgYnVmZmVycy4uXHJcbiAgICAgICAgdGhpcy5yZW5kZXJlci5jdXJyZW50UmVuZGVyZXIuc3RhcnQoKTtcclxuICAgICAgICB0aGlzLnJlbmRlcmVyLmN1cnJlbnRSZW5kZXJUYXJnZXQuYWN0aXZhdGUoKTtcclxuICAgIH1cclxuICAgIGVsc2VcclxuICAgIHtcclxuXHJcbiAgICAgICAgdGhpcy5yZW5kZXIgPSB0aGlzLnJlbmRlckNhbnZhcztcclxuICAgICAgICB0aGlzLnRleHR1cmVCdWZmZXIgPSBuZXcgQ2FudmFzQnVmZmVyKHRoaXMud2lkdGgqIHRoaXMucmVzb2x1dGlvbiwgdGhpcy5oZWlnaHQqIHRoaXMucmVzb2x1dGlvbik7XHJcbiAgICAgICAgdGhpcy5iYXNlVGV4dHVyZS5zb3VyY2UgPSB0aGlzLnRleHR1cmVCdWZmZXIuY2FudmFzO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQG1lbWJlciB7Ym9vbGVhbn1cclxuICAgICAqL1xyXG4gICAgdGhpcy52YWxpZCA9IHRydWU7XHJcblxyXG4gICAgdGhpcy5fdXBkYXRlVXZzKCk7XHJcbn1cclxuXHJcblJlbmRlclRleHR1cmUucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShUZXh0dXJlLnByb3RvdHlwZSk7XHJcblJlbmRlclRleHR1cmUucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gUmVuZGVyVGV4dHVyZTtcclxubW9kdWxlLmV4cG9ydHMgPSBSZW5kZXJUZXh0dXJlO1xyXG5cclxuLyoqXHJcbiAqIFJlc2l6ZXMgdGhlIFJlbmRlclRleHR1cmUuXHJcbiAqXHJcbiAqIEBwYXJhbSB3aWR0aCB7bnVtYmVyfSBUaGUgd2lkdGggdG8gcmVzaXplIHRvLlxyXG4gKiBAcGFyYW0gaGVpZ2h0IHtudW1iZXJ9IFRoZSBoZWlnaHQgdG8gcmVzaXplIHRvLlxyXG4gKiBAcGFyYW0gdXBkYXRlQmFzZSB7Ym9vbGVhbn0gU2hvdWxkIHRoZSBiYXNlVGV4dHVyZS53aWR0aCBhbmQgaGVpZ2h0IHZhbHVlcyBiZSByZXNpemVkIGFzIHdlbGw/XHJcbiAqL1xyXG5SZW5kZXJUZXh0dXJlLnByb3RvdHlwZS5yZXNpemUgPSBmdW5jdGlvbiAod2lkdGgsIGhlaWdodCwgdXBkYXRlQmFzZSlcclxue1xyXG4gICAgaWYgKHdpZHRoID09PSB0aGlzLndpZHRoICYmIGhlaWdodCA9PT0gdGhpcy5oZWlnaHQpXHJcbiAgICB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMudmFsaWQgPSAod2lkdGggPiAwICYmIGhlaWdodCA+IDApO1xyXG5cclxuICAgIHRoaXMud2lkdGggPSB0aGlzLl9mcmFtZS53aWR0aCA9IHRoaXMuY3JvcC53aWR0aCA9IHdpZHRoO1xyXG4gICAgdGhpcy5oZWlnaHQgPSAgdGhpcy5fZnJhbWUuaGVpZ2h0ID0gdGhpcy5jcm9wLmhlaWdodCA9IGhlaWdodDtcclxuXHJcbiAgICBpZiAodXBkYXRlQmFzZSlcclxuICAgIHtcclxuICAgICAgICB0aGlzLmJhc2VUZXh0dXJlLndpZHRoID0gdGhpcy53aWR0aDtcclxuICAgICAgICB0aGlzLmJhc2VUZXh0dXJlLmhlaWdodCA9IHRoaXMuaGVpZ2h0O1xyXG4gICAgfVxyXG5cclxuICAgIGlmICghdGhpcy52YWxpZClcclxuICAgIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy50ZXh0dXJlQnVmZmVyLnJlc2l6ZSh0aGlzLndpZHRoLCB0aGlzLmhlaWdodCk7XHJcblxyXG4gICAgaWYodGhpcy5maWx0ZXJNYW5hZ2VyKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMuZmlsdGVyTWFuYWdlci5yZXNpemUodGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuLyoqXHJcbiAqIENsZWFycyB0aGUgUmVuZGVyVGV4dHVyZS5cclxuICpcclxuICovXHJcblJlbmRlclRleHR1cmUucHJvdG90eXBlLmNsZWFyID0gZnVuY3Rpb24gKClcclxue1xyXG4gICAgaWYgKCF0aGlzLnZhbGlkKVxyXG4gICAge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBpZiAodGhpcy5yZW5kZXJlci50eXBlID09PSBDT05TVC5SRU5ERVJFUl9UWVBFLldFQkdMKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMucmVuZGVyZXIuZ2wuYmluZEZyYW1lYnVmZmVyKHRoaXMucmVuZGVyZXIuZ2wuRlJBTUVCVUZGRVIsIHRoaXMudGV4dHVyZUJ1ZmZlci5mcmFtZUJ1ZmZlcik7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy50ZXh0dXJlQnVmZmVyLmNsZWFyKCk7XHJcbn07XHJcblxyXG4vKipcclxuICogSW50ZXJuYWwgbWV0aG9kIGFzc2lnbmVkIHRvIHRoZSBgcmVuZGVyYCBwcm9wZXJ0eSBpZiB1c2luZyBhIENhbnZhc1JlbmRlcmVyLlxyXG4gKlxyXG4gKiBAcHJpdmF0ZVxyXG4gKiBAcGFyYW0gZGlzcGxheU9iamVjdCB7UElYSS5EaXNwbGF5T2JqZWN0fSBUaGUgZGlzcGxheSBvYmplY3QgdG8gcmVuZGVyIHRoaXMgdGV4dHVyZSBvblxyXG4gKiBAcGFyYW0gW21hdHJpeF0ge1BJWEkuTWF0cml4fSBPcHRpb25hbCBtYXRyaXggdG8gYXBwbHkgdG8gdGhlIGRpc3BsYXkgb2JqZWN0IGJlZm9yZSByZW5kZXJpbmcuXHJcbiAqIEBwYXJhbSBbY2xlYXI9ZmFsc2VdIHtib29sZWFufSBJZiB0cnVlIHRoZSB0ZXh0dXJlIHdpbGwgYmUgY2xlYXJlZCBiZWZvcmUgdGhlIGRpc3BsYXlPYmplY3QgaXMgZHJhd25cclxuICogQHBhcmFtIFt1cGRhdGVUcmFuc2Zvcm09dHJ1ZV0ge2Jvb2xlYW59IElmIHRydWUgdGhlIGRpc3BsYXlPYmplY3QncyB3b3JsZFRyYW5zZm9ybS93b3JsZEFscGhhIGFuZCBhbGwgY2hpbGRyZW5cclxuICogIHRyYW5zZm9ybWF0aW9ucyB3aWxsIGJlIHJlc3RvcmVkLiBOb3QgcmVzdG9yaW5nIHRoaXMgaW5mb3JtYXRpb24gd2lsbCBiZSBhIGxpdHRsZSBmYXN0ZXIuXHJcbiAqL1xyXG5SZW5kZXJUZXh0dXJlLnByb3RvdHlwZS5yZW5kZXJXZWJHTCA9IGZ1bmN0aW9uIChkaXNwbGF5T2JqZWN0LCBtYXRyaXgsIGNsZWFyLCB1cGRhdGVUcmFuc2Zvcm0pXHJcbntcclxuICAgIGlmICghdGhpcy52YWxpZClcclxuICAgIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG5cclxuICAgIHVwZGF0ZVRyYW5zZm9ybSA9ICh1cGRhdGVUcmFuc2Zvcm0gIT09IHVuZGVmaW5lZCkgPyB1cGRhdGVUcmFuc2Zvcm0gOiB0cnVlOy8vIXVwZGF0ZVRyYW5zZm9ybTtcclxuXHJcbiAgICB0aGlzLnRleHR1cmVCdWZmZXIudHJhbnNmb3JtID0gbWF0cml4O1xyXG5cclxuICAgIC8vVE9ETyBub3QgYSBmYW4gdGhhdCB0aGlzIGlzIGhlcmUuLi4gaXQgd2lsbCBtb3ZlIVxyXG4gICAgdGhpcy50ZXh0dXJlQnVmZmVyLmFjdGl2YXRlKCk7XHJcblxyXG4gICAgLy8gc2V0V29ybGQgQWxwaGEgdG8gZW5zdXJlIHRoYXQgdGhlIG9iamVjdCBpcyByZW5kZXJlciBhdCBmdWxsIG9wYWNpdHlcclxuICAgIGRpc3BsYXlPYmplY3Qud29ybGRBbHBoYSA9IDE7XHJcblxyXG4gICAgaWYgKHVwZGF0ZVRyYW5zZm9ybSlcclxuICAgIHtcclxuXHJcbiAgICAgICAgLy8gcmVzZXQgdGhlIG1hdHJpeCBvZiB0aGUgZGlzcGxhdHlPYmplY3QuLlxyXG4gICAgICAgIGRpc3BsYXlPYmplY3Qud29ybGRUcmFuc2Zvcm0uaWRlbnRpdHkoKTtcclxuXHJcbiAgICAgICAgZGlzcGxheU9iamVjdC5jdXJyZW50Qm91bmRzID0gbnVsbDtcclxuXHJcbiAgICAgICAgLy8gVGltZSB0byB1cGRhdGUgYWxsIHRoZSBjaGlsZHJlbiBvZiB0aGUgZGlzcGxheU9iamVjdCB3aXRoIHRoZSBuZXcgbWF0cml4Li5cclxuICAgICAgICB2YXIgY2hpbGRyZW4gPSBkaXNwbGF5T2JqZWN0LmNoaWxkcmVuO1xyXG4gICAgICAgIHZhciBpLCBqO1xyXG5cclxuICAgICAgICBmb3IgKGkgPSAwLCBqID0gY2hpbGRyZW4ubGVuZ3RoOyBpIDwgajsgKytpKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY2hpbGRyZW5baV0udXBkYXRlVHJhbnNmb3JtKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vVE9ETyByZW5hbWUgdGV4dHVyZUJ1ZmZlciB0byByZW5kZXJUYXJnZXQuLlxyXG4gICAgdmFyIHRlbXAgPSAgdGhpcy5yZW5kZXJlci5maWx0ZXJNYW5hZ2VyO1xyXG5cclxuICAgIHRoaXMucmVuZGVyZXIuZmlsdGVyTWFuYWdlciA9IHRoaXMuZmlsdGVyTWFuYWdlcjtcclxuICAgIHRoaXMucmVuZGVyZXIucmVuZGVyRGlzcGxheU9iamVjdChkaXNwbGF5T2JqZWN0LCB0aGlzLnRleHR1cmVCdWZmZXIsIGNsZWFyKTtcclxuXHJcbiAgICB0aGlzLnJlbmRlcmVyLmZpbHRlck1hbmFnZXIgPSB0ZW1wO1xyXG59O1xyXG5cclxuXHJcbi8qKlxyXG4gKiBJbnRlcm5hbCBtZXRob2QgYXNzaWduZWQgdG8gdGhlIGByZW5kZXJgIHByb3BlcnR5IGlmIHVzaW5nIGEgQ2FudmFzUmVuZGVyZXIuXHJcbiAqXHJcbiAqIEBwcml2YXRlXHJcbiAqIEBwYXJhbSBkaXNwbGF5T2JqZWN0IHtQSVhJLkRpc3BsYXlPYmplY3R9IFRoZSBkaXNwbGF5IG9iamVjdCB0byByZW5kZXIgdGhpcyB0ZXh0dXJlIG9uXHJcbiAqIEBwYXJhbSBbbWF0cml4XSB7UElYSS5NYXRyaXh9IE9wdGlvbmFsIG1hdHJpeCB0byBhcHBseSB0byB0aGUgZGlzcGxheSBvYmplY3QgYmVmb3JlIHJlbmRlcmluZy5cclxuICogQHBhcmFtIFtjbGVhcl0ge2Jvb2xlYW59IElmIHRydWUgdGhlIHRleHR1cmUgd2lsbCBiZSBjbGVhcmVkIGJlZm9yZSB0aGUgZGlzcGxheU9iamVjdCBpcyBkcmF3blxyXG4gKi9cclxuUmVuZGVyVGV4dHVyZS5wcm90b3R5cGUucmVuZGVyQ2FudmFzID0gZnVuY3Rpb24gKGRpc3BsYXlPYmplY3QsIG1hdHJpeCwgY2xlYXIsIHVwZGF0ZVRyYW5zZm9ybSlcclxue1xyXG4gICAgaWYgKCF0aGlzLnZhbGlkKVxyXG4gICAge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGVUcmFuc2Zvcm0gPSAhIXVwZGF0ZVRyYW5zZm9ybTtcclxuXHJcbiAgICB2YXIgd3QgPSB0ZW1wTWF0cml4O1xyXG5cclxuICAgIHd0LmlkZW50aXR5KCk7XHJcblxyXG4gICAgaWYgKG1hdHJpeClcclxuICAgIHtcclxuICAgICAgICB3dC5hcHBlbmQobWF0cml4KTtcclxuICAgIH1cclxuXHJcbiAgICBkaXNwbGF5T2JqZWN0LndvcmxkVHJhbnNmb3JtID0gd3Q7XHJcbiAgICB2YXIgY2FjaGVkV3QgPSBkaXNwbGF5T2JqZWN0LndvcmxkVHJhbnNmb3JtO1xyXG5cclxuICAgIC8vIHNldFdvcmxkIEFscGhhIHRvIGVuc3VyZSB0aGF0IHRoZSBvYmplY3QgaXMgcmVuZGVyZXIgYXQgZnVsbCBvcGFjaXR5XHJcbiAgICBkaXNwbGF5T2JqZWN0LndvcmxkQWxwaGEgPSAxO1xyXG5cclxuICAgIC8vIFRpbWUgdG8gdXBkYXRlIGFsbCB0aGUgY2hpbGRyZW4gb2YgdGhlIGRpc3BsYXlPYmplY3Qgd2l0aCB0aGUgbmV3IG1hdHJpeC4uXHJcbiAgICB2YXIgY2hpbGRyZW4gPSBkaXNwbGF5T2JqZWN0LmNoaWxkcmVuO1xyXG4gICAgdmFyIGksIGo7XHJcblxyXG4gICAgZm9yIChpID0gMCwgaiA9IGNoaWxkcmVuLmxlbmd0aDsgaSA8IGo7ICsraSlcclxuICAgIHtcclxuICAgICAgICBjaGlsZHJlbltpXS51cGRhdGVUcmFuc2Zvcm0oKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoY2xlYXIpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy50ZXh0dXJlQnVmZmVyLmNsZWFyKCk7XHJcbiAgICB9XHJcblxyXG4gICBcclxuLy8gICAgdGhpcy50ZXh0dXJlQnVmZmVyLlxyXG4gICAgdmFyIGNvbnRleHQgPSB0aGlzLnRleHR1cmVCdWZmZXIuY29udGV4dDtcclxuXHJcbiAgICB2YXIgcmVhbFJlc29sdXRpb24gPSB0aGlzLnJlbmRlcmVyLnJlc29sdXRpb247XHJcblxyXG4gICAgdGhpcy5yZW5kZXJlci5yZXNvbHV0aW9uID0gdGhpcy5yZXNvbHV0aW9uO1xyXG5cclxuICAgIHRoaXMucmVuZGVyZXIucmVuZGVyRGlzcGxheU9iamVjdChkaXNwbGF5T2JqZWN0LCBjb250ZXh0KTtcclxuXHJcbiAgICB0aGlzLnJlbmRlcmVyLnJlc29sdXRpb24gPSByZWFsUmVzb2x1dGlvbjtcclxuXHJcbiAgICAgZGlzcGxheU9iamVjdC53b3JsZFRyYW5zZm9ybSA9IGNhY2hlZFd0O1xyXG5cclxuIC8vICAgY29udGV4dC5zZXRUcmFuc2Zvcm0oMSwgMCwgMCwgMSwgMCwgMCk7XHJcbiAgIC8vIGNvbnRleHQuZmlsbFN0eWxlID1cIiNGRjAwMDBcIlxyXG4vLyAgICBjb250ZXh0LmZpbGxSZWN0KDAsIDAsIDgwMCwgNjAwKTtcclxuXHJcbn07XHJcblxyXG4vKipcclxuICogRGVzdHJveXMgdGhpcyB0ZXh0dXJlXHJcbiAqXHJcbiAqIEBwYXJhbSBkZXN0cm95QmFzZSB7Ym9vbGVhbn0gV2hldGhlciB0byBkZXN0cm95IHRoZSBiYXNlIHRleHR1cmUgYXMgd2VsbFxyXG4gKi9cclxuUmVuZGVyVGV4dHVyZS5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uICgpXHJcbntcclxuICAgIFRleHR1cmUucHJvdG90eXBlLmRlc3Ryb3kuY2FsbCh0aGlzLCB0cnVlKTtcclxuXHJcbiAgICB0aGlzLnRleHR1cmVCdWZmZXIuZGVzdHJveSgpO1xyXG5cclxuICAgIC8vIGRlc3Ryb3kgdGhlIGZpbHRlcm1hbmFnZXIuLlxyXG4gICAgaWYodGhpcy5maWx0ZXJNYW5hZ2VyKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMuZmlsdGVyTWFuYWdlci5kZXN0cm95KCk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5yZW5kZXJlciA9IG51bGw7XHJcbn07XHJcblxyXG4vKipcclxuICogV2lsbCByZXR1cm4gYSBIVE1MIEltYWdlIG9mIHRoZSB0ZXh0dXJlXHJcbiAqXHJcbiAqIEByZXR1cm4ge0ltYWdlfVxyXG4gKi9cclxuUmVuZGVyVGV4dHVyZS5wcm90b3R5cGUuZ2V0SW1hZ2UgPSBmdW5jdGlvbiAoKVxyXG57XHJcbiAgICB2YXIgaW1hZ2UgPSBuZXcgSW1hZ2UoKTtcclxuICAgIGltYWdlLnNyYyA9IHRoaXMuZ2V0QmFzZTY0KCk7XHJcbiAgICByZXR1cm4gaW1hZ2U7XHJcbn07XHJcblxyXG4vKipcclxuICogV2lsbCByZXR1cm4gYSBhIGJhc2U2NCBlbmNvZGVkIHN0cmluZyBvZiB0aGlzIHRleHR1cmUuIEl0IHdvcmtzIGJ5IGNhbGxpbmcgUmVuZGVyVGV4dHVyZS5nZXRDYW52YXMgYW5kIHRoZW4gcnVubmluZyB0b0RhdGFVUkwgb24gdGhhdC5cclxuICpcclxuICogQHJldHVybiB7c3RyaW5nfSBBIGJhc2U2NCBlbmNvZGVkIHN0cmluZyBvZiB0aGUgdGV4dHVyZS5cclxuICovXHJcblJlbmRlclRleHR1cmUucHJvdG90eXBlLmdldEJhc2U2NCA9IGZ1bmN0aW9uICgpXHJcbntcclxuICAgIHJldHVybiB0aGlzLmdldENhbnZhcygpLnRvRGF0YVVSTCgpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIENyZWF0ZXMgYSBDYW52YXMgZWxlbWVudCwgcmVuZGVycyB0aGlzIFJlbmRlclRleHR1cmUgdG8gaXQgYW5kIHRoZW4gcmV0dXJucyBpdC5cclxuICpcclxuICogQHJldHVybiB7SFRNTENhbnZhc0VsZW1lbnR9IEEgQ2FudmFzIGVsZW1lbnQgd2l0aCB0aGUgdGV4dHVyZSByZW5kZXJlZCBvbi5cclxuICovXHJcblJlbmRlclRleHR1cmUucHJvdG90eXBlLmdldENhbnZhcyA9IGZ1bmN0aW9uICgpXHJcbntcclxuICAgIGlmICh0aGlzLnJlbmRlcmVyLnR5cGUgPT09IENPTlNULlJFTkRFUkVSX1RZUEUuV0VCR0wpXHJcbiAgICB7XHJcbiAgICAgICAgdmFyIGdsID0gdGhpcy5yZW5kZXJlci5nbDtcclxuICAgICAgICB2YXIgd2lkdGggPSB0aGlzLnRleHR1cmVCdWZmZXIuc2l6ZS53aWR0aDtcclxuICAgICAgICB2YXIgaGVpZ2h0ID0gdGhpcy50ZXh0dXJlQnVmZmVyLnNpemUuaGVpZ2h0O1xyXG5cclxuICAgICAgICB2YXIgd2ViR0xQaXhlbHMgPSBuZXcgVWludDhBcnJheSg0ICogd2lkdGggKiBoZWlnaHQpO1xyXG5cclxuICAgICAgICBnbC5iaW5kRnJhbWVidWZmZXIoZ2wuRlJBTUVCVUZGRVIsIHRoaXMudGV4dHVyZUJ1ZmZlci5mcmFtZUJ1ZmZlcik7XHJcbiAgICAgICAgZ2wucmVhZFBpeGVscygwLCAwLCB3aWR0aCwgaGVpZ2h0LCBnbC5SR0JBLCBnbC5VTlNJR05FRF9CWVRFLCB3ZWJHTFBpeGVscyk7XHJcbiAgICAgICAgZ2wuYmluZEZyYW1lYnVmZmVyKGdsLkZSQU1FQlVGRkVSLCBudWxsKTtcclxuXHJcbiAgICAgICAgdmFyIHRlbXBDYW52YXMgPSBuZXcgQ2FudmFzQnVmZmVyKHdpZHRoLCBoZWlnaHQpO1xyXG4gICAgICAgIHZhciBjYW52YXNEYXRhID0gdGVtcENhbnZhcy5jb250ZXh0LmdldEltYWdlRGF0YSgwLCAwLCB3aWR0aCwgaGVpZ2h0KTtcclxuICAgICAgICBjYW52YXNEYXRhLmRhdGEuc2V0KHdlYkdMUGl4ZWxzKTtcclxuXHJcbiAgICAgICAgdGVtcENhbnZhcy5jb250ZXh0LnB1dEltYWdlRGF0YShjYW52YXNEYXRhLCAwLCAwKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHRlbXBDYW52YXMuY2FudmFzO1xyXG4gICAgfVxyXG4gICAgZWxzZVxyXG4gICAge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnRleHR1cmVCdWZmZXIuY2FudmFzO1xyXG4gICAgfVxyXG59O1xyXG5cclxuLyoqXHJcbiAqIFdpbGwgcmV0dXJuIGEgb25lLWRpbWVuc2lvbmFsIGFycmF5IGNvbnRhaW5pbmcgdGhlIHBpeGVsIGRhdGEgb2YgdGhlIGVudGlyZSB0ZXh0dXJlIGluIFJHQkEgb3JkZXIsIHdpdGggaW50ZWdlciB2YWx1ZXMgYmV0d2VlbiAwIGFuZCAyNTUgKGluY2x1ZGVkKS5cclxuICpcclxuICogQHJldHVybiB7VWludDhDbGFtcGVkQXJyYXl9XHJcbiAqL1xyXG5SZW5kZXJUZXh0dXJlLnByb3RvdHlwZS5nZXRQaXhlbHMgPSBmdW5jdGlvbiAoKVxyXG57XHJcbiAgICB2YXIgd2lkdGgsIGhlaWdodDtcclxuXHJcbiAgICBpZiAodGhpcy5yZW5kZXJlci50eXBlID09PSBDT05TVC5SRU5ERVJFUl9UWVBFLldFQkdMKVxyXG4gICAge1xyXG4gICAgICAgIHZhciBnbCA9IHRoaXMucmVuZGVyZXIuZ2w7XHJcbiAgICAgICAgd2lkdGggPSB0aGlzLnRleHR1cmVCdWZmZXIuc2l6ZS53aWR0aDtcclxuICAgICAgICBoZWlnaHQgPSB0aGlzLnRleHR1cmVCdWZmZXIuc2l6ZS5oZWlnaHQ7XHJcblxyXG4gICAgICAgIHZhciB3ZWJHTFBpeGVscyA9IG5ldyBVaW50OEFycmF5KDQgKiB3aWR0aCAqIGhlaWdodCk7XHJcblxyXG4gICAgICAgIGdsLmJpbmRGcmFtZWJ1ZmZlcihnbC5GUkFNRUJVRkZFUiwgdGhpcy50ZXh0dXJlQnVmZmVyLmZyYW1lQnVmZmVyKTtcclxuICAgICAgICBnbC5yZWFkUGl4ZWxzKDAsIDAsIHdpZHRoLCBoZWlnaHQsIGdsLlJHQkEsIGdsLlVOU0lHTkVEX0JZVEUsIHdlYkdMUGl4ZWxzKTtcclxuICAgICAgICBnbC5iaW5kRnJhbWVidWZmZXIoZ2wuRlJBTUVCVUZGRVIsIG51bGwpO1xyXG5cclxuICAgICAgICByZXR1cm4gd2ViR0xQaXhlbHM7XHJcbiAgICB9XHJcbiAgICBlbHNlXHJcbiAgICB7XHJcbiAgICAgICAgd2lkdGggPSB0aGlzLnRleHR1cmVCdWZmZXIuY2FudmFzLndpZHRoO1xyXG4gICAgICAgIGhlaWdodCA9IHRoaXMudGV4dHVyZUJ1ZmZlci5jYW52YXMuaGVpZ2h0O1xyXG5cclxuICAgICAgICByZXR1cm4gdGhpcy50ZXh0dXJlQnVmZmVyLmNhbnZhcy5nZXRDb250ZXh0KCcyZCcpLmdldEltYWdlRGF0YSgwLCAwLCB3aWR0aCwgaGVpZ2h0KS5kYXRhO1xyXG4gICAgfVxyXG59O1xyXG5cclxuLyoqXHJcbiAqIFdpbGwgcmV0dXJuIGEgb25lLWRpbWVuc2lvbmFsIGFycmF5IGNvbnRhaW5pbmcgdGhlIHBpeGVsIGRhdGEgb2YgYSBwaXhlbCB3aXRoaW4gdGhlIHRleHR1cmUgaW4gUkdCQSBvcmRlciwgd2l0aCBpbnRlZ2VyIHZhbHVlcyBiZXR3ZWVuIDAgYW5kIDI1NSAoaW5jbHVkZWQpLlxyXG4gKlxyXG4gKiBAcGFyYW0geCB7bnVtYmVyfSBUaGUgeCBjb29yZGluYXRlIG9mIHRoZSBwaXhlbCB0byByZXRyaWV2ZS5cclxuICogQHBhcmFtIHkge251bWJlcn0gVGhlIHkgY29vcmRpbmF0ZSBvZiB0aGUgcGl4ZWwgdG8gcmV0cmlldmUuXHJcbiAqIEByZXR1cm4ge1VpbnQ4Q2xhbXBlZEFycmF5fVxyXG4gKi9cclxuUmVuZGVyVGV4dHVyZS5wcm90b3R5cGUuZ2V0UGl4ZWwgPSBmdW5jdGlvbiAoeCwgeSlcclxue1xyXG4gICAgaWYgKHRoaXMucmVuZGVyZXIudHlwZSA9PT0gQ09OU1QuUkVOREVSRVJfVFlQRS5XRUJHTClcclxuICAgIHtcclxuICAgICAgICB2YXIgZ2wgPSB0aGlzLnJlbmRlcmVyLmdsO1xyXG5cclxuICAgICAgICB2YXIgd2ViR0xQaXhlbHMgPSBuZXcgVWludDhBcnJheSg0KTtcclxuXHJcbiAgICAgICAgZ2wuYmluZEZyYW1lYnVmZmVyKGdsLkZSQU1FQlVGRkVSLCB0aGlzLnRleHR1cmVCdWZmZXIuZnJhbWVCdWZmZXIpO1xyXG4gICAgICAgIGdsLnJlYWRQaXhlbHMoeCwgeSwgMSwgMSwgZ2wuUkdCQSwgZ2wuVU5TSUdORURfQllURSwgd2ViR0xQaXhlbHMpO1xyXG4gICAgICAgIGdsLmJpbmRGcmFtZWJ1ZmZlcihnbC5GUkFNRUJVRkZFUiwgbnVsbCk7XHJcblxyXG4gICAgICAgIHJldHVybiB3ZWJHTFBpeGVscztcclxuICAgIH1cclxuICAgIGVsc2VcclxuICAgIHtcclxuICAgICAgICByZXR1cm4gdGhpcy50ZXh0dXJlQnVmZmVyLmNhbnZhcy5nZXRDb250ZXh0KCcyZCcpLmdldEltYWdlRGF0YSh4LCB5LCAxLCAxKS5kYXRhO1xyXG4gICAgfVxyXG59O1xyXG4iLCJ2YXIgQmFzZVRleHR1cmUgPSByZXF1aXJlKCcuL0Jhc2VUZXh0dXJlJyksXHJcbiAgICBWaWRlb0Jhc2VUZXh0dXJlID0gcmVxdWlyZSgnLi9WaWRlb0Jhc2VUZXh0dXJlJyksXHJcbiAgICBUZXh0dXJlVXZzID0gcmVxdWlyZSgnLi9UZXh0dXJlVXZzJyksXHJcbiAgICBFdmVudEVtaXR0ZXIgPSByZXF1aXJlKCdldmVudGVtaXR0ZXIzJyksXHJcbiAgICBtYXRoID0gcmVxdWlyZSgnLi4vbWF0aCcpLFxyXG4gICAgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscycpO1xyXG5cclxuLyoqXHJcbiAqIEEgdGV4dHVyZSBzdG9yZXMgdGhlIGluZm9ybWF0aW9uIHRoYXQgcmVwcmVzZW50cyBhbiBpbWFnZSBvciBwYXJ0IG9mIGFuIGltYWdlLiBJdCBjYW5ub3QgYmUgYWRkZWRcclxuICogdG8gdGhlIGRpc3BsYXkgbGlzdCBkaXJlY3RseS4gSW5zdGVhZCB1c2UgaXQgYXMgdGhlIHRleHR1cmUgZm9yIGEgU3ByaXRlLiBJZiBubyBmcmFtZSBpcyBwcm92aWRlZCB0aGVuIHRoZSB3aG9sZSBpbWFnZSBpcyB1c2VkLlxyXG4gKlxyXG4gKiBZb3UgY2FuIGRpcmVjdGx5IGNyZWF0ZSBhIHRleHR1cmUgZnJvbSBhbiBpbWFnZSBhbmQgdGhlbiByZXVzZSBpdCBtdWx0aXBsZSB0aW1lcyBsaWtlIHRoaXMgOlxyXG4gKlxyXG4gKiBgYGBqc1xyXG4gKiB2YXIgdGV4dHVyZSA9IFBJWEkuVGV4dHVyZS5mcm9tSW1hZ2UoJ2Fzc2V0cy9pbWFnZS5wbmcnKTtcclxuICogdmFyIHNwcml0ZTEgPSBuZXcgUElYSS5TcHJpdGUodGV4dHVyZSk7XHJcbiAqIHZhciBzcHJpdGUyID0gbmV3IFBJWEkuU3ByaXRlKHRleHR1cmUpO1xyXG4gKiBgYGBcclxuICpcclxuICogQGNsYXNzXHJcbiAqIEBtZW1iZXJvZiBQSVhJXHJcbiAqIEBwYXJhbSBiYXNlVGV4dHVyZSB7UElYSS5CYXNlVGV4dHVyZX0gVGhlIGJhc2UgdGV4dHVyZSBzb3VyY2UgdG8gY3JlYXRlIHRoZSB0ZXh0dXJlIGZyb21cclxuICogQHBhcmFtIFtmcmFtZV0ge1BJWEkuUmVjdGFuZ2xlfSBUaGUgcmVjdGFuZ2xlIGZyYW1lIG9mIHRoZSB0ZXh0dXJlIHRvIHNob3dcclxuICogQHBhcmFtIFtjcm9wXSB7UElYSS5SZWN0YW5nbGV9IFRoZSBhcmVhIG9mIG9yaWdpbmFsIHRleHR1cmVcclxuICogQHBhcmFtIFt0cmltXSB7UElYSS5SZWN0YW5nbGV9IFRyaW1tZWQgdGV4dHVyZSByZWN0YW5nbGVcclxuICogQHBhcmFtIFtyb3RhdGVdIHtib29sZWFufSBpbmRpY2F0ZXMgd2hldGhlciB0aGUgdGV4dHVyZSBzaG91bGQgYmUgcm90YXRlZCBieSA5MCBkZWdyZWVzICggdXNlZCBieSB0ZXh0dXJlIHBhY2tlciApXHJcbiAqL1xyXG5mdW5jdGlvbiBUZXh0dXJlKGJhc2VUZXh0dXJlLCBmcmFtZSwgY3JvcCwgdHJpbSwgcm90YXRlKVxyXG57XHJcbiAgICBFdmVudEVtaXR0ZXIuY2FsbCh0aGlzKTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIERvZXMgdGhpcyBUZXh0dXJlIGhhdmUgYW55IGZyYW1lIGRhdGEgYXNzaWduZWQgdG8gaXQ/XHJcbiAgICAgKlxyXG4gICAgICogQG1lbWJlciB7Ym9vbGVhbn1cclxuICAgICAqL1xyXG4gICAgdGhpcy5ub0ZyYW1lID0gZmFsc2U7XHJcblxyXG4gICAgaWYgKCFmcmFtZSlcclxuICAgIHtcclxuICAgICAgICB0aGlzLm5vRnJhbWUgPSB0cnVlO1xyXG4gICAgICAgIGZyYW1lID0gbmV3IG1hdGguUmVjdGFuZ2xlKDAsIDAsIDEsIDEpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChiYXNlVGV4dHVyZSBpbnN0YW5jZW9mIFRleHR1cmUpXHJcbiAgICB7XHJcbiAgICAgICAgYmFzZVRleHR1cmUgPSBiYXNlVGV4dHVyZS5iYXNlVGV4dHVyZTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFRoZSBiYXNlIHRleHR1cmUgdGhhdCB0aGlzIHRleHR1cmUgdXNlcy5cclxuICAgICAqXHJcbiAgICAgKiBAbWVtYmVyIHtQSVhJLkJhc2VUZXh0dXJlfVxyXG4gICAgICovXHJcbiAgICB0aGlzLmJhc2VUZXh0dXJlID0gYmFzZVRleHR1cmU7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgZnJhbWUgc3BlY2lmaWVzIHRoZSByZWdpb24gb2YgdGhlIGJhc2UgdGV4dHVyZSB0aGF0IHRoaXMgdGV4dHVyZSB1c2VzXHJcbiAgICAgKlxyXG4gICAgICogQG1lbWJlciB7UElYSS5SZWN0YW5nbGV9XHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICB0aGlzLl9mcmFtZSA9IGZyYW1lO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogVGhlIHRleHR1cmUgdHJpbSBkYXRhLlxyXG4gICAgICpcclxuICAgICAqIEBtZW1iZXIge1BJWEkuUmVjdGFuZ2xlfVxyXG4gICAgICovXHJcbiAgICB0aGlzLnRyaW0gPSB0cmltO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogVGhpcyB3aWxsIGxldCB0aGUgcmVuZGVyZXIga25vdyBpZiB0aGUgdGV4dHVyZSBpcyB2YWxpZC4gSWYgaXQncyBub3QgdGhlbiBpdCBjYW5ub3QgYmUgcmVuZGVyZWQuXHJcbiAgICAgKlxyXG4gICAgICogQG1lbWJlciB7Ym9vbGVhbn1cclxuICAgICAqL1xyXG4gICAgdGhpcy52YWxpZCA9IGZhbHNlO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogVGhpcyB3aWxsIGxldCBhIHJlbmRlcmVyIGtub3cgdGhhdCBhIHRleHR1cmUgaGFzIGJlZW4gdXBkYXRlZCAodXNlZCBtYWlubHkgZm9yIHdlYkdMIHV2IHVwZGF0ZXMpXHJcbiAgICAgKlxyXG4gICAgICogQG1lbWJlciB7Ym9vbGVhbn1cclxuICAgICAqL1xyXG4gICAgdGhpcy5yZXF1aXJlc1VwZGF0ZSA9IGZhbHNlO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogVGhlIFdlYkdMIFVWIGRhdGEgY2FjaGUuXHJcbiAgICAgKlxyXG4gICAgICogQG1lbWJlciB7UElYSS5UZXh0dXJlVXZzfVxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgdGhpcy5fdXZzID0gbnVsbDtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFRoZSB3aWR0aCBvZiB0aGUgVGV4dHVyZSBpbiBwaXhlbHMuXHJcbiAgICAgKlxyXG4gICAgICogQG1lbWJlciB7bnVtYmVyfVxyXG4gICAgICovXHJcbiAgICB0aGlzLndpZHRoID0gMDtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFRoZSBoZWlnaHQgb2YgdGhlIFRleHR1cmUgaW4gcGl4ZWxzLlxyXG4gICAgICpcclxuICAgICAqIEBtZW1iZXIge251bWJlcn1cclxuICAgICAqL1xyXG4gICAgdGhpcy5oZWlnaHQgPSAwO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogVGhpcyBpcyB0aGUgYXJlYSBvZiB0aGUgQmFzZVRleHR1cmUgaW1hZ2UgdG8gYWN0dWFsbHkgY29weSB0byB0aGUgQ2FudmFzIC8gV2ViR0wgd2hlbiByZW5kZXJpbmcsXHJcbiAgICAgKiBpcnJlc3BlY3RpdmUgb2YgdGhlIGFjdHVhbCBmcmFtZSBzaXplIG9yIHBsYWNlbWVudCAod2hpY2ggY2FuIGJlIGluZmx1ZW5jZWQgYnkgdHJpbW1lZCB0ZXh0dXJlIGF0bGFzZXMpXHJcbiAgICAgKlxyXG4gICAgICogQG1lbWJlciB7UElYSS5SZWN0YW5nbGV9XHJcbiAgICAgKi9cclxuICAgIHRoaXMuY3JvcCA9IGNyb3AgfHwgZnJhbWU7Ly9uZXcgbWF0aC5SZWN0YW5nbGUoMCwgMCwgMSwgMSk7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBJbmRpY2F0ZXMgd2hldGhlciB0aGUgdGV4dHVyZSBzaG91bGQgYmUgcm90YXRlZCBieSA5MCBkZWdyZWVzXHJcbiAgICAgKlxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqIEBtZW1iZXIge2Jvb2xlYW59XHJcbiAgICAgKi9cclxuICAgIHRoaXMucm90YXRlID0gISFyb3RhdGU7XHJcblxyXG4gICAgaWYgKGJhc2VUZXh0dXJlLmhhc0xvYWRlZClcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy5ub0ZyYW1lKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZnJhbWUgPSBuZXcgbWF0aC5SZWN0YW5nbGUoMCwgMCwgYmFzZVRleHR1cmUud2lkdGgsIGJhc2VUZXh0dXJlLmhlaWdodCk7XHJcblxyXG4gICAgICAgICAgICAvLyBpZiB0aGVyZSBpcyBubyBmcmFtZSB3ZSBzaG91bGQgbW9uaXRvciBmb3IgYW55IGJhc2UgdGV4dHVyZSBjaGFuZ2VzLi5cclxuICAgICAgICAgICAgYmFzZVRleHR1cmUub24oJ3VwZGF0ZScsIHRoaXMub25CYXNlVGV4dHVyZVVwZGF0ZWQsIHRoaXMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmZyYW1lID0gZnJhbWU7XHJcbiAgICB9XHJcbiAgICBlbHNlXHJcbiAgICB7XHJcbiAgICAgICAgYmFzZVRleHR1cmUub25jZSgnbG9hZGVkJywgdGhpcy5vbkJhc2VUZXh0dXJlTG9hZGVkLCB0aGlzKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEZpcmVkIHdoZW4gdGhlIHRleHR1cmUgaXMgdXBkYXRlZC4gVGhpcyBoYXBwZW5zIGlmIHRoZSBmcmFtZSBvciB0aGUgYmFzZVRleHR1cmUgaXMgdXBkYXRlZC5cclxuICAgICAqXHJcbiAgICAgKiBAZXZlbnQgdXBkYXRlXHJcbiAgICAgKiBAbWVtYmVyb2YgUElYSS5UZXh0dXJlI1xyXG4gICAgICogQHByb3RlY3RlZFxyXG4gICAgICovXHJcbn1cclxuXHJcblRleHR1cmUucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShFdmVudEVtaXR0ZXIucHJvdG90eXBlKTtcclxuVGV4dHVyZS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBUZXh0dXJlO1xyXG5tb2R1bGUuZXhwb3J0cyA9IFRleHR1cmU7XHJcblxyXG5PYmplY3QuZGVmaW5lUHJvcGVydGllcyhUZXh0dXJlLnByb3RvdHlwZSwge1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgZnJhbWUgc3BlY2lmaWVzIHRoZSByZWdpb24gb2YgdGhlIGJhc2UgdGV4dHVyZSB0aGF0IHRoaXMgdGV4dHVyZSB1c2VzLlxyXG4gICAgICpcclxuICAgICAqIEBtZW1iZXIge1BJWEkuUmVjdGFuZ2xlfVxyXG4gICAgICogQG1lbWJlcm9mIFBJWEkuVGV4dHVyZSNcclxuICAgICAqL1xyXG4gICAgZnJhbWU6IHtcclxuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fZnJhbWU7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBzZXQ6IGZ1bmN0aW9uIChmcmFtZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuX2ZyYW1lID0gZnJhbWU7XHJcblxyXG4gICAgICAgICAgICB0aGlzLm5vRnJhbWUgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMud2lkdGggPSBmcmFtZS53aWR0aDtcclxuICAgICAgICAgICAgdGhpcy5oZWlnaHQgPSBmcmFtZS5oZWlnaHQ7XHJcblxyXG4gICAgICAgICAgICBpZiAoIXRoaXMudHJpbSAmJiAhdGhpcy5yb3RhdGUgJiYgKGZyYW1lLnggKyBmcmFtZS53aWR0aCA+IHRoaXMuYmFzZVRleHR1cmUud2lkdGggfHwgZnJhbWUueSArIGZyYW1lLmhlaWdodCA+IHRoaXMuYmFzZVRleHR1cmUuaGVpZ2h0KSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdUZXh0dXJlIEVycm9yOiBmcmFtZSBkb2VzIG5vdCBmaXQgaW5zaWRlIHRoZSBiYXNlIFRleHR1cmUgZGltZW5zaW9ucyAnICsgdGhpcyk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vdGhpcy52YWxpZCA9IGZyYW1lICYmIGZyYW1lLndpZHRoICYmIGZyYW1lLmhlaWdodCAmJiB0aGlzLmJhc2VUZXh0dXJlLnNvdXJjZSAmJiB0aGlzLmJhc2VUZXh0dXJlLmhhc0xvYWRlZDtcclxuICAgICAgICAgICAgdGhpcy52YWxpZCA9IGZyYW1lICYmIGZyYW1lLndpZHRoICYmIGZyYW1lLmhlaWdodCAmJiB0aGlzLmJhc2VUZXh0dXJlLmhhc0xvYWRlZDtcclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLnRyaW0pXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMud2lkdGggPSB0aGlzLnRyaW0ud2lkdGg7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmhlaWdodCA9IHRoaXMudHJpbS5oZWlnaHQ7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9mcmFtZS53aWR0aCA9IHRoaXMudHJpbS53aWR0aDtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2ZyYW1lLmhlaWdodCA9IHRoaXMudHJpbS5oZWlnaHQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNyb3AgPSBmcmFtZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMudmFsaWQpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3VwZGF0ZVV2cygpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KTtcclxuXHJcbi8qKlxyXG4gKiBVcGRhdGVzIHRoaXMgdGV4dHVyZSBvbiB0aGUgZ3B1LlxyXG4gKlxyXG4gKi9cclxuVGV4dHVyZS5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24gKClcclxue1xyXG4gICAgdGhpcy5iYXNlVGV4dHVyZS51cGRhdGUoKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBDYWxsZWQgd2hlbiB0aGUgYmFzZSB0ZXh0dXJlIGlzIGxvYWRlZFxyXG4gKlxyXG4gKiBAcHJpdmF0ZVxyXG4gKi9cclxuVGV4dHVyZS5wcm90b3R5cGUub25CYXNlVGV4dHVyZUxvYWRlZCA9IGZ1bmN0aW9uIChiYXNlVGV4dHVyZSlcclxue1xyXG4gICAgLy8gVE9ETyB0aGlzIGNvZGUgbG9va3MgY29uZnVzaW5nLi4gYm9vIHRvIGFidXNpbmcgZ2V0dGVycyBhbmQgc2V0dGVyc3MhXHJcbiAgICBpZiAodGhpcy5ub0ZyYW1lKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMuZnJhbWUgPSBuZXcgbWF0aC5SZWN0YW5nbGUoMCwgMCwgYmFzZVRleHR1cmUud2lkdGgsIGJhc2VUZXh0dXJlLmhlaWdodCk7XHJcbiAgICB9XHJcbiAgICBlbHNlXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5mcmFtZSA9IHRoaXMuX2ZyYW1lO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuZW1pdCgndXBkYXRlJywgdGhpcyk7XHJcbn07XHJcblxyXG4vKipcclxuICogQ2FsbGVkIHdoZW4gdGhlIGJhc2UgdGV4dHVyZSBpcyB1cGRhdGVkXHJcbiAqXHJcbiAqIEBwcml2YXRlXHJcbiAqL1xyXG5UZXh0dXJlLnByb3RvdHlwZS5vbkJhc2VUZXh0dXJlVXBkYXRlZCA9IGZ1bmN0aW9uIChiYXNlVGV4dHVyZSlcclxue1xyXG4gICAgdGhpcy5fZnJhbWUud2lkdGggPSBiYXNlVGV4dHVyZS53aWR0aDtcclxuICAgIHRoaXMuX2ZyYW1lLmhlaWdodCA9IGJhc2VUZXh0dXJlLmhlaWdodDtcclxuXHJcbiAgICB0aGlzLmVtaXQoJ3VwZGF0ZScsIHRoaXMpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIERlc3Ryb3lzIHRoaXMgdGV4dHVyZVxyXG4gKlxyXG4gKiBAcGFyYW0gW2Rlc3Ryb3lCYXNlPWZhbHNlXSB7Ym9vbGVhbn0gV2hldGhlciB0byBkZXN0cm95IHRoZSBiYXNlIHRleHR1cmUgYXMgd2VsbFxyXG4gKi9cclxuVGV4dHVyZS5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uIChkZXN0cm95QmFzZSlcclxue1xyXG4gICAgaWYgKHRoaXMuYmFzZVRleHR1cmUpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKGRlc3Ryb3lCYXNlKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5iYXNlVGV4dHVyZS5kZXN0cm95KCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmJhc2VUZXh0dXJlLm9mZigndXBkYXRlJywgdGhpcy5vbkJhc2VUZXh0dXJlVXBkYXRlZCwgdGhpcyk7XHJcbiAgICAgICAgdGhpcy5iYXNlVGV4dHVyZS5vZmYoJ2xvYWRlZCcsIHRoaXMub25CYXNlVGV4dHVyZUxvYWRlZCwgdGhpcyk7XHJcblxyXG4gICAgICAgIHRoaXMuYmFzZVRleHR1cmUgPSBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuX2ZyYW1lID0gbnVsbDtcclxuICAgIHRoaXMuX3V2cyA9IG51bGw7XHJcbiAgICB0aGlzLnRyaW0gPSBudWxsO1xyXG4gICAgdGhpcy5jcm9wID0gbnVsbDtcclxuXHJcbiAgICB0aGlzLnZhbGlkID0gZmFsc2U7XHJcblxyXG4gICAgdGhpcy5vZmYoJ2Rpc3Bvc2UnLCB0aGlzLmRpc3Bvc2UsIHRoaXMpO1xyXG4gICAgdGhpcy5vZmYoJ3VwZGF0ZScsIHRoaXMudXBkYXRlLCB0aGlzKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBDcmVhdGVzIGEgbmV3IHRleHR1cmUgb2JqZWN0IHRoYXQgYWN0cyB0aGUgc2FtZSBhcyB0aGlzIG9uZS5cclxuICpcclxuICogQHJldHVybiB7UElYSS5UZXh0dXJlfVxyXG4gKi9cclxuVGV4dHVyZS5wcm90b3R5cGUuY2xvbmUgPSBmdW5jdGlvbiAoKVxyXG57XHJcbiAgICByZXR1cm4gbmV3IFRleHR1cmUodGhpcy5iYXNlVGV4dHVyZSwgdGhpcy5mcmFtZSwgdGhpcy5jcm9wLCB0aGlzLnRyaW0sIHRoaXMucm90YXRlKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBVcGRhdGVzIHRoZSBpbnRlcm5hbCBXZWJHTCBVViBjYWNoZS5cclxuICpcclxuICogQHByaXZhdGVcclxuICovXHJcblRleHR1cmUucHJvdG90eXBlLl91cGRhdGVVdnMgPSBmdW5jdGlvbiAoKVxyXG57XHJcbiAgICBpZiAoIXRoaXMuX3V2cylcclxuICAgIHtcclxuICAgICAgICB0aGlzLl91dnMgPSBuZXcgVGV4dHVyZVV2cygpO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuX3V2cy5zZXQodGhpcy5jcm9wLCB0aGlzLmJhc2VUZXh0dXJlLCB0aGlzLnJvdGF0ZSk7XHJcbn07XHJcblxyXG4vKipcclxuICogSGVscGVyIGZ1bmN0aW9uIHRoYXQgY3JlYXRlcyBhIFRleHR1cmUgb2JqZWN0IGZyb20gdGhlIGdpdmVuIGltYWdlIHVybC5cclxuICogSWYgdGhlIGltYWdlIGlzIG5vdCBpbiB0aGUgdGV4dHVyZSBjYWNoZSBpdCB3aWxsIGJlICBjcmVhdGVkIGFuZCBsb2FkZWQuXHJcbiAqXHJcbiAqIEBzdGF0aWNcclxuICogQHBhcmFtIGltYWdlVXJsIHtzdHJpbmd9IFRoZSBpbWFnZSB1cmwgb2YgdGhlIHRleHR1cmVcclxuICogQHBhcmFtIGNyb3Nzb3JpZ2luIHtib29sZWFufSBXaGV0aGVyIHJlcXVlc3RzIHNob3VsZCBiZSB0cmVhdGVkIGFzIGNyb3Nzb3JpZ2luXHJcbiAqIEBwYXJhbSBzY2FsZU1vZGUge251bWJlcn0gU2VlIHtAbGluayBQSVhJLlNDQUxFX01PREVTfSBmb3IgcG9zc2libGUgdmFsdWVzXHJcbiAqIEByZXR1cm4ge1BJWEkuVGV4dHVyZX0gVGhlIG5ld2x5IGNyZWF0ZWQgdGV4dHVyZVxyXG4gKi9cclxuVGV4dHVyZS5mcm9tSW1hZ2UgPSBmdW5jdGlvbiAoaW1hZ2VVcmwsIGNyb3Nzb3JpZ2luLCBzY2FsZU1vZGUpXHJcbntcclxuICAgIHZhciB0ZXh0dXJlID0gdXRpbHMuVGV4dHVyZUNhY2hlW2ltYWdlVXJsXTtcclxuXHJcbiAgICBpZiAoIXRleHR1cmUpXHJcbiAgICB7XHJcbiAgICAgICAgdGV4dHVyZSA9IG5ldyBUZXh0dXJlKEJhc2VUZXh0dXJlLmZyb21JbWFnZShpbWFnZVVybCwgY3Jvc3NvcmlnaW4sIHNjYWxlTW9kZSkpO1xyXG4gICAgICAgIHV0aWxzLlRleHR1cmVDYWNoZVtpbWFnZVVybF0gPSB0ZXh0dXJlO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0ZXh0dXJlO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEhlbHBlciBmdW5jdGlvbiB0aGF0IGNyZWF0ZXMgYSBzcHJpdGUgdGhhdCB3aWxsIGNvbnRhaW4gYSB0ZXh0dXJlIGZyb20gdGhlIFRleHR1cmVDYWNoZSBiYXNlZCBvbiB0aGUgZnJhbWVJZFxyXG4gKiBUaGUgZnJhbWUgaWRzIGFyZSBjcmVhdGVkIHdoZW4gYSBUZXh0dXJlIHBhY2tlciBmaWxlIGhhcyBiZWVuIGxvYWRlZFxyXG4gKlxyXG4gKiBAc3RhdGljXHJcbiAqIEBwYXJhbSBmcmFtZUlkIHtzdHJpbmd9IFRoZSBmcmFtZSBJZCBvZiB0aGUgdGV4dHVyZSBpbiB0aGUgY2FjaGVcclxuICogQHJldHVybiB7UElYSS5UZXh0dXJlfSBUaGUgbmV3bHkgY3JlYXRlZCB0ZXh0dXJlXHJcbiAqL1xyXG5UZXh0dXJlLmZyb21GcmFtZSA9IGZ1bmN0aW9uIChmcmFtZUlkKVxyXG57XHJcbiAgICB2YXIgdGV4dHVyZSA9IHV0aWxzLlRleHR1cmVDYWNoZVtmcmFtZUlkXTtcclxuXHJcbiAgICBpZiAoIXRleHR1cmUpXHJcbiAgICB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdUaGUgZnJhbWVJZCBcIicgKyBmcmFtZUlkICsgJ1wiIGRvZXMgbm90IGV4aXN0IGluIHRoZSB0ZXh0dXJlIGNhY2hlJyk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRleHR1cmU7XHJcbn07XHJcblxyXG4vKipcclxuICogSGVscGVyIGZ1bmN0aW9uIHRoYXQgY3JlYXRlcyBhIG5ldyBUZXh0dXJlIGJhc2VkIG9uIHRoZSBnaXZlbiBjYW52YXMgZWxlbWVudC5cclxuICpcclxuICogQHN0YXRpY1xyXG4gKiBAcGFyYW0gY2FudmFzIHtDYW52YXN9IFRoZSBjYW52YXMgZWxlbWVudCBzb3VyY2Ugb2YgdGhlIHRleHR1cmVcclxuICogQHBhcmFtIHNjYWxlTW9kZSB7bnVtYmVyfSBTZWUge0BsaW5rIFBJWEkuU0NBTEVfTU9ERVN9IGZvciBwb3NzaWJsZSB2YWx1ZXNcclxuICogQHJldHVybiB7UElYSS5UZXh0dXJlfVxyXG4gKi9cclxuVGV4dHVyZS5mcm9tQ2FudmFzID0gZnVuY3Rpb24gKGNhbnZhcywgc2NhbGVNb2RlKVxyXG57XHJcbiAgICByZXR1cm4gbmV3IFRleHR1cmUoQmFzZVRleHR1cmUuZnJvbUNhbnZhcyhjYW52YXMsIHNjYWxlTW9kZSkpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEhlbHBlciBmdW5jdGlvbiB0aGF0IGNyZWF0ZXMgYSBuZXcgVGV4dHVyZSBiYXNlZCBvbiB0aGUgZ2l2ZW4gdmlkZW8gZWxlbWVudC5cclxuICpcclxuICogQHN0YXRpY1xyXG4gKiBAcGFyYW0gdmlkZW8ge0hUTUxWaWRlb0VsZW1lbnR9XHJcbiAqIEBwYXJhbSBzY2FsZU1vZGUge251bWJlcn0gU2VlIHtAbGluayBQSVhJLlNDQUxFX01PREVTfSBmb3IgcG9zc2libGUgdmFsdWVzXHJcbiAqIEByZXR1cm4ge1BJWEkuVGV4dHVyZX0gQSBUZXh0dXJlXHJcbiAqL1xyXG5UZXh0dXJlLmZyb21WaWRlbyA9IGZ1bmN0aW9uICh2aWRlbywgc2NhbGVNb2RlKVxyXG57XHJcbiAgICBpZiAodHlwZW9mIHZpZGVvID09PSAnc3RyaW5nJylcclxuICAgIHtcclxuICAgICAgICByZXR1cm4gVGV4dHVyZS5mcm9tVmlkZW9VcmwodmlkZW8sIHNjYWxlTW9kZSk7XHJcbiAgICB9XHJcbiAgICBlbHNlXHJcbiAgICB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBUZXh0dXJlKFZpZGVvQmFzZVRleHR1cmUuZnJvbVZpZGVvKHZpZGVvLCBzY2FsZU1vZGUpKTtcclxuICAgIH1cclxufTtcclxuXHJcbi8qKlxyXG4gKiBIZWxwZXIgZnVuY3Rpb24gdGhhdCBjcmVhdGVzIGEgbmV3IFRleHR1cmUgYmFzZWQgb24gdGhlIHZpZGVvIHVybC5cclxuICpcclxuICogQHN0YXRpY1xyXG4gKiBAcGFyYW0gdmlkZW9Vcmwge3N0cmluZ31cclxuICogQHBhcmFtIHNjYWxlTW9kZSB7bnVtYmVyfSBTZWUge0BsaW5rIFBJWEkuU0NBTEVfTU9ERVN9IGZvciBwb3NzaWJsZSB2YWx1ZXNcclxuICogQHJldHVybiB7UElYSS5UZXh0dXJlfSBBIFRleHR1cmVcclxuICovXHJcblRleHR1cmUuZnJvbVZpZGVvVXJsID0gZnVuY3Rpb24gKHZpZGVvVXJsLCBzY2FsZU1vZGUpXHJcbntcclxuICAgIHJldHVybiBuZXcgVGV4dHVyZShWaWRlb0Jhc2VUZXh0dXJlLmZyb21VcmwodmlkZW9VcmwsIHNjYWxlTW9kZSkpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEFkZHMgYSB0ZXh0dXJlIHRvIHRoZSBnbG9iYWwgdXRpbHMuVGV4dHVyZUNhY2hlLiBUaGlzIGNhY2hlIGlzIHNoYXJlZCBhY3Jvc3MgdGhlIHdob2xlIFBJWEkgb2JqZWN0LlxyXG4gKlxyXG4gKiBAc3RhdGljXHJcbiAqIEBwYXJhbSB0ZXh0dXJlIHtQSVhJLlRleHR1cmV9IFRoZSBUZXh0dXJlIHRvIGFkZCB0byB0aGUgY2FjaGUuXHJcbiAqIEBwYXJhbSBpZCB7c3RyaW5nfSBUaGUgaWQgdGhhdCB0aGUgdGV4dHVyZSB3aWxsIGJlIHN0b3JlZCBhZ2FpbnN0LlxyXG4gKi9cclxuVGV4dHVyZS5hZGRUZXh0dXJlVG9DYWNoZSA9IGZ1bmN0aW9uICh0ZXh0dXJlLCBpZClcclxue1xyXG4gICAgdXRpbHMuVGV4dHVyZUNhY2hlW2lkXSA9IHRleHR1cmU7XHJcbn07XHJcblxyXG4vKipcclxuICogUmVtb3ZlIGEgdGV4dHVyZSBmcm9tIHRoZSBnbG9iYWwgdXRpbHMuVGV4dHVyZUNhY2hlLlxyXG4gKlxyXG4gKiBAc3RhdGljXHJcbiAqIEBwYXJhbSBpZCB7c3RyaW5nfSBUaGUgaWQgb2YgdGhlIHRleHR1cmUgdG8gYmUgcmVtb3ZlZFxyXG4gKiBAcmV0dXJuIHtQSVhJLlRleHR1cmV9IFRoZSB0ZXh0dXJlIHRoYXQgd2FzIHJlbW92ZWRcclxuICovXHJcblRleHR1cmUucmVtb3ZlVGV4dHVyZUZyb21DYWNoZSA9IGZ1bmN0aW9uIChpZClcclxue1xyXG4gICAgdmFyIHRleHR1cmUgPSB1dGlscy5UZXh0dXJlQ2FjaGVbaWRdO1xyXG5cclxuICAgIGRlbGV0ZSB1dGlscy5UZXh0dXJlQ2FjaGVbaWRdO1xyXG4gICAgZGVsZXRlIHV0aWxzLkJhc2VUZXh0dXJlQ2FjaGVbaWRdO1xyXG5cclxuICAgIHJldHVybiB0ZXh0dXJlO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEFuIGVtcHR5IHRleHR1cmUsIHVzZWQgb2Z0ZW4gdG8gbm90IGhhdmUgdG8gY3JlYXRlIG11bHRpcGxlIGVtcHR5IHRleHR1cmVzLlxyXG4gKlxyXG4gKiBAc3RhdGljXHJcbiAqIEBjb25zdGFudFxyXG4gKi9cclxuVGV4dHVyZS5FTVBUWSA9IG5ldyBUZXh0dXJlKG5ldyBCYXNlVGV4dHVyZSgpKTtcclxuIiwiXHJcbi8qKlxyXG4gKiBBIHN0YW5kYXJkIG9iamVjdCB0byBzdG9yZSB0aGUgVXZzIG9mIGEgdGV4dHVyZVxyXG4gKlxyXG4gKiBAY2xhc3NcclxuICogQHByaXZhdGVcclxuICogQG1lbWJlcm9mIFBJWElcclxuICovXHJcbmZ1bmN0aW9uIFRleHR1cmVVdnMoKVxyXG57XHJcbiAgICB0aGlzLngwID0gMDtcclxuICAgIHRoaXMueTAgPSAwO1xyXG5cclxuICAgIHRoaXMueDEgPSAxO1xyXG4gICAgdGhpcy55MSA9IDA7XHJcblxyXG4gICAgdGhpcy54MiA9IDE7XHJcbiAgICB0aGlzLnkyID0gMTtcclxuXHJcbiAgICB0aGlzLngzID0gMDtcclxuICAgIHRoaXMueTMgPSAxO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFRleHR1cmVVdnM7XHJcblxyXG4vKipcclxuICogU2V0cyB0aGUgdGV4dHVyZSBVdnMgYmFzZWQgb24gdGhlIGdpdmVuIGZyYW1lIGluZm9ybWF0aW9uXHJcbiAqIEBwYXJhbSBmcmFtZSB7UElYSS5SZWN0YW5nbGV9XHJcbiAqIEBwYXJhbSBiYXNlRnJhbWUge1BJWEkuUmVjdGFuZ2xlfVxyXG4gKiBAcGFyYW0gcm90YXRlIHtib29sZWFufSBXaGV0aGVyIG9yIG5vdCB0aGUgZnJhbWUgaXMgcm90YXRlZFxyXG4gKiBAcHJpdmF0ZVxyXG4gKi9cclxuVGV4dHVyZVV2cy5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24gKGZyYW1lLCBiYXNlRnJhbWUsIHJvdGF0ZSlcclxue1xyXG4gICAgdmFyIHR3ID0gYmFzZUZyYW1lLndpZHRoO1xyXG4gICAgdmFyIHRoID0gYmFzZUZyYW1lLmhlaWdodDtcclxuXHJcbiAgICBpZihyb3RhdGUpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy54MCA9IChmcmFtZS54ICsgZnJhbWUuaGVpZ2h0KSAvIHR3O1xyXG4gICAgICAgIHRoaXMueTAgPSBmcmFtZS55IC8gdGg7XHJcblxyXG4gICAgICAgIHRoaXMueDEgPSAoZnJhbWUueCArIGZyYW1lLmhlaWdodCkgLyB0dztcclxuICAgICAgICB0aGlzLnkxID0gKGZyYW1lLnkgKyBmcmFtZS53aWR0aCkgLyB0aDtcclxuXHJcbiAgICAgICAgdGhpcy54MiA9IGZyYW1lLnggLyB0dztcclxuICAgICAgICB0aGlzLnkyID0gKGZyYW1lLnkgKyBmcmFtZS53aWR0aCkgLyB0aDtcclxuXHJcbiAgICAgICAgdGhpcy54MyA9IGZyYW1lLnggLyB0dztcclxuICAgICAgICB0aGlzLnkzID0gZnJhbWUueSAvIHRoO1xyXG4gICAgfVxyXG4gICAgZWxzZVxyXG4gICAge1xyXG5cclxuICAgICAgICB0aGlzLngwID0gZnJhbWUueCAvIHR3O1xyXG4gICAgICAgIHRoaXMueTAgPSBmcmFtZS55IC8gdGg7XHJcblxyXG4gICAgICAgIHRoaXMueDEgPSAoZnJhbWUueCArIGZyYW1lLndpZHRoKSAvIHR3O1xyXG4gICAgICAgIHRoaXMueTEgPSBmcmFtZS55IC8gdGg7XHJcblxyXG4gICAgICAgIHRoaXMueDIgPSAoZnJhbWUueCArIGZyYW1lLndpZHRoKSAvIHR3O1xyXG4gICAgICAgIHRoaXMueTIgPSAoZnJhbWUueSArIGZyYW1lLmhlaWdodCkgLyB0aDtcclxuXHJcbiAgICAgICAgdGhpcy54MyA9IGZyYW1lLnggLyB0dztcclxuICAgICAgICB0aGlzLnkzID0gKGZyYW1lLnkgKyBmcmFtZS5oZWlnaHQpIC8gdGg7XHJcbiAgICB9XHJcbn07XHJcbiIsInZhciBDT05TVCA9IHJlcXVpcmUoJy4uL2NvbnN0JyksXHJcbiAgICBFdmVudEVtaXR0ZXIgPSByZXF1aXJlKCdldmVudGVtaXR0ZXIzJyksXHJcbiAgICAvLyBJbnRlcm5hbCBldmVudCB1c2VkIGJ5IGNvbXBvc2VkIGVtaXR0ZXJcclxuICAgIFRJQ0sgPSAndGljayc7XHJcblxyXG4vKipcclxuICogQSBUaWNrZXIgY2xhc3MgdGhhdCBydW5zIGFuIHVwZGF0ZSBsb29wIHRoYXQgb3RoZXIgb2JqZWN0cyBsaXN0ZW4gdG8uXHJcbiAqIFRoaXMgY2xhc3MgaXMgY29tcG9zZWQgYXJvdW5kIGFuIEV2ZW50RW1pdHRlciBvYmplY3QgdG8gYWRkIGxpc3RlbmVyc1xyXG4gKiBtZWFudCBmb3IgZXhlY3V0aW9uIG9uIHRoZSBuZXh0IHJlcXVlc3RlZCBhbmltYXRpb24gZnJhbWUuXHJcbiAqIEFuaW1hdGlvbiBmcmFtZXMgYXJlIHJlcXVlc3RlZCBvbmx5IHdoZW4gbmVjZXNzYXJ5LFxyXG4gKiBlLmcuIFdoZW4gdGhlIHRpY2tlciBpcyBzdGFydGVkIGFuZCB0aGUgZW1pdHRlciBoYXMgbGlzdGVuZXJzLlxyXG4gKlxyXG4gKiBAY2xhc3NcclxuICogQG1lbWJlcm9mIFBJWEkudGlja2VyXHJcbiAqL1xyXG5mdW5jdGlvbiBUaWNrZXIoKVxyXG57XHJcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogSW50ZXJuYWwgdGljayBtZXRob2QgYm91bmQgdG8gdGlja2VyIGluc3RhbmNlLlxyXG4gICAgICogVGhpcyBpcyBiZWNhdXNlIGluIGVhcmx5IDIwMTUsIEZ1bmN0aW9uLmJpbmRcclxuICAgICAqIGlzIHN0aWxsIDYwJSBzbG93ZXIgaW4gaGlnaCBwZXJmb3JtYW5jZSBzY2VuYXJpb3MuXHJcbiAgICAgKiBBbHNvIHNlcGFyYXRpbmcgZnJhbWUgcmVxdWVzdHMgZnJvbSB1cGRhdGUgbWV0aG9kXHJcbiAgICAgKiBzbyBsaXN0ZW5lcnMgbWF5IGJlIGNhbGxlZCBhdCBhbnkgdGltZSBhbmQgd2l0aFxyXG4gICAgICogYW55IGFuaW1hdGlvbiBBUEksIGp1c3QgaW52b2tlIHRpY2tlci51cGRhdGUodGltZSkuXHJcbiAgICAgKlxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgdGhpcy5fdGljayA9IGZ1bmN0aW9uIF90aWNrKHRpbWUpIHtcclxuXHJcbiAgICAgICAgX3RoaXMuX3JlcXVlc3RJZCA9IG51bGw7XHJcblxyXG4gICAgICAgIGlmIChfdGhpcy5zdGFydGVkKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgLy8gSW52b2tlIGxpc3RlbmVycyBub3dcclxuICAgICAgICAgICAgX3RoaXMudXBkYXRlKHRpbWUpO1xyXG4gICAgICAgICAgICAvLyBMaXN0ZW5lciBzaWRlIGVmZmVjdHMgbWF5IGhhdmUgbW9kaWZpZWQgdGlja2VyIHN0YXRlLlxyXG4gICAgICAgICAgICBpZiAoX3RoaXMuc3RhcnRlZCAmJiBfdGhpcy5fcmVxdWVzdElkID09PSBudWxsICYmIF90aGlzLl9lbWl0dGVyLmxpc3RlbmVycyhUSUNLLCB0cnVlKSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgX3RoaXMuX3JlcXVlc3RJZCA9IHJlcXVlc3RBbmltYXRpb25GcmFtZShfdGhpcy5fdGljayk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogSW50ZXJuYWwgZW1pdHRlciB1c2VkIHRvIGZpcmUgJ3RpY2snIGV2ZW50XHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICB0aGlzLl9lbWl0dGVyID0gbmV3IEV2ZW50RW1pdHRlcigpO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogSW50ZXJuYWwgY3VycmVudCBmcmFtZSByZXF1ZXN0IElEXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICB0aGlzLl9yZXF1ZXN0SWQgPSBudWxsO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogSW50ZXJuYWwgdmFsdWUgbWFuYWdlZCBieSBtaW5GUFMgcHJvcGVydHkgc2V0dGVyIGFuZCBnZXR0ZXIuXHJcbiAgICAgKiBUaGlzIGlzIHRoZSBtYXhpbXVtIGFsbG93ZWQgbWlsbGlzZWNvbmRzIGJldHdlZW4gdXBkYXRlcy5cclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIHRoaXMuX21heEVsYXBzZWRNUyA9IDEwMDtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFdoZXRoZXIgb3Igbm90IHRoaXMgdGlja2VyIHNob3VsZCBpbnZva2UgdGhlIG1ldGhvZFxyXG4gICAgICoge0BsaW5rIFBJWEkudGlja2VyLlRpY2tlciNzdGFydH0gYXV0b21hdGljYWxseVxyXG4gICAgICogd2hlbiBhIGxpc3RlbmVyIGlzIGFkZGVkLlxyXG4gICAgICpcclxuICAgICAqIEBtZW1iZXIge2Jvb2xlYW59XHJcbiAgICAgKiBAZGVmYXVsdCBmYWxzZVxyXG4gICAgICovXHJcbiAgICB0aGlzLmF1dG9TdGFydCA9IGZhbHNlO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2NhbGFyIHRpbWUgdmFsdWUgZnJvbSBsYXN0IGZyYW1lIHRvIHRoaXMgZnJhbWUuXHJcbiAgICAgKiBUaGlzIHZhbHVlIGlzIGNhcHBlZCBieSBzZXR0aW5nIHtAbGluayBQSVhJLnRpY2tlci5UaWNrZXIjbWluRlBTfVxyXG4gICAgICogYW5kIGlzIHNjYWxlZCB3aXRoIHtAbGluayBQSVhJLnRpY2tlci5UaWNrZXIjc3BlZWR9LlxyXG4gICAgICogKipOb3RlOioqIFRoZSBjYXAgbWF5IGJlIGV4Y2VlZGVkIGJ5IHNjYWxpbmcuXHJcbiAgICAgKlxyXG4gICAgICogQG1lbWJlciB7bnVtYmVyfVxyXG4gICAgICogQGRlZmF1bHQgMVxyXG4gICAgICovXHJcbiAgICB0aGlzLmRlbHRhVGltZSA9IDE7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUaW1lIGVsYXBzZWQgaW4gbWlsbGlzZWNvbmRzIGZyb20gbGFzdCBmcmFtZSB0byB0aGlzIGZyYW1lLlxyXG4gICAgICogT3Bwb3NlZCB0byB3aGF0IHRoZSBzY2FsYXIge0BsaW5rIFBJWEkudGlja2VyLlRpY2tlciNkZWx0YVRpbWV9XHJcbiAgICAgKiBpcyBiYXNlZCwgdGhpcyB2YWx1ZSBpcyBuZWl0aGVyIGNhcHBlZCBub3Igc2NhbGVkLlxyXG4gICAgICogSWYgdGhlIHBsYXRmb3JtIHN1cHBvcnRzIERPTUhpZ2hSZXNUaW1lU3RhbXAsXHJcbiAgICAgKiB0aGlzIHZhbHVlIHdpbGwgaGF2ZSBhIHByZWNpc2lvbiBvZiAxIMK1cy5cclxuICAgICAqXHJcbiAgICAgKiBAbWVtYmVyIHtET01IaWdoUmVzVGltZVN0YW1wfG51bWJlcn1cclxuICAgICAqIEBkZWZhdWx0IDEgLyBUQVJHRVRfRlBNU1xyXG4gICAgICovXHJcbiAgICB0aGlzLmVsYXBzZWRNUyA9IDEgLyBDT05TVC5UQVJHRVRfRlBNUzsgLy8gZGVmYXVsdCB0byB0YXJnZXQgZnJhbWUgdGltZVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVGhlIGxhc3QgdGltZSB7QGxpbmsgUElYSS50aWNrZXIuVGlja2VyI3VwZGF0ZX0gd2FzIGludm9rZWQuXHJcbiAgICAgKiBUaGlzIHZhbHVlIGlzIGFsc28gcmVzZXQgaW50ZXJuYWxseSBvdXRzaWRlIG9mIGludm9raW5nXHJcbiAgICAgKiB1cGRhdGUsIGJ1dCBvbmx5IHdoZW4gYSBuZXcgYW5pbWF0aW9uIGZyYW1lIGlzIHJlcXVlc3RlZC5cclxuICAgICAqIElmIHRoZSBwbGF0Zm9ybSBzdXBwb3J0cyBET01IaWdoUmVzVGltZVN0YW1wLFxyXG4gICAgICogdGhpcyB2YWx1ZSB3aWxsIGhhdmUgYSBwcmVjaXNpb24gb2YgMSDCtXMuXHJcbiAgICAgKlxyXG4gICAgICogQG1lbWJlciB7RE9NSGlnaFJlc1RpbWVTdGFtcHxudW1iZXJ9XHJcbiAgICAgKiBAZGVmYXVsdCAwXHJcbiAgICAgKi9cclxuICAgIHRoaXMubGFzdFRpbWUgPSAwO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogRmFjdG9yIG9mIGN1cnJlbnQge0BsaW5rIFBJWEkudGlja2VyLlRpY2tlciNkZWx0YVRpbWV9LlxyXG4gICAgICogQGV4YW1wbGVcclxuICAgICAqIC8vIFNjYWxlcyB0aWNrZXIuZGVsdGFUaW1lIHRvIHdoYXQgd291bGQgYmVcclxuICAgICAqIC8vIHRoZSBlcXVpdmFsZW50IG9mIGFwcHJveGltYXRlbHkgMTIwIEZQU1xyXG4gICAgICogdGlja2VyLnNwZWVkID0gMjtcclxuICAgICAqXHJcbiAgICAgKiBAbWVtYmVyIHtudW1iZXJ9XHJcbiAgICAgKiBAZGVmYXVsdCAxXHJcbiAgICAgKi9cclxuICAgIHRoaXMuc3BlZWQgPSAxO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogV2hldGhlciBvciBub3QgdGhpcyB0aWNrZXIgaGFzIGJlZW4gc3RhcnRlZC5cclxuICAgICAqIGB0cnVlYCBpZiB7QGxpbmsgUElYSS50aWNrZXIuVGlja2VyI3N0YXJ0fSBoYXMgYmVlbiBjYWxsZWQuXHJcbiAgICAgKiBgZmFsc2VgIGlmIHtAbGluayBQSVhJLnRpY2tlci5UaWNrZXIjc3RvcH0gaGFzIGJlZW4gY2FsbGVkLlxyXG4gICAgICogV2hpbGUgYGZhbHNlYCwgdGhpcyB2YWx1ZSBtYXkgY2hhbmdlIHRvIGB0cnVlYCBpbiB0aGVcclxuICAgICAqIGV2ZW50IG9mIHtAbGluayBQSVhJLnRpY2tlci5UaWNrZXIjYXV0b1N0YXJ0fSBiZWluZyBgdHJ1ZWBcclxuICAgICAqIGFuZCBhIGxpc3RlbmVyIGlzIGFkZGVkLlxyXG4gICAgICpcclxuICAgICAqIEBtZW1iZXIge2Jvb2xlYW59XHJcbiAgICAgKiBAZGVmYXVsdCBmYWxzZVxyXG4gICAgICovXHJcbiAgICB0aGlzLnN0YXJ0ZWQgPSBmYWxzZTtcclxufVxyXG5cclxuT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoVGlja2VyLnByb3RvdHlwZSwge1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgZnJhbWVzIHBlciBzZWNvbmQgYXQgd2hpY2ggdGhpcyB0aWNrZXIgaXMgcnVubmluZy5cclxuICAgICAqIFRoZSBkZWZhdWx0IGlzIGFwcHJveGltYXRlbHkgNjAgaW4gbW9zdCBtb2Rlcm4gYnJvd3NlcnMuXHJcbiAgICAgKiAqKk5vdGU6KiogVGhpcyBkb2VzIG5vdCBmYWN0b3IgaW4gdGhlIHZhbHVlIG9mXHJcbiAgICAgKiB7QGxpbmsgUElYSS50aWNrZXIuVGlja2VyI3NwZWVkfSwgd2hpY2ggaXMgc3BlY2lmaWNcclxuICAgICAqIHRvIHNjYWxpbmcge0BsaW5rIFBJWEkudGlja2VyLlRpY2tlciNkZWx0YVRpbWV9LlxyXG4gICAgICpcclxuICAgICAqIEBtZW1iZXJcclxuICAgICAqIEBtZW1iZXJvZiBQSVhJLnRpY2tlci5UaWNrZXIjXHJcbiAgICAgKiBAcmVhZG9ubHlcclxuICAgICAqL1xyXG4gICAgRlBTOiB7XHJcbiAgICAgICAgZ2V0OiBmdW5jdGlvbigpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICByZXR1cm4gMTAwMCAvIHRoaXMuZWxhcHNlZE1TO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBNYW5hZ2VzIHRoZSBtYXhpbXVtIGFtb3VudCBvZiBtaWxsaXNlY29uZHMgYWxsb3dlZCB0b1xyXG4gICAgICogZWxhcHNlIGJldHdlZW4gaW52b2tpbmcge0BsaW5rIFBJWEkudGlja2VyLlRpY2tlciN1cGRhdGV9LlxyXG4gICAgICogVGhpcyB2YWx1ZSBpcyB1c2VkIHRvIGNhcCB7QGxpbmsgUElYSS50aWNrZXIuVGlja2VyI2RlbHRhVGltZX0sXHJcbiAgICAgKiBidXQgZG9lcyBub3QgZWZmZWN0IHRoZSBtZWFzdXJlZCB2YWx1ZSBvZiB7QGxpbmsgUElYSS50aWNrZXIuVGlja2VyI0ZQU30uXHJcbiAgICAgKiBXaGVuIHNldHRpbmcgdGhpcyBwcm9wZXJ0eSBpdCBpcyBjbGFtcGVkIHRvIGEgdmFsdWUgYmV0d2VlblxyXG4gICAgICogYDBgIGFuZCBgUElYSS5UQVJHRVRfRlBNUyAqIDEwMDBgLlxyXG4gICAgICpcclxuICAgICAqIEBtZW1iZXJcclxuICAgICAqIEBtZW1iZXJvZiBQSVhJLnRpY2tlci5UaWNrZXIjXHJcbiAgICAgKiBAZGVmYXVsdCAxMFxyXG4gICAgICovXHJcbiAgICBtaW5GUFM6IHtcclxuICAgICAgICBnZXQ6IGZ1bmN0aW9uKClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVybiAxMDAwIC8gdGhpcy5fbWF4RWxhcHNlZE1TO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc2V0OiBmdW5jdGlvbihmcHMpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICAvLyBDbGFtcDogMCB0byBUQVJHRVRfRlBNU1xyXG4gICAgICAgICAgICB2YXIgbWluRlBNUyA9IE1hdGgubWluKE1hdGgubWF4KDAsIGZwcykgLyAxMDAwLCBDT05TVC5UQVJHRVRfRlBNUyk7XHJcbiAgICAgICAgICAgIHRoaXMuX21heEVsYXBzZWRNUyA9IDEgLyBtaW5GUE1TO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSk7XHJcblxyXG4vKipcclxuICogQ29uZGl0aW9uYWxseSByZXF1ZXN0cyBhIG5ldyBhbmltYXRpb24gZnJhbWUuXHJcbiAqIElmIGEgZnJhbWUgaGFzIG5vdCBhbHJlYWR5IGJlZW4gcmVxdWVzdGVkLCBhbmQgaWYgdGhlIGludGVybmFsXHJcbiAqIGVtaXR0ZXIgaGFzIGxpc3RlbmVycywgYSBuZXcgZnJhbWUgaXMgcmVxdWVzdGVkLlxyXG4gKlxyXG4gKiBAcHJpdmF0ZVxyXG4gKi9cclxuVGlja2VyLnByb3RvdHlwZS5fcmVxdWVzdElmTmVlZGVkID0gZnVuY3Rpb24gX3JlcXVlc3RJZk5lZWRlZCgpXHJcbntcclxuICAgIGlmICh0aGlzLl9yZXF1ZXN0SWQgPT09IG51bGwgJiYgdGhpcy5fZW1pdHRlci5saXN0ZW5lcnMoVElDSywgdHJ1ZSkpXHJcbiAgICB7XHJcbiAgICAgICAgLy8gZW5zdXJlIGNhbGxiYWNrcyBnZXQgY29ycmVjdCBkZWx0YVxyXG4gICAgICAgIHRoaXMubGFzdFRpbWUgPSBwZXJmb3JtYW5jZS5ub3coKTtcclxuICAgICAgICB0aGlzLl9yZXF1ZXN0SWQgPSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy5fdGljayk7XHJcbiAgICB9XHJcbn07XHJcblxyXG4vKipcclxuICogQ29uZGl0aW9uYWxseSBjYW5jZWxzIGEgcGVuZGluZyBhbmltYXRpb24gZnJhbWUuXHJcbiAqXHJcbiAqIEBwcml2YXRlXHJcbiAqL1xyXG5UaWNrZXIucHJvdG90eXBlLl9jYW5jZWxJZk5lZWRlZCA9IGZ1bmN0aW9uIF9jYW5jZWxJZk5lZWRlZCgpXHJcbntcclxuICAgIGlmICh0aGlzLl9yZXF1ZXN0SWQgIT09IG51bGwpXHJcbiAgICB7XHJcbiAgICAgICAgY2FuY2VsQW5pbWF0aW9uRnJhbWUodGhpcy5fcmVxdWVzdElkKTtcclxuICAgICAgICB0aGlzLl9yZXF1ZXN0SWQgPSBudWxsO1xyXG4gICAgfVxyXG59O1xyXG5cclxuLyoqXHJcbiAqIENvbmRpdGlvbmFsbHkgcmVxdWVzdHMgYSBuZXcgYW5pbWF0aW9uIGZyYW1lLlxyXG4gKiBJZiB0aGUgdGlja2VyIGhhcyBiZWVuIHN0YXJ0ZWQgaXQgY2hlY2tzIGlmIGEgZnJhbWUgaGFzIG5vdCBhbHJlYWR5XHJcbiAqIGJlZW4gcmVxdWVzdGVkLCBhbmQgaWYgdGhlIGludGVybmFsIGVtaXR0ZXIgaGFzIGxpc3RlbmVycy4gSWYgdGhlc2VcclxuICogY29uZGl0aW9ucyBhcmUgbWV0LCBhIG5ldyBmcmFtZSBpcyByZXF1ZXN0ZWQuIElmIHRoZSB0aWNrZXIgaGFzIG5vdFxyXG4gKiBiZWVuIHN0YXJ0ZWQsIGJ1dCBhdXRvU3RhcnQgaXMgYHRydWVgLCB0aGVuIHRoZSB0aWNrZXIgc3RhcnRzIG5vdyxcclxuICogYW5kIGNvbnRpbnVlcyB3aXRoIHRoZSBwcmV2aW91cyBjb25kaXRpb25zIHRvIHJlcXVlc3QgYSBuZXcgZnJhbWUuXHJcbiAqXHJcbiAqIEBwcml2YXRlXHJcbiAqL1xyXG5UaWNrZXIucHJvdG90eXBlLl9zdGFydElmUG9zc2libGUgPSBmdW5jdGlvbiBfc3RhcnRJZlBvc3NpYmxlKClcclxue1xyXG4gICAgaWYgKHRoaXMuc3RhcnRlZClcclxuICAgIHtcclxuICAgICAgICB0aGlzLl9yZXF1ZXN0SWZOZWVkZWQoKTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKHRoaXMuYXV0b1N0YXJ0KVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMuc3RhcnQoKTtcclxuICAgIH1cclxufTtcclxuXHJcbi8qKlxyXG4gKiBDYWxscyB7QGxpbmsgbW9kdWxlOmV2ZW50ZW1pdHRlcjMuRXZlbnRFbWl0dGVyI29ufSBpbnRlcm5hbGx5IGZvciB0aGVcclxuICogaW50ZXJuYWwgJ3RpY2snIGV2ZW50LiBJdCBjaGVja3MgaWYgdGhlIGVtaXR0ZXIgaGFzIGxpc3RlbmVycyxcclxuICogYW5kIGlmIHNvIGl0IHJlcXVlc3RzIGEgbmV3IGFuaW1hdGlvbiBmcmFtZSBhdCB0aGlzIHBvaW50LlxyXG4gKlxyXG4gKiBAcGFyYW0gZm4ge0Z1bmN0aW9ufSBUaGUgbGlzdGVuZXIgZnVuY3Rpb24gdG8gYmUgYWRkZWQgZm9yIHVwZGF0ZXNcclxuICogQHBhcmFtIFtjb250ZXh0XSB7RnVuY3Rpb259IFRoZSBsaXN0ZW5lciBjb250ZXh0XHJcbiAqIEByZXR1cm5zIHtQSVhJLnRpY2tlci5UaWNrZXJ9IHRoaXNcclxuICovXHJcblRpY2tlci5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24gYWRkKGZuLCBjb250ZXh0KVxyXG57XHJcbiAgICB0aGlzLl9lbWl0dGVyLm9uKFRJQ0ssIGZuLCBjb250ZXh0KTtcclxuXHJcbiAgICB0aGlzLl9zdGFydElmUG9zc2libGUoKTtcclxuXHJcbiAgICByZXR1cm4gdGhpcztcclxufTtcclxuXHJcbi8qKlxyXG4gKiBDYWxscyB7QGxpbmsgbW9kdWxlOmV2ZW50ZW1pdHRlcjMuRXZlbnRFbWl0dGVyI29uY2V9IGludGVybmFsbHkgZm9yIHRoZVxyXG4gKiBpbnRlcm5hbCAndGljaycgZXZlbnQuIEl0IGNoZWNrcyBpZiB0aGUgZW1pdHRlciBoYXMgbGlzdGVuZXJzLFxyXG4gKiBhbmQgaWYgc28gaXQgcmVxdWVzdHMgYSBuZXcgYW5pbWF0aW9uIGZyYW1lIGF0IHRoaXMgcG9pbnQuXHJcbiAqXHJcbiAqIEBwYXJhbSBmbiB7RnVuY3Rpb259IFRoZSBsaXN0ZW5lciBmdW5jdGlvbiB0byBiZSBhZGRlZCBmb3Igb25lIHVwZGF0ZVxyXG4gKiBAcGFyYW0gW2NvbnRleHRdIHtGdW5jdGlvbn0gVGhlIGxpc3RlbmVyIGNvbnRleHRcclxuICogQHJldHVybnMge1BJWEkudGlja2VyLlRpY2tlcn0gdGhpc1xyXG4gKi9cclxuVGlja2VyLnByb3RvdHlwZS5hZGRPbmNlID0gZnVuY3Rpb24gYWRkT25jZShmbiwgY29udGV4dClcclxue1xyXG4gICAgdGhpcy5fZW1pdHRlci5vbmNlKFRJQ0ssIGZuLCBjb250ZXh0KTtcclxuXHJcbiAgICB0aGlzLl9zdGFydElmUG9zc2libGUoKTtcclxuXHJcbiAgICByZXR1cm4gdGhpcztcclxufTtcclxuXHJcbi8qKlxyXG4gKiBDYWxscyB7QGxpbmsgbW9kdWxlOmV2ZW50ZW1pdHRlcjMuRXZlbnRFbWl0dGVyI29mZn0gaW50ZXJuYWxseSBmb3IgJ3RpY2snIGV2ZW50LlxyXG4gKiBJdCBjaGVja3MgaWYgdGhlIGVtaXR0ZXIgaGFzIGxpc3RlbmVycyBmb3IgJ3RpY2snIGV2ZW50LlxyXG4gKiBJZiBpdCBkb2VzLCB0aGVuIGl0IGNhbmNlbHMgdGhlIGFuaW1hdGlvbiBmcmFtZS5cclxuICpcclxuICogQHBhcmFtIFtmbl0ge0Z1bmN0aW9ufSBUaGUgbGlzdGVuZXIgZnVuY3Rpb24gdG8gYmUgcmVtb3ZlZFxyXG4gKiBAcGFyYW0gW2NvbnRleHRdIHtGdW5jdGlvbn0gVGhlIGxpc3RlbmVyIGNvbnRleHQgdG8gYmUgcmVtb3ZlZFxyXG4gKiBAcmV0dXJucyB7UElYSS50aWNrZXIuVGlja2VyfSB0aGlzXHJcbiAqL1xyXG5UaWNrZXIucHJvdG90eXBlLnJlbW92ZSA9IGZ1bmN0aW9uIHJlbW92ZShmbiwgY29udGV4dClcclxue1xyXG4gICAgdGhpcy5fZW1pdHRlci5vZmYoVElDSywgZm4sIGNvbnRleHQpO1xyXG5cclxuICAgIGlmICghdGhpcy5fZW1pdHRlci5saXN0ZW5lcnMoVElDSywgdHJ1ZSkpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5fY2FuY2VsSWZOZWVkZWQoKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGhpcztcclxufTtcclxuXHJcbi8qKlxyXG4gKiBTdGFydHMgdGhlIHRpY2tlci4gSWYgdGhlIHRpY2tlciBoYXMgbGlzdGVuZXJzXHJcbiAqIGEgbmV3IGFuaW1hdGlvbiBmcmFtZSBpcyByZXF1ZXN0ZWQgYXQgdGhpcyBwb2ludC5cclxuICovXHJcblRpY2tlci5wcm90b3R5cGUuc3RhcnQgPSBmdW5jdGlvbiBzdGFydCgpXHJcbntcclxuICAgIGlmICghdGhpcy5zdGFydGVkKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMuc3RhcnRlZCA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5fcmVxdWVzdElmTmVlZGVkKCk7XHJcbiAgICB9XHJcbn07XHJcblxyXG4vKipcclxuICogU3RvcHMgdGhlIHRpY2tlci4gSWYgdGhlIHRpY2tlciBoYXMgcmVxdWVzdGVkXHJcbiAqIGFuIGFuaW1hdGlvbiBmcmFtZSBpdCBpcyBjYW5jZWxlZCBhdCB0aGlzIHBvaW50LlxyXG4gKi9cclxuVGlja2VyLnByb3RvdHlwZS5zdG9wID0gZnVuY3Rpb24gc3RvcCgpXHJcbntcclxuICAgIGlmICh0aGlzLnN0YXJ0ZWQpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5zdGFydGVkID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5fY2FuY2VsSWZOZWVkZWQoKTtcclxuICAgIH1cclxufTtcclxuXHJcbi8qKlxyXG4gKiBUcmlnZ2VycyBhbiB1cGRhdGUuIEFuIHVwZGF0ZSBlbnRhaWxzIHNldHRpbmcgdGhlXHJcbiAqIGN1cnJlbnQge0BsaW5rIFBJWEkudGlja2VyLlRpY2tlciNlbGFwc2VkTVN9LFxyXG4gKiB0aGUgY3VycmVudCB7QGxpbmsgUElYSS50aWNrZXIuVGlja2VyI2RlbHRhVGltZX0sXHJcbiAqIGludm9raW5nIGFsbCBsaXN0ZW5lcnMgd2l0aCBjdXJyZW50IGRlbHRhVGltZSxcclxuICogYW5kIHRoZW4gZmluYWxseSBzZXR0aW5nIHtAbGluayBQSVhJLnRpY2tlci5UaWNrZXIjbGFzdFRpbWV9XHJcbiAqIHdpdGggdGhlIHZhbHVlIG9mIGN1cnJlbnRUaW1lIHRoYXQgd2FzIHByb3ZpZGVkLlxyXG4gKiBUaGlzIG1ldGhvZCB3aWxsIGJlIGNhbGxlZCBhdXRvbWF0aWNhbGx5IGJ5IGFuaW1hdGlvblxyXG4gKiBmcmFtZSBjYWxsYmFja3MgaWYgdGhlIHRpY2tlciBpbnN0YW5jZSBoYXMgYmVlbiBzdGFydGVkXHJcbiAqIGFuZCBsaXN0ZW5lcnMgYXJlIGFkZGVkLlxyXG4gKlxyXG4gKiBAcGFyYW0gW2N1cnJlbnRUaW1lPXBlcmZvcm1hbmNlLm5vdygpXSB7RE9NSGlnaFJlc1RpbWVTdGFtcHxudW1iZXJ9IHRoZSBjdXJyZW50IHRpbWUgb2YgZXhlY3V0aW9uXHJcbiAqL1xyXG5UaWNrZXIucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uIHVwZGF0ZShjdXJyZW50VGltZSlcclxue1xyXG4gICAgdmFyIGVsYXBzZWRNUztcclxuXHJcbiAgICAvLyBBbGxvdyBjYWxsaW5nIHVwZGF0ZSBkaXJlY3RseSB3aXRoIGRlZmF1bHQgY3VycmVudFRpbWUuXHJcbiAgICBjdXJyZW50VGltZSA9IGN1cnJlbnRUaW1lIHx8IHBlcmZvcm1hbmNlLm5vdygpO1xyXG4gICAgLy8gU2F2ZSB1bmNhcHBlZCBlbGFwc2VkTVMgZm9yIG1lYXN1cmVtZW50XHJcbiAgICBlbGFwc2VkTVMgPSB0aGlzLmVsYXBzZWRNUyA9IGN1cnJlbnRUaW1lIC0gdGhpcy5sYXN0VGltZTtcclxuXHJcbiAgICAvLyBjYXAgdGhlIG1pbGxpc2Vjb25kcyBlbGFwc2VkIHVzZWQgZm9yIGRlbHRhVGltZVxyXG4gICAgaWYgKGVsYXBzZWRNUyA+IHRoaXMuX21heEVsYXBzZWRNUylcclxuICAgIHtcclxuICAgICAgICBlbGFwc2VkTVMgPSB0aGlzLl9tYXhFbGFwc2VkTVM7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5kZWx0YVRpbWUgPSBlbGFwc2VkTVMgKiBDT05TVC5UQVJHRVRfRlBNUyAqIHRoaXMuc3BlZWQ7XHJcblxyXG4gICAgLy8gSW52b2tlIGxpc3RlbmVycyBhZGRlZCB0byBpbnRlcm5hbCBlbWl0dGVyXHJcbiAgICB0aGlzLl9lbWl0dGVyLmVtaXQoVElDSywgdGhpcy5kZWx0YVRpbWUpO1xyXG5cclxuICAgIHRoaXMubGFzdFRpbWUgPSBjdXJyZW50VGltZTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gVGlja2VyO1xyXG4iLCJ2YXIgVGlja2VyID0gcmVxdWlyZSgnLi9UaWNrZXInKTtcclxuXHJcbi8qKlxyXG4gKiBUaGUgc2hhcmVkIHRpY2tlciBpbnN0YW5jZSB1c2VkIGJ5IHtAbGluayBQSVhJLmV4dHJhcy5Nb3ZpZUNsaXB9LlxyXG4gKiBhbmQgYnkge0BsaW5rIFBJWEkuaW50ZXJhY3Rpb24uSW50ZXJhY3Rpb25NYW5hZ2VyfS5cclxuICogVGhlIHByb3BlcnR5IHtAbGluayBQSVhJLnRpY2tlci5UaWNrZXIjYXV0b1N0YXJ0fSBpcyBzZXQgdG8gYHRydWVgXHJcbiAqIGZvciB0aGlzIGluc3RhbmNlLiBQbGVhc2UgZm9sbG93IHRoZSBleGFtcGxlcyBmb3IgdXNhZ2UsIGluY2x1ZGluZ1xyXG4gKiBob3cgdG8gb3B0LW91dCBvZiBhdXRvLXN0YXJ0aW5nIHRoZSBzaGFyZWQgdGlja2VyLlxyXG4gKlxyXG4gKiBAZXhhbXBsZVxyXG4gKiB2YXIgdGlja2VyID0gUElYSS50aWNrZXIuc2hhcmVkO1xyXG4gKiAvLyBTZXQgdGhpcyB0byBwcmV2ZW50IHN0YXJ0aW5nIHRoaXMgdGlja2VyIHdoZW4gbGlzdGVuZXJzIGFyZSBhZGRlZC5cclxuICogLy8gQnkgZGVmYXVsdCB0aGlzIGlzIHRydWUgb25seSBmb3IgdGhlIFBJWEkudGlja2VyLnNoYXJlZCBpbnN0YW5jZS5cclxuICogdGlja2VyLmF1dG9TdGFydCA9IGZhbHNlO1xyXG4gKiAvLyBGWUksIGNhbGwgdGhpcyB0byBlbnN1cmUgdGhlIHRpY2tlciBpcyBzdG9wcGVkLiBJdCBzaG91bGQgYmUgc3RvcHBlZFxyXG4gKiAvLyBpZiB5b3UgaGF2ZSBub3QgYXR0ZW1wdGVkIHRvIHJlbmRlciBhbnl0aGluZyB5ZXQuXHJcbiAqIHRpY2tlci5zdG9wKCk7XHJcbiAqIC8vIENhbGwgdGhpcyB3aGVuIHlvdSBhcmUgcmVhZHkgZm9yIGEgcnVubmluZyBzaGFyZWQgdGlja2VyLlxyXG4gKiB0aWNrZXIuc3RhcnQoKTtcclxuICpcclxuICogQGV4YW1wbGVcclxuICogLy8gWW91IG1heSB1c2UgdGhlIHNoYXJlZCB0aWNrZXIgdG8gcmVuZGVyLi4uXHJcbiAqIHZhciByZW5kZXJlciA9IFBJWEkuYXV0b0RldGVjdFJlbmRlcmVyKDgwMCwgNjAwKTtcclxuICogdmFyIHN0YWdlID0gbmV3IFBJWEkuQ29udGFpbmVyKCk7XHJcbiAqIHZhciBpbnRlcmFjdGlvbk1hbmFnZXIgPSBQSVhJLmludGVyYWN0aW9uLkludGVyYWN0aW9uTWFuYWdlcihyZW5kZXJlcik7XHJcbiAqIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQocmVuZGVyZXIudmlldyk7XHJcbiAqIHRpY2tlci5hZGQoZnVuY3Rpb24gKHRpbWUpIHtcclxuICogICAgIHJlbmRlcmVyLnJlbmRlcihzdGFnZSk7XHJcbiAqIH0pO1xyXG4gKlxyXG4gKiBAZXhhbXBsZVxyXG4gKiAvLyBPciB5b3UgY2FuIGp1c3QgdXBkYXRlIGl0IG1hbnVhbGx5LlxyXG4gKiB0aWNrZXIuYXV0b1N0YXJ0ID0gZmFsc2U7XHJcbiAqIHRpY2tlci5zdG9wKCk7XHJcbiAqIGZ1bmN0aW9uIGFuaW1hdGUodGltZSkge1xyXG4gKiAgICAgdGlja2VyLnVwZGF0ZSh0aW1lKTtcclxuICogICAgIHJlbmRlcmVyLnJlbmRlcihzdGFnZSk7XHJcbiAqICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoYW5pbWF0ZSk7XHJcbiAqIH1cclxuICogYW5pbWF0ZShwZXJmb3JtYW5jZS5ub3coKSk7XHJcbiAqXHJcbiAqIEB0eXBlIHtQSVhJLnRpY2tlci5UaWNrZXJ9XHJcbiAqIEBtZW1iZXJvZiBQSVhJLnRpY2tlclxyXG4gKi9cclxudmFyIHNoYXJlZCA9IG5ldyBUaWNrZXIoKTtcclxuc2hhcmVkLmF1dG9TdGFydCA9IHRydWU7XHJcblxyXG4vKipcclxuICogQG5hbWVzcGFjZSBQSVhJLnRpY2tlclxyXG4gKi9cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgICBzaGFyZWQ6IHNoYXJlZCxcclxuICAgIFRpY2tlcjogVGlja2VyXHJcbn07XHJcbiIsInZhciBDT05TVCA9IHJlcXVpcmUoJy4uL2NvbnN0Jyk7XHJcblxyXG4vKipcclxuICogQG5hbWVzcGFjZSBQSVhJLnV0aWxzXHJcbiAqL1xyXG52YXIgdXRpbHMgPSBtb2R1bGUuZXhwb3J0cyA9IHtcclxuICAgIF91aWQ6IDAsXHJcbiAgICBfc2FpZEhlbGxvOiBmYWxzZSxcclxuXHJcbiAgICBFdmVudEVtaXR0ZXI6ICAgcmVxdWlyZSgnZXZlbnRlbWl0dGVyMycpLFxyXG4gICAgcGx1Z2luVGFyZ2V0OiAgIHJlcXVpcmUoJy4vcGx1Z2luVGFyZ2V0JyksXHJcbiAgICBhc3luYzogICAgICAgICAgcmVxdWlyZSgnYXN5bmMnKSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIEdldHMgdGhlIG5leHQgdW5pcXVlIGlkZW50aWZpZXJcclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJuIHtudW1iZXJ9IFRoZSBuZXh0IHVuaXF1ZSBpZGVudGlmaWVyIHRvIHVzZS5cclxuICAgICAqL1xyXG4gICAgdWlkOiBmdW5jdGlvbiAoKVxyXG4gICAge1xyXG4gICAgICAgIHJldHVybiArK3V0aWxzLl91aWQ7XHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ29udmVydHMgYSBoZXggY29sb3IgbnVtYmVyIHRvIGFuIFtSLCBHLCBCXSBhcnJheVxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSBoZXgge251bWJlcn1cclxuICAgICAqIEBwYXJhbSAge251bWJlcltdfSBbb3V0PVtdXVxyXG4gICAgICogQHJldHVybiB7bnVtYmVyW119IEFuIGFycmF5IHJlcHJlc2VudGluZyB0aGUgW1IsIEcsIEJdIG9mIHRoZSBjb2xvci5cclxuICAgICAqL1xyXG4gICAgaGV4MnJnYjogZnVuY3Rpb24gKGhleCwgb3V0KVxyXG4gICAge1xyXG4gICAgICAgIG91dCA9IG91dCB8fCBbXTtcclxuXHJcbiAgICAgICAgb3V0WzBdID0gKGhleCA+PiAxNiAmIDB4RkYpIC8gMjU1O1xyXG4gICAgICAgIG91dFsxXSA9IChoZXggPj4gOCAmIDB4RkYpIC8gMjU1O1xyXG4gICAgICAgIG91dFsyXSA9IChoZXggJiAweEZGKSAvIDI1NTtcclxuXHJcbiAgICAgICAgcmV0dXJuIG91dDtcclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDb252ZXJ0cyBhIGhleCBjb2xvciBudW1iZXIgdG8gYSBzdHJpbmcuXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIGhleCB7bnVtYmVyfVxyXG4gICAgICogQHJldHVybiB7c3RyaW5nfSBUaGUgc3RyaW5nIGNvbG9yLlxyXG4gICAgICovXHJcbiAgICBoZXgyc3RyaW5nOiBmdW5jdGlvbiAoaGV4KVxyXG4gICAge1xyXG4gICAgICAgIGhleCA9IGhleC50b1N0cmluZygxNik7XHJcbiAgICAgICAgaGV4ID0gJzAwMDAwMCcuc3Vic3RyKDAsIDYgLSBoZXgubGVuZ3RoKSArIGhleDtcclxuXHJcbiAgICAgICAgcmV0dXJuICcjJyArIGhleDtcclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDb252ZXJ0cyBhIGNvbG9yIGFzIGFuIFtSLCBHLCBCXSBhcnJheSB0byBhIGhleCBudW1iZXJcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gcmdiIHtudW1iZXJbXX1cclxuICAgICAqIEByZXR1cm4ge251bWJlcn0gVGhlIGNvbG9yIG51bWJlclxyXG4gICAgICovXHJcbiAgICByZ2IyaGV4OiBmdW5jdGlvbiAocmdiKVxyXG4gICAge1xyXG4gICAgICAgIHJldHVybiAoKHJnYlswXSoyNTUgPDwgMTYpICsgKHJnYlsxXSoyNTUgPDwgOCkgKyByZ2JbMl0qMjU1KTtcclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDaGVja3Mgd2hldGhlciB0aGUgQ2FudmFzIEJsZW5kTW9kZXMgYXJlIHN1cHBvcnRlZCBieSB0aGUgY3VycmVudCBicm93c2VyXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybiB7Ym9vbGVhbn0gd2hldGhlciB0aGV5IGFyZSBzdXBwb3J0ZWRcclxuICAgICAqL1xyXG4gICAgY2FuVXNlTmV3Q2FudmFzQmxlbmRNb2RlczogZnVuY3Rpb24gKClcclxuICAgIHtcclxuICAgICAgICBpZiAodHlwZW9mIGRvY3VtZW50ID09PSAndW5kZWZpbmVkJylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciBwbmdIZWFkID0gJ2RhdGE6aW1hZ2UvcG5nO2Jhc2U2NCxpVkJPUncwS0dnb0FBQUFOU1VoRVVnQUFBQVFBQUFBQkFRTUFBQUREOHAyT0FBQUFBMUJNVkVYLyc7XHJcbiAgICAgICAgdmFyIHBuZ0VuZCA9ICdBQUFBQ2tsRVFWUUkxMk5nQUFBQUFnQUI0aUc4TXdBQUFBQkpSVTVFcmtKZ2dnPT0nO1xyXG5cclxuICAgICAgICB2YXIgbWFnZW50YSA9IG5ldyBJbWFnZSgpO1xyXG4gICAgICAgIG1hZ2VudGEuc3JjID0gcG5nSGVhZCArICdBUDgwNE9hNicgKyBwbmdFbmQ7XHJcblxyXG4gICAgICAgIHZhciB5ZWxsb3cgPSBuZXcgSW1hZ2UoKTtcclxuICAgICAgICB5ZWxsb3cuc3JjID0gcG5nSGVhZCArICcvd0NLeHZSRicgKyBwbmdFbmQ7XHJcblxyXG4gICAgICAgIHZhciBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcclxuICAgICAgICBjYW52YXMud2lkdGggPSA2O1xyXG4gICAgICAgIGNhbnZhcy5oZWlnaHQgPSAxO1xyXG5cclxuICAgICAgICB2YXIgY29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xyXG4gICAgICAgIGNvbnRleHQuZ2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uID0gJ211bHRpcGx5JztcclxuICAgICAgICBjb250ZXh0LmRyYXdJbWFnZShtYWdlbnRhLCAwLCAwKTtcclxuICAgICAgICBjb250ZXh0LmRyYXdJbWFnZSh5ZWxsb3csIDIsIDApO1xyXG5cclxuICAgICAgICB2YXIgZGF0YSA9IGNvbnRleHQuZ2V0SW1hZ2VEYXRhKDIsMCwxLDEpLmRhdGE7XHJcblxyXG4gICAgICAgIHJldHVybiAoZGF0YVswXSA9PT0gMjU1ICYmIGRhdGFbMV0gPT09IDAgJiYgZGF0YVsyXSA9PT0gMCk7XHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2l2ZW4gYSBudW1iZXIsIHRoaXMgZnVuY3Rpb24gcmV0dXJucyB0aGUgY2xvc2VzdCBudW1iZXIgdGhhdCBpcyBhIHBvd2VyIG9mIHR3b1xyXG4gICAgICogdGhpcyBmdW5jdGlvbiBpcyB0YWtlbiBmcm9tIFN0YXJsaW5nIEZyYW1ld29yayBhcyBpdHMgcHJldHR5IG5lYXQgOylcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gbnVtYmVyIHtudW1iZXJ9XHJcbiAgICAgKiBAcmV0dXJuIHtudW1iZXJ9IHRoZSBjbG9zZXN0IG51bWJlciB0aGF0IGlzIGEgcG93ZXIgb2YgdHdvXHJcbiAgICAgKi9cclxuICAgIGdldE5leHRQb3dlck9mVHdvOiBmdW5jdGlvbiAobnVtYmVyKVxyXG4gICAge1xyXG4gICAgICAgIC8vIHNlZTogaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9Qb3dlcl9vZl90d28jRmFzdF9hbGdvcml0aG1fdG9fY2hlY2tfaWZfYV9wb3NpdGl2ZV9udW1iZXJfaXNfYV9wb3dlcl9vZl90d29cclxuICAgICAgICBpZiAobnVtYmVyID4gMCAmJiAobnVtYmVyICYgKG51bWJlciAtIDEpKSA9PT0gMClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVybiBudW1iZXI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSAxO1xyXG5cclxuICAgICAgICAgICAgd2hpbGUgKHJlc3VsdCA8IG51bWJlcilcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0IDw8PSAxO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBjaGVja3MgaWYgdGhlIGdpdmVuIHdpZHRoIGFuZCBoZWlnaHQgbWFrZSBhIHBvd2VyIG9mIHR3byByZWN0YW5nbGVcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gd2lkdGgge251bWJlcn1cclxuICAgICAqIEBwYXJhbSBoZWlnaHQge251bWJlcn1cclxuICAgICAqIEByZXR1cm4ge2Jvb2xlYW59XHJcbiAgICAgKi9cclxuICAgIGlzUG93ZXJPZlR3bzogZnVuY3Rpb24gKHdpZHRoLCBoZWlnaHQpXHJcbiAgICB7XHJcbiAgICAgICAgcmV0dXJuICh3aWR0aCA+IDAgJiYgKHdpZHRoICYgKHdpZHRoIC0gMSkpID09PSAwICYmIGhlaWdodCA+IDAgJiYgKGhlaWdodCAmIChoZWlnaHQgLSAxKSkgPT09IDApO1xyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIGdldCB0aGUgcmVzb2x1dGlvbiBvZiBhbiBhc3NldCBieSBsb29raW5nIGZvciB0aGUgcHJlZml4XHJcbiAgICAgKiB1c2VkIGJ5IHNwcml0ZXNoZWV0cyBhbmQgaW1hZ2UgdXJsc1xyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB1cmwge3N0cmluZ30gdGhlIGltYWdlIHBhdGhcclxuICAgICAqIEByZXR1cm4ge251bWJlcn1cclxuICAgICAqL1xyXG4gICAgZ2V0UmVzb2x1dGlvbk9mVXJsOiBmdW5jdGlvbiAodXJsKVxyXG4gICAge1xyXG4gICAgICAgIHZhciByZXNvbHV0aW9uID0gQ09OU1QuUkVUSU5BX1BSRUZJWC5leGVjKHVybCk7XHJcblxyXG4gICAgICAgIGlmIChyZXNvbHV0aW9uKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICByZXR1cm4gcGFyc2VGbG9hdChyZXNvbHV0aW9uWzFdKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiAxO1xyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIExvZ3Mgb3V0IHRoZSB2ZXJzaW9uIGFuZCByZW5kZXJlciBpbmZvcm1hdGlvbiBmb3IgdGhpcyBydW5uaW5nIGluc3RhbmNlIG9mIFBJWEkuXHJcbiAgICAgKiBJZiB5b3UgZG9uJ3Qgd2FudCB0byBzZWUgdGhpcyBtZXNzYWdlIHlvdSBjYW4gc2V0IGBQSVhJLnV0aWxzLl9zYWlkSGVsbG8gPSB0cnVlO2BcclxuICAgICAqIHNvIHRoZSBsaWJyYXJ5IHRoaW5rcyBpdCBhbHJlYWR5IHNhaWQgaXQuIEtlZXAgaW4gbWluZCB0aGF0IGRvaW5nIHRoYXQgd2lsbCBmb3JldmVyXHJcbiAgICAgKiBtYWtlcyB5b3UgYSBqZXJrIGZhY2UuXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHR5cGUgLSBUaGUgc3RyaW5nIHJlbmRlcmVyIHR5cGUgdG8gbG9nLlxyXG4gICAgICogQGNvbnN0YW50XHJcbiAgICAgKiBAc3RhdGljXHJcbiAgICAgKi9cclxuICAgIHNheUhlbGxvOiBmdW5jdGlvbiAodHlwZSlcclxuICAgIHtcclxuICAgICAgICBpZiAodXRpbHMuX3NhaWRIZWxsbylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChuYXZpZ2F0b3IudXNlckFnZW50LnRvTG93ZXJDYXNlKCkuaW5kZXhPZignY2hyb21lJykgPiAtMSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHZhciBhcmdzID0gW1xyXG4gICAgICAgICAgICAgICAgJ1xcbiAlYyAlYyAlYyBQaXhpLmpzICcgKyBDT05TVC5WRVJTSU9OICsgJyAtIOKcsCAnICsgdHlwZSArICcg4pywICAlYyAnICsgJyAlYyAnICsgJyBodHRwOi8vd3d3LnBpeGlqcy5jb20vICAlYyAlYyDimaUlY+KZpSVj4pmlIFxcblxcbicsXHJcbiAgICAgICAgICAgICAgICAnYmFja2dyb3VuZDogI2ZmNjZhNTsgcGFkZGluZzo1cHggMDsnLFxyXG4gICAgICAgICAgICAgICAgJ2JhY2tncm91bmQ6ICNmZjY2YTU7IHBhZGRpbmc6NXB4IDA7JyxcclxuICAgICAgICAgICAgICAgICdjb2xvcjogI2ZmNjZhNTsgYmFja2dyb3VuZDogIzAzMDMwNzsgcGFkZGluZzo1cHggMDsnLFxyXG4gICAgICAgICAgICAgICAgJ2JhY2tncm91bmQ6ICNmZjY2YTU7IHBhZGRpbmc6NXB4IDA7JyxcclxuICAgICAgICAgICAgICAgICdiYWNrZ3JvdW5kOiAjZmZjM2RjOyBwYWRkaW5nOjVweCAwOycsXHJcbiAgICAgICAgICAgICAgICAnYmFja2dyb3VuZDogI2ZmNjZhNTsgcGFkZGluZzo1cHggMDsnLFxyXG4gICAgICAgICAgICAgICAgJ2NvbG9yOiAjZmYyNDI0OyBiYWNrZ3JvdW5kOiAjZmZmOyBwYWRkaW5nOjVweCAwOycsXHJcbiAgICAgICAgICAgICAgICAnY29sb3I6ICNmZjI0MjQ7IGJhY2tncm91bmQ6ICNmZmY7IHBhZGRpbmc6NXB4IDA7JyxcclxuICAgICAgICAgICAgICAgICdjb2xvcjogI2ZmMjQyNDsgYmFja2dyb3VuZDogI2ZmZjsgcGFkZGluZzo1cHggMDsnXHJcbiAgICAgICAgICAgIF07XHJcblxyXG4gICAgICAgICAgICB3aW5kb3cuY29uc29sZS5sb2cuYXBwbHkoY29uc29sZSwgYXJncyk7IC8vanNoaW50IGlnbm9yZTpsaW5lXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKHdpbmRvdy5jb25zb2xlKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgd2luZG93LmNvbnNvbGUubG9nKCdQaXhpLmpzICcgKyBDT05TVC5WRVJTSU9OICsgJyAtICcgKyB0eXBlICsgJyAtIGh0dHA6Ly93d3cucGl4aWpzLmNvbS8nKTsgLy9qc2hpbnQgaWdub3JlOmxpbmVcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHV0aWxzLl9zYWlkSGVsbG8gPSB0cnVlO1xyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIEhlbHBlciBmb3IgY2hlY2tpbmcgZm9yIHdlYmdsIHN1cHBvcnRcclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJuIHtib29sZWFufVxyXG4gICAgICovXHJcbiAgICBpc1dlYkdMU3VwcG9ydGVkOiBmdW5jdGlvbiAoKVxyXG4gICAge1xyXG4gICAgICAgIHZhciBjb250ZXh0T3B0aW9ucyA9IHsgc3RlbmNpbDogdHJ1ZSB9O1xyXG4gICAgICAgIHRyeVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKCF3aW5kb3cuV2ViR0xSZW5kZXJpbmdDb250ZXh0KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHZhciBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKSxcclxuICAgICAgICAgICAgICAgIGdsID0gY2FudmFzLmdldENvbnRleHQoJ3dlYmdsJywgY29udGV4dE9wdGlvbnMpIHx8IGNhbnZhcy5nZXRDb250ZXh0KCdleHBlcmltZW50YWwtd2ViZ2wnLCBjb250ZXh0T3B0aW9ucyk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gISEoZ2wgJiYgZ2wuZ2V0Q29udGV4dEF0dHJpYnV0ZXMoKS5zdGVuY2lsKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY2F0Y2ggKGUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgc2lnbiBvZiBudW1iZXJcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gbiB7bnVtYmVyfVxyXG4gICAgICogQHJldHVybnMge251bWJlcn0gMCBpZiBuIGlzIDAsIC0xIGlmIG4gaXMgbmVnYXRpdmUsIDEgaWYgbiBpIHBvc2l0aXZlXHJcbiAgICAgKi9cclxuICAgIHNpZ246IGZ1bmN0aW9uIChuKSB7XHJcbiAgICAgICAgcmV0dXJuIG4gPyAobiA8IDAgPyAtMSA6IDEpIDogMDtcclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAdG9kbyBEZXNjcmliZSBwcm9wZXJ0eSB1c2FnZVxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgVGV4dHVyZUNhY2hlOiB7fSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIEB0b2RvIERlc2NyaWJlIHByb3BlcnR5IHVzYWdlXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBCYXNlVGV4dHVyZUNhY2hlOiB7fVxyXG59O1xyXG4iLCIvKipcclxuICogTWl4aW5zIGZ1bmN0aW9uYWxpdHkgdG8gbWFrZSBhbiBvYmplY3QgaGF2ZSBcInBsdWdpbnNcIi5cclxuICpcclxuICogQG1peGluXHJcbiAqIEBtZW1iZXJvZiBQSVhJLnV0aWxzXHJcbiAqIEBwYXJhbSBvYmoge29iamVjdH0gVGhlIG9iamVjdCB0byBtaXggaW50by5cclxuICogQGV4YW1wbGVcclxuICogICAgICBmdW5jdGlvbiBNeU9iamVjdCgpIHt9XHJcbiAqXHJcbiAqICAgICAgcGx1Z2luVGFyZ2V0Lm1peGluKE15T2JqZWN0KTtcclxuICovXHJcbmZ1bmN0aW9uIHBsdWdpblRhcmdldChvYmopXHJcbntcclxuICAgIG9iai5fX3BsdWdpbnMgPSB7fTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEFkZHMgYSBwbHVnaW4gdG8gYW4gb2JqZWN0XHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHBsdWdpbk5hbWUge3N0cmluZ30gVGhlIGV2ZW50cyB0aGF0IHNob3VsZCBiZSBsaXN0ZWQuXHJcbiAgICAgKiBAcGFyYW0gY3RvciB7RnVuY3Rpb259IFRoZSBjb25zdHJ1Y3RvciBmdW5jdGlvbiBmb3IgdGhlIHBsdWdpbi5cclxuICAgICAqL1xyXG4gICAgb2JqLnJlZ2lzdGVyUGx1Z2luID0gZnVuY3Rpb24gKHBsdWdpbk5hbWUsIGN0b3IpXHJcbiAgICB7XHJcbiAgICAgICAgb2JqLl9fcGx1Z2luc1twbHVnaW5OYW1lXSA9IGN0b3I7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogSW5zdGFudGlhdGVzIGFsbCB0aGUgcGx1Z2lucyBvZiB0aGlzIG9iamVjdFxyXG4gICAgICpcclxuICAgICAqL1xyXG4gICAgb2JqLnByb3RvdHlwZS5pbml0UGx1Z2lucyA9IGZ1bmN0aW9uICgpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5wbHVnaW5zID0gdGhpcy5wbHVnaW5zIHx8IHt9O1xyXG5cclxuICAgICAgICBmb3IgKHZhciBvIGluIG9iai5fX3BsdWdpbnMpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnBsdWdpbnNbb10gPSBuZXcgKG9iai5fX3BsdWdpbnNbb10pKHRoaXMpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZW1vdmVzIGFsbCB0aGUgcGx1Z2lucyBvZiB0aGlzIG9iamVjdFxyXG4gICAgICpcclxuICAgICAqL1xyXG4gICAgb2JqLnByb3RvdHlwZS5kZXN0cm95UGx1Z2lucyA9IGZ1bmN0aW9uICgpXHJcbiAgICB7XHJcbiAgICAgICAgZm9yICh2YXIgbyBpbiB0aGlzLnBsdWdpbnMpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnBsdWdpbnNbb10uZGVzdHJveSgpO1xyXG4gICAgICAgICAgICB0aGlzLnBsdWdpbnNbb10gPSBudWxsO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5wbHVnaW5zID0gbnVsbDtcclxuICAgIH07XHJcbn1cclxuXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICAgIC8qKlxyXG4gICAgICogTWl4ZXMgaW4gdGhlIHByb3BlcnRpZXMgb2YgdGhlIHBsdWdpblRhcmdldCBpbnRvIGFub3RoZXIgb2JqZWN0XHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIG9iamVjdCB7b2JqZWN0fSBUaGUgb2JqIHRvIG1peCBpbnRvXHJcbiAgICAgKi9cclxuICAgIG1peGluOiBmdW5jdGlvbiBtaXhpbihvYmopXHJcbiAgICB7XHJcbiAgICAgICAgcGx1Z2luVGFyZ2V0KG9iaik7XHJcbiAgICB9XHJcbn07XHJcbiIsIi8vIHJ1biB0aGUgcG9seWZpbGxzXHJcbnJlcXVpcmUoJy4vcG9seWZpbGwnKTtcclxuXHJcbnZhciBjb3JlID0gbW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL2NvcmUnKTtcclxuXHJcbi8vIGFkZCBjb3JlIHBsdWdpbnMuXHJcbmNvcmUuZXh0cmFzICAgICAgICAgPSByZXF1aXJlKCcuL2V4dHJhcycpO1xyXG5jb3JlLmZpbHRlcnMgICAgICAgID0gcmVxdWlyZSgnLi9maWx0ZXJzJyk7XHJcbmNvcmUuaW50ZXJhY3Rpb24gICAgPSByZXF1aXJlKCcuL2ludGVyYWN0aW9uJyk7XHJcbmNvcmUubG9hZGVycyAgICAgICAgPSByZXF1aXJlKCcuL2xvYWRlcnMnKTtcclxuY29yZS5tZXNoICAgICAgICAgICA9IHJlcXVpcmUoJy4vbWVzaCcpO1xyXG5cclxuLy8gZXhwb3J0IGEgcHJlbWFkZSBsb2FkZXIgaW5zdGFuY2VcclxuLyoqXHJcbiAqIEEgcHJlbWFkZSBpbnN0YW5jZSBvZiB0aGUgbG9hZGVyIHRoYXQgY2FuIGJlIHVzZWQgdG8gbG9hZGVyIHJlc291cmNlcy5cclxuICpcclxuICogQG5hbWUgbG9hZGVyXHJcbiAqIEBtZW1iZXJvZiBQSVhJXHJcbiAqIEBwcm9wZXJ0eSB7UElYSS5sb2FkZXJzLkxvYWRlcn1cclxuICovXHJcbi8vY29yZS5sb2FkZXIgPSBuZXcgY29yZS5sb2FkZXJzLkxvYWRlcigpO1xyXG5cclxuLy8gbWl4aW4gdGhlIGRlcHJlY2F0aW9uIGZlYXR1cmVzLlxyXG4vL09iamVjdC5hc3NpZ24oY29yZSwgcmVxdWlyZSgnLi9kZXByZWNhdGlvbicpKTtcclxuXHJcbi8vIEFsd2F5cyBleHBvcnQgcGl4aSBnbG9iYWxseS5cclxuZ2xvYmFsLlBJWEkgPSBjb3JlO1xyXG4iLCJ2YXIgY29yZSA9IHJlcXVpcmUoJy4uL2NvcmUnKTtcclxuXHJcbi8qKlxyXG4gKiBIb2xkcyBhbGwgaW5mb3JtYXRpb24gcmVsYXRlZCB0byBhbiBJbnRlcmFjdGlvbiBldmVudFxyXG4gKlxyXG4gKiBAY2xhc3NcclxuICogQG1lbWJlcm9mIFBJWEkuaW50ZXJhY3Rpb25cclxuICovXHJcbmZ1bmN0aW9uIEludGVyYWN0aW9uRGF0YSgpXHJcbntcclxuICAgIC8qKlxyXG4gICAgICogVGhpcyBwb2ludCBzdG9yZXMgdGhlIGdsb2JhbCBjb29yZHMgb2Ygd2hlcmUgdGhlIHRvdWNoL21vdXNlIGV2ZW50IGhhcHBlbmVkXHJcbiAgICAgKlxyXG4gICAgICogQG1lbWJlciB7UElYSS5Qb2ludH1cclxuICAgICAqL1xyXG4gICAgdGhpcy5nbG9iYWwgPSBuZXcgY29yZS5Qb2ludCgpO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogVGhlIHRhcmdldCBTcHJpdGUgdGhhdCB3YXMgaW50ZXJhY3RlZCB3aXRoXHJcbiAgICAgKlxyXG4gICAgICogQG1lbWJlciB7UElYSS5TcHJpdGV9XHJcbiAgICAgKi9cclxuICAgIHRoaXMudGFyZ2V0ID0gbnVsbDtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFdoZW4gcGFzc2VkIHRvIGFuIGV2ZW50IGhhbmRsZXIsIHRoaXMgd2lsbCBiZSB0aGUgb3JpZ2luYWwgRE9NIEV2ZW50IHRoYXQgd2FzIGNhcHR1cmVkXHJcbiAgICAgKlxyXG4gICAgICogQG1lbWJlciB7RXZlbnR9XHJcbiAgICAgKi9cclxuICAgIHRoaXMub3JpZ2luYWxFdmVudCA9IG51bGw7XHJcbn1cclxuXHJcbkludGVyYWN0aW9uRGF0YS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBJbnRlcmFjdGlvbkRhdGE7XHJcbm1vZHVsZS5leHBvcnRzID0gSW50ZXJhY3Rpb25EYXRhO1xyXG5cclxuLyoqXHJcbiAqIFRoaXMgd2lsbCByZXR1cm4gdGhlIGxvY2FsIGNvb3JkaW5hdGVzIG9mIHRoZSBzcGVjaWZpZWQgZGlzcGxheU9iamVjdCBmb3IgdGhpcyBJbnRlcmFjdGlvbkRhdGFcclxuICpcclxuICogQHBhcmFtIGRpc3BsYXlPYmplY3Qge1BJWEkuRGlzcGxheU9iamVjdH0gVGhlIERpc3BsYXlPYmplY3QgdGhhdCB5b3Ugd291bGQgbGlrZSB0aGUgbG9jYWwgY29vcmRzIG9mZlxyXG4gKiBAcGFyYW0gW3BvaW50XSB7UElYSS5Qb2ludH0gQSBQb2ludCBvYmplY3QgaW4gd2hpY2ggdG8gc3RvcmUgdGhlIHZhbHVlLCBvcHRpb25hbCAob3RoZXJ3aXNlIHdpbGwgY3JlYXRlIGEgbmV3IHBvaW50KVxyXG4gKiBwYXJhbSBbZ2xvYmFsUG9zXSB7UElYSS5Qb2ludH0gQSBQb2ludCBvYmplY3QgY29udGFpbmluZyB5b3VyIGN1c3RvbSBnbG9iYWwgY29vcmRzLCBvcHRpb25hbCAob3RoZXJ3aXNlIHdpbGwgdXNlIHRoZSBjdXJyZW50IGdsb2JhbCBjb29yZHMpXHJcbiAqIEByZXR1cm4ge1BJWEkuUG9pbnR9IEEgcG9pbnQgY29udGFpbmluZyB0aGUgY29vcmRpbmF0ZXMgb2YgdGhlIEludGVyYWN0aW9uRGF0YSBwb3NpdGlvbiByZWxhdGl2ZSB0byB0aGUgRGlzcGxheU9iamVjdFxyXG4gKi9cclxuSW50ZXJhY3Rpb25EYXRhLnByb3RvdHlwZS5nZXRMb2NhbFBvc2l0aW9uID0gZnVuY3Rpb24gKGRpc3BsYXlPYmplY3QsIHBvaW50LCBnbG9iYWxQb3MpXHJcbntcclxuICAgIHJldHVybiBkaXNwbGF5T2JqZWN0LnRvTG9jYWwoZ2xvYmFsUG9zID8gZ2xvYmFsUG9zIDogdGhpcy5nbG9iYWwsIHBvaW50KTtcclxufTtcclxuIiwidmFyIGNvcmUgPSByZXF1aXJlKCcuLi9jb3JlJyksXHJcbiAgICBJbnRlcmFjdGlvbkRhdGEgPSByZXF1aXJlKCcuL0ludGVyYWN0aW9uRGF0YScpO1xyXG5cclxuLy8gTWl4IGludGVyYWN0aXZlVGFyZ2V0IGludG8gY29yZS5EaXNwbGF5T2JqZWN0LnByb3RvdHlwZVxyXG5PYmplY3QuYXNzaWduKFxyXG4gICAgY29yZS5EaXNwbGF5T2JqZWN0LnByb3RvdHlwZSxcclxuICAgIHJlcXVpcmUoJy4vaW50ZXJhY3RpdmVUYXJnZXQnKVxyXG4pO1xyXG5cclxuLyoqXHJcbiAqIFRoZSBpbnRlcmFjdGlvbiBtYW5hZ2VyIGRlYWxzIHdpdGggbW91c2UgYW5kIHRvdWNoIGV2ZW50cy4gQW55IERpc3BsYXlPYmplY3QgY2FuIGJlIGludGVyYWN0aXZlXHJcbiAqIGlmIGl0cyBpbnRlcmFjdGl2ZSBwYXJhbWV0ZXIgaXMgc2V0IHRvIHRydWVcclxuICogVGhpcyBtYW5hZ2VyIGFsc28gc3VwcG9ydHMgbXVsdGl0b3VjaC5cclxuICpcclxuICogQGNsYXNzXHJcbiAqIEBtZW1iZXJvZiBQSVhJLmludGVyYWN0aW9uXHJcbiAqIEBwYXJhbSByZW5kZXJlciB7UElYSS5DYW52YXNSZW5kZXJlcnxQSVhJLldlYkdMUmVuZGVyZXJ9IEEgcmVmZXJlbmNlIHRvIHRoZSBjdXJyZW50IHJlbmRlcmVyXHJcbiAqIEBwYXJhbSBbb3B0aW9uc10ge29iamVjdH1cclxuICogQHBhcmFtIFtvcHRpb25zLmF1dG9QcmV2ZW50RGVmYXVsdD10cnVlXSB7Ym9vbGVhbn0gU2hvdWxkIHRoZSBtYW5hZ2VyIGF1dG9tYXRpY2FsbHkgcHJldmVudCBkZWZhdWx0IGJyb3dzZXIgYWN0aW9ucy5cclxuICogQHBhcmFtIFtvcHRpb25zLmludGVyYWN0aW9uRnJlcXVlbmN5PTEwXSB7bnVtYmVyfSBGcmVxdWVuY3kgaW5jcmVhc2VzIHRoZSBpbnRlcmFjdGlvbiBldmVudHMgd2lsbCBiZSBjaGVja2VkLlxyXG4gKi9cclxuZnVuY3Rpb24gSW50ZXJhY3Rpb25NYW5hZ2VyKHJlbmRlcmVyLCBvcHRpb25zKVxyXG57XHJcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFRoZSByZW5kZXJlciB0aGlzIGludGVyYWN0aW9uIG1hbmFnZXIgd29ya3MgZm9yLlxyXG4gICAgICpcclxuICAgICAqIEBtZW1iZXIge1BJWEkuU3lzdGVtUmVuZGVyZXJ9XHJcbiAgICAgKi9cclxuICAgIHRoaXMucmVuZGVyZXIgPSByZW5kZXJlcjtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFNob3VsZCBkZWZhdWx0IGJyb3dzZXIgYWN0aW9ucyBhdXRvbWF0aWNhbGx5IGJlIHByZXZlbnRlZC5cclxuICAgICAqXHJcbiAgICAgKiBAbWVtYmVyIHtib29sZWFufVxyXG4gICAgICogQGRlZmF1bHQgdHJ1ZVxyXG4gICAgICovXHJcbiAgICB0aGlzLmF1dG9QcmV2ZW50RGVmYXVsdCA9IG9wdGlvbnMuYXV0b1ByZXZlbnREZWZhdWx0ICE9PSB1bmRlZmluZWQgPyBvcHRpb25zLmF1dG9QcmV2ZW50RGVmYXVsdCA6IHRydWU7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBcyB0aGlzIGZyZXF1ZW5jeSBpbmNyZWFzZXMgdGhlIGludGVyYWN0aW9uIGV2ZW50cyB3aWxsIGJlIGNoZWNrZWQgbW9yZSBvZnRlbi5cclxuICAgICAqXHJcbiAgICAgKiBAbWVtYmVyIHtudW1iZXJ9XHJcbiAgICAgKiBAZGVmYXVsdCAxMFxyXG4gICAgICovXHJcbiAgICB0aGlzLmludGVyYWN0aW9uRnJlcXVlbmN5ID0gb3B0aW9ucy5pbnRlcmFjdGlvbkZyZXF1ZW5jeSB8fCAxMDtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFRoZSBtb3VzZSBkYXRhXHJcbiAgICAgKlxyXG4gICAgICogQG1lbWJlciB7UElYSS5pbnRlcmFjdGlvbi5JbnRlcmFjdGlvbkRhdGF9XHJcbiAgICAgKi9cclxuICAgIHRoaXMubW91c2UgPSBuZXcgSW50ZXJhY3Rpb25EYXRhKCk7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBbiBldmVudCBkYXRhIG9iamVjdCB0byBoYW5kbGUgYWxsIHRoZSBldmVudCB0cmFja2luZy9kaXNwYXRjaGluZ1xyXG4gICAgICpcclxuICAgICAqIEBtZW1iZXIge29iamVjdH1cclxuICAgICAqL1xyXG4gICAgdGhpcy5ldmVudERhdGEgPSB7XHJcbiAgICAgICAgc3RvcHBlZDogZmFsc2UsXHJcbiAgICAgICAgdGFyZ2V0OiBudWxsLFxyXG4gICAgICAgIHR5cGU6IG51bGwsXHJcbiAgICAgICAgZGF0YTogdGhpcy5tb3VzZSxcclxuICAgICAgICBzdG9wUHJvcGFnYXRpb246ZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgdGhpcy5zdG9wcGVkID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogVGlueSBsaXR0bGUgaW50ZXJhY3RpdmVEYXRhIHBvb2wgIVxyXG4gICAgICpcclxuICAgICAqIEBtZW1iZXIge1BJWEkuaW50ZXJhY3Rpb24uSW50ZXJhY3Rpb25EYXRhW119XHJcbiAgICAgKi9cclxuICAgIHRoaXMuaW50ZXJhY3RpdmVEYXRhUG9vbCA9IFtdO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogVGhlIERPTSBlbGVtZW50IHRvIGJpbmQgdG8uXHJcbiAgICAgKlxyXG4gICAgICogQG1lbWJlciB7SFRNTEVsZW1lbnR9XHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICB0aGlzLmludGVyYWN0aW9uRE9NRWxlbWVudCA9IG51bGw7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBIYXZlIGV2ZW50cyBiZWVuIGF0dGFjaGVkIHRvIHRoZSBkb20gZWxlbWVudD9cclxuICAgICAqXHJcbiAgICAgKiBAbWVtYmVyIHtib29sZWFufVxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgdGhpcy5ldmVudHNBZGRlZCA9IGZhbHNlO1xyXG5cclxuICAgIC8vdGhpcyB3aWxsIG1ha2UgaXQgc28gdGhhdCB5b3UgZG9uJ3QgaGF2ZSB0byBjYWxsIGJpbmQgYWxsIHRoZSB0aW1lXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAbWVtYmVyIHtGdW5jdGlvbn1cclxuICAgICAqL1xyXG4gICAgdGhpcy5vbk1vdXNlVXAgPSB0aGlzLm9uTW91c2VVcC5iaW5kKHRoaXMpO1xyXG4gICAgdGhpcy5wcm9jZXNzTW91c2VVcCA9IHRoaXMucHJvY2Vzc01vdXNlVXAuYmluZCggdGhpcyApO1xyXG5cclxuXHJcbiAgICAvKipcclxuICAgICAqIEBtZW1iZXIge0Z1bmN0aW9ufVxyXG4gICAgICovXHJcbiAgICB0aGlzLm9uTW91c2VEb3duID0gdGhpcy5vbk1vdXNlRG93bi5iaW5kKHRoaXMpO1xyXG4gICAgdGhpcy5wcm9jZXNzTW91c2VEb3duID0gdGhpcy5wcm9jZXNzTW91c2VEb3duLmJpbmQoIHRoaXMgKTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEBtZW1iZXIge0Z1bmN0aW9ufVxyXG4gICAgICovXHJcbiAgICB0aGlzLm9uTW91c2VNb3ZlID0gdGhpcy5vbk1vdXNlTW92ZS5iaW5kKCB0aGlzICk7XHJcbiAgICB0aGlzLnByb2Nlc3NNb3VzZU1vdmUgPSB0aGlzLnByb2Nlc3NNb3VzZU1vdmUuYmluZCggdGhpcyApO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogQG1lbWJlciB7RnVuY3Rpb259XHJcbiAgICAgKi9cclxuICAgIHRoaXMub25Nb3VzZU91dCA9IHRoaXMub25Nb3VzZU91dC5iaW5kKHRoaXMpO1xyXG4gICAgdGhpcy5wcm9jZXNzTW91c2VPdmVyT3V0ID0gdGhpcy5wcm9jZXNzTW91c2VPdmVyT3V0LmJpbmQoIHRoaXMgKTtcclxuXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAbWVtYmVyIHtGdW5jdGlvbn1cclxuICAgICAqL1xyXG4gICAgdGhpcy5vblRvdWNoU3RhcnQgPSB0aGlzLm9uVG91Y2hTdGFydC5iaW5kKHRoaXMpO1xyXG4gICAgdGhpcy5wcm9jZXNzVG91Y2hTdGFydCA9IHRoaXMucHJvY2Vzc1RvdWNoU3RhcnQuYmluZCh0aGlzKTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEBtZW1iZXIge0Z1bmN0aW9ufVxyXG4gICAgICovXHJcbiAgICB0aGlzLm9uVG91Y2hFbmQgPSB0aGlzLm9uVG91Y2hFbmQuYmluZCh0aGlzKTtcclxuICAgIHRoaXMucHJvY2Vzc1RvdWNoRW5kID0gdGhpcy5wcm9jZXNzVG91Y2hFbmQuYmluZCh0aGlzKTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEBtZW1iZXIge0Z1bmN0aW9ufVxyXG4gICAgICovXHJcbiAgICB0aGlzLm9uVG91Y2hNb3ZlID0gdGhpcy5vblRvdWNoTW92ZS5iaW5kKHRoaXMpO1xyXG4gICAgdGhpcy5wcm9jZXNzVG91Y2hNb3ZlID0gdGhpcy5wcm9jZXNzVG91Y2hNb3ZlLmJpbmQodGhpcyk7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAbWVtYmVyIHtudW1iZXJ9XHJcbiAgICAgKi9cclxuICAgIHRoaXMubGFzdCA9IDA7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgY3NzIHN0eWxlIG9mIHRoZSBjdXJzb3IgdGhhdCBpcyBiZWluZyB1c2VkXHJcbiAgICAgKiBAbWVtYmVyIHtzdHJpbmd9XHJcbiAgICAgKi9cclxuICAgIHRoaXMuY3VycmVudEN1cnNvclN0eWxlID0gJ2luaGVyaXQnO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogSW50ZXJuYWwgY2FjaGVkIHZhclxyXG4gICAgICogQG1lbWJlciB7UElYSS5Qb2ludH1cclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIHRoaXMuX3RlbXBQb2ludCA9IG5ldyBjb3JlLlBvaW50KCk7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgY3VycmVudCByZXNvbHV0aW9uXHJcbiAgICAgKiBAbWVtYmVyIHtudW1iZXJ9XHJcbiAgICAgKi9cclxuICAgIHRoaXMucmVzb2x1dGlvbiA9IDE7XHJcblxyXG4gICAgdGhpcy5zZXRUYXJnZXRFbGVtZW50KHRoaXMucmVuZGVyZXIudmlldywgdGhpcy5yZW5kZXJlci5yZXNvbHV0aW9uKTtcclxufVxyXG5cclxuSW50ZXJhY3Rpb25NYW5hZ2VyLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEludGVyYWN0aW9uTWFuYWdlcjtcclxubW9kdWxlLmV4cG9ydHMgPSBJbnRlcmFjdGlvbk1hbmFnZXI7XHJcblxyXG4vKipcclxuICogU2V0cyB0aGUgRE9NIGVsZW1lbnQgd2hpY2ggd2lsbCByZWNlaXZlIG1vdXNlL3RvdWNoIGV2ZW50cy4gVGhpcyBpcyB1c2VmdWwgZm9yIHdoZW4geW91IGhhdmVcclxuICogb3RoZXIgRE9NIGVsZW1lbnRzIG9uIHRvcCBvZiB0aGUgcmVuZGVyZXJzIENhbnZhcyBlbGVtZW50LiBXaXRoIHRoaXMgeW91J2xsIGJlIGJhbGUgdG8gZGVsZXRlZ2F0ZVxyXG4gKiBhbm90aGVyIERPTSBlbGVtZW50IHRvIHJlY2VpdmUgdGhvc2UgZXZlbnRzLlxyXG4gKlxyXG4gKiBAcGFyYW0gZWxlbWVudCB7SFRNTEVsZW1lbnR9IHRoZSBET00gZWxlbWVudCB3aGljaCB3aWxsIHJlY2VpdmUgbW91c2UgYW5kIHRvdWNoIGV2ZW50cy5cclxuICogQHBhcmFtIFtyZXNvbHV0aW9uPTFdIHtudW1iZXJ9IFRIZSByZXNvbHV0aW9uIG9mIHRoZSBuZXcgZWxlbWVudCAocmVsYXRpdmUgdG8gdGhlIGNhbnZhcykuXHJcbiAqIEBwcml2YXRlXHJcbiAqL1xyXG5JbnRlcmFjdGlvbk1hbmFnZXIucHJvdG90eXBlLnNldFRhcmdldEVsZW1lbnQgPSBmdW5jdGlvbiAoZWxlbWVudCwgcmVzb2x1dGlvbilcclxue1xyXG4gICAgdGhpcy5yZW1vdmVFdmVudHMoKTtcclxuXHJcbiAgICB0aGlzLmludGVyYWN0aW9uRE9NRWxlbWVudCA9IGVsZW1lbnQ7XHJcblxyXG4gICAgdGhpcy5yZXNvbHV0aW9uID0gcmVzb2x1dGlvbiB8fCAxO1xyXG5cclxuICAgIHRoaXMuYWRkRXZlbnRzKCk7XHJcbn07XHJcblxyXG4vKipcclxuICogUmVnaXN0ZXJzIGFsbCB0aGUgRE9NIGV2ZW50c1xyXG4gKlxyXG4gKiBAcHJpdmF0ZVxyXG4gKi9cclxuSW50ZXJhY3Rpb25NYW5hZ2VyLnByb3RvdHlwZS5hZGRFdmVudHMgPSBmdW5jdGlvbiAoKVxyXG57XHJcbiAgICBpZiAoIXRoaXMuaW50ZXJhY3Rpb25ET01FbGVtZW50KVxyXG4gICAge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBjb3JlLnRpY2tlci5zaGFyZWQuYWRkKHRoaXMudXBkYXRlLCB0aGlzKTtcclxuXHJcbiAgICBpZiAod2luZG93Lm5hdmlnYXRvci5tc1BvaW50ZXJFbmFibGVkKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMuaW50ZXJhY3Rpb25ET01FbGVtZW50LnN0eWxlWyctbXMtY29udGVudC16b29taW5nJ10gPSAnbm9uZSc7XHJcbiAgICAgICAgdGhpcy5pbnRlcmFjdGlvbkRPTUVsZW1lbnQuc3R5bGVbJy1tcy10b3VjaC1hY3Rpb24nXSA9ICdub25lJztcclxuICAgIH1cclxuXHJcbiAgICB3aW5kb3cuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgICAgdGhpcy5vbk1vdXNlTW92ZSwgdHJ1ZSk7XHJcbiAgICB0aGlzLmludGVyYWN0aW9uRE9NRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCAgICB0aGlzLm9uTW91c2VEb3duLCB0cnVlKTtcclxuICAgIHRoaXMuaW50ZXJhY3Rpb25ET01FbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlb3V0JywgICAgIHRoaXMub25Nb3VzZU91dCwgdHJ1ZSk7XHJcblxyXG4gICAgdGhpcy5pbnRlcmFjdGlvbkRPTUVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsICAgdGhpcy5vblRvdWNoU3RhcnQsIHRydWUpO1xyXG4gICAgdGhpcy5pbnRlcmFjdGlvbkRPTUVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCAgICAgdGhpcy5vblRvdWNoRW5kLCB0cnVlKTtcclxuICAgIHRoaXMuaW50ZXJhY3Rpb25ET01FbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsICAgIHRoaXMub25Ub3VjaE1vdmUsIHRydWUpO1xyXG5cclxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgIHRoaXMub25Nb3VzZVVwLCB0cnVlKTtcclxuXHJcbiAgICB0aGlzLmV2ZW50c0FkZGVkID0gdHJ1ZTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBSZW1vdmVzIGFsbCB0aGUgRE9NIGV2ZW50cyB0aGF0IHdlcmUgcHJldmlvdXNseSByZWdpc3RlcmVkXHJcbiAqXHJcbiAqIEBwcml2YXRlXHJcbiAqL1xyXG5JbnRlcmFjdGlvbk1hbmFnZXIucHJvdG90eXBlLnJlbW92ZUV2ZW50cyA9IGZ1bmN0aW9uICgpXHJcbntcclxuICAgIGlmICghdGhpcy5pbnRlcmFjdGlvbkRPTUVsZW1lbnQpXHJcbiAgICB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGNvcmUudGlja2VyLnNoYXJlZC5yZW1vdmUodGhpcy51cGRhdGUpO1xyXG5cclxuICAgIGlmICh3aW5kb3cubmF2aWdhdG9yLm1zUG9pbnRlckVuYWJsZWQpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5pbnRlcmFjdGlvbkRPTUVsZW1lbnQuc3R5bGVbJy1tcy1jb250ZW50LXpvb21pbmcnXSA9ICcnO1xyXG4gICAgICAgIHRoaXMuaW50ZXJhY3Rpb25ET01FbGVtZW50LnN0eWxlWyctbXMtdG91Y2gtYWN0aW9uJ10gPSAnJztcclxuICAgIH1cclxuXHJcbiAgICB3aW5kb3cuZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgdGhpcy5vbk1vdXNlTW92ZSwgdHJ1ZSk7XHJcbiAgICB0aGlzLmludGVyYWN0aW9uRE9NRWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCB0aGlzLm9uTW91c2VEb3duLCB0cnVlKTtcclxuICAgIHRoaXMuaW50ZXJhY3Rpb25ET01FbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlb3V0JywgIHRoaXMub25Nb3VzZU91dCwgdHJ1ZSk7XHJcblxyXG4gICAgdGhpcy5pbnRlcmFjdGlvbkRPTUVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIHRoaXMub25Ub3VjaFN0YXJ0LCB0cnVlKTtcclxuICAgIHRoaXMuaW50ZXJhY3Rpb25ET01FbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgIHRoaXMub25Ub3VjaEVuZCwgdHJ1ZSk7XHJcbiAgICB0aGlzLmludGVyYWN0aW9uRE9NRWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaG1vdmUnLCB0aGlzLm9uVG91Y2hNb3ZlLCB0cnVlKTtcclxuXHJcbiAgICB0aGlzLmludGVyYWN0aW9uRE9NRWxlbWVudCA9IG51bGw7XHJcblxyXG4gICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCAgdGhpcy5vbk1vdXNlVXAsIHRydWUpO1xyXG5cclxuICAgIHRoaXMuZXZlbnRzQWRkZWQgPSBmYWxzZTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBVcGRhdGVzIHRoZSBzdGF0ZSBvZiBpbnRlcmFjdGl2ZSBvYmplY3RzLlxyXG4gKiBJbnZva2VkIGJ5IGEgdGhyb3R0bGVkIHRpY2tlciB1cGRhdGUgZnJvbVxyXG4gKiB7QGxpbmsgUElYSS50aWNrZXIuc2hhcmVkfS5cclxuICpcclxuICogQHBhcmFtIGRlbHRhVGltZSB7bnVtYmVyfVxyXG4gKi9cclxuSW50ZXJhY3Rpb25NYW5hZ2VyLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbiAoZGVsdGFUaW1lKVxyXG57XHJcbiAgICB0aGlzLl9kZWx0YVRpbWUgKz0gZGVsdGFUaW1lO1xyXG5cclxuICAgIGlmICh0aGlzLl9kZWx0YVRpbWUgPCB0aGlzLmludGVyYWN0aW9uRnJlcXVlbmN5KVxyXG4gICAge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLl9kZWx0YVRpbWUgPSAwO1xyXG5cclxuICAgIGlmICghdGhpcy5pbnRlcmFjdGlvbkRPTUVsZW1lbnQpXHJcbiAgICB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGlmIHRoZSB1c2VyIG1vdmUgdGhlIG1vdXNlIHRoaXMgY2hlY2sgaGFzIGFscmVhZHkgYmVlbiBkZm9uZSB1c2luZyB0aGUgbW91c2UgbW92ZSFcclxuICAgIGlmKHRoaXMuZGlkTW92ZSlcclxuICAgIHtcclxuICAgICAgICB0aGlzLmRpZE1vdmUgPSBmYWxzZTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5jdXJzb3IgPSAnaW5oZXJpdCc7XHJcblxyXG4gICAgdGhpcy5wcm9jZXNzSW50ZXJhY3RpdmUodGhpcy5tb3VzZS5nbG9iYWwsIHRoaXMucmVuZGVyZXIuX2xhc3RPYmplY3RSZW5kZXJlZCwgdGhpcy5wcm9jZXNzTW91c2VPdmVyT3V0LCB0cnVlICk7XHJcblxyXG4gICAgaWYgKHRoaXMuY3VycmVudEN1cnNvclN0eWxlICE9PSB0aGlzLmN1cnNvcilcclxuICAgIHtcclxuICAgICAgICB0aGlzLmN1cnJlbnRDdXJzb3JTdHlsZSA9IHRoaXMuY3Vyc29yO1xyXG4gICAgICAgIHRoaXMuaW50ZXJhY3Rpb25ET01FbGVtZW50LnN0eWxlLmN1cnNvciA9IHRoaXMuY3Vyc29yO1xyXG4gICAgfVxyXG5cclxuICAgIC8vVE9ET1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIERpc3BhdGNoZXMgYW4gZXZlbnQgb24gdGhlIGRpc3BsYXkgb2JqZWN0IHRoYXQgd2FzIGludGVyYWN0ZWQgd2l0aFxyXG4gKlxyXG4gKiBAcGFyYW0gZGlzcGxheU9iamVjdCB7UElYSS5Db250YWluZXJ8UElYSS5TcHJpdGV8UElYSS5leHRyYXMuVGlsaW5nU3ByaXRlfSB0aGUgZGlzcGxheSBvYmplY3QgaW4gcXVlc3Rpb25cclxuICogQHBhcmFtIGV2ZW50U3RyaW5nIHtzdHJpbmd9IHRoZSBuYW1lIG9mIHRoZSBldmVudCAoZS5nLCBtb3VzZWRvd24pXHJcbiAqIEBwYXJhbSBldmVudERhdGEge29iamVjdH0gdGhlIGV2ZW50IGRhdGEgb2JqZWN0XHJcbiAqIEBwcml2YXRlXHJcbiAqL1xyXG5JbnRlcmFjdGlvbk1hbmFnZXIucHJvdG90eXBlLmRpc3BhdGNoRXZlbnQgPSBmdW5jdGlvbiAoIGRpc3BsYXlPYmplY3QsIGV2ZW50U3RyaW5nLCBldmVudERhdGEgKVxyXG57XHJcbiAgICBpZighZXZlbnREYXRhLnN0b3BwZWQpXHJcbiAgICB7XHJcbiAgICAgICAgZXZlbnREYXRhLnRhcmdldCA9IGRpc3BsYXlPYmplY3Q7XHJcbiAgICAgICAgZXZlbnREYXRhLnR5cGUgPSBldmVudFN0cmluZztcclxuXHJcbiAgICAgICAgZGlzcGxheU9iamVjdC5lbWl0KCBldmVudFN0cmluZywgZXZlbnREYXRhICk7XHJcblxyXG4gICAgICAgIGlmKCBkaXNwbGF5T2JqZWN0W2V2ZW50U3RyaW5nXSApXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBkaXNwbGF5T2JqZWN0W2V2ZW50U3RyaW5nXSggZXZlbnREYXRhICk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuLyoqXHJcbiAqIE1hcHMgeCBhbmQgeSBjb29yZHMgZnJvbSBhIERPTSBvYmplY3QgYW5kIG1hcHMgdGhlbSBjb3JyZWN0bHkgdG8gdGhlIHBpeGkgdmlldy4gVGhlIHJlc3VsdGluZyB2YWx1ZSBpcyBzdG9yZWQgaW4gdGhlIHBvaW50LlxyXG4gKiBUaGlzIHRha2VzIGludG8gYWNjb3VudCB0aGUgZmFjdCB0aGF0IHRoZSBET00gZWxlbWVudCBjb3VsZCBiZSBzY2FsZWQgYW5kIHBvc2l0aW9uZWQgYW55d2hlcmUgb24gdGhlIHNjcmVlbi5cclxuICpcclxuICogQHBhcmFtICB7UElYSS5Qb2ludH0gcG9pbnQgdGhlIHBvaW50IHRoYXQgdGhlIHJlc3VsdCB3aWxsIGJlIHN0b3JlZCBpblxyXG4gKiBAcGFyYW0gIHtudW1iZXJ9IHggICAgIHRoZSB4IGNvb3JkIG9mIHRoZSBwb3NpdGlvbiB0byBtYXBcclxuICogQHBhcmFtICB7bnVtYmVyfSB5ICAgICB0aGUgeSBjb29yZCBvZiB0aGUgcG9zaXRpb24gdG8gbWFwXHJcbiAqL1xyXG5JbnRlcmFjdGlvbk1hbmFnZXIucHJvdG90eXBlLm1hcFBvc2l0aW9uVG9Qb2ludCA9IGZ1bmN0aW9uICggcG9pbnQsIHgsIHkgKVxyXG57XHJcbiAgICB2YXIgcmVjdCA9IHRoaXMuaW50ZXJhY3Rpb25ET01FbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG4gICAgcG9pbnQueCA9ICggKCB4IC0gcmVjdC5sZWZ0ICkgKiAodGhpcy5pbnRlcmFjdGlvbkRPTUVsZW1lbnQud2lkdGggIC8gcmVjdC53aWR0aCAgKSApIC8gdGhpcy5yZXNvbHV0aW9uO1xyXG4gICAgcG9pbnQueSA9ICggKCB5IC0gcmVjdC50b3AgICkgKiAodGhpcy5pbnRlcmFjdGlvbkRPTUVsZW1lbnQuaGVpZ2h0IC8gcmVjdC5oZWlnaHQgKSApIC8gdGhpcy5yZXNvbHV0aW9uO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFRoaXMgZnVuY3Rpb24gaXMgcHJvdmlkZXMgYSBuZWF0IHdheSBvZiBjcmF3bGluZyB0aHJvdWdoIHRoZSBzY2VuZSBncmFwaCBhbmQgcnVubmluZyBhIHNwZWNpZmllZCBmdW5jdGlvbiBvbiBhbGwgaW50ZXJhY3RpdmUgb2JqZWN0cyBpdCBmaW5kcy5cclxuICogSXQgd2lsbCBhbHNvIHRha2UgY2FyZSBvZiBoaXQgdGVzdGluZyB0aGUgaW50ZXJhY3RpdmUgb2JqZWN0cyBhbmQgcGFzc2VzIHRoZSBoaXQgYWNyb3NzIGluIHRoZSBmdW5jdGlvbi5cclxuICpcclxuICogQHBhcmFtICB7UElYSS5Qb2ludH0gcG9pbnQgdGhlIHBvaW50IHRoYXQgaXMgdGVzdGVkIGZvciBjb2xsaXNpb25cclxuICogQHBhcmFtICB7UElYSS5Db250YWluZXJ8UElYSS5TcHJpdGV8UElYSS5leHRyYXMuVGlsaW5nU3ByaXRlfSBkaXNwbGF5T2JqZWN0IHRoZSBkaXNwbGF5T2JqZWN0IHRoYXQgd2lsbCBiZSBoaXQgdGVzdCAocmVjdXJjc2l2bHkgY3Jhd2xzIGl0cyBjaGlsZHJlbilcclxuICogQHBhcmFtICB7RnVuY3Rpb259IGZ1bmMgdGhlIGZ1bmN0aW9uIHRoYXQgd2lsbCBiZSBjYWxsZWQgb24gZWFjaCBpbnRlcmFjdGl2ZSBvYmplY3QuIFRoZSBkaXNwbGF5T2JqZWN0IGFuZCBoaXQgd2lsbCBiZSBwYXNzZWQgdG8gdGhlIGZ1bmN0aW9uXHJcbiAqIEBwYXJhbSAge2Jvb2xlYW59IGhpdFRlc3QgdGhpcyBpbmRpY2F0ZXMgaWYgdGhlIG9iamVjdHMgaW5zaWRlIHNob3VsZCBiZSBoaXQgdGVzdCBhZ2FpbnN0IHRoZSBwb2ludFxyXG4gKiBAcmV0dXJuIHtib29sZWFufSByZXR1cm5zIHRydWUgaWYgdGhlIGRpc3BsYXlPYmplY3QgaGl0IHRoZSBwb2ludFxyXG4gKi9cclxuSW50ZXJhY3Rpb25NYW5hZ2VyLnByb3RvdHlwZS5wcm9jZXNzSW50ZXJhY3RpdmUgPSBmdW5jdGlvbiAocG9pbnQsIGRpc3BsYXlPYmplY3QsIGZ1bmMsIGhpdFRlc3QsIGludGVyYWN0aXZlIClcclxue1xyXG4gICAgaWYoIWRpc3BsYXlPYmplY3QgfHwgIWRpc3BsYXlPYmplY3QudmlzaWJsZSlcclxuICAgIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGNoaWxkcmVuID0gZGlzcGxheU9iamVjdC5jaGlsZHJlbjtcclxuXHJcbiAgICB2YXIgaGl0ID0gZmFsc2U7XHJcblxyXG4gICAgLy8gaWYgdGhlIG9iamVjdCBpcyBpbnRlcmFjdGl2ZSB3ZSBtdXN0IGhpdCB0ZXN0IGFsbCBpdHMgY2hpbGRyZW4uLlxyXG4gICAgaW50ZXJhY3RpdmUgPSBpbnRlcmFjdGl2ZSB8fCBkaXNwbGF5T2JqZWN0LmludGVyYWN0aXZlO1xyXG5cclxuICAgIGlmKGRpc3BsYXlPYmplY3QuaW50ZXJhY3RpdmVDaGlsZHJlbilcclxuICAgIHtcclxuXHJcbiAgICAgICAgZm9yICh2YXIgaSA9IGNoaWxkcmVuLmxlbmd0aC0xOyBpID49IDA7IGktLSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmKCEgaGl0ICAmJiBoaXRUZXN0KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBoaXQgPSB0aGlzLnByb2Nlc3NJbnRlcmFjdGl2ZShwb2ludCwgY2hpbGRyZW5baV0sIGZ1bmMsIHRydWUsIGludGVyYWN0aXZlICk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAvLyBub3cgd2Uga25vdyB3ZSBjYW4gbWlzcyBpdCBhbGwhXHJcbiAgICAgICAgICAgICAgICB0aGlzLnByb2Nlc3NJbnRlcmFjdGl2ZShwb2ludCwgY2hpbGRyZW5baV0sIGZ1bmMsIGZhbHNlLCBmYWxzZSApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbiAgICBpZihpbnRlcmFjdGl2ZSlcclxuICAgIHtcclxuICAgICAgICBpZihoaXRUZXN0KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYoZGlzcGxheU9iamVjdC5oaXRBcmVhKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAvLyBsZXRzIHVzZSB0aGUgaGl0IG9iamVjdCBmaXJzdCFcclxuICAgICAgICAgICAgICAgIGRpc3BsYXlPYmplY3Qud29ybGRUcmFuc2Zvcm0uYXBwbHlJbnZlcnNlKHBvaW50LCAgdGhpcy5fdGVtcFBvaW50KTtcclxuICAgICAgICAgICAgICAgIGhpdCA9IGRpc3BsYXlPYmplY3QuaGl0QXJlYS5jb250YWlucyggdGhpcy5fdGVtcFBvaW50LngsIHRoaXMuX3RlbXBQb2ludC55ICk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZihkaXNwbGF5T2JqZWN0LmNvbnRhaW5zUG9pbnQpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGhpdCA9IGRpc3BsYXlPYmplY3QuY29udGFpbnNQb2ludChwb2ludCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmKGRpc3BsYXlPYmplY3QuaW50ZXJhY3RpdmUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBmdW5jKGRpc3BsYXlPYmplY3QsIGhpdCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBoaXQ7XHJcbn07XHJcblxyXG5cclxuXHJcblxyXG4vKipcclxuICogSXMgY2FsbGVkIHdoZW4gdGhlIG1vdXNlIGJ1dHRvbiBpcyBwcmVzc2VkIGRvd24gb24gdGhlIHJlbmRlcmVyIGVsZW1lbnRcclxuICpcclxuICogQHBhcmFtIGV2ZW50IHtFdmVudH0gVGhlIERPTSBldmVudCBvZiBhIG1vdXNlIGJ1dHRvbiBiZWluZyBwcmVzc2VkIGRvd25cclxuICogQHByaXZhdGVcclxuICovXHJcbkludGVyYWN0aW9uTWFuYWdlci5wcm90b3R5cGUub25Nb3VzZURvd24gPSBmdW5jdGlvbiAoZXZlbnQpXHJcbntcclxuICAgIHRoaXMubW91c2Uub3JpZ2luYWxFdmVudCA9IGV2ZW50O1xyXG4gICAgdGhpcy5ldmVudERhdGEuZGF0YSA9IHRoaXMubW91c2U7XHJcbiAgICB0aGlzLmV2ZW50RGF0YS5zdG9wcGVkID0gZmFsc2U7XHJcblxyXG4gICAgLy8gVXBkYXRlIGludGVybmFsIG1vdXNlIHJlZmVyZW5jZVxyXG4gICAgdGhpcy5tYXBQb3NpdGlvblRvUG9pbnQoIHRoaXMubW91c2UuZ2xvYmFsLCBldmVudC5jbGllbnRYLCBldmVudC5jbGllbnRZKTtcclxuXHJcbiAgICBpZiAodGhpcy5hdXRvUHJldmVudERlZmF1bHQpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5tb3VzZS5vcmlnaW5hbEV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5wcm9jZXNzSW50ZXJhY3RpdmUodGhpcy5tb3VzZS5nbG9iYWwsIHRoaXMucmVuZGVyZXIuX2xhc3RPYmplY3RSZW5kZXJlZCwgdGhpcy5wcm9jZXNzTW91c2VEb3duLCB0cnVlICk7XHJcbn07XHJcblxyXG4vKipcclxuICogUHJvY2Vzc2VzIHRoZSByZXN1bHQgb2YgdGhlIG1vdXNlIGRvd24gY2hlY2sgYW5kIGRpc3BhdGNoZXMgdGhlIGV2ZW50IGlmIG5lZWQgYmVcclxuICpcclxuICogQHBhcmFtIGRpc3BsYXlPYmplY3Qge1BJWEkuQ29udGFpbmVyfFBJWEkuU3ByaXRlfFBJWEkuZXh0cmFzLlRpbGluZ1Nwcml0ZX0gVGhlIGRpc3BsYXkgb2JqZWN0IHRoYXQgd2FzIHRlc3RlZFxyXG4gKiBAcGFyYW0gaGl0IHtib29sZWFufSB0aGUgcmVzdWx0IG9mIHRoZSBoaXQgdGVzdCBvbiB0aGUgZGlzcGF5IG9iamVjdFxyXG4gKiBAcHJpdmF0ZVxyXG4gKi9cclxuSW50ZXJhY3Rpb25NYW5hZ2VyLnByb3RvdHlwZS5wcm9jZXNzTW91c2VEb3duID0gZnVuY3Rpb24gKCBkaXNwbGF5T2JqZWN0LCBoaXQgKVxyXG57XHJcbiAgICB2YXIgZSA9IHRoaXMubW91c2Uub3JpZ2luYWxFdmVudDtcclxuXHJcbiAgICB2YXIgaXNSaWdodEJ1dHRvbiA9IGUuYnV0dG9uID09PSAyIHx8IGUud2hpY2ggPT09IDM7XHJcblxyXG4gICAgaWYoaGl0KVxyXG4gICAge1xyXG4gICAgICAgIGRpc3BsYXlPYmplY3RbIGlzUmlnaHRCdXR0b24gPyAnX2lzUmlnaHREb3duJyA6ICdfaXNMZWZ0RG93bicgXSA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KCBkaXNwbGF5T2JqZWN0LCBpc1JpZ2h0QnV0dG9uID8gJ3JpZ2h0ZG93bicgOiAnbW91c2Vkb3duJywgdGhpcy5ldmVudERhdGEgKTtcclxuICAgIH1cclxufTtcclxuXHJcblxyXG5cclxuLyoqXHJcbiAqIElzIGNhbGxlZCB3aGVuIHRoZSBtb3VzZSBidXR0b24gaXMgcmVsZWFzZWQgb24gdGhlIHJlbmRlcmVyIGVsZW1lbnRcclxuICpcclxuICogQHBhcmFtIGV2ZW50IHtFdmVudH0gVGhlIERPTSBldmVudCBvZiBhIG1vdXNlIGJ1dHRvbiBiZWluZyByZWxlYXNlZFxyXG4gKiBAcHJpdmF0ZVxyXG4gKi9cclxuSW50ZXJhY3Rpb25NYW5hZ2VyLnByb3RvdHlwZS5vbk1vdXNlVXAgPSBmdW5jdGlvbiAoZXZlbnQpXHJcbntcclxuICAgIHRoaXMubW91c2Uub3JpZ2luYWxFdmVudCA9IGV2ZW50O1xyXG4gICAgdGhpcy5ldmVudERhdGEuZGF0YSA9IHRoaXMubW91c2U7XHJcbiAgICB0aGlzLmV2ZW50RGF0YS5zdG9wcGVkID0gZmFsc2U7XHJcblxyXG4gICAgLy8gVXBkYXRlIGludGVybmFsIG1vdXNlIHJlZmVyZW5jZVxyXG4gICAgdGhpcy5tYXBQb3NpdGlvblRvUG9pbnQoIHRoaXMubW91c2UuZ2xvYmFsLCBldmVudC5jbGllbnRYLCBldmVudC5jbGllbnRZKTtcclxuXHJcbiAgICB0aGlzLnByb2Nlc3NJbnRlcmFjdGl2ZSh0aGlzLm1vdXNlLmdsb2JhbCwgdGhpcy5yZW5kZXJlci5fbGFzdE9iamVjdFJlbmRlcmVkLCB0aGlzLnByb2Nlc3NNb3VzZVVwLCB0cnVlICk7XHJcbn07XHJcblxyXG4vKipcclxuICogUHJvY2Vzc2VzIHRoZSByZXN1bHQgb2YgdGhlIG1vdXNlIHVwIGNoZWNrIGFuZCBkaXNwYXRjaGVzIHRoZSBldmVudCBpZiBuZWVkIGJlXHJcbiAqXHJcbiAqIEBwYXJhbSBkaXNwbGF5T2JqZWN0IHtQSVhJLkNvbnRhaW5lcnxQSVhJLlNwcml0ZXxQSVhJLmV4dHJhcy5UaWxpbmdTcHJpdGV9IFRoZSBkaXNwbGF5IG9iamVjdCB0aGF0IHdhcyB0ZXN0ZWRcclxuICogQHBhcmFtIGhpdCB7Ym9vbGVhbn0gdGhlIHJlc3VsdCBvZiB0aGUgaGl0IHRlc3Qgb24gdGhlIGRpc3BsYXkgb2JqZWN0XHJcbiAqIEBwcml2YXRlXHJcbiAqL1xyXG5JbnRlcmFjdGlvbk1hbmFnZXIucHJvdG90eXBlLnByb2Nlc3NNb3VzZVVwID0gZnVuY3Rpb24gKCBkaXNwbGF5T2JqZWN0LCBoaXQgKVxyXG57XHJcbiAgICB2YXIgZSA9IHRoaXMubW91c2Uub3JpZ2luYWxFdmVudDtcclxuXHJcbiAgICB2YXIgaXNSaWdodEJ1dHRvbiA9IGUuYnV0dG9uID09PSAyIHx8IGUud2hpY2ggPT09IDM7XHJcbiAgICB2YXIgaXNEb3duID0gIGlzUmlnaHRCdXR0b24gPyAnX2lzUmlnaHREb3duJyA6ICdfaXNMZWZ0RG93bic7XHJcblxyXG4gICAgaWYoaGl0KVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudCggZGlzcGxheU9iamVjdCwgaXNSaWdodEJ1dHRvbiA/ICdyaWdodHVwJyA6ICdtb3VzZXVwJywgdGhpcy5ldmVudERhdGEgKTtcclxuXHJcbiAgICAgICAgaWYoIGRpc3BsYXlPYmplY3RbIGlzRG93biBdIClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGRpc3BsYXlPYmplY3RbIGlzRG93biBdID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudCggZGlzcGxheU9iamVjdCwgaXNSaWdodEJ1dHRvbiA/ICdyaWdodGNsaWNrJyA6ICdjbGljaycsIHRoaXMuZXZlbnREYXRhICk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZWxzZVxyXG4gICAge1xyXG4gICAgICAgIGlmKCBkaXNwbGF5T2JqZWN0WyBpc0Rvd24gXSApXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBkaXNwbGF5T2JqZWN0WyBpc0Rvd24gXSA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoIGRpc3BsYXlPYmplY3QsIGlzUmlnaHRCdXR0b24gPyAncmlnaHR1cG91dHNpZGUnIDogJ21vdXNldXBvdXRzaWRlJywgdGhpcy5ldmVudERhdGEgKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG5cclxuLyoqXHJcbiAqIElzIGNhbGxlZCB3aGVuIHRoZSBtb3VzZSBtb3ZlcyBhY3Jvc3MgdGhlIHJlbmRlcmVyIGVsZW1lbnRcclxuICpcclxuICogQHBhcmFtIGV2ZW50IHtFdmVudH0gVGhlIERPTSBldmVudCBvZiB0aGUgbW91c2UgbW92aW5nXHJcbiAqIEBwcml2YXRlXHJcbiAqL1xyXG5JbnRlcmFjdGlvbk1hbmFnZXIucHJvdG90eXBlLm9uTW91c2VNb3ZlID0gZnVuY3Rpb24gKGV2ZW50KVxyXG57XHJcbiAgICB0aGlzLm1vdXNlLm9yaWdpbmFsRXZlbnQgPSBldmVudDtcclxuICAgIHRoaXMuZXZlbnREYXRhLmRhdGEgPSB0aGlzLm1vdXNlO1xyXG4gICAgdGhpcy5ldmVudERhdGEuc3RvcHBlZCA9IGZhbHNlO1xyXG5cclxuICAgIHRoaXMubWFwUG9zaXRpb25Ub1BvaW50KCB0aGlzLm1vdXNlLmdsb2JhbCwgZXZlbnQuY2xpZW50WCwgZXZlbnQuY2xpZW50WSk7XHJcblxyXG4gICAgdGhpcy5kaWRNb3ZlID0gdHJ1ZTtcclxuXHJcbiAgICB0aGlzLmN1cnNvciA9ICdpbmhlcml0JztcclxuXHJcbiAgICB0aGlzLnByb2Nlc3NJbnRlcmFjdGl2ZSh0aGlzLm1vdXNlLmdsb2JhbCwgdGhpcy5yZW5kZXJlci5fbGFzdE9iamVjdFJlbmRlcmVkLCB0aGlzLnByb2Nlc3NNb3VzZU1vdmUsIHRydWUgKTtcclxuXHJcbiAgICBpZiAodGhpcy5jdXJyZW50Q3Vyc29yU3R5bGUgIT09IHRoaXMuY3Vyc29yKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMuY3VycmVudEN1cnNvclN0eWxlID0gdGhpcy5jdXJzb3I7XHJcbiAgICAgICAgdGhpcy5pbnRlcmFjdGlvbkRPTUVsZW1lbnQuc3R5bGUuY3Vyc29yID0gdGhpcy5jdXJzb3I7XHJcbiAgICB9XHJcblxyXG4gICAgLy9UT0RPIEJVRyBmb3IgcGFyZW50cyBpbmVyYWN0aXZlIG9iamVjdCAoYm9yZGVyIG9yZGVyIGlzc3VlKVxyXG59O1xyXG5cclxuLyoqXHJcbiAqIFByb2Nlc3NlcyB0aGUgcmVzdWx0IG9mIHRoZSBtb3VzZSBtb3ZlIGNoZWNrIGFuZCBkaXNwYXRjaGVzIHRoZSBldmVudCBpZiBuZWVkIGJlXHJcbiAqXHJcbiAqIEBwYXJhbSBkaXNwbGF5T2JqZWN0IHtQSVhJLkNvbnRhaW5lcnxQSVhJLlNwcml0ZXxQSVhJLmV4dHJhcy5UaWxpbmdTcHJpdGV9IFRoZSBkaXNwbGF5IG9iamVjdCB0aGF0IHdhcyB0ZXN0ZWRcclxuICogQHBhcmFtIGhpdCB7Ym9vbGVhbn0gdGhlIHJlc3VsdCBvZiB0aGUgaGl0IHRlc3Qgb24gdGhlIGRpc3BsYXkgb2JqZWN0XHJcbiAqIEBwcml2YXRlXHJcbiAqL1xyXG5JbnRlcmFjdGlvbk1hbmFnZXIucHJvdG90eXBlLnByb2Nlc3NNb3VzZU1vdmUgPSBmdW5jdGlvbiAoIGRpc3BsYXlPYmplY3QsIGhpdCApXHJcbntcclxuICAgIHRoaXMuZGlzcGF0Y2hFdmVudCggZGlzcGxheU9iamVjdCwgJ21vdXNlbW92ZScsIHRoaXMuZXZlbnREYXRhKTtcclxuICAgIHRoaXMucHJvY2Vzc01vdXNlT3Zlck91dChkaXNwbGF5T2JqZWN0LCBoaXQpO1xyXG59O1xyXG5cclxuXHJcbi8qKlxyXG4gKiBJcyBjYWxsZWQgd2hlbiB0aGUgbW91c2UgaXMgbW92ZWQgb3V0IG9mIHRoZSByZW5kZXJlciBlbGVtZW50XHJcbiAqXHJcbiAqIEBwYXJhbSBldmVudCB7RXZlbnR9IFRoZSBET00gZXZlbnQgb2YgYSBtb3VzZSBiZWluZyBtb3ZlZCBvdXRcclxuICogQHByaXZhdGVcclxuICovXHJcbkludGVyYWN0aW9uTWFuYWdlci5wcm90b3R5cGUub25Nb3VzZU91dCA9IGZ1bmN0aW9uIChldmVudClcclxue1xyXG4gICAgdGhpcy5tb3VzZS5vcmlnaW5hbEV2ZW50ID0gZXZlbnQ7XHJcbiAgICB0aGlzLmV2ZW50RGF0YS5zdG9wcGVkID0gZmFsc2U7XHJcblxyXG4gICAgLy8gVXBkYXRlIGludGVybmFsIG1vdXNlIHJlZmVyZW5jZVxyXG4gICAgdGhpcy5tYXBQb3NpdGlvblRvUG9pbnQoIHRoaXMubW91c2UuZ2xvYmFsLCBldmVudC5jbGllbnRYLCBldmVudC5jbGllbnRZKTtcclxuXHJcbiAgICB0aGlzLmludGVyYWN0aW9uRE9NRWxlbWVudC5zdHlsZS5jdXJzb3IgPSAnaW5oZXJpdCc7XHJcblxyXG4gICAgLy8gVE9ETyBvcHRpbWl6ZSBieSBub3QgY2hlY2sgRVZFUlkgVElNRSEgbWF5YmUgaGFsZiBhcyBvZnRlbj8gLy9cclxuICAgIHRoaXMubWFwUG9zaXRpb25Ub1BvaW50KCB0aGlzLm1vdXNlLmdsb2JhbCwgZXZlbnQuY2xpZW50WCwgZXZlbnQuY2xpZW50WSApO1xyXG5cclxuICAgIHRoaXMucHJvY2Vzc0ludGVyYWN0aXZlKCB0aGlzLm1vdXNlLmdsb2JhbCwgdGhpcy5yZW5kZXJlci5fbGFzdE9iamVjdFJlbmRlcmVkLCB0aGlzLnByb2Nlc3NNb3VzZU92ZXJPdXQsIGZhbHNlICk7XHJcbn07XHJcblxyXG4vKipcclxuICogUHJvY2Vzc2VzIHRoZSByZXN1bHQgb2YgdGhlIG1vdXNlIG92ZXIvb3V0IGNoZWNrIGFuZCBkaXNwYXRjaGVzIHRoZSBldmVudCBpZiBuZWVkIGJlXHJcbiAqXHJcbiAqIEBwYXJhbSBkaXNwbGF5T2JqZWN0IHtQSVhJLkNvbnRhaW5lcnxQSVhJLlNwcml0ZXxQSVhJLmV4dHJhcy5UaWxpbmdTcHJpdGV9IFRoZSBkaXNwbGF5IG9iamVjdCB0aGF0IHdhcyB0ZXN0ZWRcclxuICogQHBhcmFtIGhpdCB7Ym9vbGVhbn0gdGhlIHJlc3VsdCBvZiB0aGUgaGl0IHRlc3Qgb24gdGhlIGRpc3BsYXkgb2JqZWN0XHJcbiAqIEBwcml2YXRlXHJcbiAqL1xyXG5JbnRlcmFjdGlvbk1hbmFnZXIucHJvdG90eXBlLnByb2Nlc3NNb3VzZU92ZXJPdXQgPSBmdW5jdGlvbiAoIGRpc3BsYXlPYmplY3QsIGhpdCApXHJcbntcclxuICAgIGlmKGhpdClcclxuICAgIHtcclxuICAgICAgICBpZighZGlzcGxheU9iamVjdC5fb3ZlcilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGRpc3BsYXlPYmplY3QuX292ZXIgPSB0cnVlO1xyXG4gICAgICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoIGRpc3BsYXlPYmplY3QsICdtb3VzZW92ZXInLCB0aGlzLmV2ZW50RGF0YSApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGRpc3BsYXlPYmplY3QuYnV0dG9uTW9kZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuY3Vyc29yID0gZGlzcGxheU9iamVjdC5kZWZhdWx0Q3Vyc29yO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGVsc2VcclxuICAgIHtcclxuICAgICAgICBpZihkaXNwbGF5T2JqZWN0Ll9vdmVyKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZGlzcGxheU9iamVjdC5fb3ZlciA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoIGRpc3BsYXlPYmplY3QsICdtb3VzZW91dCcsIHRoaXMuZXZlbnREYXRhKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG5cclxuLyoqXHJcbiAqIElzIGNhbGxlZCB3aGVuIGEgdG91Y2ggaXMgc3RhcnRlZCBvbiB0aGUgcmVuZGVyZXIgZWxlbWVudFxyXG4gKlxyXG4gKiBAcGFyYW0gZXZlbnQge0V2ZW50fSBUaGUgRE9NIGV2ZW50IG9mIGEgdG91Y2ggc3RhcnRpbmcgb24gdGhlIHJlbmRlcmVyIHZpZXdcclxuICogQHByaXZhdGVcclxuICovXHJcbkludGVyYWN0aW9uTWFuYWdlci5wcm90b3R5cGUub25Ub3VjaFN0YXJ0ID0gZnVuY3Rpb24gKGV2ZW50KVxyXG57XHJcbiAgICBpZiAodGhpcy5hdXRvUHJldmVudERlZmF1bHQpXHJcbiAgICB7XHJcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgY2hhbmdlZFRvdWNoZXMgPSBldmVudC5jaGFuZ2VkVG91Y2hlcztcclxuICAgIHZhciBjTGVuZ3RoID0gY2hhbmdlZFRvdWNoZXMubGVuZ3RoO1xyXG5cclxuICAgIGZvciAodmFyIGk9MDsgaSA8IGNMZW5ndGg7IGkrKylcclxuICAgIHtcclxuICAgICAgICB2YXIgdG91Y2hFdmVudCA9IGNoYW5nZWRUb3VjaGVzW2ldO1xyXG4gICAgICAgIC8vVE9ETyBQT09MXHJcbiAgICAgICAgdmFyIHRvdWNoRGF0YSA9IHRoaXMuZ2V0VG91Y2hEYXRhKCB0b3VjaEV2ZW50ICk7XHJcblxyXG4gICAgICAgIHRvdWNoRGF0YS5vcmlnaW5hbEV2ZW50ID0gZXZlbnQ7XHJcblxyXG4gICAgICAgIHRoaXMuZXZlbnREYXRhLmRhdGEgPSB0b3VjaERhdGE7XHJcbiAgICAgICAgdGhpcy5ldmVudERhdGEuc3RvcHBlZCA9IGZhbHNlO1xyXG5cclxuICAgICAgICB0aGlzLnByb2Nlc3NJbnRlcmFjdGl2ZSggdG91Y2hEYXRhLmdsb2JhbCwgdGhpcy5yZW5kZXJlci5fbGFzdE9iamVjdFJlbmRlcmVkLCB0aGlzLnByb2Nlc3NUb3VjaFN0YXJ0LCB0cnVlICk7XHJcblxyXG4gICAgICAgIHRoaXMucmV0dXJuVG91Y2hEYXRhKCB0b3VjaERhdGEgKTtcclxuICAgIH1cclxufTtcclxuXHJcbi8qKlxyXG4gKiBQcm9jZXNzZXMgdGhlIHJlc3VsdCBvZiBhIHRvdWNoIGNoZWNrIGFuZCBkaXNwYXRjaGVzIHRoZSBldmVudCBpZiBuZWVkIGJlXHJcbiAqXHJcbiAqIEBwYXJhbSBkaXNwbGF5T2JqZWN0IHtQSVhJLkNvbnRhaW5lcnxQSVhJLlNwcml0ZXxQSVhJLmV4dHJhcy5UaWxpbmdTcHJpdGV9IFRoZSBkaXNwbGF5IG9iamVjdCB0aGF0IHdhcyB0ZXN0ZWRcclxuICogQHBhcmFtIGhpdCB7Ym9vbGVhbn0gdGhlIHJlc3VsdCBvZiB0aGUgaGl0IHRlc3Qgb24gdGhlIGRpc3BsYXkgb2JqZWN0XHJcbiAqIEBwcml2YXRlXHJcbiAqL1xyXG5JbnRlcmFjdGlvbk1hbmFnZXIucHJvdG90eXBlLnByb2Nlc3NUb3VjaFN0YXJ0ID0gZnVuY3Rpb24gKCBkaXNwbGF5T2JqZWN0LCBoaXQgKVxyXG57XHJcbiAgICAvL2NvbnNvbGUubG9nKFwiaGl0XCIgKyBoaXQpXHJcbiAgICBpZihoaXQpXHJcbiAgICB7XHJcbiAgICAgICAgZGlzcGxheU9iamVjdC5fdG91Y2hEb3duID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoIGRpc3BsYXlPYmplY3QsICd0b3VjaHN0YXJ0JywgdGhpcy5ldmVudERhdGEgKTtcclxuICAgIH1cclxufTtcclxuXHJcblxyXG4vKipcclxuICogSXMgY2FsbGVkIHdoZW4gYSB0b3VjaCBlbmRzIG9uIHRoZSByZW5kZXJlciBlbGVtZW50XHJcbiAqXHJcbiAqIEBwYXJhbSBldmVudCB7RXZlbnR9IFRoZSBET00gZXZlbnQgb2YgYSB0b3VjaCBlbmRpbmcgb24gdGhlIHJlbmRlcmVyIHZpZXdcclxuICovXHJcbkludGVyYWN0aW9uTWFuYWdlci5wcm90b3R5cGUub25Ub3VjaEVuZCA9IGZ1bmN0aW9uIChldmVudClcclxue1xyXG4gICAgaWYgKHRoaXMuYXV0b1ByZXZlbnREZWZhdWx0KVxyXG4gICAge1xyXG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGNoYW5nZWRUb3VjaGVzID0gZXZlbnQuY2hhbmdlZFRvdWNoZXM7XHJcbiAgICB2YXIgY0xlbmd0aCA9IGNoYW5nZWRUb3VjaGVzLmxlbmd0aDtcclxuXHJcbiAgICBmb3IgKHZhciBpPTA7IGkgPCBjTGVuZ3RoOyBpKyspXHJcbiAgICB7XHJcbiAgICAgICAgdmFyIHRvdWNoRXZlbnQgPSBjaGFuZ2VkVG91Y2hlc1tpXTtcclxuXHJcbiAgICAgICAgdmFyIHRvdWNoRGF0YSA9IHRoaXMuZ2V0VG91Y2hEYXRhKCB0b3VjaEV2ZW50ICk7XHJcblxyXG4gICAgICAgIHRvdWNoRGF0YS5vcmlnaW5hbEV2ZW50ID0gZXZlbnQ7XHJcblxyXG4gICAgICAgIC8vVE9ETyB0aGlzIHNob3VsZCBiZSBwYXNzZWQgYWxvbmcuLiBubyBzZXRcclxuICAgICAgICB0aGlzLmV2ZW50RGF0YS5kYXRhID0gdG91Y2hEYXRhO1xyXG4gICAgICAgIHRoaXMuZXZlbnREYXRhLnN0b3BwZWQgPSBmYWxzZTtcclxuXHJcblxyXG4gICAgICAgIHRoaXMucHJvY2Vzc0ludGVyYWN0aXZlKCB0b3VjaERhdGEuZ2xvYmFsLCB0aGlzLnJlbmRlcmVyLl9sYXN0T2JqZWN0UmVuZGVyZWQsIHRoaXMucHJvY2Vzc1RvdWNoRW5kLCB0cnVlICk7XHJcblxyXG4gICAgICAgIHRoaXMucmV0dXJuVG91Y2hEYXRhKCB0b3VjaERhdGEgKTtcclxuICAgIH1cclxufTtcclxuXHJcbi8qKlxyXG4gKiBQcm9jZXNzZXMgdGhlIHJlc3VsdCBvZiB0aGUgZW5kIG9mIGEgdG91Y2ggYW5kIGRpc3BhdGNoZXMgdGhlIGV2ZW50IGlmIG5lZWQgYmVcclxuICpcclxuICogQHBhcmFtIGRpc3BsYXlPYmplY3Qge1BJWEkuQ29udGFpbmVyfFBJWEkuU3ByaXRlfFBJWEkuZXh0cmFzLlRpbGluZ1Nwcml0ZX0gVGhlIGRpc3BsYXkgb2JqZWN0IHRoYXQgd2FzIHRlc3RlZFxyXG4gKiBAcGFyYW0gaGl0IHtib29sZWFufSB0aGUgcmVzdWx0IG9mIHRoZSBoaXQgdGVzdCBvbiB0aGUgZGlzcGxheSBvYmplY3RcclxuICogQHByaXZhdGVcclxuICovXHJcbkludGVyYWN0aW9uTWFuYWdlci5wcm90b3R5cGUucHJvY2Vzc1RvdWNoRW5kID0gZnVuY3Rpb24gKCBkaXNwbGF5T2JqZWN0LCBoaXQgKVxyXG57XHJcbiAgICBpZihoaXQpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KCBkaXNwbGF5T2JqZWN0LCAndG91Y2hlbmQnLCB0aGlzLmV2ZW50RGF0YSApO1xyXG5cclxuICAgICAgICBpZiggZGlzcGxheU9iamVjdC5fdG91Y2hEb3duIClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGRpc3BsYXlPYmplY3QuX3RvdWNoRG93biA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoIGRpc3BsYXlPYmplY3QsICd0YXAnLCB0aGlzLmV2ZW50RGF0YSApO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGVsc2VcclxuICAgIHtcclxuICAgICAgICBpZiggZGlzcGxheU9iamVjdC5fdG91Y2hEb3duIClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGRpc3BsYXlPYmplY3QuX3RvdWNoRG93biA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoIGRpc3BsYXlPYmplY3QsICd0b3VjaGVuZG91dHNpZGUnLCB0aGlzLmV2ZW50RGF0YSApO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcbi8qKlxyXG4gKiBJcyBjYWxsZWQgd2hlbiBhIHRvdWNoIGlzIG1vdmVkIGFjcm9zcyB0aGUgcmVuZGVyZXIgZWxlbWVudFxyXG4gKlxyXG4gKiBAcGFyYW0gZXZlbnQge0V2ZW50fSBUaGUgRE9NIGV2ZW50IG9mIGEgdG91Y2ggbW92aW5nIGFjcm9zcyB0aGUgcmVuZGVyZXIgdmlld1xyXG4gKiBAcHJpdmF0ZVxyXG4gKi9cclxuSW50ZXJhY3Rpb25NYW5hZ2VyLnByb3RvdHlwZS5vblRvdWNoTW92ZSA9IGZ1bmN0aW9uIChldmVudClcclxue1xyXG4gICAgaWYgKHRoaXMuYXV0b1ByZXZlbnREZWZhdWx0KVxyXG4gICAge1xyXG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGNoYW5nZWRUb3VjaGVzID0gZXZlbnQuY2hhbmdlZFRvdWNoZXM7XHJcbiAgICB2YXIgY0xlbmd0aCA9IGNoYW5nZWRUb3VjaGVzLmxlbmd0aDtcclxuXHJcbiAgICBmb3IgKHZhciBpPTA7IGkgPCBjTGVuZ3RoOyBpKyspXHJcbiAgICB7XHJcbiAgICAgICAgdmFyIHRvdWNoRXZlbnQgPSBjaGFuZ2VkVG91Y2hlc1tpXTtcclxuXHJcbiAgICAgICAgdmFyIHRvdWNoRGF0YSA9IHRoaXMuZ2V0VG91Y2hEYXRhKCB0b3VjaEV2ZW50ICk7XHJcblxyXG4gICAgICAgIHRvdWNoRGF0YS5vcmlnaW5hbEV2ZW50ID0gZXZlbnQ7XHJcblxyXG4gICAgICAgIHRoaXMuZXZlbnREYXRhLmRhdGEgPSB0b3VjaERhdGE7XHJcbiAgICAgICAgdGhpcy5ldmVudERhdGEuc3RvcHBlZCA9IGZhbHNlO1xyXG5cclxuICAgICAgICB0aGlzLnByb2Nlc3NJbnRlcmFjdGl2ZSggdG91Y2hEYXRhLmdsb2JhbCwgdGhpcy5yZW5kZXJlci5fbGFzdE9iamVjdFJlbmRlcmVkLCB0aGlzLnByb2Nlc3NUb3VjaE1vdmUsIHRydWUgKTtcclxuXHJcbiAgICAgICAgdGhpcy5yZXR1cm5Ub3VjaERhdGEoIHRvdWNoRGF0YSApO1xyXG4gICAgfVxyXG59O1xyXG5cclxuLyoqXHJcbiAqIFByb2Nlc3NlcyB0aGUgcmVzdWx0IG9mIGEgdG91Y2ggbW92ZSBjaGVjayBhbmQgZGlzcGF0Y2hlcyB0aGUgZXZlbnQgaWYgbmVlZCBiZVxyXG4gKlxyXG4gKiBAcGFyYW0gZGlzcGxheU9iamVjdCB7UElYSS5Db250YWluZXJ8UElYSS5TcHJpdGV8UElYSS5leHRyYXMuVGlsaW5nU3ByaXRlfSBUaGUgZGlzcGxheSBvYmplY3QgdGhhdCB3YXMgdGVzdGVkXHJcbiAqIEBwYXJhbSBoaXQge2Jvb2xlYW59IHRoZSByZXN1bHQgb2YgdGhlIGhpdCB0ZXN0IG9uIHRoZSBkaXNwbGF5IG9iamVjdFxyXG4gKiBAcHJpdmF0ZVxyXG4gKi9cclxuSW50ZXJhY3Rpb25NYW5hZ2VyLnByb3RvdHlwZS5wcm9jZXNzVG91Y2hNb3ZlID0gZnVuY3Rpb24gKCBkaXNwbGF5T2JqZWN0LCBoaXQgKVxyXG57XHJcbiAgICBoaXQgPSBoaXQ7XHJcbiAgICB0aGlzLmRpc3BhdGNoRXZlbnQoIGRpc3BsYXlPYmplY3QsICd0b3VjaG1vdmUnLCB0aGlzLmV2ZW50RGF0YSk7XHJcbn07XHJcblxyXG4vKipcclxuICogR3JhYnMgYW4gaW50ZXJhY3Rpb24gZGF0YSBvYmplY3QgZnJvbSB0aGUgaW50ZXJuYWwgcG9vbFxyXG4gKlxyXG4gKiBAcGFyYW0gdG91Y2hFdmVudCB7RXZlbnREYXRhfSBUaGUgdG91Y2ggZXZlbnQgd2UgbmVlZCB0byBwYWlyIHdpdGggYW4gaW50ZXJhY3Rpb25EYXRhIG9iamVjdFxyXG4gKlxyXG4gKiBAcHJpdmF0ZVxyXG4gKi9cclxuSW50ZXJhY3Rpb25NYW5hZ2VyLnByb3RvdHlwZS5nZXRUb3VjaERhdGEgPSBmdW5jdGlvbiAodG91Y2hFdmVudClcclxue1xyXG4gICAgdmFyIHRvdWNoRGF0YSA9IHRoaXMuaW50ZXJhY3RpdmVEYXRhUG9vbC5wb3AoKTtcclxuXHJcbiAgICBpZighdG91Y2hEYXRhKVxyXG4gICAge1xyXG4gICAgICAgIHRvdWNoRGF0YSA9IG5ldyBJbnRlcmFjdGlvbkRhdGEoKTtcclxuICAgIH1cclxuXHJcbiAgICB0b3VjaERhdGEuaWRlbnRpZmllciA9IHRvdWNoRXZlbnQuaWRlbnRpZmllcjtcclxuICAgIHRoaXMubWFwUG9zaXRpb25Ub1BvaW50KCB0b3VjaERhdGEuZ2xvYmFsLCB0b3VjaEV2ZW50LmNsaWVudFgsIHRvdWNoRXZlbnQuY2xpZW50WSApO1xyXG5cclxuICAgIGlmKG5hdmlnYXRvci5pc0NvY29vbkpTKVxyXG4gICAge1xyXG4gICAgICAgIHRvdWNoRGF0YS5nbG9iYWwueCA9IHRvdWNoRGF0YS5nbG9iYWwueCAvIHRoaXMucmVzb2x1dGlvbjtcclxuICAgICAgICB0b3VjaERhdGEuZ2xvYmFsLnkgPSB0b3VjaERhdGEuZ2xvYmFsLnkgLyB0aGlzLnJlc29sdXRpb247XHJcbiAgICB9XHJcblxyXG4gICAgdG91Y2hFdmVudC5nbG9iYWxYID0gdG91Y2hEYXRhLmdsb2JhbC54O1xyXG4gICAgdG91Y2hFdmVudC5nbG9iYWxZID0gdG91Y2hEYXRhLmdsb2JhbC55O1xyXG5cclxuICAgIHJldHVybiB0b3VjaERhdGE7XHJcbn07XHJcblxyXG4vKipcclxuICogUmV0dXJucyBhbiBpbnRlcmFjdGlvbiBkYXRhIG9iamVjdCB0byB0aGUgaW50ZXJuYWwgcG9vbFxyXG4gKlxyXG4gKiBAcGFyYW0gdG91Y2hEYXRhIHtQSVhJLmludGVyYWN0aW9uLkludGVyYWN0aW9uRGF0YX0gVGhlIHRvdWNoIGRhdGEgb2JqZWN0IHdlIHdhbnQgdG8gcmV0dXJuIHRvIHRoZSBwb29sXHJcbiAqXHJcbiAqIEBwcml2YXRlXHJcbiAqL1xyXG5JbnRlcmFjdGlvbk1hbmFnZXIucHJvdG90eXBlLnJldHVyblRvdWNoRGF0YSA9IGZ1bmN0aW9uICggdG91Y2hEYXRhIClcclxue1xyXG4gICAgdGhpcy5pbnRlcmFjdGl2ZURhdGFQb29sLnB1c2goIHRvdWNoRGF0YSApO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIERlc3Ryb3lzIHRoZSBpbnRlcmFjdGlvbiBtYW5hZ2VyXHJcbiAqXHJcbiAqL1xyXG5JbnRlcmFjdGlvbk1hbmFnZXIucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB0aGlzLnJlbW92ZUV2ZW50cygpO1xyXG5cclxuICAgIHRoaXMucmVuZGVyZXIgPSBudWxsO1xyXG5cclxuICAgIHRoaXMubW91c2UgPSBudWxsO1xyXG5cclxuICAgIHRoaXMuZXZlbnREYXRhID0gbnVsbDtcclxuXHJcbiAgICB0aGlzLmludGVyYWN0aXZlRGF0YVBvb2wgPSBudWxsO1xyXG5cclxuICAgIHRoaXMuaW50ZXJhY3Rpb25ET01FbGVtZW50ID0gbnVsbDtcclxuXHJcbiAgICB0aGlzLm9uTW91c2VVcCA9IG51bGw7XHJcbiAgICB0aGlzLnByb2Nlc3NNb3VzZVVwID0gbnVsbDtcclxuXHJcblxyXG4gICAgdGhpcy5vbk1vdXNlRG93biA9IG51bGw7XHJcbiAgICB0aGlzLnByb2Nlc3NNb3VzZURvd24gPSBudWxsO1xyXG5cclxuICAgIHRoaXMub25Nb3VzZU1vdmUgPSBudWxsO1xyXG4gICAgdGhpcy5wcm9jZXNzTW91c2VNb3ZlID0gbnVsbDtcclxuXHJcbiAgICB0aGlzLm9uTW91c2VPdXQgPSBudWxsO1xyXG4gICAgdGhpcy5wcm9jZXNzTW91c2VPdmVyT3V0ID0gbnVsbDtcclxuXHJcblxyXG4gICAgdGhpcy5vblRvdWNoU3RhcnQgPSBudWxsO1xyXG4gICAgdGhpcy5wcm9jZXNzVG91Y2hTdGFydCA9IG51bGw7XHJcblxyXG4gICAgdGhpcy5vblRvdWNoRW5kID0gbnVsbDtcclxuICAgIHRoaXMucHJvY2Vzc1RvdWNoRW5kID0gbnVsbDtcclxuXHJcbiAgICB0aGlzLm9uVG91Y2hNb3ZlID0gbnVsbDtcclxuICAgIHRoaXMucHJvY2Vzc1RvdWNoTW92ZSA9IG51bGw7XHJcblxyXG4gICAgdGhpcy5fdGVtcFBvaW50ID0gbnVsbDtcclxufTtcclxuXHJcbi8vY29yZS5XZWJHTFJlbmRlcmVyLnJlZ2lzdGVyUGx1Z2luKCdpbnRlcmFjdGlvbicsIEludGVyYWN0aW9uTWFuYWdlcik7XHJcbmNvcmUuQ2FudmFzUmVuZGVyZXIucmVnaXN0ZXJQbHVnaW4oJ2ludGVyYWN0aW9uJywgSW50ZXJhY3Rpb25NYW5hZ2VyKTtcclxuIiwiLyoqXHJcbiAqIEBmaWxlICAgICAgICBNYWluIGV4cG9ydCBvZiB0aGUgUElYSSBpbnRlcmFjdGlvbnMgbGlicmFyeVxyXG4gKiBAYXV0aG9yICAgICAgTWF0IEdyb3ZlcyA8bWF0QGdvb2Rib3lkaWdpdGFsLmNvbT5cclxuICogQGNvcHlyaWdodCAgIDIwMTMtMjAxNSBHb29kQm95RGlnaXRhbFxyXG4gKiBAbGljZW5zZSAgICAge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9waXhpanMvcGl4aS5qcy9ibG9iL21hc3Rlci9MSUNFTlNFfE1JVCBMaWNlbnNlfVxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBAbmFtZXNwYWNlIFBJWEkuaW50ZXJhY3Rpb25cclxuICovXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gICAgSW50ZXJhY3Rpb25EYXRhOiAgICByZXF1aXJlKCcuL0ludGVyYWN0aW9uRGF0YScpLFxyXG4gICAgSW50ZXJhY3Rpb25NYW5hZ2VyOiByZXF1aXJlKCcuL0ludGVyYWN0aW9uTWFuYWdlcicpLFxyXG4gICAgaW50ZXJhY3RpdmVUYXJnZXQ6ICByZXF1aXJlKCcuL2ludGVyYWN0aXZlVGFyZ2V0JylcclxufTtcclxuIiwiLyoqXHJcbiAqIERlZmF1bHQgcHJvcGVydHkgdmFsdWVzIG9mIGludGVyYWN0aXZlIG9iamVjdHNcclxuICogdXNlZCBieSB7QGxpbmsgUElYSS5pbnRlcmFjdGlvbi5JbnRlcmFjdGlvbk1hbmFnZXJ9LlxyXG4gKlxyXG4gKiBAbWl4aW5cclxuICogQG1lbWJlcm9mIFBJWEkuaW50ZXJhY3Rpb25cclxuICogQGV4YW1wbGVcclxuICogICAgICBmdW5jdGlvbiBNeU9iamVjdCgpIHt9XHJcbiAqXHJcbiAqICAgICAgT2JqZWN0LmFzc2lnbihcclxuICogICAgICAgICAgTXlPYmplY3QucHJvdG90eXBlLFxyXG4gKiAgICAgICAgICBQSVhJLmludGVyYWN0aW9uLmludGVyYWN0aXZlVGFyZ2V0XHJcbiAqICAgICAgKTtcclxuICovXHJcbnZhciBpbnRlcmFjdGl2ZVRhcmdldCA9IHtcclxuICAgIC8qKlxyXG4gICAgICogQHRvZG8gTmVlZHMgZG9jcy5cclxuICAgICAqL1xyXG4gICAgaW50ZXJhY3RpdmU6IGZhbHNlLFxyXG4gICAgLyoqXHJcbiAgICAgKiBAdG9kbyBOZWVkcyBkb2NzLlxyXG4gICAgICovXHJcbiAgICBidXR0b25Nb2RlOiBmYWxzZSxcclxuICAgIC8qKlxyXG4gICAgICogQHRvZG8gTmVlZHMgZG9jcy5cclxuICAgICAqL1xyXG4gICAgaW50ZXJhY3RpdmVDaGlsZHJlbjogdHJ1ZSxcclxuICAgIC8qKlxyXG4gICAgICogQHRvZG8gTmVlZHMgZG9jcy5cclxuICAgICAqL1xyXG4gICAgZGVmYXVsdEN1cnNvcjogJ3BvaW50ZXInLFxyXG5cclxuICAgIC8vIHNvbWUgaW50ZXJuYWwgY2hlY2tzLi5cclxuXHJcbiAgICAvKipcclxuICAgICAqIEB0b2RvIE5lZWRzIGRvY3MuXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfb3ZlcjogZmFsc2UsXHJcbiAgICAvKipcclxuICAgICAqIEB0b2RvIE5lZWRzIGRvY3MuXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfdG91Y2hEb3duOiBmYWxzZVxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBpbnRlcmFjdGl2ZVRhcmdldDtcclxuIiwiLy8gUmVmZXJlbmNlczpcclxuLy8gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvTWF0aC9zaWduXHJcblxyXG5pZiAoIU1hdGguc2lnbilcclxue1xyXG4gICAgTWF0aC5zaWduID0gZnVuY3Rpb24gKHgpIHtcclxuICAgICAgICB4ID0gK3g7XHJcbiAgICAgICAgaWYgKHggPT09IDAgfHwgaXNOYU4oeCkpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICByZXR1cm4geDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHggPiAwID8gMSA6IC0xO1xyXG4gICAgfTtcclxufVxyXG4iLCIvLyBSZWZlcmVuY2VzOlxyXG4vLyBodHRwczovL2dpdGh1Yi5jb20vc2luZHJlc29yaHVzL29iamVjdC1hc3NpZ25cclxuLy8gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvT2JqZWN0L2Fzc2lnblxyXG5cclxuaWYgKCFPYmplY3QuYXNzaWduKVxyXG57XHJcbiAgICBPYmplY3QuYXNzaWduID0gcmVxdWlyZSgnb2JqZWN0LWFzc2lnbicpO1xyXG59XHJcbiIsInJlcXVpcmUoJy4vT2JqZWN0LmFzc2lnbicpO1xyXG5yZXF1aXJlKCcuL3JlcXVlc3RBbmltYXRpb25GcmFtZScpO1xyXG5yZXF1aXJlKCcuL01hdGguc2lnbicpO1xyXG4iLCIvLyBSZWZlcmVuY2VzOlxyXG4vLyBodHRwOi8vcGF1bGlyaXNoLmNvbS8yMDExL3JlcXVlc3RhbmltYXRpb25mcmFtZS1mb3Itc21hcnQtYW5pbWF0aW5nL1xyXG4vLyBodHRwczovL2dpc3QuZ2l0aHViLmNvbS8xNTc5NjcxXHJcbi8vIGh0dHA6Ly91cGRhdGVzLmh0bWw1cm9ja3MuY29tLzIwMTIvMDUvcmVxdWVzdEFuaW1hdGlvbkZyYW1lLUFQSS1ub3ctd2l0aC1zdWItbWlsbGlzZWNvbmQtcHJlY2lzaW9uXHJcbi8vIGh0dHBzOi8vZ2lzdC5naXRodWIuY29tL3RpbWhhbGwvNDA3ODYxNFxyXG4vLyBodHRwczovL2dpdGh1Yi5jb20vRmluYW5jaWFsLVRpbWVzL3BvbHlmaWxsLXNlcnZpY2UvdHJlZS9tYXN0ZXIvcG9seWZpbGxzL3JlcXVlc3RBbmltYXRpb25GcmFtZVxyXG5cclxuLy8gRXhwZWN0ZWQgdG8gYmUgdXNlZCB3aXRoIEJyb3dzZXJmaXlcclxuLy8gQnJvd3NlcmlmeSBhdXRvbWF0aWNhbGx5IGRldGVjdHMgdGhlIHVzZSBvZiBgZ2xvYmFsYCBhbmQgcGFzc2VzIHRoZVxyXG4vLyBjb3JyZWN0IHJlZmVyZW5jZSBvZiBgZ2xvYmFsYCwgYHNlbGZgLCBhbmQgZmluYWxseSBgd2luZG93YFxyXG5cclxuLy8gRGF0ZS5ub3dcclxuaWYgKCEoRGF0ZS5ub3cgJiYgRGF0ZS5wcm90b3R5cGUuZ2V0VGltZSkpIHtcclxuICAgIERhdGUubm93ID0gZnVuY3Rpb24gbm93KCkge1xyXG4gICAgICAgIHJldHVybiBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcclxuICAgIH07XHJcbn1cclxuXHJcbi8vIHBlcmZvcm1hbmNlLm5vd1xyXG5pZiAoIShnbG9iYWwucGVyZm9ybWFuY2UgJiYgZ2xvYmFsLnBlcmZvcm1hbmNlLm5vdykpIHtcclxuICAgIHZhciBzdGFydFRpbWUgPSBEYXRlLm5vdygpO1xyXG4gICAgaWYgKCFnbG9iYWwucGVyZm9ybWFuY2UpIHtcclxuICAgICAgICBnbG9iYWwucGVyZm9ybWFuY2UgPSB7fTtcclxuICAgIH1cclxuICAgIGdsb2JhbC5wZXJmb3JtYW5jZS5ub3cgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIERhdGUubm93KCkgLSBzdGFydFRpbWU7XHJcbiAgICB9O1xyXG59XHJcblxyXG4vLyByZXF1ZXN0QW5pbWF0aW9uRnJhbWVcclxudmFyIGxhc3RUaW1lID0gRGF0ZS5ub3coKTtcclxudmFyIHZlbmRvcnMgPSBbJ21zJywgJ21veicsICd3ZWJraXQnLCAnbyddO1xyXG5cclxuZm9yKHZhciB4ID0gMDsgeCA8IHZlbmRvcnMubGVuZ3RoICYmICFnbG9iYWwucmVxdWVzdEFuaW1hdGlvbkZyYW1lOyArK3gpIHtcclxuICAgIGdsb2JhbC5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSBnbG9iYWxbdmVuZG9yc1t4XSArICdSZXF1ZXN0QW5pbWF0aW9uRnJhbWUnXTtcclxuICAgIGdsb2JhbC5jYW5jZWxBbmltYXRpb25GcmFtZSA9IGdsb2JhbFt2ZW5kb3JzW3hdICsgJ0NhbmNlbEFuaW1hdGlvbkZyYW1lJ10gfHxcclxuICAgICAgICBnbG9iYWxbdmVuZG9yc1t4XSArICdDYW5jZWxSZXF1ZXN0QW5pbWF0aW9uRnJhbWUnXTtcclxufVxyXG5cclxuaWYgKCFnbG9iYWwucmVxdWVzdEFuaW1hdGlvbkZyYW1lKSB7XHJcbiAgICBnbG9iYWwucmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gZnVuY3Rpb24gKGNhbGxiYWNrKSB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBjYWxsYmFjayAhPT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGNhbGxiYWNrICsgJ2lzIG5vdCBhIGZ1bmN0aW9uJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgY3VycmVudFRpbWUgPSBEYXRlLm5vdygpLFxyXG4gICAgICAgICAgICBkZWxheSA9IDE2ICsgbGFzdFRpbWUgLSBjdXJyZW50VGltZTtcclxuXHJcbiAgICAgICAgaWYgKGRlbGF5IDwgMCkge1xyXG4gICAgICAgICAgICBkZWxheSA9IDA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsYXN0VGltZSA9IGN1cnJlbnRUaW1lO1xyXG5cclxuICAgICAgICByZXR1cm4gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGxhc3RUaW1lID0gRGF0ZS5ub3coKTtcclxuICAgICAgICAgICAgY2FsbGJhY2socGVyZm9ybWFuY2Uubm93KCkpO1xyXG4gICAgICAgIH0sIGRlbGF5KTtcclxuICAgIH07XHJcbn1cclxuXHJcbmlmICghZ2xvYmFsLmNhbmNlbEFuaW1hdGlvbkZyYW1lKSB7XHJcbiAgICBnbG9iYWwuY2FuY2VsQW5pbWF0aW9uRnJhbWUgPSBmdW5jdGlvbihpZCkge1xyXG4gICAgICAgIGNsZWFyVGltZW91dChpZCk7XHJcbiAgICB9O1xyXG59XHJcbiJdfQ==

//# sourceMappingURL=pixi.js.map
