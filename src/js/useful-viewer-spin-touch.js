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
useful.Viewer.prototype.Spin_Touch = function (parent) {
	// properties
	"use strict";
	this.root = parent.parent;
	this.parent = parent;
	this.x = null;
	this.sensitivity = null;
	// mouse gesture controls
	this.start = function (event) {
		var root = this.root, parent = this.parent, cfg = root.cfg;
		// get the event properties
		event = event || window.event;
		// store the touch positions
		this.x = [];
		for (var a = 0, b = event.touches.length; a < b; a += 1) {
			this.x.push(event.touches[a].pageX);
		}
		// calculate the sensitivity
		this.sensitivity = (cfg.status.menus.spinCover.offsetWidth - cfg.status.menus.spinIn.offsetWidth - cfg.status.menus.spinOut.offsetWidth) / cfg.status.figures.length;
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
			var x = [];
			for (var a = 0, b = event.touches.length; a < b; a += 1) {
				x.push(event.touches[a].pageX);
			}
			var distance = this.x[0] - x[0];
			// if the draw was to the left
			if (distance < -this.sensitivity) {
				// increase the spin index
				cfg.status.index += 1;
				// loop the value if needed
				if (cfg.status.index >= cfg.status.figures.length) {
					cfg.status.index = 1;
				}
				// reset the distance
				this.x[0] = x[0];
				// order a redraw
				root.update();
			// else if the drag was to the right
			} else if (distance > this.sensitivity) {
				// decrease the spin index
				cfg.status.index -= 1;
				// loop the value if needed
				if (cfg.status.index <= 0) {
					cfg.status.index = cfg.status.figures.length - 1;
				}
				// reset the distance
				this.x[0] = x[0];
				// order a redraw
				root.update();
			}
		}
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
	exports = module.exports = useful.Viewer.Spin_Touch;
}
