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
useful.Viewer.prototype.Figures_Touch = function (parent) {
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
	// methods
	this.start = function (event) {
		var root = this.root, parent = this.parent, cfg = root.cfg;
		// store the touch positions
		this.x = [];
		this.y = [];
		for (var a = 0, b = event.touches.length; a < b; a += 1) {
			this.x.push(event.touches[a].pageX);
			this.y.push(event.touches[a].pageY);
		}
		// adjust the sensitivity
		this.sensitivity = (cfg.magnification - 1) / 2 + 1;
		this.treshold = cfg.status.cover.offsetWidth / 10;
		this.flick = cfg.status.cover.offsetWidth * 0.6;
	};
	this.move = function (event) {
		var root = this.root, parent = this.parent, cfg = root.cfg;
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
					cfg.status.zoom = cfg.status.zoom / this.sensitivity;
				// else
				} else {
					// zoom in
					cfg.status.zoom = cfg.status.zoom * this.sensitivity;
				}
				// reset the distance
				this.x[0] = x[0];
				this.y[0] = y[0];
				this.x[1] = x[1];
				this.y[1] = y[1];
				// temporarily disable streaming for a while to avoid flooding
				cfg.status.stream = false;
				clearTimeout(this.delay);
				this.delay = setTimeout(function () {
					cfg.status.stream = true;
					root.update();
				}, 500);
			// else if there was a drag motion
			} else if (cfg.status.zoom > 1 || cfg.spin === 'slideshow') {
				// calculate the drag distance into %
				cfg.status.pan.x -= xDelta * cfg.status.zoom / cfg.status.figures[cfg.status.index].offsetWidth;
				cfg.status.pan.y -= yDelta * cfg.status.zoom / cfg.status.figures[cfg.status.index].offsetHeight;
				// reset the distance
				this.x[0] = x[0];
				this.y[0] = y[0];
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
				this.x[0] = x[0];
				this.y[0] = y[0];
				// order a redraw
				root.update();
			}
			// order a redraw
			root.update();
		}
		// cancel the click
		target.blur();
		event.preventDefault();
	};
	this.end = function (event) {
		var root = this.root, parent = this.parent, cfg = root.cfg;
		// clear the positions
		this.x = null;
		this.y = null;
		// order a redraw
		root.update();
	};
	this.mirror = function (event) {
		var root = this.root, parent = this.parent, cfg = root.cfg;
		// retrieve the touch position
		var pos = useful.positions.touch(event, cfg.status.cover);
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
	exports = module.exports = useful.Viewer.Figures_Touch;
}
