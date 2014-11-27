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
useful.Viewer.prototype.init = function (cfg) {
	// properties
	"use strict";
	this.cfg = cfg;
	// methods
	this.wait = function () {
		var _this = this;
		// wait until the page has loaded
		window.addEventListener('load', function () {
			// gather the input
			_this.gatherInput();
			// validate the input
			_this.validateInput();
			// set the start parameters
			_this.startingStatus();
			// apply the custom styles
			_this.styling();
			// run the viewer
			_this.run();
			// destroy the init function
			_this.init = function () {};
		});
	};
	// set the start parameters
	this.startingStatus = function () {
		// create the object to hold all the running variables
		this.cfg.status = {};
		// pick the initial active slide
		this.cfg.status.index = 1;
		// pick the initial zoom level
		this.cfg.status.zoom = 1;
		// pick the initial pan position
		this.cfg.status.pan = {x : 0.5, y : 0.5};
		// pick the initial canvas position
		this.cfg.status.pos = {x : 0, y : 0};
		// establish the replacement regular expressions
		this.cfg.regSrc = new RegExp('{src}', 'gi');
		this.cfg.regWidth = new RegExp('{width}', 'gi');
		this.cfg.regHeight = new RegExp('{height}', 'gi');
		this.cfg.regLeft = new RegExp('{left}', 'gi');
		this.cfg.regTop = new RegExp('{top}', 'gi');
		this.cfg.regRight = new RegExp('{right}', 'gi');
		this.cfg.regBottom = new RegExp('{bottom}', 'gi');
	};
	// gather all the configuration and DOM elements
	this.gatherInput = function () {
		// get the assets from the html
		this.cfg.thumbnails = [0];
		this.cfg.figures = [0];
		this.cfg.titles = [0];
		this.cfg.descriptions = [0];
		this.cfg.widths = [0];
		this.cfg.heights = [0];
		this.cfg.lefts = [0];
		this.cfg.tops = [0];
		this.cfg.rights = [0];
		this.cfg.bottoms = [0];
		var allLinks = this.cfg.element.getElementsByTagName('a');
		var allImages = this.cfg.element.getElementsByTagName('img');
		for (var a = 0, b = allLinks.length; a < b; a += 1) {
			// create a list of thumbnail urls and full urls
			this.cfg.thumbnails.push(allImages[a].getAttribute('src'));
			this.cfg.figures.push(this.cfg.urlprefix + allLinks[a].getAttribute('href'));
			this.cfg.titles.push(allImages[a].getAttribute('title'));
			this.cfg.descriptions.push(allImages[a].getAttribute('alt'));
			this.cfg.widths.push(parseInt(allImages[a].getAttribute('width'), 10));
			this.cfg.heights.push(parseInt(allImages[a].getAttribute('height'), 10));
			this.cfg.lefts.push(parseFloat(allImages[a].getAttribute('data-left') || this.cfg.left || 0));
			this.cfg.tops.push(parseFloat(allImages[a].getAttribute('data-top') || this.cfg.top || 0));
			this.cfg.rights.push(parseFloat(allImages[a].getAttribute('data-right') || this.cfg.right || 1));
			this.cfg.bottoms.push(parseFloat(allImages[a].getAttribute('data-bottom') || this.cfg.bottom || 1));
		}
	};
	// fix some numbers in the context.cfg
	this.validateInput = function () {
		this.cfg.grid = parseInt(this.cfg.grid, 10);
		this.cfg.cache = parseInt(this.cfg.cache, 10);
		this.cfg.lens = parseFloat(this.cfg.lens);
		this.cfg.magnification = parseFloat(this.cfg.magnification);
		this.cfg.max = parseFloat(this.cfg.max);
		this.cfg.navigation = 'thumbnails';
		this.cfg.divide = (this.cfg.spin === 'rotation') ? 1 : parseInt(this.cfg.divide, 10) / 100;
		this.cfg.retry = null;
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
			sheet.insertRule(".viewer button {background-color : " + this.cfg.colorPassive + " !important;}", 0);
			sheet.insertRule(".viewer button:hover {background-color : " + this.cfg.colorHover + " !important;}", 0);
			sheet.insertRule(".viewer button.disabled {background-color : " + this.cfg.colorDisabled + " !important;}", 0);
			sheet.insertRule(".viewer .thumbnails_active {background-color : " + this.cfg.colorPassive + " !important;}", 0);
			sheet.insertRule(".viewer menu.slider {background-color : " + this.cfg.colorPassive + " !important;}", 0);
			sheet.insertRule(".viewer menu.slider meter div {background-color : " + this.cfg.colorPassive + " !important;}", 0);
		} else {
			sheet.addRule(".viewer button", "background-color : " + this.cfg.colorPassive + " !important;", 0);
			sheet.addRule(".viewer button:hover", "background-color : " + this.cfg.colorHover + " !important;", 0);
			sheet.addRule(".viewer button.disabled", "background-color : " + this.cfg.colorDisabled + " !important;", 0);
			sheet.addRule(".viewer .thumbnails_active", "background-color : " + this.cfg.colorPassive + " !important;", 0);
			sheet.addRule(".viewer menu.slider", "background-color : " + this.cfg.colorPassive + " !important;", 0);
			sheet.addRule(".viewer menu.slider meter div", "background-color : " + this.cfg.colorPassive + " !important;", 0);
		}
	};
	// run the slideshow
	this.run = function () {
		var _this = this;
		// hide the component
		this.cfg.element.style.visibility = 'hidden';
		setTimeout(function () {
			// start the components
			_this.setup();
			// start the redraw
			setTimeout(function () {
				// draw the component
				_this.update();
				// reveal the component
				_this.cfg.element.style.visibility = 'visible';
			}, 400);
		}, 100);
	};
	// build the app html
	this.setup = function () {
		// shortcut pointers
		var sip = this.cfg.element;
		// clear the parent node
		sip.innerHTML = '';
		// apply optional dimensions
		if (this.cfg.width) {
			sip.style.width = this.cfg.width + this.cfg.widthUnit;
		}
		if (this.cfg.height) {
			sip.style.height = this.cfg.height + this.cfg.heightUnit;
		}
		// apply any context.cfg classes
		sip.className += ' spin_' + this.cfg.spin;
		// setup the sub components
		this.automatic.setup();
		this.figures.setup();
		// choose what type of toolbars to setup
		switch (this.cfg.toolbars) {
		// setup the slider toolbars
		case 'sliders' :
			this.zoom.setup(this);
			if (this.cfg.spin === 'rotation') {
				this.spin.setup();
			}
			if (this.cfg.spin === 'catalogue') {
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
		if (this.cfg.spin !== 'rotation') {
			this.thumbnails.setup();
		}
	};
	// update the whole app
	this.update = function () {
		// if the slideshow has been disabled
		if (this.cfg.element.offsetHeight === 0) {
			// stop updating and try again later
			clearTimeout(this.cfg.retry);
			var _this = this;
			this.cfg.retry = setTimeout(function () {
				_this.update();
			}, 1000);
		// else
		} else {
			// update the sub components
			this.figures.update();
			// choose what type of toolbars to update
			switch (this.cfg.toolbars) {
				// update the slider toolbars
				case 'sliders' :
					this.zoom.update();
					if (this.cfg.spin === 'rotation') {
						this.spin.update();
					}
					if (this.cfg.spin === 'catalogue') {
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
			if (this.cfg.spin !== 'rotation') {
				this.thumbnails.update();
			}
		}
	};
	// automatic idle slideshow
	this.automatic = new this.Automatic(this);
	// manages the main view
	this.figures = new this.Figures(this);
	// zoom slider
	this.zoom = new this.Zoom(this);
	// spin slider
	this.spin = new this.Spin(this);
	// manages the thumbnails
	this.thumbnails = new this.Thumbnails(this);
	// manages leafing through pages
	this.leaf = new this.Leaf(this);
	// minimal superset of controls
	this.toolbar = new this.Toolbar(this);
	// external API
	this.focus = function (index) {
		this.cfg.status.index = index;
		this.update(this);
	};
	this.previous = function () {
		this.cfg.status.index -= 1;
		this.update(this);
	};
	this.next = function () {
		this.cfg.status.index += 1;
		this.update(this);
	};
	// go
	this.wait();
	return this;
};

// return as a require.js module
if (typeof module !== 'undefined') {
	exports = module.exports = useful.Viewer;
}
