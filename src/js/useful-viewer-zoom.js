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

	// PROPERTIES
	
	"use strict";
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

// return as a require.js module
if (typeof module !== 'undefined') {
	exports = module.exports = useful.Viewer.Zoom;
}
