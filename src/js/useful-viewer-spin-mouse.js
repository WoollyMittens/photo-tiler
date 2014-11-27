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
useful.Viewer.prototype.Spin_Mouse = function (parent) {
	// properties
	"use strict";
	this.root = parent.parent;
	this.parent = parent;
	this.x = null;
	this.sensitivity = null;
	this.fudge = 0.7;
	// mouse wheel controls
	this.wheel = function (event) {
		var root = this.root, parent = this.parent, cfg = root.cfg;
		// get the reading from the mouse wheel
		var distance = (window.event) ? window.event.wheelDelta / 120 : -event.detail / 3;
		// do not loop around
		if (distance < 0) {
			// increase the spin index
			parent.increase(event);
		} else if (distance > 0) {
			// decrease the spin index
			parent.decrease(event);
		}
	};
	// mouse gesture controls
	this.start = function (event) {
		var root = this.root, parent = this.parent, cfg = root.cfg;
		// get the event properties
		event = event || window.event;
		// store the touch positions
		this.x = event.pageX || event.x;
		// calculate the sensitivity
		this.sensitivity = (cfg.status.menus.spinCover.offsetWidth - cfg.status.menus.spinIn.offsetWidth - cfg.status.menus.spinOut.offsetWidth) / cfg.status.figures.length * this.fudge;
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
			var distance = this.x - x;
			// if the draw was to the left
			if (distance < -this.sensitivity) {
				// increase the spin index
				cfg.status.index += 1;
				// reset the distance
				this.x = x;
				// order a redraw
				root.update();
			// else if the drag was to the right
			} else if (distance > this.sensitivity) {
				// decrease the spin index
				cfg.status.index -= 1;
				// reset the distance
				this.x = x;
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
		// clear the positions
		this.x = null;
		// cancel the click
		event.preventDefault();
	};
};

// return as a require.js module
if (typeof module !== 'undefined') {
	exports = module.exports = useful.Viewer.Spin_Mouse;
}
