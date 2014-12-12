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
useful.Viewer.prototype.Zoom_Mouse = function (parent) {
	// properties
	"use strict";
	this.parent = parent;
	this.config = parent.config;
	this.context = parent.context;
	this.y = null;
	this.distance = null;
	this.sensitivity = null;
	this.fudge = 1.1;
	// methods
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

// return as a require.js module
if (typeof module !== 'undefined') {
	exports = module.exports = useful.Viewer.Zoom_Mouse;
}
