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
useful.Viewer.prototype.Figures_Mouse = function (parent) {
	// properties
	"use strict";
	this.root = parent.parent;
	this.parent = parent;
	this.x = null;
	this.y = null;
	this.sensitivity = null;
	this.treshold = null;
	this.flick = null;
	this.delay = null;
	// mouse wheel controls
	this.wheel = function (event) {
		var root = this.root, parent = this.parent, cfg = root.cfg;
		// get the reading from the mouse wheel
		var distance = (window.event) ? window.event.wheelDelta / 120 : -event.detail / 3;
		// do not loop around
		if (distance < 0) {
			// increase the zoom factor
			cfg.status.zoom = cfg.status.zoom * cfg.magnification;
		} else if (distance > 0) {
			// decrease the zoom factor
			cfg.status.zoom = cfg.status.zoom / cfg.magnification;
		}
		// temporarily disable streaming for a while to avoid flooding
		cfg.status.stream = false;
		clearTimeout(this.delay);
		this.delay = setTimeout(function () {
			cfg.status.stream = true;
			root.update();
		}, 500);
		// call for a redraw
		root.update();
		// cancel the scrolling
		event.preventDefault();
	};
	// mouse gesture controls
	this.start = function (event) {
		var root = this.root, parent = this.parent, cfg = root.cfg;
		// get the event properties
		event = event || window.event;
		// store the touch positions
		this.x = event.pageX || event.x;
		this.y = event.pageY || event.y;
		// calculate the sensitivity
		this.treshold = cfg.status.cover.offsetWidth / 10;
		this.flick = cfg.status.cover.offsetWidth * 0.6;
		// cancel the click
		event.preventDefault();
	};
	this.move = function (event) {
		var root = this.root, parent = this.parent, cfg = root.cfg;
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
			if (cfg.status.zoom > 1) {
				// calculate the drag distance into %
				cfg.status.pan.x -= xDelta * cfg.status.zoom / cfg.status.figures[cfg.status.index].offsetWidth;
				cfg.status.pan.y -= yDelta * cfg.status.zoom / cfg.status.figures[cfg.status.index].offsetHeight;
				// reset the distance
				this.x = x;
				this.y = y;
				// order a redraw
				root.update();
			// else there was a spin gesture
			} else if (
				(Math.abs(xDelta) > this.treshold && cfg.spin === 'rotation') ||
				Math.abs(xDelta) > this.flick
			) {
				// increase the spin
				cfg.status.index += (xDelta > 0) ? 1 : -1;
				// if in spin mode
				if (cfg.spin === 'rotation') {
					// loop the value if needed
					if (cfg.status.index >= cfg.status.figures.length) {
						cfg.status.index = 1;
					}
					// loop the value if needed
					if (cfg.status.index <= 0) {
						cfg.status.index = cfg.status.figures.length - 1;
					}
				}
				// reset the distance
				this.x = x;
				this.y = y;
				// order a redraw
				root.update();
			}
		}
		// cancel the click
		event.preventDefault();
	};
	this.end = function (event) {
		var root = this.root, parent = this.parent, cfg = root.cfg;
		// get the event properties
		event = event || window.event;
		// if there was a motion
		if (this.x !== null) {
			// order a redraw
			root.update();
		}
		// clear the positions
		this.x = null;
		this.y = null;
		// cancel the click
		event.preventDefault();
	};
	this.mirror = function (event) {
		var root = this.root, parent = this.parent, cfg = root.cfg;
		// retrieve the mouse position
		var pos = useful.positions.cursor(event, cfg.status.cover);
		// measure the exact location of the interaction
		cfg.status.pos.x = pos.x;
		cfg.status.pos.y = pos.y;
		// order a redraw
		root.update();
		// cancel the scrolling
		event.preventDefault();
	};
};

// return as a require.js module
if (typeof module !== 'undefined') {
	exports = module.exports = useful.Viewer.Figures_Mouse;
}
