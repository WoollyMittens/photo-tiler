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
useful.Viewer.prototype.Spin = function (parent) {
	// properties
	"use strict";
	this.root = parent;
	this.parent = parent;
	// methods
	this.setup = function () {
		var root = this.root, parent = this.parent, cfg = root.cfg;
		// create the menu
		cfg.status.menus = cfg.status.menus || {};
		cfg.status.menus.spinMenu = document.createElement('menu');
		cfg.status.menus.spinMenu.className = 'slider spin';
		cfg.status.menus.spinMenu.style.bottom = ((1 - cfg.divide) * 100) + '%';
		// add the slider to the menu
		this.build.slider(cfg.status.menus.spinMenu);
		// add a touch cover to the menu
		this.build.cover(cfg.status.menus.spinMenu);
		// add the increase button
		this.build.increaser(cfg.status.menus.spinMenu);
		// add the decrease button
		this.build.decreaser(cfg.status.menus.spinMenu);
		// add the menu to the interface
		cfg.element.appendChild(cfg.status.menus.spinMenu);
	};
	this.update = function () {
		var root = this.root, parent = this.parent, cfg = root.cfg;
		// reposition the slider
		cfg.status.menus.spinSlider.style.left = ((cfg.status.index - 1) / (cfg.status.figures.length - 2) * 100) + '%';
		// update the value
		cfg.status.menus.spinIndicator.setAttribute('value', cfg.status.index);
		cfg.status.menus.spinSliderIcon.innerHTML = cfg.status.index;
	};
	this.increase = function () {
		var root = this.root, parent = this.parent, cfg = root.cfg;
		// decrease the spin index
		cfg.status.index -= 1;
		// loop the value if needed
		if (cfg.status.index <= 0) {
			cfg.status.index = cfg.status.figures.length - 1;
		}
		// order a redraw
		root.update();
	};
	this.decrease = function () {
		var root = this.root, parent = this.parent, cfg = root.cfg;
		// increase the spin index
		cfg.status.index += 1;
		// loop the value if needed
		if (cfg.status.index >= cfg.status.figures.length) {
			cfg.status.index = 1;
		}
		// order a redraw
		root.update();
	};
	// build functionality
	this.build = new this.parent.Spin_Build(this);
	// mouse wheel controls
	this.mouse = new this.parent.Spin_Mouse(this);
	// touch screen controls
	this.touch = new this.parent.Spin_Touch(this);
};

// return as a require.js module
if (typeof module !== 'undefined') {
	exports = module.exports = useful.Viewer.Spin;
}
