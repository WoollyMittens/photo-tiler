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
useful.Viewer.prototype.Leaf = function (parent) {
	// properties
	"use strict";
	this.root = parent;
	this.parent = parent;
	// build the leafing toolbar
	this.setup = function () {
		var root = this.root, parent = this.parent, cfg = root.cfg;
		// create the menu
		cfg.status.menus = cfg.status.menus || {};
		cfg.status.menus.leafMenu = document.createElement('menu');
		cfg.status.menus.leafMenu.className = 'slider leaf';
		cfg.status.menus.leafMenu.style.bottom = ((1 - cfg.divide) * 100) + '%';
		// create the page indicator
		this.build.indicator(cfg.status.menus.leafMenu);
		// create the reset button
		this.build.resetter(cfg.status.menus.leafMenu);
		// create the next button
		this.build.increaser(cfg.status.menus.leafMenu);
		// create the previous button
		this.build.decreaser(cfg.status.menus.leafMenu);
		// add the menu to the interface
		cfg.element.appendChild(cfg.status.menus.leafMenu);
	};
	// updates the leafing toolbar
	this.update = function () {
		var root = this.root, parent = this.parent, cfg = root.cfg;
		// fill in the current page
		cfg.status.menus.leafPageInput.value = cfg.status.index;
		// fill in the page total
		cfg.status.menus.leafPageCount.innerHTML = 'of ' +	(cfg.status.figures.length - 1);
	};
	this.increase = function (event) {
		var root = this.root, parent = this.parent, cfg = root.cfg;
		// decrease the spin index
		cfg.status.index += 1;
		// look if needed
		if (cfg.toolbars === 'buttons') {
			// loop the value if needed
			if (cfg.status.index >= cfg.status.figures.length) {
				cfg.status.index = 1;
			}
			// loop the value if needed
			if (cfg.status.index <= 0) {
				cfg.status.index = cfg.status.figures.length - 1;
			}
		}
		// redraw
		root.update();
		// cancel the click
		event.preventDefault();
	};
	this.decrease = function (event) {
		var root = this.root, parent = this.parent, cfg = root.cfg;
		// decrease the spin index
		cfg.status.index -= 1;
		// redraw
		root.update();
		// cancel the click
		event.preventDefault();
	};
	this.typed = function (event) {
		var root = this.root, parent = this.parent, cfg = root.cfg;
		// get the typed number
		var number = parseInt(cfg.status.menus.leafPageInput.value, 10);
		// if the typed number is acceptable
		if (!isNaN(number)) {
			// accept the value
			cfg.status.index = number;
		}
		// update the interface
		root.update();
	};
	this.reset = function (event) {
		var root = this.root, parent = this.parent, cfg = root.cfg;
		// reset the zoom level
		cfg.status.zoom = (cfg.zoom !== 'static') ? cfg.max : 1;
		// redraw
		root.update();
		// cancel the click
		event.preventDefault();
	};
	// build functionality
	this.build = new this.parent.Leaf_Build(this);
};

// return as a require.js module
if (typeof module !== 'undefined') {
	exports = module.exports = useful.Viewer.Leaf;
}
