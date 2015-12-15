/*
	Source:
	van Creij, Maurice (2014). "useful.viewer.js: A simple tile based image viewer", version 20141127, http://www.woollymittens.nl/.

	License:
	This work is licensed under a Creative Commons Attribution 3.0 Unported License.
*/

// create the constructor if needed
var useful = useful || {};
useful.Viewer = useful.Viewer || function () {};

// extend the constructor
useful.Viewer.prototype.Figures = function (parent) {

	// PROPERTIES
	
	"use strict";
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

// return as a require.js module
if (typeof module !== 'undefined') {
	exports = module.exports = useful.Viewer.Figures;
}
