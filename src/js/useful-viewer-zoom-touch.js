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
	useful.Viewer_Zoom_Touch = function (parent) {
		this.root = parent.parent;
		this.parent = parent;
		this.y = null;
		this.distance = null;
		this.sensitivity = null;
		this.fudge = 1.1;
		this.start = function (event) {
			var root = this.root, parent = this.parent, cfg = root.cfg;
			// store the touch positions
			this.y = [];
			for (var a = 0, b = event.touches.length; a < b; a += 1) {
				this.y.push(event.touches[a].pageY);
			}
			// calculate the sensitivity
			this.distance = cfg.status.menus.zoomCover.offsetHeight - cfg.status.menus.zoomIn.offsetHeight - cfg.status.menus.zoomOut.offsetHeight;
			this.sensitivity = cfg.heights[cfg.status.index] / cfg.status.canvas.offsetHeight - 1;
		};
		this.move = function (event) {
			var root = this.root, parent = this.parent, cfg = root.cfg;
			// get the event properties
			event = event || window.event;
			var target = event.target || event.srcElement;
			// if there is a touch in progress
			if (this.y !== null) {
				// store the touch positions
				var y;
				y = [];
				for (var a = 0, b = event.touches.length; a < b; a += 1) {
					y.push(event.touches[a].pageY);
				}
				// calculate the drag distance into %
				cfg.status.zoom += (this.y[0] - y[0]) / this.distance * this.sensitivity * this.fudge;
				// reset the distance
				this.y[0] = y[0];
				// disable streaming new images
				cfg.status.stream = false;
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
			this.y = null;
			// enable streaming new images
			cfg.status.stream = true;
			// order a redraw
			root.update();
		};
	};

	// return as a require.js module
	if (typeof module !== 'undefined') {
		exports = module.exports = useful.Viewer_Zoom_Touch;
	}

})();
