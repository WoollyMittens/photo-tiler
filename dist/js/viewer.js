/*
Source:
van Creij, Maurice (2014). "useful.positions.js: A library of useful functions to ease working with screen positions.", version 20141127, http://www.woollymittens.nl/.

License:
This work is licensed under a Creative Commons Attribution 3.0 Unported License.
*/

// public object
var useful = useful || {};

(function(){

	// Invoke strict mode
	"use strict";

	// Create a private object for this library
	useful.positions = {

		// find the dimensions of the window
		window : function (parent) {
			// define a position object
			var dimensions = {x : 0, y : 0};
			// if an alternative was given to use as a window
			if (parent && parent !== window && parent !== document) {
				// find the current dimensions of surrogate window
				dimensions.x = parent.offsetWidth;
				dimensions.y = parent.offsetHeight;
			} else {
				// find the current dimensions of the window
				dimensions.x = window.innerWidth || document.body.clientWidth;
				dimensions.y = window.innerHeight || document.body.clientHeight;
			}
			// return the object
			return dimensions;
		},

		// find the scroll position of an element
		document : function (parent) {
			// define a position object
			var position = {x : 0, y : 0};
			// find the current position in the document
			if (parent && parent !== window && parent !== document) {
				position.x = parent.scrollLeft;
				position.y = parent.scrollTop;
			} else {
				position.x = (window.pageXOffset) ?
				window.pageXOffset :
				(document.documentElement) ?
				document.documentElement.scrollLeft :
				document.body.scrollLeft;
				position.y = (window.pageYOffset) ?
				window.pageYOffset :
				(document.documentElement) ?
				document.documentElement.scrollTop :
				document.body.scrollTop;
			}
			// return the object
			return position;
		},

		// finds the position of the element, relative to the document
		object : function (node) {
			// define a position object
			var position = {x : 0, y : 0};
			// if offsetparent exists
			if (node.offsetParent) {
				// add every parent's offset
				while (node.offsetParent) {
					position.x += node.offsetLeft;
					position.y += node.offsetTop;
					node = node.offsetParent;
				}
			}
			// return the object
			return position;
		},

		// find the position of the mouse cursor relative to an element
		cursor : function (event, parent) {
			// get the event properties
			event = event || window.event;
			// define a position object
			var position = {x : 0, y : 0};
			// find the current position on the document
			if (event.touches && event.touches[0]) {
				position.x = event.touches[0].pageX;
				position.y = event.touches[0].pageY;
			} else if (event.pageX !== undefined) {
				position.x = event.pageX;
				position.y = event.pageY;
			} else {
				position.x = event.clientX + (document.documentElement.scrollLeft || document.body.scrollLeft);
				position.y = event.clientY + (document.documentElement.scrollTop || document.body.scrollTop);
			}
			// if a parent was given
			if (parent) {
				// retrieve the position of the parent
				var offsets = this.object(parent);
				// adjust the coordinates to fit the parent
				position.x -= offsets.x;
				position.y -= offsets.y;
			}
			// return the object
			return position;
		}

	};

	// return as a require.js module
	if (typeof module !== 'undefined') {
		exports = module.exports = useful.positions;
	}

})();

/*
	Source:
	van Creij, Maurice (2014). "useful.transitions.js: A library of useful functions to ease working with CSS3 transitions.", version 20141127, http://www.woollymittens.nl/.

	License:
	This work is licensed under a Creative Commons Attribution 3.0 Unported License.
*/

// public object
var useful = useful || {};

(function(){

	// Invoke strict mode
	"use strict";

	// Create a private object for this library
	useful.transitions = {

		// applies functionality to node that conform to a given CSS rule, or returns them
		select : function (input, parent) {
			var a, b, elements;
			// validate the input
			parent = parent || document;
			input = (typeof input === 'string') ? {'rule' : input, 'parent' : parent} : input;
			input.parent = input.parent || document;
			input.data = input.data || {};
			// use querySelectorAll to select elements, or defer to jQuery
			elements = (typeof(document.querySelectorAll) !== 'undefined') ?
				input.parent.querySelectorAll(input.rule) :
				(typeof(jQuery) !== 'undefined') ? jQuery(input.parent).find(input.rule).get() : [];
			// if there was a handler
			if (typeof(input.handler) !== 'undefined') {
				// for each element
				for (a = 0, b = elements.length; a < b; a += 1) {
					// run the handler and pass a unique copy of the data (in case it's a model)
					input.handler(elements[a], input.data.create());
				}
			// else assume the function was called for a list of elements
			} else {
				// return the selected elements
				return elements;
			}
		},

		// checks the compatibility of CSS3 transitions for this browser
		compatibility : function () {
			var eventName, newDiv, empty;
			// create a test div
			newDiv = document.createElement('div');
			// use various tests for transition support
			if (typeof(newDiv.style.MozTransition) !== 'undefined') { eventName = 'transitionend'; }
			try { document.createEvent('OTransitionEvent'); eventName = 'oTransitionEnd'; } catch (e) { empty = null; }
			try { document.createEvent('WebKitTransitionEvent'); eventName = 'webkitTransitionEnd'; } catch (e) { empty = null; }
			try { document.createEvent('transitionEvent'); eventName = 'transitionend'; } catch (e) { empty = null; }
			// remove the test div
			newDiv = empty;
			// pass back working event name
			return eventName;
		},

		// performs a transition between two classnames
		byClass : function (element, removedClass, addedClass, endEventHandler, jQueryDuration, jQueryEasing) {
			var replaceThis, replaceWith, endEventName, endEventFunction;
			// validate the input
			endEventHandler = endEventHandler || function () {};
			endEventName = this.compatibility();
			// turn the classnames into regular expressions
			replaceThis = new RegExp(removedClass.trim().replace(/ {2,}/g, ' ').split(' ').join('|'), 'g');
			replaceWith = new RegExp(addedClass, 'g');
			// if CSS3 transitions are available
			if (typeof endEventName !== 'undefined') {
				// set the onComplete handler and immediately remove it afterwards
				element.addEventListener(endEventName, endEventFunction = function () {
					endEventHandler();
					element.removeEventListener(endEventName, endEventFunction, true);
				}, true);
				// replace the class name
				element.className = (element.className.replace(replaceThis, '') + ' ' + addedClass).replace(/ {2,}/g, ' ').trim();
			// else if jQuery UI is available
			} else if (typeof jQuery !== 'undefined' && typeof jQuery.ui !== 'undefined') {
				// retrieve any extra information for jQuery
				jQueryDuration = jQueryDuration || 500;
				jQueryEasing = jQueryEasing || 'swing';
				// use switchClass from jQuery UI to approximate CSS3 transitions
				jQuery(element).switchClass(removedClass.replace(replaceWith, ''), addedClass, jQueryDuration, jQueryEasing, endEventHandler);
			// if all else fails
			} else {
				// just replace the class name
				element.className = (element.className.replace(replaceThis, '') + ' ' + addedClass).replace(/ {2,}/g, ' ').trim();
				// and call the onComplete handler
				endEventHandler();
			}
		},

		// adds the relevant browser prefix to a style property
		prefix : function (property) {
			// pick the prefix that goes with the browser
			return (navigator.userAgent.match(/webkit/gi)) ? 'webkit' + property.substr(0, 1).toUpperCase() + property.substr(1):
				(navigator.userAgent.match(/firefox/gi)) ? 'Moz' + property.substr(0, 1).toUpperCase() + property.substr(1):
				(navigator.userAgent.match(/microsoft/gi)) ? 'ms' + property.substr(0, 1).toUpperCase() + property.substr(1):
				(navigator.userAgent.match(/opera/gi)) ? 'O' + property.substr(0, 1).toUpperCase() + property.substr(1):
				property;
		},

		// applies a list of rules
		byRules : function (element, rules, endEventHandler) {
			var rule, endEventName, endEventFunction;
			// validate the input
			rules.transitionProperty = rules.transitionProperty || 'all';
			rules.transitionDuration = rules.transitionDuration || '300ms';
			rules.transitionTimingFunction = rules.transitionTimingFunction || 'ease';
			endEventHandler = endEventHandler || function () {};
			endEventName = this.compatibility();
			// if CSS3 transitions are available
			if (typeof endEventName !== 'undefined') {
				// set the onComplete handler and immediately remove it afterwards
				element.addEventListener(endEventName, endEventFunction = function () {
					endEventHandler();
					element.removeEventListener(endEventName, endEventFunction, true);
				}, true);
				// for all rules
				for (rule in rules) {
					if (rules.hasOwnProperty(rule)) {
						// implement the prefixed value
						element.style[this.compatibility(rule)] = rules[rule];
						// implement the value
						element.style[rule] = rules[rule];
					}
				}
			// else if jQuery is available
			} else if (typeof jQuery !== 'undefined') {
				var jQueryEasing, jQueryDuration;
				// pick the equivalent jQuery animation function
				jQueryEasing = (rules.transitionTimingFunction.match(/ease/gi)) ? 'swing' : 'linear';
				jQueryDuration = parseInt(rules.transitionDuration.replace(/s/g, '000').replace(/ms/g, ''), 10);
				// remove rules that will make Internet Explorer complain
				delete rules.transitionProperty;
				delete rules.transitionDuration;
				delete rules.transitionTimingFunction;
				// use animate from jQuery
				jQuery(element).animate(
					rules,
					jQueryDuration,
					jQueryEasing,
					endEventHandler
				);
			// else
			} else {
				// for all rules
				for (rule in rules) {
					if (rules.hasOwnProperty(rule)) {
						// implement the prefixed value
						element.style[this.compatibility(rule)] = rules[rule];
						// implement the value
						element.style[rule] = rules[rule];
					}
				}
				// call the onComplete handler
				endEventHandler();
			}
		}

	};

	// return as a require.js module
	if (typeof module !== 'undefined') {
		exports = module.exports = useful.transitions;
	}

})();

/*
Source:
van Creij, Maurice (2018). "viewer.js: A simple tile based image viewer", http://www.woollymittens.nl/.

License:
This work is licensed under a Creative Commons Attribution 3.0 Unported License.
*/

// establish the class
var Viewer = function (config) {
	// default config
	this.config = {
		'urlprefix' : '',
		'imageslice' : 'php/imageslice.php?src=../{src}&left={left}&top={top}&right={right}&bottom={bottom}&width={width}&height={height}',
		'transforms' : true,
		'width' : '100',
		'widthUnit' : '%',
		'height' : '512',
		'heightUnit' : 'px',
		'divide' : '80%',
		'margin' : '0%',
		'colorPassive' : '#ff6a00',
		'colorActive' : '#d45800',
		'colorHover' : '#ff9800',
		'colorDisabled' : '#7f7f7f',
		'lens' : '0.5',
		'toolbars' : 'buttons', 	// buttons | toolbar | sliders | none
		'zoom' : 'static', 			// static | lens
		'spin' : 'slideshow', 		// rotation | slideshow | catalogue
		'pan' : 'drag', 			// drag | hover
		'magnification' : '1.1',
		'max' : '4',
		'grid' : '256px',
		'cache' : '32',
		'left' : 0,
		'top' : 0,
		'right' : 1,
		'bottom' : 1
	};
	// store the config
	for (var key in config) { this.config[key] = config[key]; }
	// bind the components
	this.main = new this.Main(this);
	// expose the public functions
	this.focus = this.main.focus.bind(this.main);
	this.previous = this.main.previous.bind(this.main);
	this.next = this.main.next.bind(this.main);
	// return the object
	return this;
};

// return as a require.js module
if (typeof module !== 'undefined') {
	exports = module.exports = Viewer;
}

// extend the class
Viewer.prototype.Automatic = function(parent) {

	// PROPERTIES

	this.parent = parent;
	this.config = parent.config;
	this.context = parent.context;

	// METHODS

	this.setup = function() {};
};

// extend the class
Viewer.prototype.Figures_Mouse = function (parent) {

	// PROPERTIES

	this.parent = parent;
	this.config = parent.config;
	this.context = parent.context;
	this.x = null;
	this.y = null;
	this.sensitivity = null;
	this.treshold = null;
	this.flick = null;
	this.delay = null;
	// mouse wheel controls
	this.wheel = function (event) {
		var context = this.context, parent = this.parent, config = this.config;
		// get the reading from the mouse wheel
		var distance = (window.event) ? window.event.wheelDelta / 120 : -event.detail / 3;
		// do not loop around
		if (distance < 0) {
			// increase the zoom factor
			config.status.zoom = config.status.zoom * config.magnification;
		} else if (distance > 0) {
			// decrease the zoom factor
			config.status.zoom = config.status.zoom / config.magnification;
		}
		// temporarily disable streaming for a while to avoid flooding
		config.status.stream = false;
		clearTimeout(this.delay);
		this.delay = setTimeout(function () {
			config.status.stream = true;
			parent.parent.update();
		}, 500);
		// call for a redraw
		parent.parent.update();
		// cancel the scrolling
		event.preventDefault();
	};
	// mouse gesture controls
	this.start = function (event) {
		var context = this.context, parent = this.parent, config = this.config;
		// get the event properties
		event = event || window.event;
		// store the touch positions
		this.x = event.pageX || event.x;
		this.y = event.pageY || event.y;
		// calculate the sensitivity
		this.treshold = config.status.cover.offsetWidth / 10;
		this.flick = config.status.cover.offsetWidth * 0.6;
		// cancel the click
		event.preventDefault();
	};

	this.move = function (event) {
		var context = this.context, parent = this.parent, config = this.config;
		// get the event properties
		event = event || window.event;
		// if there is a touch in progress
		if (this.x !== null) {
			// store the touch positions
			var x = event.pageX || event.x;
			var y = event.pageY || event.y;
			var xDelta = this.x - x;
			var yDelta = this.y - y;
			// if the image was zoomed in
			if (config.status.zoom > 1) {
				// calculate the drag distance into %
				config.status.pan.x -= xDelta * config.status.zoom / config.status.figures[config.status.index].offsetWidth;
				config.status.pan.y -= yDelta * config.status.zoom / config.status.figures[config.status.index].offsetHeight;
				// reset the distance
				this.x = x;
				this.y = y;
				// order a redraw
				parent.parent.update();
			// else there was a spin gesture
			} else if (
				(Math.abs(xDelta) > this.treshold && config.spin === 'rotation') ||
				Math.abs(xDelta) > this.flick
			) {
				// increase the spin
				config.status.index += (xDelta > 0) ? 1 : -1;
				// if in spin mode
				if (config.spin === 'rotation') {
					// loop the value if needed
					if (config.status.index >= config.status.figures.length) {
						config.status.index = 1;
					}
					// loop the value if needed
					if (config.status.index <= 0) {
						config.status.index = config.status.figures.length - 1;
					}
				}
				// reset the distance
				this.x = x;
				this.y = y;
				// order a redraw
				parent.parent.update();
			}
		}
		// cancel the click
		event.preventDefault();
	};

	this.end = function (event) {
		var context = this.context, parent = this.parent, config = this.config;
		// get the event properties
		event = event || window.event;
		// if there was a motion
		if (this.x !== null) {
			// order a redraw
			parent.parent.update();
		}
		// clear the positions
		this.x = null;
		this.y = null;
		// cancel the click
		event.preventDefault();
	};

	this.mirror = function (event) {
		var context = this.context, parent = this.parent, config = this.config;
		// retrieve the mouse position
		var pos = useful.positions.cursor(event, config.status.cover);
		// measure the exact location of the interaction
		config.status.pos.x = pos.x;
		config.status.pos.y = pos.y;
		// order a redraw
		parent.parent.update();
		// cancel the scrolling
		event.preventDefault();
	};
};

// extend the class
Viewer.prototype.Figures_Redraw = function (parent) {

	// PROPERTIES

	this.parent = parent;
	this.config = parent.config;
	this.context = parent.context;

	// METHODS

	this.validate = function () {
		var context = this.context, parent = this.parent, config = this.config;
		// reset the stored limits
		config.status.atMinZoom = false;
		config.status.atMaxZoom = false;
		config.status.atMinLeaf = false;
		config.status.atMaxLeaf = false;
		// check the zoom level
		var minZoom = (config.zoom !== 'static') ? (1 / config.lens) : 1;
		if (config.status.zoom <= minZoom) {
			config.status.zoom = minZoom;
			config.status.atMinZoom = true;
		}
		if (config.status.index <= 1) {
			config.status.index = 1;
			config.status.atMinLeaf = true;
		}
		if (config.status.index >= config.status.figures.length) {
			config.status.index = config.status.figures.length - 1;
			config.status.atMaxLeaf = true;
		}
	};

	this.calculate = function () {
		var context = this.context, parent = this.parent, config = this.config;
		// calculate dimensions for a given zoom level
		this.canvasWidth = config.status.canvas.offsetWidth;
		this.canvasHeight = config.status.canvas.offsetHeight;
		this.canvasLeft = config.status.pos.x - this.canvasWidth / 2;
		this.canvasTop = config.status.pos.y - this.canvasHeight / 2;
		this.maxWidth = config.widths[config.status.index] * (config.rights[config.status.index] - config.lefts[config.status.index]);
		this.maxHeight = config.heights[config.status.index] * (config.bottoms[config.status.index] - config.tops[config.status.index]);
		this.figureAspect = this.maxWidth / this.maxHeight;
		this.figureWidth = this.canvasHeight * this.figureAspect * config.status.zoom;
		this.figureHeight = this.canvasHeight * config.status.zoom;
		this.figureLeft = (config.status.pan.x - 0.5) * this.canvasWidth;
		this.figureTop = (config.status.pan.y - 0.5) * this.canvasHeight;
		this.overscanLeft = (this.figureWidth - this.canvasWidth) / 2;
		this.overscanTop = (this.figureHeight - this.canvasHeight) / 2;
		this.offsetLeft = this.overscanLeft - this.figureLeft;
		this.offsetTop = this.overscanTop - this.figureTop;
		this.minPanLeft = -this.overscanLeft / this.canvasWidth + 0.5;
		this.maxPanLeft = this.overscanLeft / this.canvasWidth + 0.5;
		this.minPanTop = -this.overscanTop / this.canvasHeight + 0.5;
		this.maxPanTop = this.overscanTop / this.canvasHeight + 0.5;
		this.maxZoom = this.maxHeight / this.canvasHeight;
		// extra dimensions for non static zooms
		if (config.zoom !== 'static') {
			this.backgroundWidth = config.status.background.offsetWidth;
			this.backgroundHeight = config.status.background.offsetHeight;
			this.backgroundLeft = (this.backgroundHeight * this.figureAspect - this.backgroundWidth) / 2;
			this.backgroundTop = 0;
		}
	};

	this.normalise = function () {
		var context = this.context, parent = this.parent, config = this.config;
		// normalise the figure position
		if (this.figureWidth >= this.maxWidth || this.figureHeight >= this.maxHeight) {
			this.figureWidth = this.maxWidth;
			this.figureHeight = this.maxHeight;
			config.status.zoom = this.maxZoom;
			config.status.atMaxZoom = true;
		}
		if (this.figureLeft > this.overscanLeft) {
			this.figureLeft = this.overscanLeft;
			config.status.pan.x = this.maxPanLeft;
		}
		if (this.figureLeft < -this.overscanLeft) {
			this.figureLeft = -this.overscanLeft;
			config.status.pan.x = this.minPanLeft;
		}
		if (this.figureTop > this.overscanTop) {
			this.figureTop = this.overscanTop;
			config.status.pan.y = this.maxPanTop;
		}
		if (this.figureTop < -this.overscanTop) {
			this.figureTop = -this.overscanTop;
			config.status.pan.y = this.minPanTop;
		}
		if (this.figureHeight < this.canvasHeight) {
			this.figureWidth = this.canvasHeight / this.maxHeight * this.maxWidth;
			this.figureHeight = this.canvasHeight;
			config.status.zoom = 1;
			config.status.pan.y = 0.5;
		}
		if (this.figureWidth < this.canvasWidth) {
			this.figureLeft = 0;
			config.status.pan.x = 0.5;
		}
	};

	this.canvas = function () {
		var context = this.context, parent = this.parent, config = this.config;
		// figure out the relevant movement
		switch (config.zoom) {
		case 'lens' :
			var fraction, extra, range, offset;
			// set the horizontal shift
			fraction = (1 - (config.status.pos.x + this.backgroundLeft) / (this.backgroundHeight * this.figureAspect));
			extra = this.canvasWidth / this.figureWidth;
			range = this.maxPanLeft - this.minPanLeft + extra * 2;
			offset = this.minPanLeft - extra;
			config.status.pan.x = fraction * range + offset;
			// set the vertical shift
			fraction = (1 - (config.status.pos.y + this.backgroundTop) / this.backgroundHeight);
			extra = this.canvasHeight / this.figureHeight;
			range = this.maxPanTop - this.minPanTop + extra * 2;
			offset = this.minPanTop - extra;
			config.status.pan.y = fraction * range + offset;
			// set the positions
			config.status.canvas.style.left = parseInt(this.canvasLeft, 10) + 'px';
			config.status.canvas.style.top = parseInt(this.canvasTop, 10) + 'px';
			break;
		case 'top' :
			config.status.canvas.style.left = '0px';
			config.status.canvas.style.top = '-' + config.status.canvas.offsetHeight + 'px';
			break;
		case 'right' :
			config.status.canvas.style.left = config.status.canvas.offsetWidth + 'px';
			config.status.canvas.style.top = '0px';
			break;
		case 'bottom' :
			config.status.canvas.style.left = '0px';
			config.status.canvas.style.top = config.status.canvas.offsetHeight + 'px';
			break;
		case 'left' :
			config.status.canvas.style.left = '-' + config.status.canvas.offsetHeight + 'px';
			config.status.canvas.style.top = '0px';
			break;
		}
		// show the appropriate cursor
		if (config.zoom === 'lens') {
			config.status.cover.style.cursor = 'crosshair';
		} else if (config.status.zoom > 1 || config.spin === 'rotation') {
			config.status.cover.style.cursor = 'move';
		} else {
			config.status.cover.style.cursor = 'auto';
		}
	};

	this.figures = function () {
		var context = this.context, parent = this.parent, config = this.config;
		// use CSS3 transforms if allowed
		if (this.config.transforms) {
			// calculate the transformation properties
			var x = (config.status.pan.x * 100 - 50) / this.figureAspect,
				y = config.status.pan.y * 100 - 50,
				z =	config.status.zoom;
			// formulate the css rule
			var transformation = 'translate(' + x + '%, ' + y + '%) scale(' + z + ', ' + z + ')';
			// set the transformation styles
			config.status.figures[config.status.index].style.msTransform = transformation;
			config.status.figures[config.status.index].style.webkitTransform = transformation;
			config.status.figures[config.status.index].style.transform = transformation;
		// else use CSS2
		} else {
			// set the zoomed figure dimensions
			config.status.figures[config.status.index].style.left = (config.status.pan.x * 100) + '%';
			config.status.figures[config.status.index].style.top = (config.status.pan.y * 100) + '%';
			config.status.figures[config.status.index].style.marginLeft = parseInt(this.figureWidth / -2, 10) + 'px';
			config.status.figures[config.status.index].style.marginTop = parseInt(this.figureHeight / -2, 10) + 'px';
			config.status.figures[config.status.index].style.width = parseInt(this.figureWidth, 10) + 'px';
			config.status.figures[config.status.index].style.height = parseInt(this.figureHeight, 10) + 'px';
		}
	};

	this.create = function () {
		var context = this.context, parent = this.parent, config = this.config;
		// if streaming new tiles is allowed
		if (
			// allow/disallow streaming switch
			config.status.stream &&
			// don't stream at the initial zoom in the rotation (the initial images will be of high enough resolution)
			config.status.zoom > 1
		) {
			// divide the dimension into tiles
			var horizontalTiles = Math.ceil(this.figureWidth / config.grid);
			var verticalTiles = Math.ceil(this.figureHeight / config.grid);
			var tileName, tileWidth, tileHeight, tileTop, tileRight, tileBottom, tileLeft,
				tileId = config.figures[config.status.index],
				tileZoom = config.status.zoom.toString().replace('.', 'D'),
				cropLeft = config.lefts[config.status.index],
				cropTop = config.tops[config.status.index],
				cropWidth = config.rights[config.status.index] - cropLeft,
				cropHeight = config.bottoms[config.status.index] - cropTop;
			// for all columns
			for (var x = 0; x < horizontalTiles; x += 1) {
				// for all rows
				for (var y = 0; y < verticalTiles; y += 1) {
					// formulate the tile name
					tileName = 'fig_' + tileId + '_zoom_' + tileZoom + '_x_' + x + '_y_' + y;
					// if the tile is within the bounds of the canvas
					if (
						(x + 1) * config.grid >= this.offsetLeft &&
						(x) * config.grid <= this.offsetLeft + this.canvasWidth &&
						(y + 1) * config.grid >= this.offsetTop &&
						(y) * config.grid <= this.offsetTop + this.canvasHeight
					) {
						// if this tile doesn't exist (naming convention: tiles['fig_1_zoom_1_x_1_y_1'] = {})
						if (!config.status.tiles[tileName]) {
							// count the new tile
							config.status.count += 1;
							// create a tile at this zoom level
							config.status.tiles[tileName] = {
								'object' : document.createElement('img'),
								'figure' : config.status.index,
								'zoom' : config.status.zoom,
								'x' : x,
								'y' : y,
								'index' : config.status.count
							};
							// reveal it onload
							config.status.tiles[tileName].object.className = 'tile_hidden';
							this.onTileLoad(config.status.tiles[tileName].object);
							// calculate the positions
							tileWidth = config.grid;
							tileHeight = config.grid;
							tileTop = (y * tileHeight / this.figureHeight);
							tileRight = ((x + 1) * tileWidth / this.figureWidth);
							tileBottom = ((y + 1) * tileHeight / this.figureHeight);
							tileLeft = (x * tileWidth / this.figureWidth);
							// normalise the sizes
							if (tileRight > 1) {
								tileWidth = Math.round((1 - tileLeft) / (tileRight - tileLeft) * tileWidth);
								tileRight = 1;
							}
							if (tileBottom > 1) {
								tileHeight = Math.round((1 - tileTop) / (tileBottom - tileTop) * tileHeight);
								tileBottom = 1;
							}
							// costruct the tile url
							config.status.tiles[tileName].object.className = 'tile_hidden';
							config.status.tiles[tileName].object.src = config.imageslice
								.replace(config.regSrc, config.figures[config.status.index])
								.replace(config.regWidth, tileWidth)
								.replace(config.regHeight, tileHeight)
								.replace(config.regLeft, tileLeft * cropWidth + cropLeft)
								.replace(config.regTop, tileTop * cropHeight + cropTop)
								.replace(config.regRight, tileRight * cropWidth + cropLeft)
								.replace(config.regBottom, tileBottom * cropHeight + cropTop);
							// position it on the grid
							config.status.tiles[tileName].object.style.position = 'absolute';
							config.status.tiles[tileName].object.style.left = (tileLeft * 100) + '%';
							config.status.tiles[tileName].object.style.top = (tileTop * 100) + '%';
							config.status.tiles[tileName].object.style.width = (tileWidth / this.figureWidth * 100) + '%';
							config.status.tiles[tileName].object.style.height = (tileHeight / this.figureHeight * 100) + '%';
							config.status.tiles[tileName].object.style.zIndex = parseInt(config.status.zoom * 100, 10);
							// add it to the figure
							config.status.figures[config.status.index].appendChild(config.status.tiles[tileName].object);
						}
					}
				}
			}
		}
	};

	this.display = function () {
		var context = this.context, parent = this.parent, config = this.config;
		// for all tiles
		var tile = '', checkedTile;
		for (tile in config.status.tiles) {
			// validate
			if (config.status.tiles.hasOwnProperty(tile)) {
				// get the target tile
				checkedTile = config.status.tiles[tile];
				// if this is a surplus tile
				if (config.status.tiles[tile].index < config.status.count - config.cache) {
					// remove it
					config.status.tiles[tile].object.parentNode.removeChild(config.status.tiles[tile].object);
					delete config.status.tiles[tile];
				// if the tile is within the bounds of the canvas
				} else if (
					(checkedTile.x + 1) * config.grid >= this.offsetLeft &&
					(checkedTile.x) * config.grid <= this.offsetLeft + this.canvasWidth &&
					(checkedTile.y + 1) * config.grid >= this.offsetTop &&
					(checkedTile.y) * config.grid <= this.offsetTop + this.canvasHeight &&
					checkedTile.zoom <= config.status.zoom
				) {
					// display the tile
					checkedTile.object.style.display = 'block';
				// else
				} else {
					// undisplay the tile
					checkedTile.object.style.display = 'none';
				}
			}
		}
	};

	this.spin = function () {
		var context = this.context, parent = this.parent, config = this.config;
		// decide on the transition effect
		switch (config.spin) {
		// in case of a catalogue
		case 'catalogue' :
			// for all figures
			var clipWidth;
			for (var a = 1, b = config.status.figures.length; a < b; a += 1) {
				// clear any transition that may be in effect on this figure
				clearTimeout(config.status.transitions[a]);
				// measure the slide width
				clipWidth = config.status.figures[a].offsetWidth;
				// if this is an active slide
				if (a === config.status.index) {
					// if there is a zoom factor, disable the clipping
					if (config.status.zoom > 1) {
						config.status.figures[a].style.clip = 'rect(auto 10000px auto 0px)';
					}
					// else if the figure wasn't revealed yet
					else if (config.status.figures[a].className !== 'figure_leafin') {
						// force the clip's start situation
						config.status.figures[a].style.clip = 'rect(auto ' + clipWidth + 'px auto ' + clipWidth + 'px)';
						// apply the figure class
						config.status.figures[a].className = 'figure_leafin';
						// apply the figure style
						useful.transitions.byRules(
							config.status.figures[a],
							{'clip' : 'rect(auto ' + clipWidth + 'px auto 0px)', 'transform' : 'translate(0%,0%) rotate(0deg)'},
							null,
							600
						);
					}
				}
				// else if this is a passive slide, but not unrevealed yet
				else if (config.status.figures[a].className !== 'figure_leafout') {
					// delay its return
					this.onFigureUnreveal(a, clipWidth);
					// apply the figure class
					config.status.figures[a].className = 'figure_leafout';
				}
			}
			break;
		// in case of a slideshow
		case 'slideshow' :
			// for all figures
			for (a = 1, b = config.status.figures.length; a < b; a += 1) {
				// apply the figure class
				config.status.figures[a].className = (a === config.status.index) ? 'figure_fadein' : 'figure_fadeout';
				if (config.zoom !== 'static') {
					config.status.backgrounds[a].className = (a === config.status.index) ? 'figure_fadein' : 'figure_fadeout';
				}
			}
			break;
		// for a generic transition
		default :
			// for all figures
			for (a = 1, b = config.status.figures.length; a < b; a += 1) {
				// apply the figure class
				config.status.figures[a].className = (a === config.status.index) ? 'figure_active' : 'figure_passive';
				if (config.zoom !== 'static') {
					config.status.backgrounds[a].className = (a === config.status.index) ? 'figure_active' : 'figure_passive';
				}
			}
		}
	};
	// handlers for the events
	this.onTileLoad = function (element) {
		var context = this.context, parent = this.parent, config = this.config;
		element.addEventListener('load', function () {
			element.className = 'tile_visible';
		}, false);
	};

	this.onFigureUnreveal = function (a, clipWidth) {
		var context = this.context, parent = this.parent, config = this.config;
		setTimeout(function () {
			// apply the figure style
			config.status.figures[a].style.clip = 'rect(auto ' + clipWidth + 'px auto ' + clipWidth + 'px)';
			config.status.figures[a].style.webkitTransform = 'translate(25%,25%) rotate(45deg)';
			config.status.figures[a].style.MozTransform = 'translate(25%,25%) rotate(45deg)';
			config.status.figures[a].style.msTransform = 'translate(25%,25%) rotate(45deg)';
			config.status.figures[a].style.oTransform = 'translate(25%,25%) rotate(45deg)';
			config.status.figures[a].style.transform = 'translate(25%,25%) rotate(45deg)';
		}, 750);
	};
};

// extend the class
Viewer.prototype.Figures_Touch = function (parent) {

	// PROPERTIES

	this.parent = parent;
	this.config = parent.config;
	this.context = parent.context;
	this.x = null;
	this.y = null;
	this.sensitivity = null;
	this.treshold = null;
	this.flick = null;
	this.delay = null;

	// METHODS

	this.start = function (event) {
		var context = this.context, parent = this.parent, config = this.config;
		// store the touch positions
		this.x = [];
		this.y = [];
		for (var a = 0, b = event.touches.length; a < b; a += 1) {
			this.x.push(event.touches[a].pageX);
			this.y.push(event.touches[a].pageY);
		}
		// adjust the sensitivity
		this.sensitivity = (config.magnification - 1) / 2 + 1;
		this.treshold = config.status.cover.offsetWidth / 10;
		this.flick = config.status.cover.offsetWidth * 0.6;
	};

	this.move = function (event) {
		var context = this.context, parent = this.parent, config = this.config;
		// get the event properties
		event = event || window.event;
		var target = event.target || event.srcElement;
		// if there is a touch in progress
		if (this.x !== null) {
			// store the touch positions
			var x = [];
			var y = [];
			for (var a = 0, b = event.touches.length; a < b; a += 1) {
				x.push(event.touches[a].pageX);
				y.push(event.touches[a].pageY);
			}
			var xDelta = this.x[0] - x[0];
			var yDelta = this.y[0] - y[0];
			// if there was a pinch motion
			if (x.length > 1 && this.x.length > 1) {
				// if the distances decreased
				if (
					Math.abs(x[0] - x[1]) + Math.abs(y[0] - y[1]) <
					Math.abs(this.x[0] - this.x[1]) + Math.abs(this.y[0] - this.y[1])
				) {
					// zoom out
					config.status.zoom = config.status.zoom / this.sensitivity;
				// else
				} else {
					// zoom in
					config.status.zoom = config.status.zoom * this.sensitivity;
				}
				// reset the distance
				this.x[0] = x[0];
				this.y[0] = y[0];
				this.x[1] = x[1];
				this.y[1] = y[1];
				// temporarily disable streaming for a while to avoid flooding
				config.status.stream = false;
				clearTimeout(this.delay);
				this.delay = setTimeout(function () {
					config.status.stream = true;
					parent.parent.update();
				}, 500);
			// else if there was a drag motion
			} else if (config.status.zoom > 1 || config.spin === 'slideshow') {
				// calculate the drag distance into %
				config.status.pan.x -= xDelta * config.status.zoom / config.status.figures[config.status.index].offsetWidth;
				config.status.pan.y -= yDelta * config.status.zoom / config.status.figures[config.status.index].offsetHeight;
				// reset the distance
				this.x[0] = x[0];
				this.y[0] = y[0];
			// else there was a spin gesture
			} else if (
				(Math.abs(xDelta) > this.treshold && config.spin === 'rotation') ||
				Math.abs(xDelta) > this.flick
			) {
				// increase the spin
				config.status.index += (xDelta > 0) ? 1 : -1;
				// if in spin mode
				if (config.spin === 'rotation') {
					// loop the value if needed
					if (config.status.index >= config.status.figures.length) {
						config.status.index = 1;
					}
					// loop the value if needed
					if (config.status.index <= 0) {
						config.status.index = config.status.figures.length - 1;
					}
				}
				// reset the distance
				this.x[0] = x[0];
				this.y[0] = y[0];
				// order a redraw
				parent.parent.update();
			}
			// order a redraw
			parent.parent.update();
		}
		// cancel the click
		target.blur();
		event.preventDefault();
	};

	this.end = function (event) {
		var context = this.context, parent = this.parent, config = this.config;
		// clear the positions
		this.x = null;
		this.y = null;
		// order a redraw
		parent.parent.update();
	};

	this.mirror = function (event) {
		var context = this.context, parent = this.parent, config = this.config;
		// retrieve the touch position
		var pos = useful.positions.touch(event, config.status.cover);
		// measure the exact location of the interaction
		config.status.pos.x = pos.x;
		config.status.pos.y = pos.y;
		// order a redraw
		parent.parent.update();
		// cancel the scrolling
		event.preventDefault();
	};
};

// extend the class
Viewer.prototype.Figures = function (parent) {

	// PROPERTIES

	this.parent = parent;
	this.config = parent.config;
	this.context = parent.context;
	// builds the figure
	this.setup = function () {
		var context = this.context, parent = this.parent, config = this.config;
		// enable the streaming of images
		config.status.stream = true;
		// set up a counter for the amount of images streamed
		config.status.count = 0;
		// create a storage place for the transition timeouts
		config.status.transitions = [];
		// create a wrapper for overflow management
		config.status.wrapper = document.createElement('div');
		config.status.wrapper.className = 'wrapper';
		// force the height of the wrapper if desired
		config.status.wrapper.style.height = (config.divide * 100) + '%';
		// create a canvas layer to contain the images
		config.status.canvas = document.createElement('div');
		config.status.canvas.className = 'canvas';
		// add the canvas to the parent
		config.status.wrapper.appendChild(config.status.canvas);
		// add the figures to the construct
		this.addFigures();
		// add the cover layer to the construct
		this.addCover();
		// add the lens to the construct
		this.addLens();
		// add the wrapper to the parent
		config.element.appendChild(config.status.wrapper);
		// add a place to contain the tiles
		config.status.tiles = {};
	};
	// add the figures to the construct
	this.addFigures = function () {
		var context = this.context, parent = this.parent, config = this.config;
		// for all figures in the this.config
		config.status.figures = [0];
		var newImage, newWidth, newHeight, croppedWidth, croppedHeight;
		for (var a = 1, b = config.figures.length; a < b; a += 1) {
			// calculate the cropped dimensions
			croppedWidth = config.widths[a] * (config.rights[a] - config.lefts[a]);
			croppedHeight = config.heights[a] * (config.bottoms[a] - config.tops[a]);
			// calculate the starting dimensions
			newHeight = config.element.offsetHeight * config.divide;
			newWidth = newHeight / croppedHeight * croppedWidth;
			// create a new slide
			config.status.figures[a] = document.createElement('figure');
			config.status.figures[a].className = (a === 1) ? 'figure_active' : 'figure_passive';
			config.status.figures[a].style.width = parseInt(newWidth, 10) + 'px';
			config.status.figures[a].style.height = parseInt(newHeight, 10) + 'px';
			config.status.figures[a].style.left = (config.status.pan.x * 100) + '%';
			config.status.figures[a].style.top = (config.status.pan.y * 100) + '%';
			config.status.figures[a].style.marginLeft = parseInt(newWidth / -2, 10) + 'px';
			config.status.figures[a].style.marginTop = parseInt(newHeight / -2, 10) + 'px';
			// add the default image to the slide
			newImage = document.createElement('img');
			// load starting images
			newImage.src = config.imageslice
				.replace(config.regSrc, config.figures[a])
				.replace(config.regWidth, parseInt(newWidth, 10))
				.replace(config.regHeight, parseInt(newHeight, 10))
				.replace(config.regLeft, config.lefts[a])
				.replace(config.regTop, config.tops[a])
				.replace(config.regRight, config.rights[a])
				.replace(config.regBottom, config.bottoms[a]);
			// set the image properties
			newImage.style.width = '100%';
			newImage.style.height = '100%';
			newImage.className = 'zoom_0';
			if (config.descriptions) {
				newImage.setAttribute('alt', config.descriptions[a]);
			} else {
				newImage.setAttribute('alt', '');
			}
			if (config.titles) {
				newImage.setAttribute('title', config.titles[a]);
			} else {
				newImage.setAttribute('title', '');
			}
			config.status.figures[a].appendChild(newImage);
			// insert the new nodes
			config.status.canvas.appendChild(config.status.figures[a]);
		}
	};
	// add the lens to the construct
	this.addLens = function () {
		var context = this.context, parent = this.parent, config = this.config;
		// clone the initial figure into a background layer on non-static zooms
		if (config.zoom !== 'static') {
			// create a background layer to contain all the low res backgrounds
			config.status.background = config.status.canvas.cloneNode(true);
			config.status.background.className = 'background';
			// insert the background into the parent
			config.status.wrapper.insertBefore(config.status.background, config.status.canvas);
			// apply a lens style to the canvas
			config.status.canvas.className += ' canvas_lens canvas_hidden';
			// set a starting zoom factor
			config.status.zoom = config.max;
			// set the lens dimensions
			if (config.zoom === 'lens') {
				var lensSize = config.element.offsetWidth * config.lens;
				config.status.canvas.style.width = lensSize + 'px';
				config.status.canvas.style.height = lensSize + 'px';
				if (navigator.userAgent.match(/firefox|webkit/gi)) {
					config.status.canvas.style.borderRadius = '50%';	//(lensSize / 2) + 'px';
				}
			}
			// store the backgrounds
			var backgroundFigures = config.status.background.getElementsByTagName('figure');
			config.status.backgrounds = [];
			for (var a = 0, b = backgroundFigures.length; a < b; a += 1) {
				config.status.backgrounds[a + 1] = backgroundFigures[a];
				config.status.backgrounds[a + 1].style.display = 'block';
				config.status.backgrounds[a + 1].style.position = 'absolute';
			}
		}
	};
	// add the cover to the construct
	this.addCover = function () {
		var context = this.context, parent = this.parent, config = this.config;
		// add a top layer for uninterrupted touch events
		config.status.cover = document.createElement('div');
		config.status.cover.className = 'cover';
		config.status.wrapper.appendChild(config.status.cover);
		// add the mouse events for the cover layer
		this.onCoverScroll(config.status.cover);
		this.onCoverMouse(config.status.cover);
		this.onCoverTouch(config.status.cover);
	};
	// set the mouse wheel events
	this.onCoverScroll = function (cover) {
		var context = this.context, parent = this.parent, config = this.config;
		var _this = this;
		cover.addEventListener('mousewheel', function (event) {
			_this.mouse.wheel(event);
		}, false);
		cover.addEventListener('DOMMouseScroll', function (event) {
			_this.mouse.wheel(event);
		}, false);
	};
	// add the mouse events
	this.onCoverMouse = function (cover) {
		var context = this.context, parent = this.parent, config = this.config;
		// set the right interactions for the zoom mode
		var _this = this;
		if (config.zoom !== 'static') {
			cover.addEventListener('mousemove', function (event) {
				_this.mouse.mirror(event);
			}, false);
		} else {
			cover.addEventListener('mousedown', function (event) {
				_this.mouse.start(event);
			}, false);
			cover.addEventListener('mousemove', function (event) {
				_this.mouse.move(event);
			}, false);
			cover.addEventListener('mouseup', function (event) {
				_this.mouse.end(event);
			}, false);
			cover.addEventListener('mouseout', function (event) {
				_this.mouse.end(event);
			}, false);
		}
	};
	// add the touch events
	this.onCoverTouch = function (cover) {
		var context = this.context, parent = this.parent, config = this.config;
		var _this = this;
		// set the right interactions for the zoom mode
		if (config.zoom !== 'static') {
			cover.addEventListener('move', function (event) {
				_this.touch.mirror(event);
			}, false);
		} else {
			cover.addEventListener('touchstart', function (event) {
				_this.touch.start(event);
			}, false);
			cover.addEventListener('touchmove', function (event) {
				_this.touch.move(event);
			}, false);
			cover.addEventListener('touchend', function (event) {
				_this.touch.end(event);
			}, false);
		}
	};
	// redraws the figure
	this.update = function () {
		var context = this.context, parent = this.parent, config = this.config;
		// validate the input
		this.redraw.validate();
		// calculate the values
		this.redraw.calculate();
		// normalise the values
		this.redraw.normalise();
		// move the canvas around
		this.redraw.canvas();
		// move the figure around
		this.redraw.figures();
		// create new tiles
		this.redraw.create();
		// display existing tiles
		this.redraw.display();
		// spin the correct figure into view
		this.redraw.spin();
	};
	// redrawing functionality
	this.redraw = new this.context.Figures_Redraw(this);
	// mouse controls
	this.mouse = new this.context.Figures_Mouse(this);
	// touch screen controls
	this.touch = new this.context.Figures_Touch(this);
};

// extend the class
Viewer.prototype.Leaf_Build = function (parent) {

	// PROPERTIES

	this.parent = parent;
	this.config = parent.config;
	this.context = parent.context;

	// METHODS

	this.indicator = function (element) {
		var context = this.context, parent = this.parent, config = this.config;
		// create the page indicator
		config.status.menus.leafPage = document.createElement('form');
		config.status.menus.leafPageInput = document.createElement('input');
		config.status.menus.leafPageInput.setAttribute('type', 'text');
		config.status.menus.leafPageCount = document.createElement('span');
		config.status.menus.leafPageCount.className = 'count';
		config.status.menus.leafPageSubmit = document.createElement('button');
		config.status.menus.leafPageSubmit.setAttribute('type', 'submit');
		config.status.menus.leafPageSubmit.style.position = 'absolute';
		config.status.menus.leafPageSubmit.style.left = '-999em';
		config.status.menus.leafPage.appendChild(config.status.menus.leafPageInput);
		config.status.menus.leafPage.appendChild(config.status.menus.leafPageCount);
		element.appendChild(config.status.menus.leafPage);
		config.status.menus.leafPageInput.addEventListener('change', function (event) {
			parent.typed(event);
		}, false);
		config.status.menus.leafPage.addEventListener('submit', function (event) {
			parent.typed(event);
			event.preventDefault();
		}, false);
	};

	this.resetter = function (element) {
		var context = this.context, parent = this.parent, config = this.config;
		// create the reset button
		config.status.menus.leafReset = document.createElement('button');
		config.status.menus.leafReset.className = 'reset';
		config.status.menus.leafResetIcon = document.createElement('span');
		config.status.menus.leafResetIcon.innerHTML = 'Reset view';
		config.status.menus.leafReset.appendChild(config.status.menus.leafResetIcon);
		element.appendChild(config.status.menus.leafReset);
		config.status.menus.leafReset.addEventListener('click', function (event) {
			parent.reset(event);
		}, false);
	};

	this.increaser = function (element) {
		var context = this.context, parent = this.parent, config = this.config;
		// create the next button
		config.status.menus.leafIn = document.createElement('button');
		config.status.menus.leafIn.className = 'increase';
		config.status.menus.leafInIcon = document.createElement('span');
		config.status.menus.leafInIcon.innerHTML = 'Leaf forward';
		config.status.menus.leafIn.appendChild(config.status.menus.leafInIcon);
		element.appendChild(config.status.menus.leafIn);
		config.status.menus.leafIn.addEventListener('click', function (event) {
			parent.increase(event);
		}, false);
	};

	this.decreaser = function (element) {
		var context = this.context, parent = this.parent, config = this.config;
		// create the previous button
		config.status.menus.leafOut = document.createElement('button');
		config.status.menus.leafOut.className = 'decrease';
		config.status.menus.leafOutIcon = document.createElement('span');
		config.status.menus.leafOutIcon.innerHTML = 'Leaf back';
		config.status.menus.leafOut.appendChild(config.status.menus.leafOutIcon);
		element.appendChild(config.status.menus.leafOut);
		config.status.menus.leafOut.addEventListener('click', function (event) {
			parent.decrease(event);
		}, false);
	};
};

// extend the class
Viewer.prototype.Leaf = function (parent) {

	// PROPERTIES

	this.parent = parent;
	this.config = parent.config;
	this.context = parent.context;
	// build the leafing toolbar
	this.setup = function () {
		var context = this.context, parent = this.parent, config = this.config;
		// create the menu
		config.status.menus = config.status.menus || {};
		config.status.menus.leafMenu = document.createElement('menu');
		config.status.menus.leafMenu.className = 'slider leaf';
		config.status.menus.leafMenu.style.bottom = ((1 - config.divide) * 100) + '%';
		// create the page indicator
		this.build.indicator(config.status.menus.leafMenu);
		// create the reset button
		this.build.resetter(config.status.menus.leafMenu);
		// create the next button
		this.build.increaser(config.status.menus.leafMenu);
		// create the previous button
		this.build.decreaser(config.status.menus.leafMenu);
		// add the menu to the interface
		config.element.appendChild(config.status.menus.leafMenu);
	};
	// updates the leafing toolbar
	this.update = function () {
		var context = this.context, parent = this.parent, config = this.config;
		// fill in the current page
		config.status.menus.leafPageInput.value = config.status.index;
		// fill in the page total
		config.status.menus.leafPageCount.innerHTML = 'of ' +	(config.status.figures.length - 1);
	};

	this.increase = function (event) {
		var context = this.context, parent = this.parent, config = this.config;
		// decrease the spin index
		config.status.index += 1;
		// look if needed
		if (config.toolbars === 'buttons') {
			// loop the value if needed
			if (config.status.index >= config.status.figures.length) {
				config.status.index = 1;
			}
			// loop the value if needed
			if (config.status.index <= 0) {
				config.status.index = config.status.figures.length - 1;
			}
		}
		// redraw
		parent.update();
		// cancel the click
		event.preventDefault();
	};

	this.decrease = function (event) {
		var context = this.context, parent = this.parent, config = this.config;
		// decrease the spin index
		config.status.index -= 1;
		// redraw
		parent.update();
		// cancel the click
		event.preventDefault();
	};

	this.typed = function (event) {
		var context = this.context, parent = this.parent, config = this.config;
		// get the typed number
		var number = parseInt(config.status.menus.leafPageInput.value, 10);
		// if the typed number is acceptable
		if (!isNaN(number)) {
			// accept the value
			config.status.index = number;
		}
		// update the interface
		parent.update();
	};

	this.reset = function (event) {
		var context = this.context, parent = this.parent, config = this.config;
		// reset the zoom level
		config.status.zoom = (config.zoom !== 'static') ? config.max : 1;
		// redraw
		parent.update();
		// cancel the click
		event.preventDefault();
	};
	// build functionality
	this.build = new this.context.Leaf_Build(this);
};

// extend the class
Viewer.prototype.Main = function (context) {

	// PROPERTIES

	this.context = null;
	this.config = null;

	// METHODS

	this.init = function (context) {
		// store the context
		this.context = context;
		this.config = context.config;
		// automatic idle slideshow
		this.automatic = new this.context.Automatic(this);
		// manages the main view
		this.figures = new this.context.Figures(this);
		// zoom slider
		this.zoom = new this.context.Zoom(this);
		// spin slider
		this.spin = new this.context.Spin(this);
		// manages the thumbnails
		this.thumbnails = new this.context.Thumbnails(this);
		// manages leafing through pages
		this.leaf = new this.context.Leaf(this);
		// minimal superset of controls
		this.toolbar = new this.context.Toolbar(this);
		// wait until the page has loaded
		window.addEventListener('load', this.onPageLoaded.bind(this));
		// return the object
		return this;
	};
	// start the script
	this.onPageLoaded = function () {
		// gather the input
		this.gatherInput();
		// validate the input
		this.validateInput();
		// set the start parameters
		this.startingStatus();
		// apply the custom styles
		this.styling();
		// run the viewer
		this.run();
	};
	// set the start parameters
	this.startingStatus = function () {
		// create the object to hold all the running variables
		this.config.status = {};
		// pick the initial active slide
		this.config.status.index = 1;
		// pick the initial zoom level
		this.config.status.zoom = 1;
		// pick the initial pan position
		this.config.status.pan = {x : 0.5, y : 0.5};
		// pick the initial canvas position
		this.config.status.pos = {x : 0, y : 0};
		// establish the replacement regular expressions
		this.config.regSrc = new RegExp('{src}', 'gi');
		this.config.regWidth = new RegExp('{width}', 'gi');
		this.config.regHeight = new RegExp('{height}', 'gi');
		this.config.regLeft = new RegExp('{left}', 'gi');
		this.config.regTop = new RegExp('{top}', 'gi');
		this.config.regRight = new RegExp('{right}', 'gi');
		this.config.regBottom = new RegExp('{bottom}', 'gi');
	};
	// gather all the configuration and DOM elements
	this.gatherInput = function () {
		// get the assets from the html
		this.config.thumbnails = [0];
		this.config.figures = [0];
		this.config.titles = [0];
		this.config.descriptions = [0];
		this.config.widths = [0];
		this.config.heights = [0];
		this.config.lefts = [0];
		this.config.tops = [0];
		this.config.rights = [0];
		this.config.bottoms = [0];
		var allLinks = this.config.element.getElementsByTagName('a');
		var allImages = this.config.element.getElementsByTagName('img');
		for (var a = 0, b = allLinks.length; a < b; a += 1) {
			// create a list of thumbnail urls and full urls
			this.config.thumbnails.push(allImages[a].getAttribute('src'));
			this.config.figures.push(this.config.urlprefix + allLinks[a].getAttribute('href'));
			this.config.titles.push(allImages[a].getAttribute('title'));
			this.config.descriptions.push(allImages[a].getAttribute('alt'));
			this.config.widths.push(parseInt(allImages[a].getAttribute('width'), 10));
			this.config.heights.push(parseInt(allImages[a].getAttribute('height'), 10));
			this.config.lefts.push(parseFloat(allImages[a].getAttribute('data-left') || this.config.left || 0));
			this.config.tops.push(parseFloat(allImages[a].getAttribute('data-top') || this.config.top || 0));
			this.config.rights.push(parseFloat(allImages[a].getAttribute('data-right') || this.config.right || 1));
			this.config.bottoms.push(parseFloat(allImages[a].getAttribute('data-bottom') || this.config.bottom || 1));
		}
	};
	// fix some numbers in the context.config
	this.validateInput = function () {
		this.config.grid = parseInt(this.config.grid, 10);
		this.config.cache = parseInt(this.config.cache, 10);
		this.config.lens = parseFloat(this.config.lens);
		this.config.magnification = parseFloat(this.config.magnification);
		this.config.max = parseFloat(this.config.max);
		this.config.navigation = 'thumbnails';
		this.config.divide = (this.config.spin === 'rotation') ? 1 : parseInt(this.config.divide, 10) / 100;
		this.config.retry = null;
	};
	// implement customised styles
	this.styling = function () {
		// create a custom stylesheet
		var style = document.createElement("style");
		var isWebkit = new RegExp('webkit', 'gi');
		if (isWebkit.test(navigator.UserAgent)) { style.appendChild(document.createTextNode("")); }
		document.body.appendChild(style);
		var sheet = style.sheet || style.styleSheet;
		// add the custom styles
		if (sheet.insertRule) {
			sheet.insertRule(".viewer button {background-color : " + this.config.colorPassive + " !important;}", 0);
			sheet.insertRule(".viewer button:hover {background-color : " + this.config.colorHover + " !important;}", 0);
			sheet.insertRule(".viewer button.disabled {background-color : " + this.config.colorDisabled + " !important;}", 0);
			sheet.insertRule(".viewer .thumbnails_active {background-color : " + this.config.colorPassive + " !important;}", 0);
			sheet.insertRule(".viewer menu.slider {background-color : " + this.config.colorPassive + " !important;}", 0);
			sheet.insertRule(".viewer menu.slider meter div {background-color : " + this.config.colorPassive + " !important;}", 0);
		} else {
			sheet.addRule(".viewer button", "background-color : " + this.config.colorPassive + " !important;", 0);
			sheet.addRule(".viewer button:hover", "background-color : " + this.config.colorHover + " !important;", 0);
			sheet.addRule(".viewer button.disabled", "background-color : " + this.config.colorDisabled + " !important;", 0);
			sheet.addRule(".viewer .thumbnails_active", "background-color : " + this.config.colorPassive + " !important;", 0);
			sheet.addRule(".viewer menu.slider", "background-color : " + this.config.colorPassive + " !important;", 0);
			sheet.addRule(".viewer menu.slider meter div", "background-color : " + this.config.colorPassive + " !important;", 0);
		}
	};
	// run the slideshow
	this.run = function () {
		var _this = this;
		// hide the component
		this.config.element.style.visibility = 'hidden';
		setTimeout(function () {
			// start the components
			_this.setup();
			// start the redraw
			setTimeout(function () {
				// draw the component
				_this.update();
				// reveal the component
				_this.config.element.style.visibility = 'visible';
			}, 400);
		}, 100);
	};
	// build the app html
	this.setup = function () {
		// shortcut pointers
		var element = this.config.element;
		// clear the parent node
		element.innerHTML = '';
		// apply optional dimensions
		if (this.config.width) {
			element.style.width = this.config.width + this.config.widthUnit;
		}
		if (this.config.height) {
			element.style.height = this.config.height + this.config.heightUnit;
		}
		// apply any context.config classes
		element.className += ' spin_' + this.config.spin;
		// setup the sub components
		this.automatic.setup();
		this.figures.setup();
		// choose what type of toolbars to setup
		switch (this.config.toolbars) {
		// setup the slider toolbars
		case 'sliders' :
			this.zoom.setup(this);
			if (this.config.spin === 'rotation') {
				this.spin.setup();
			}
			if (this.config.spin === 'catalogue') {
				this.leaf.setup();
			}
			break;
		// setup the floating buttons
		case 'buttons' :
			this.toolbar.setup();
			break;
		// setup the default toolbar
		default :
			this.toolbar.setup();
		}
		// setup the thumbnails
		if (this.config.spin !== 'rotation') {
			this.thumbnails.setup();
		}
	};
	// update the whole app
	this.update = function () {
		// if the slideshow has been disabled
		if (this.config.element.offsetHeight === 0) {
			// stop updating and try again later
			clearTimeout(this.config.retry);
			var _this = this;
			this.config.retry = setTimeout(function () {
				_this.update();
			}, 1000);
		// else
		} else {
			// update the sub components
			this.figures.update();
			// choose what type of toolbars to update
			switch (this.config.toolbars) {
				// update the slider toolbars
				case 'sliders' :
					this.zoom.update();
					if (this.config.spin === 'rotation') {
						this.spin.update();
					}
					if (this.config.spin === 'catalogue') {
						this.leaf.update();
					}
					break;
				// update the floating buttons
				case 'buttons' :
					this.toolbar.update();
					break;
				// update the default toolbar
				default :
					this.toolbar.update();
			}
			// update the thumbnails
			if (this.config.spin !== 'rotation') {
				this.thumbnails.update();
			}
		}
	};
	// public functions
	this.focus = function (index) {
		this.config.status.index = index;
		this.update(this);
	};

	this.previous = function () {
		this.config.status.index -= 1;
		this.update(this);
	};

	this.next = function () {
		this.config.status.index += 1;
		this.update(this);
	};

	// EVENTS

	this.init(context);
};

// extend the class
Viewer.prototype.Spin_Build = function (parent) {

	// PROPERTIES

	this.parent = parent;
	this.config = parent.config;
	this.context = parent.context;

	// METHODS

	this.slider = function (element) {
		var context = this.context, parent = this.parent, config = this.config;
		// add the slider to the menu
		config.status.menus.spinIndicator = (navigator.userAgent.match(/WebKit/) || true) ? document.createElement('div') : document.createElement('meter');
		config.status.menus.spinIndicator.className = 'meter';
		config.status.menus.spinIndicator.setAttribute('min', 1);
		config.status.menus.spinIndicator.setAttribute('max', config.figures.length);
		config.status.menus.spinIndicator.setAttribute('value', config.status.index);
		config.status.menus.spinSlider = document.createElement('div');
		config.status.menus.spinSliderIcon = document.createElement('span');
		config.status.menus.spinSliderIcon.innerHTML = config.status.index;
		config.status.menus.spinSlider.appendChild(config.status.menus.spinSliderIcon);
		config.status.menus.spinIndicator.appendChild(config.status.menus.spinSlider);
		element.appendChild(config.status.menus.spinIndicator);
	};

	this.cover = function (element) {
		var context = this.context, parent = this.parent, config = this.config;
		// add a touch cover to the menu
		config.status.menus.spinCover = document.createElement('div');
		config.status.menus.spinCover.className = 'cover';
		element.appendChild(config.status.menus.spinCover);
		var sims = config.status.menus.spinCover;
		// add the event handler
		sims.addEventListener('mousewheel', function (event) {
			parent.mouse.wheel(event);
		}, false);
		sims.addEventListener('DOMMouseScroll', function (event) {
			parent.mouse.wheel(event);
		}, false);
		sims.addEventListener('mousedown', function (event) {
			parent.mouse.start(event);
		}, false);
		sims.addEventListener('mousemove', function (event) {
			parent.mouse.move(event);
		}, false);
		sims.addEventListener('mouseup', function (event) {
			parent.mouse.end(event);
		}, false);
		sims.addEventListener('mouseout', function (event) {
			parent.mouse.end(event);
		}, false);
		// add the touch events
		sims.addEventListener('touchstart', function (event) {
			parent.touch.start(event);
		}, false);
		sims.addEventListener('touchmove', function (event) {
			parent.touch.move(event);
		}, false);
		sims.addEventListener('touchend', function (event) {
			parent.touch.end(event);
		}, false);
	};

	this.increaser = function (element) {
		var context = this.context, parent = this.parent, config = this.config;
		// add the increase button
		config.status.menus.spinIn = document.createElement('button');
		config.status.menus.spinIn.className = 'increase';
		config.status.menus.spinInIcon = document.createElement('span');
		config.status.menus.spinInIcon.innerHTML = 'Spin left';
		config.status.menus.spinIn.appendChild(config.status.menus.spinInIcon);
		element.appendChild(config.status.menus.spinIn);
		config.status.menus.spinIn.addEventListener('mousedown', function (event) {
			// increase the zoom
			parent.increase();
			// cancel streaming
			config.status.stream = false;
			// repeat
			config.status.menus.spinInRepeat = setInterval(function () { parent.increase(); }, 100);
			// cancel this event
			event.preventDefault();
		}, false);
		config.status.menus.spinIn.addEventListener('mouseup', function () {
			// stop repeating
			clearInterval(config.status.menus.spinInRepeat);
			// allow streaming
			config.status.stream = true;
			// redraw
			parent.parent.update();
		}, false);
	};

	this.decreaser = function (element) {
		var context = this.context, parent = this.parent, config = this.config;
		// add the decrease button
		config.status.menus.spinOut = document.createElement('button');
		config.status.menus.spinOut.className = 'decrease';
		config.status.menus.spinOutIcon = document.createElement('span');
		config.status.menus.spinOutIcon.innerHTML = 'Spin right';
		config.status.menus.spinOut.appendChild(config.status.menus.spinOutIcon);
		element.appendChild(config.status.menus.spinOut);
		config.status.menus.spinOut.addEventListener('mousedown', function (event) {
			// increase the zoom
			parent.decrease();
			// cancel streaming
			config.status.stream = false;
			// repeat
			config.status.menus.spinOutRepeat = setInterval(function () { parent.decrease(); }, 100);
			// cancel this event
			event.preventDefault();
		}, false);
		config.status.menus.spinOut.addEventListener('mouseup', function () {
			// stop repeating
			clearInterval(config.status.menus.spinOutRepeat);
			// allow streaming
			config.status.stream = true;
			// redraw
			parent.parent.update();
		}, false);
	};
};

// extend the class
Viewer.prototype.Spin_Mouse = function (parent) {

	// PROPERTIES

	this.parent = parent;
	this.config = parent.config;
	this.context = parent.context;
	this.x = null;
	this.sensitivity = null;
	this.fudge = 0.7;
	// mouse wheel controls
	this.wheel = function (event) {
		var context = this.context, parent = this.parent, config = this.config;
		// get the reading from the mouse wheel
		var distance = (window.event) ? window.event.wheelDelta / 120 : -event.detail / 3;
		// do not loop around
		if (distance < 0) {
			// increase the spin index
			parent.increase(event);
		} else if (distance > 0) {
			// decrease the spin index
			parent.decrease(event);
		}
	};
	// mouse gesture controls
	this.start = function (event) {
		var context = this.context, parent = this.parent, config = this.config;
		// get the event properties
		event = event || window.event;
		// store the touch positions
		this.x = event.pageX || event.x;
		// calculate the sensitivity
		this.sensitivity = (config.status.menus.spinCover.offsetWidth - config.status.menus.spinIn.offsetWidth - config.status.menus.spinOut.offsetWidth) / config.status.figures.length * this.fudge;
		// cancel the click
		event.preventDefault();
	};

	this.move = function (event) {
		var context = this.context, parent = this.parent, config = this.config;
		// get the event properties
		event = event || window.event;
		// if there is a touch in progress
		if (this.x !== null) {
			// store the touch positions
			var x = event.pageX || event.x;
			var distance = this.x - x;
			// if the draw was to the left
			if (distance < -this.sensitivity) {
				// increase the spin index
				config.status.index += 1;
				// reset the distance
				this.x = x;
				// order a redraw
				parent.parent.update();
			// else if the drag was to the right
			} else if (distance > this.sensitivity) {
				// decrease the spin index
				config.status.index -= 1;
				// reset the distance
				this.x = x;
				// order a redraw
				parent.parent.update();
			}
		}
		// cancel the click
		event.preventDefault();
	};

	this.end = function (event) {
		var context = this.context, parent = this.parent, config = this.config;
		// get the event properties
		event = event || window.event;
		// clear the positions
		this.x = null;
		// cancel the click
		event.preventDefault();
	};
};

// extend the class
Viewer.prototype.Spin_Touch = function (parent) {

	// PROPERTIES

	this.parent = parent;
	this.config = parent.config;
	this.context = parent.context;
	this.x = null;
	this.sensitivity = null;
	// mouse gesture controls
	this.start = function (event) {
		var context = this.context, parent = this.parent, config = this.config;
		// get the event properties
		event = event || window.event;
		// store the touch positions
		this.x = [];
		for (var a = 0, b = event.touches.length; a < b; a += 1) {
			this.x.push(event.touches[a].pageX);
		}
		// calculate the sensitivity
		this.sensitivity = (config.status.menus.spinCover.offsetWidth - config.status.menus.spinIn.offsetWidth - config.status.menus.spinOut.offsetWidth) / config.status.figures.length;
		// cancel the click
		event.preventDefault();
	};

	this.move = function (event) {
		var context = this.context, parent = this.parent, config = this.config;
		// get the event properties
		event = event || window.event;
		// if there is a touch in progress
		if (this.x !== null) {
			// store the touch positions
			var x = [];
			for (var a = 0, b = event.touches.length; a < b; a += 1) {
				x.push(event.touches[a].pageX);
			}
			var distance = this.x[0] - x[0];
			// if the draw was to the left
			if (distance < -this.sensitivity) {
				// increase the spin index
				config.status.index += 1;
				// loop the value if needed
				if (config.status.index >= config.status.figures.length) {
					config.status.index = 1;
				}
				// reset the distance
				this.x[0] = x[0];
				// order a redraw
				parent.parent.update();
			// else if the drag was to the right
			} else if (distance > this.sensitivity) {
				// decrease the spin index
				config.status.index -= 1;
				// loop the value if needed
				if (config.status.index <= 0) {
					config.status.index = config.status.figures.length - 1;
				}
				// reset the distance
				this.x[0] = x[0];
				// order a redraw
				parent.parent.update();
			}
		}
	};

	this.end = function (event) {
		var context = this.context, parent = this.parent, config = this.config;
		// get the event properties
		event = event || window.event;
		// clear the positions
		this.x = null;
		// cancel the click
		event.preventDefault();
	};
};

// extend the class
Viewer.prototype.Spin = function (parent) {

	// PROPERTIES

	this.parent = parent;
	this.config = parent.config;
	this.context = parent.context;

	// METHODS

	this.setup = function () {
		var context = this.context, parent = this.parent, config = this.config;
		// create the menu
		config.status.menus = config.status.menus || {};
		config.status.menus.spinMenu = document.createElement('menu');
		config.status.menus.spinMenu.className = 'slider spin';
		config.status.menus.spinMenu.style.bottom = ((1 - config.divide) * 100) + '%';
		// add the slider to the menu
		this.build.slider(config.status.menus.spinMenu);
		// add a touch cover to the menu
		this.build.cover(config.status.menus.spinMenu);
		// add the increase button
		this.build.increaser(config.status.menus.spinMenu);
		// add the decrease button
		this.build.decreaser(config.status.menus.spinMenu);
		// add the menu to the interface
		config.element.appendChild(config.status.menus.spinMenu);
	};

	this.update = function () {
		var context = this.context, parent = this.parent, config = this.config;
		// reposition the slider
		config.status.menus.spinSlider.style.left = ((config.status.index - 1) / (config.status.figures.length - 2) * 100) + '%';
		// update the value
		config.status.menus.spinIndicator.setAttribute('value', config.status.index);
		config.status.menus.spinSliderIcon.innerHTML = config.status.index;
	};

	this.increase = function () {
		var context = this.context, parent = this.parent, config = this.config;
		// decrease the spin index
		config.status.index -= 1;
		// loop the value if needed
		if (config.status.index <= 0) {
			config.status.index = config.status.figures.length - 1;
		}
		// order a redraw
		parent.update();
	};

	this.decrease = function () {
		var context = this.context, parent = this.parent, config = this.config;
		// increase the spin index
		config.status.index += 1;
		// loop the value if needed
		if (config.status.index >= config.status.figures.length) {
			config.status.index = 1;
		}
		// order a redraw
		parent.update();
	};
	// build functionality
	this.build = new this.context.Spin_Build(this);
	// mouse wheel controls
	this.mouse = new this.context.Spin_Mouse(this);
	// touch screen controls
	this.touch = new this.context.Spin_Touch(this);
};

// extend the class
Viewer.prototype.Thumbnails_Menu = function (parent) {

	// PROPERTIES

	this.parent = parent;
	this.config = parent.config;
	this.context = parent.context;

	// METHODS

	// build the menu options
	this.setup = function () {
		var context = this.context, parent = this.parent, config = this.config;
		// create the thumbnail controls
		config.status.pageMenu = document.createElement('menu');
		config.status.pageMenu.className = 'scroller';
		config.status.nextPage = document.createElement('button');
		config.status.nextPage.className = 'next';
		config.status.nextPageIcon = document.createElement('span');
		config.status.nextPageIcon.innerHTML = '&gt';
		config.status.prevPage = document.createElement('button');
		config.status.prevPage.className = 'previous';
		config.status.prevPageIcon = document.createElement('span');
		config.status.prevPageIcon.innerHTML = '&lt';
		config.status.nextPage.appendChild(config.status.nextPageIcon);
		config.status.pageMenu.appendChild(config.status.nextPage);
		config.status.prevPage.appendChild(config.status.prevPageIcon);
		config.status.pageMenu.appendChild(config.status.prevPage);
		config.status.slideNav.appendChild(config.status.pageMenu);
		// apply clicks to the thumbnail controls
		var _this = this;
		config.status.nextPage.addEventListener('click', function (event) {
			_this.next(event, config.status.nextSlide);
		}, false);
		config.status.prevPage.addEventListener('click', function (event) {
			_this.prev(event, config.status.prevSlide);
		}, false);
	};
	// show or hide the previous and next buttons
	this.update = function () {
		var context = this.context, parent = this.parent, config = this.config;
		// calculate the current position
		config.scrollPosition = (config.status.slideUl.style.marginLeft) ? parseInt(config.status.slideUl.style.marginLeft, 10) : 0;
		config.scrollDistance = config.status.slideDiv.offsetWidth;
		// calculate the minimum position
		config.scrollMin = 0;
		// calculate the maximum position
		var lastThumbnail = config.status.thumbnails[config.status.thumbnails.length - 1];
		config.scrollStep = lastThumbnail.offsetWidth;
		config.scrollMax = -1 * (lastThumbnail.offsetLeft + lastThumbnail.offsetWidth) + config.scrollDistance;
		// show or hide the prev button
		config.status.prevPage.className = config.status.prevPage.className.replace(/ disabled/gi, '');
		config.status.prevPage.className += (config.scrollPosition >= config.scrollMin) ? ' disabled' : '';
		// show or hide the next button
		config.status.nextPage.className = config.status.nextPage.className.replace(/ disabled/gi, '');
		config.status.nextPage.className += (config.scrollPosition <= config.scrollMax && config.scrollMax < 0) ? ' disabled' : '';
	};

	// EVENTS

	// show the next page of thumbnails
	this.next = function (event, node) {
		var context = this.context, parent = this.parent, config = this.config;
		// get the event properties
		event = event || window.event;
		var target = event.target || event.srcElement;
		// if the button is not disabled
		if (!target.className.match(/disabled/)) {
			// scroll one page's width of thumbnails
			var newPosition = config.scrollPosition - config.scrollDistance + config.scrollStep;
			// limit the scroll distance
			if (newPosition < config.scrollMax) {
				newPosition = config.scrollMax;
			}
			// transition to the new position
			useful.transitions.byRules(config.status.slideUl, {'marginLeft' : newPosition + 'px'});
			// redraw the menu buttons
			this.update();
		}
		// cancel the click
		target.blur();
		event.preventDefault();
	};
	// show the previous page of thumbnails
	this.prev = function (event, node) {
		var context = this.context, parent = this.parent, config = this.config;
		// get the event properties
		event = event || window.event;
		var target = event.target || event.srcElement;
		// if the button is not disabled
		if (!target.className.match(/disabled/)) {
			// scroll one page's width of thumbnails
			var newPosition = config.scrollPosition + config.scrollDistance - config.scrollStep;
			// limit the scroll distance
			if (newPosition > 0) {
				newPosition = 0;
			}
			// transition to the new position
			useful.transitions.byRules(config.status.slideUl, {'marginLeft' : newPosition + 'px'});
			// redraw the menu buttons
			this.update();
		}
		// cancel the click
		target.blur();
		event.preventDefault();
	};
};

// extend the class
Viewer.prototype.Thumbnails = function (parent) {

	// PROPERTIES

	this.parent = parent;
	this.config = parent.config;
	this.context = parent.context;

	// METHODS

	// build the thumbnail list
	this.setup = function () {
		var context = this.context, parent = this.parent, config = this.config;
		// create the navigation bar
		config.status.slideNav = document.createElement('nav');
		config.status.slideNav.className = 'thumbnails';
		config.status.slideDiv = document.createElement('div');
		config.status.slideUl = document.createElement('ul');
		// force the height of the nav if desired
		if (config.divide !== '100%') {
			config.status.slideNav.style.height = (100 - config.divide * 100 - parseInt(config.margin, 10)) + '%';
		}
		if (config.margin) {
			config.pixelMargin = parseInt(config.element.offsetWidth * parseInt(config.margin, 10) / 100, 10);
		}
		// for all thumbnails in the this.config
		config.status.thumbnails = [0];
		for (var a = 1; a < config.thumbnails.length; a += 1) {
			// create a new thumbnail
			var newLi = document.createElement('li');
			var newA = document.createElement('a');
			newA.className = (a === 1) ? config.navigation + '_active' : config.navigation + '_passive';
			var newImage = document.createElement('img');
			newImage.alt = '';
			newImage.src = config.thumbnails[a];
			newA.appendChild(newImage);
			newLi.appendChild(newA);
			// insert the new nodes
			config.status.slideUl.appendChild(newLi);
			// store the dom pointers to the images
			config.status.thumbnails[a] = newA;
		}
		// insert the navigation bar
		config.status.slideDiv.appendChild(config.status.slideUl);
		config.status.slideNav.appendChild(config.status.slideDiv);
		config.element.appendChild(config.status.slideNav);
		// for all thumbnails in the this.config
		for (a = 1; a < config.thumbnails.length; a += 1) {
			// assign the event handler
			this.onThumbnailClick(config.status.thumbnails[a]);
		}
		// start the menu
		this.menu.setup();
	};
	// event handlers
	this.onThumbnailClick = function (element) {
		var context = this.context, parent = this.parent, config = this.config;
		var _this = this;
		element.addEventListener('click', function (event) {
			_this.set(event, element);
		}, false);
	};
	// redraw/recentre the thumbnails according to the this.config
	this.update = function () {
		var context = this.context, parent = this.parent, config = this.config;
		// update the thumbnails menu
		this.menu.update();
		/// highlight the icons
		this.hightlightIcons();
		// centre the icons
		this.centreIcons();
		// centre the slider
		this.centreSlider();
	};
	// highlight active icon
	this.hightlightIcons = function () {
		var context = this.context, parent = this.parent, config = this.config;
		// for all thumbnails
		for (var a = 1, b = config.thumbnails.length; a < b; a += 1) {
			// highlight the active slide
			config.status.thumbnails[a].className = (config.status.index === a) ? config.navigation + '_active' : config.navigation + '_passive';
		}
	};
	// centre the icons in containers
	this.centreIcons = function () {
		var context = this.context, parent = this.parent, config = this.config;
		var imageObject, imageWidth, imageHeight, rowHeight;
		// measure the available space
		rowHeight = config.status.slideNav.offsetHeight;
		// for all thumbnails
		for (var a = 1, b = config.thumbnails.length; a < b; a += 1) {
			// centre the image in its surroundings
			config.status.thumbnails[a].style.width =  rowHeight + 'px';
			imageObject = config.status.thumbnails[a].getElementsByTagName('img')[0];
			imageWidth = imageObject.offsetWidth;
			imageHeight = imageObject.offsetHeight;
			if (imageWidth > imageHeight) {
				imageWidth = imageWidth / imageHeight * rowHeight;
				imageHeight = rowHeight;
			} else {
				imageHeight = imageHeight /  imageWidth * rowHeight;
				imageWidth = rowHeight;
			}
			imageObject.style.width = Math.round(imageWidth) + 'px';
			imageObject.style.height = Math.round(imageHeight) + 'px';
			imageObject.style.left = '50%';
			imageObject.style.top = '50%';
			imageObject.style.marginLeft = Math.round(-imageWidth / 2) + 'px';
			imageObject.style.marginTop = Math.round(-imageHeight / 2) + 'px';
		}
	};
	// centre the container around the active one
	this.centreSlider = function () {
		var context = this.context, parent = this.parent, config = this.config;
		// scroll the slider enough to center the active slide
		var activeThumbnail = config.status.thumbnails[config.status.index];
		var activePosition = activeThumbnail.offsetLeft;
		var activeWidth = activeThumbnail.offsetWidth;
		var scrollDistance = config.status.slideDiv.offsetWidth;
		var centeredPosition = -activePosition + scrollDistance / 2 - activeWidth / 2;
		centeredPosition = (centeredPosition > 0) ? 0 : centeredPosition;
		centeredPosition = (centeredPosition < config.scrollMax && config.scrollMax < 0) ? config.scrollMax : centeredPosition;
		// transition to the new position
		useful.transitions.byRules(
			config.status.slideUl,
			{'marginLeft' : centeredPosition + 'px'}
		);
	};
	// activate a corresponding figure
	this.set = function (event, node) {
		var context = this.context, parent = this.parent, config = this.config;
		// get the event properties
		event = event || window.event;
		// count which thumbnail this is
		for (var a = 1; a < config.status.thumbnails.length; a += 1) {
			if (config.status.thumbnails[a] === node) {
				// change the index to this slide
				config.status.index = a;
				// reset the zoom
				config.status.zoom = (config.zoom !== 'static') ? config.max : 1;
				// redraw all
				parent.update();
			}
		}
		// cancel the click
		event.preventDefault();
	};
	// manages the thumbnail controls
	this.menu = new this.context.Thumbnails_Menu(this);
};

// extend the class
Viewer.prototype.Toolbar = function (parent) {

	// PROPERTIES

	this.parent = parent;
	this.config = parent.config;
	this.context = parent.context;

	// METHODS

	this.setup = function () {
		var context = this.context, parent = this.parent, config = this.config;
		// create the menu
		config.status.menus = config.status.menus || {};
		config.status.menus.toolbarNav = document.createElement('nav');
		config.status.menus.toolbarNav.className = config.toolbars + ' ' + config.spin;
		config.status.menus.toolbarNav.style.bottom = ((1 - config.divide) * 100) + '%';
		// add the zoom buttons
		config.status.menus.toolbarZoom = document.createElement('menu');
		config.status.menus.toolbarZoom.className = 'zoom';
		parent.zoom.build.increaser(config.status.menus.toolbarZoom);
		parent.zoom.build.decreaser(config.status.menus.toolbarZoom);
		config.status.menus.toolbarNav.appendChild(config.status.menus.toolbarZoom);
		// setup the right toolbar
		switch (config.spin) {
		case 'rotation' :
			// create the menu
			config.status.menus.toolbarSpin = document.createElement('menu');
			config.status.menus.toolbarSpin.className = 'spin';
			// add the spin buttons
			parent.spin.build.decreaser(config.status.menus.toolbarSpin);
			parent.spin.build.increaser(config.status.menus.toolbarSpin);
			// add the menu to the toolbar
			config.status.menus.toolbarNav.appendChild(config.status.menus.toolbarSpin);
			break;
		case 'slideshow' :
			// create the menu
			config.status.menus.toolbarLeaf = document.createElement('menu');
			config.status.menus.toolbarLeaf.className = 'leaf';
			// add the previous button
			parent.leaf.build.decreaser(config.status.menus.toolbarLeaf);
			// add the next button
			parent.leaf.build.increaser(config.status.menus.toolbarLeaf);
			// add the menu to the toolbar
			config.status.menus.toolbarNav.appendChild(config.status.menus.toolbarLeaf);
			break;
		case 'catalogue' :
			// create the menu
			config.status.menus.toolbarLeaf = document.createElement('menu');
			config.status.menus.toolbarLeaf.className = 'leaf';
			// add the reset button
			parent.leaf.build.resetter(config.status.menus.toolbarLeaf);
			// add the indicator display
			parent.leaf.build.indicator(config.status.menus.toolbarLeaf);
			// add the previous button
			parent.leaf.build.decreaser(config.status.menus.toolbarLeaf);
			// add the next button
			parent.leaf.build.increaser(config.status.menus.toolbarLeaf);
			// add the reset button
			//parent.leaf.build.resetter(config.status.menus.toolbarLeaf);
			// add the menu to the toolbar
			config.status.menus.toolbarNav.appendChild(config.status.menus.toolbarLeaf);
			break;
		}
		// add the menu to the interface
		config.element.appendChild(config.status.menus.toolbarNav);
	};

	this.update = function () {
		var context = this.context, parent = this.parent, config = this.config;
		// hide/show the zoom out button
		config.status.menus.zoomIn.className = config.status.menus.zoomIn.className.replace(/ disabled/gi, '');
		config.status.menus.zoomIn.className += (config.status.atMaxZoom) ? ' disabled' : '';
		// hide/show the zoom in button
		config.status.menus.zoomOut.className = config.status.menus.zoomOut.className.replace(/ disabled/gi, '');
		config.status.menus.zoomOut.className += (config.status.atMinZoom) ? ' disabled' : '';
		// update the right toolbar
		switch (config.spin) {
			case 'rotation' :
				break;
			case 'slideshow' :
				// hide/show the previous button
				config.status.menus.leafIn.className = config.status.menus.leafIn.className.replace(/ disabled/gi, '');
				config.status.menus.leafIn.className += (config.status.atMaxLeaf) ? ' disabled' : '';
				// hide/show the next button
				config.status.menus.leafOut.className = config.status.menus.leafOut.className.replace(/ disabled/gi, '');
				config.status.menus.leafOut.className += (config.status.atMinLeaf) ? ' disabled' : '';
				break;
			case 'catalogue' :
				// fill in the current page
				config.status.menus.leafPageInput.value = config.status.index;
				// fill in the page total
				config.status.menus.leafPageCount.innerHTML = 'of ' +	(config.status.figures.length - 1);
				break;
		}
	};
};

// extend the class
Viewer.prototype.Zoom_Build = function (parent) {

	// PROPERTIES

	this.parent = parent;
	this.config = parent.config;
	this.context = parent.context;

	// METHODS

	this.slider = function (element) {
		var context = this.context, parent = this.parent, config = this.config;
		// add the slider to the menu
		config.status.menus.zoomIndicator = (navigator.userAgent.match(/WebKit/) || true) ? document.createElement('div') : document.createElement('meter');
		config.status.menus.zoomIndicator.className = 'meter';
		config.status.menus.zoomIndicator.setAttribute('min', 1);
		config.status.menus.zoomIndicator.setAttribute('max', config.heights[config.status.index] / config.status.canvas.offsetHeight);
		config.status.menus.zoomIndicator.setAttribute('value', config.status.zoom);
		config.status.menus.zoomSlider = document.createElement('div');
		config.status.menus.zoomSliderIcon = document.createElement('span');
		config.status.menus.zoomSliderIcon.innerHTML = config.status.zoom;
		config.status.menus.zoomSlider.appendChild(config.status.menus.zoomSliderIcon);
		config.status.menus.zoomIndicator.appendChild(config.status.menus.zoomSlider);
		element.appendChild(config.status.menus.zoomIndicator);
	};

	this.cover = function (element) {
		var context = this.context, parent = this.parent, config = this.config;
		// add a touch cover to the menu
		config.status.menus.zoomCover = document.createElement('div');
		config.status.menus.zoomCover.className = 'cover';
		element.appendChild(config.status.menus.zoomCover);
		// add the event handler
		var simz = config.status.menus.zoomCover;
		simz.addEventListener('mousewheel', function (event) {
			parent.mouse.wheel(event);
		}, false);
		simz.addEventListener('DOMMouseScroll', function (event) {
			parent.mouse.wheel(event);
		}, false);
		simz.addEventListener('mousedown', function (event) {
			parent.mouse.start(event);
		}, false);
		simz.addEventListener('mousemove', function (event) {
			parent.mouse.move(event);
		}, false);
		simz.addEventListener('mouseup', function (event) {
			parent.mouse.end(event);
		}, false);
		simz.addEventListener('mouseout', function (event) {
			parent.mouse.end(event);
		}, false);
		// add the touch events
		simz.addEventListener('touchstart', function (event) {
			parent.touch.start(event);
		}, false);
		simz.addEventListener('touchmove', function (event) {
			parent.touch.move(event);
		}, false);
		simz.addEventListener('touchend', function (event) {
			parent.touch.end(event);
		}, false);
	};

	this.increaser = function (element) {
		var context = this.context, parent = this.parent, config = this.config;
		// add the increase button
		config.status.menus.zoomIn = document.createElement('button');
		config.status.menus.zoomIn.className = 'increase';
		config.status.menus.zoomInIcon = document.createElement('span');
		config.status.menus.zoomInIcon.innerHTML = 'Zoom in';
		config.status.menus.zoomIn.appendChild(config.status.menus.zoomInIcon);
		element.appendChild(config.status.menus.zoomIn);
		// add the event handlers
		config.status.menus.zoomIn.addEventListener('mousedown', function (event) {
			// increase the zoom
			parent.increase();
			// cancel streaming
			config.status.stream = false;
			// repeat
			config.status.menus.zoomInRepeat = setInterval(function () { parent.increase(); }, 300);
			// cancel this event
			event.preventDefault();
		}, false);
		config.status.menus.zoomIn.addEventListener('mouseup', function () {
			// stop repeating
			clearInterval(config.status.menus.zoomInRepeat);
			// allow streaming
			config.status.stream = true;
			// redraw
			parent.parent.update();
		}, false);
		config.status.menus.zoomIn.addEventListener('click', function (event) {
			// cancel this event
			event.preventDefault();
		}, false);
	};

	this.decreaser = function (element) {
		var context = this.context, parent = this.parent, config = this.config;
		// add the decrease button
		config.status.menus.zoomOut = document.createElement('button');
		config.status.menus.zoomOut.className = 'decrease';
		config.status.menus.zoomOutIcon = document.createElement('span');
		config.status.menus.zoomOutIcon.innerHTML = 'Zoom out';
		config.status.menus.zoomOut.appendChild(config.status.menus.zoomOutIcon);
		element.appendChild(config.status.menus.zoomOut);
		config.status.menus.zoomOut.addEventListener('mousedown', function (event) {
			// increase the zoom
			parent.decrease();
			// cancel streaming
			config.status.stream = false;
			// repeat
			config.status.menus.zoomOutRepeat = setInterval(function () { parent.decrease(); }, 300);
			// cancel this event
			event.preventDefault();
		}, false);
		config.status.menus.zoomOut.addEventListener('mouseup', function () {
			// stop repeating
			clearInterval(config.status.menus.zoomOutRepeat);
			// allow streaming
			config.status.stream = true;
			// redraw
			parent.parent.update();
		}, false);
		config.status.menus.zoomOut.addEventListener('click', function (event) {
			// cancel this event
			event.preventDefault();
		}, false);
	};
};

// extend the class
Viewer.prototype.Zoom_Mouse = function (parent) {

	// PROPERTIES

	this.parent = parent;
	this.config = parent.config;
	this.context = parent.context;
	this.y = null;
	this.distance = null;
	this.sensitivity = null;
	this.fudge = 1.1;

	// METHODS

	this.wheel = function (event) {
		var context = this.context, parent = this.parent, config = this.config;
		// get the reading from the mouse wheel
		var distance = (window.event) ? window.event.wheelDelta / 120 : -event.detail / 3;
		// do not loop around
		if (distance < 0) {
			// increase the zoom factor
			config.status.zoom = config.status.zoom * config.magnification;
		} else if (distance > 0) {
			// decrease the zoom factor
			config.status.zoom = config.status.zoom / config.magnification;
		}
		// call for a redraw
		parent.parent.update();
		// cancel the scrolling
		event.preventDefault();
	};

	this.start = function (event) {
		var context = this.context, parent = this.parent, config = this.config;
		// get the event properties
		event = event || window.event;
		// store the touch positions
		this.y = event.pageY || event.y;
		this.distance = config.status.menus.zoomCover.offsetHeight - config.status.menus.zoomIn.offsetHeight - config.status.menus.zoomOut.offsetHeight;
		this.sensitivity = config.heights[config.status.index] / config.status.canvas.offsetHeight - 1;
		// cancel the click
		event.preventDefault();
	};

	this.move = function (event) {
		var context = this.context, parent = this.parent, config = this.config;
		// get the event properties
		event = event || window.event;
		// if there is a touch in progress
		if (this.y !== null) {
			// store the touch positions
			var y = event.pageY || event.y;
			// calculate the drag distance into %
			config.status.zoom += (this.y - y) / this.distance * this.sensitivity * this.fudge;
			// reset the distance
			this.y = y;
			// disable streaming new images
			config.status.stream = false;
			// order a redraw
			parent.parent.update();
		}
		// cancel the click
		event.preventDefault();
	};

	this.end = function (event) {
		var context = this.context, parent = this.parent, config = this.config;
		// get the event properties
		event = event || window.event;
		// clear the positions
		this.y = null;
		// enable streaming new images
		config.status.stream = true;
		// order a redraw
		parent.parent.update();
		// cancel the click
		event.preventDefault();
	};
};

// extend the class
Viewer.prototype.Zoom_Touch = function (parent) {

	// PROPERTIES

	this.parent = parent;
	this.config = parent.config;
	this.context = parent.context;
	this.y = null;
	this.distance = null;
	this.sensitivity = null;
	this.fudge = 1.1;

	// METHODS

	this.start = function (event) {
		var context = this.context, parent = this.parent, config = this.config;
		// store the touch positions
		this.y = [];
		for (var a = 0, b = event.touches.length; a < b; a += 1) {
			this.y.push(event.touches[a].pageY);
		}
		// calculate the sensitivity
		this.distance = config.status.menus.zoomCover.offsetHeight - config.status.menus.zoomIn.offsetHeight - config.status.menus.zoomOut.offsetHeight;
		this.sensitivity = config.heights[config.status.index] / config.status.canvas.offsetHeight - 1;
	};

	this.move = function (event) {
		var context = this.context, parent = this.parent, config = this.config;
		// get the event properties
		event = event || window.event;
		var target = event.target || event.srcElement;
		// if there is a touch in progress
		if (this.y !== null) {
			// store the touch positions
			var y;
			y = [];
			for (var a = 0, b = event.touches.length; a < b; a += 1) {
				y.push(event.touches[a].pageY);
			}
			// calculate the drag distance into %
			config.status.zoom += (this.y[0] - y[0]) / this.distance * this.sensitivity * this.fudge;
			// reset the distance
			this.y[0] = y[0];
			// disable streaming new images
			config.status.stream = false;
			// order a redraw
			parent.parent.update();
		}
		// cancel the click
		target.blur();
		event.preventDefault();
	};

	this.end = function (event) {
		var context = this.context, parent = this.parent, config = this.config;
		// clear the positions
		this.y = null;
		// enable streaming new images
		config.status.stream = true;
		// order a redraw
		parent.parent.update();
	};
};

// extend the class
Viewer.prototype.Zoom = function (parent) {

	// PROPERTIES

	this.parent = parent;
	this.config = parent.config;
	this.context = parent.context;

	// METHODS

	this.setup = function () {
		var context = this.context, parent = this.parent, config = this.config;
		// create the menu
		config.status.menus = config.status.menus || {};
		config.status.menus.zoomMenu = document.createElement('menu');
		config.status.menus.zoomMenu.className = 'slider zoom';
		config.status.menus.zoomMenu.style.bottom = ((1 - config.divide) * 100) + '%';
		// add the slider to the menu
		this.build.slider(config.status.menus.zoomMenu);
		// add a touch cover to the menu
		this.build.cover(config.status.menus.zoomMenu);
		// add the increase button
		this.build.increaser(config.status.menus.zoomMenu);
		// add the decrease button
		this.build.decreaser(config.status.menus.zoomMenu);
		// add the menu to the interface
		config.element.appendChild(config.status.menus.zoomMenu);
	};

	this.update = function () {
		var context = this.context, parent = this.parent, config = this.config;
		// gather the constants
		var minZoom = 1,
			maxZoom = config.heights[config.status.index] / config.status.canvas.offsetHeight,
			curZoom = config.status.zoom;
		// update the value
		config.status.menus.zoomIndicator.setAttribute('value', curZoom);
		config.status.menus.zoomSliderIcon.innerHTML = curZoom;
		// reposition the slider
		config.status.menus.zoomSlider.style.top = (100 - (curZoom - minZoom) / (maxZoom - minZoom) * 100) + '%';
	};

	this.increase = function () {
		var context = this.context, parent = this.parent, config = this.config;
		// increase the zoom factor
		config.status.zoom = config.status.zoom * config.magnification;
		// order a redraw
		parent.update();
	};

	this.decrease = function () {
		var context = this.context, parent = this.parent, config = this.config;
		// decrease the zoom factor
		config.status.zoom = config.status.zoom / config.magnification;
		// order a redraw
		parent.update();
	};
	// build functionality
	this.build = new this.context.Zoom_Build(this);
	// mouse controls
	this.mouse = new this.context.Zoom_Mouse(this);
	// touch screen controls
	this.touch = new this.context.Zoom_Touch(this);
};
