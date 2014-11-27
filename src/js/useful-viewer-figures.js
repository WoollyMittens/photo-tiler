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
	// properties
	"use strict";
	this.root = parent;
	this.parent = parent;
	// builds the figure
	this.setup = function () {
		var root = this.root, parent = this.parent, cfg = root.cfg;
		// enable the streaming of images
		cfg.status.stream = true;
		// set up a counter for the amount of images streamed
		cfg.status.count = 0;
		// create a storage place for the transition timeouts
		cfg.status.transitions = [];
		// create a wrapper for overflow management
		cfg.status.wrapper = document.createElement('div');
		cfg.status.wrapper.className = 'wrapper';
		// force the height of the wrapper if desired
		cfg.status.wrapper.style.height = (cfg.divide * 100) + '%';
		// create a canvas layer to contain the images
		cfg.status.canvas = document.createElement('div');
		cfg.status.canvas.className = 'canvas';
		// add the canvas to the parent
		cfg.status.wrapper.appendChild(cfg.status.canvas);
		// add the figures to the construct
		this.addFigures();
		// add the cover layer to the construct
		this.addCover();
		// add the lens to the construct
		this.addLens();
		// add the wrapper to the parent
		cfg.element.appendChild(cfg.status.wrapper);
		// add a place to contain the tiles
		cfg.status.tiles = {};
	};
	// add the figures to the construct
	this.addFigures = function () {
		var root = this.root, parent = this.parent, cfg = root.cfg;
		// for all figures in the root.cfg
		cfg.status.figures = [0];
		var newImage, newWidth, newHeight, croppedWidth, croppedHeight;
		for (var a = 1, b = cfg.figures.length; a < b; a += 1) {
			// calculate the cropped dimensions
			croppedWidth = cfg.widths[a] * (cfg.rights[a] - cfg.lefts[a]);
			croppedHeight = cfg.heights[a] * (cfg.bottoms[a] - cfg.tops[a]);
			// calculate the starting dimensions
			newHeight = cfg.element.offsetHeight * cfg.divide;
			newWidth = newHeight / croppedHeight * croppedWidth;
			// create a new slide
			cfg.status.figures[a] = document.createElement('figure');
			cfg.status.figures[a].className = (a === 1) ? 'figure_active' : 'figure_passive';
			cfg.status.figures[a].style.width = parseInt(newWidth, 10) + 'px';
			cfg.status.figures[a].style.height = parseInt(newHeight, 10) + 'px';
			cfg.status.figures[a].style.left = (cfg.status.pan.x * 100) + '%';
			cfg.status.figures[a].style.top = (cfg.status.pan.y * 100) + '%';
			cfg.status.figures[a].style.marginLeft = parseInt(newWidth / -2, 10) + 'px';
			cfg.status.figures[a].style.marginTop = parseInt(newHeight / -2, 10) + 'px';
			// add the default image to the slide
			newImage = document.createElement('img');
			// load starting images
			newImage.src = cfg.imageslice
				.replace(cfg.regSrc, cfg.figures[a])
				.replace(cfg.regWidth, parseInt(newWidth, 10))
				.replace(cfg.regHeight, parseInt(newHeight, 10))
				.replace(cfg.regLeft, cfg.lefts[a])
				.replace(cfg.regTop, cfg.tops[a])
				.replace(cfg.regRight, cfg.rights[a])
				.replace(cfg.regBottom, cfg.bottoms[a]);
			// set the image properties
			newImage.style.width = '100%';
			newImage.style.height = '100%';
			newImage.className = 'zoom_0';
			if (cfg.descriptions) {
				newImage.setAttribute('alt', cfg.descriptions[a]);
			} else {
				newImage.setAttribute('alt', '');
			}
			if (cfg.titles) {
				newImage.setAttribute('title', cfg.titles[a]);
			} else {
				newImage.setAttribute('title', '');
			}
			cfg.status.figures[a].appendChild(newImage);
			// insert the new nodes
			cfg.status.canvas.appendChild(cfg.status.figures[a]);
		}
	};
	// add the lens to the construct
	this.addLens = function () {
		var root = this.root, parent = this.parent, cfg = root.cfg;
		// clone the initial figure into a background layer on non-static zooms
		if (cfg.zoom !== 'static') {
			// create a background layer to contain all the low res backgrounds
			cfg.status.background = cfg.status.canvas.cloneNode(true);
			cfg.status.background.className = 'background';
			// insert the background into the parent
			cfg.status.wrapper.insertBefore(cfg.status.background, cfg.status.canvas);
			// apply a lens style to the canvas
			cfg.status.canvas.className += ' canvas_lens canvas_hidden';
			// set a starting zoom factor
			cfg.status.zoom = cfg.max;
			// set the lens dimensions
			if (cfg.zoom === 'lens') {
				var lensSize = cfg.element.offsetWidth * cfg.lens;
				cfg.status.canvas.style.width = lensSize + 'px';
				cfg.status.canvas.style.height = lensSize + 'px';
				if (navigator.userAgent.match(/firefox|webkit/gi)) {
					cfg.status.canvas.style.borderRadius = '50%';	//(lensSize / 2) + 'px';
				}
			}
			// store the backgrounds
			var backgroundFigures = cfg.status.background.getElementsByTagName('figure');
			cfg.status.backgrounds = [];
			for (var a = 0, b = backgroundFigures.length; a < b; a += 1) {
				cfg.status.backgrounds[a + 1] = backgroundFigures[a];
				cfg.status.backgrounds[a + 1].style.display = 'block';
				cfg.status.backgrounds[a + 1].style.position = 'absolute';
			}
		}
	};
	// add the cover to the construct
	this.addCover = function () {
		var root = this.root, parent = this.parent, cfg = root.cfg;
		// add a top layer for uninterrupted touch events
		cfg.status.cover = document.createElement('div');
		cfg.status.cover.className = 'cover';
		cfg.status.wrapper.appendChild(cfg.status.cover);
		// add the mouse events for the cover layer
		this.onCoverScroll(cfg.status.cover);
		this.onCoverMouse(cfg.status.cover);
		this.onCoverTouch(cfg.status.cover);
	};
	// set the mouse wheel events
	this.onCoverScroll = function (cover) {
		var root = this.root, parent = this.parent, cfg = root.cfg;
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
		var root = this.root, parent = this.parent, cfg = root.cfg;
		// set the right interactions for the zoom mode
		var _this = this;
		if (cfg.zoom !== 'static') {
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
		var root = this.root, parent = this.parent, cfg = root.cfg;
		var _this = this;
		// set the right interactions for the zoom mode
		if (cfg.zoom !== 'static') {
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
		var root = this.root, parent = this.parent, cfg = root.cfg;
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
	this.redraw = new this.parent.Figures_Redraw(this);
	// mouse controls
	this.mouse = new this.parent.Figures_Mouse(this);
	// touch screen controls
	this.touch = new this.parent.Figures_Touch(this);
};

// return as a require.js module
if (typeof module !== 'undefined') {
	exports = module.exports = useful.Viewer.Figures;
}
