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
useful.Viewer.prototype.Zoom = function (parent) {
	// properties
	"use strict";
	this.root = parent;
	this.parent = parent;
	// methods
	this.setup = function () {
		var root = this.root, parent = this.parent, cfg = root.cfg;
		// create the menu
		cfg.status.menus = cfg.status.menus || {};
		cfg.status.menus.zoomMenu = document.createElement('menu');
		cfg.status.menus.zoomMenu.className = 'slider zoom';
		cfg.status.menus.zoomMenu.style.bottom = ((1 - cfg.divide) * 100) + '%';
		// add the slider to the menu
		this.build.slider(cfg.status.menus.zoomMenu);
		// add a touch cover to the menu
		this.build.cover(cfg.status.menus.zoomMenu);
		// add the increase button
		this.build.increaser(cfg.status.menus.zoomMenu);
		// add the decrease button
		this.build.decreaser(cfg.status.menus.zoomMenu);
		// add the menu to the interface
		cfg.element.appendChild(cfg.status.menus.zoomMenu);
	};
	this.update = function () {
		var root = this.root, parent = this.parent, cfg = root.cfg;
		// gather the constants
		var minZoom = 1,
			maxZoom = cfg.heights[cfg.status.index] / cfg.status.canvas.offsetHeight,
			curZoom = cfg.status.zoom;
		// update the value
		cfg.status.menus.zoomIndicator.setAttribute('value', curZoom);
		cfg.status.menus.zoomSliderIcon.innerHTML = curZoom;
		// reposition the slider
		cfg.status.menus.zoomSlider.style.top = (100 - (curZoom - minZoom) / (maxZoom - minZoom) * 100) + '%';
	};
	this.increase = function () {
		var root = this.root, parent = this.parent, cfg = root.cfg;
		// increase the zoom factor
		cfg.status.zoom = cfg.status.zoom * cfg.magnification;
		// order a redraw
		parent.update();
	};
	this.decrease = function () {
		var root = this.root, parent = this.parent, cfg = root.cfg;
		// decrease the zoom factor
		cfg.status.zoom = cfg.status.zoom / cfg.magnification;
		// order a redraw
		parent.update();
	};
	// build functionality
	this.build = new this.parent.Zoom_Build(this);
	// mouse controls
	this.mouse = new this.parent.Zoom_Mouse(this);
	// touch screen controls
	this.touch = new this.parent.Zoom_Touch(this);
};

// return as a require.js module
if (typeof module !== 'undefined') {
	exports = module.exports = useful.Viewer.Zoom;
}
