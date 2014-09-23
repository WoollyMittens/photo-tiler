/*
	Source:
	van Creij, Maurice (2014). "useful.viewer.js: A simple tile based image viewer", version 20140923, http://www.woollymittens.nl/.

	License:
	This work is licensed under a Creative Commons Attribution 3.0 Unported License.
*/

// public object
var useful = useful || {};

(function(){

	// invoke strict mode
	"use strict";

	// private functions
	useful.Viewer_Zoom_Mouse = function (parent) {
		this.root = parent.parent;
		this.parent = parent;
		this.y = null;
		this.distance = null;
		this.sensitivity = null;
		this.fudge = 1.1;
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
			this.y = event.pageY || event.y;
			this.distance = cfg.status.menus.zoomCover.offsetHeight - cfg.status.menus.zoomIn.offsetHeight - cfg.status.menus.zoomOut.offsetHeight;
			this.sensitivity = cfg.heights[cfg.status.index] / cfg.status.canvas.offsetHeight - 1;
			// cancel the click
			event.preventDefault();
		};
		this.move = function (event) {
			var root = this.root, parent = this.parent, cfg = root.cfg;
			// get the event properties
			event = event || window.event;
			// if there is a touch in progress
			if (this.y !== null) {
				// store the touch positions
				var y = event.pageY || event.y;
				// calculate the drag distance into %
				cfg.status.zoom += (this.y - y) / this.distance * this.sensitivity * this.fudge;
				// reset the distance
				this.y = y;
				// disable streaming new images
				cfg.status.stream = false;
				// order a redraw
				root.update();
			}
			// cancel the click
			event.preventDefault();
		};
		this.end = function (event) {
			var root = this.root, parent = this.parent, cfg = root.cfg;
			// get the event properties
			event = event || window.event;
			// clear the positions
			this.y = null;
			// enable streaming new images
			cfg.status.stream = true;
			// order a redraw
			root.update();
			// cancel the click
			event.preventDefault();
		};
	};

	// return as a require.js module
	if (typeof module !== 'undefined') {
		exports = module.exports = useful.Viewer_Zoom_Mouse;
	}

})();
