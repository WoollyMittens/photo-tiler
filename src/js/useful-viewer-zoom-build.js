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
useful.Viewer.prototype.Zoom_Build = function (parent) {
	// properties
	"use strict";
	this.root = parent.parent;
	this.parent = parent;
	// methods
	this.slider = function (element) {
		var root = this.root, parent = this.parent, cfg = root.cfg;
		// add the slider to the menu
		cfg.status.menus.zoomIndicator = (navigator.userAgent.match(/WebKit/) || true) ? document.createElement('div') : document.createElement('meter');
		cfg.status.menus.zoomIndicator.className = 'meter';
		cfg.status.menus.zoomIndicator.setAttribute('min', 1);
		cfg.status.menus.zoomIndicator.setAttribute('max', cfg.heights[cfg.status.index] / cfg.status.canvas.offsetHeight);
		cfg.status.menus.zoomIndicator.setAttribute('value', cfg.status.zoom);
		cfg.status.menus.zoomSlider = document.createElement('div');
		cfg.status.menus.zoomSliderIcon = document.createElement('span');
		cfg.status.menus.zoomSliderIcon.innerHTML = cfg.status.zoom;
		cfg.status.menus.zoomSlider.appendChild(cfg.status.menus.zoomSliderIcon);
		cfg.status.menus.zoomIndicator.appendChild(cfg.status.menus.zoomSlider);
		element.appendChild(cfg.status.menus.zoomIndicator);
	};
	this.cover = function (element) {
		var root = this.root, parent = this.parent, cfg = root.cfg;
		// add a touch cover to the menu
		cfg.status.menus.zoomCover = document.createElement('div');
		cfg.status.menus.zoomCover.className = 'cover';
		element.appendChild(cfg.status.menus.zoomCover);
		// add the event handler
		var simz = cfg.status.menus.zoomCover;
		simz.addEventListener('mousewheel', function (event) {
			parent.mouse.wheel(event);
		}, false);
		simz.addEventListener('DOMMouseScroll', function (event) {
			parent.mouse.wheel(event);
		}, false);
		simz.addEventListener('mousedown', function (event) {
			parent.mouse.start(event);
		}, false);
		simz.addEventListener('mousemove', function (event) {
			parent.mouse.move(event);
		}, false);
		simz.addEventListener('mouseup', function (event) {
			parent.mouse.end(event);
		}, false);
		simz.addEventListener('mouseout', function (event) {
			parent.mouse.end(event);
		}, false);
		// add the touch events
		simz.addEventListener('touchstart', function (event) {
			parent.touch.start(event);
		}, false);
		simz.addEventListener('touchmove', function (event) {
			parent.touch.move(event);
		}, false);
		simz.addEventListener('touchend', function (event) {
			parent.touch.end(event);
		}, false);
	};
	this.increaser = function (element) {
		var root = this.root, parent = this.parent, cfg = root.cfg;
		// add the increase button
		cfg.status.menus.zoomIn = document.createElement('button');
		cfg.status.menus.zoomIn.className = 'increase';
		cfg.status.menus.zoomInIcon = document.createElement('span');
		cfg.status.menus.zoomInIcon.innerHTML = 'Zoom in';
		cfg.status.menus.zoomIn.appendChild(cfg.status.menus.zoomInIcon);
		element.appendChild(cfg.status.menus.zoomIn);
		// add the event handlers
		cfg.status.menus.zoomIn.addEventListener('mousedown', function (event) {
			// increase the zoom
			parent.increase();
			// cancel streaming
			cfg.status.stream = false;
			// repeat
			cfg.status.menus.zoomInRepeat = setInterval(function () { parent.increase(); }, 300);
			// cancel this event
			event.preventDefault();
		}, false);
		cfg.status.menus.zoomIn.addEventListener('mouseup', function () {
			// stop repeating
			clearInterval(cfg.status.menus.zoomInRepeat);
			// allow streaming
			cfg.status.stream = true;
			// redraw
			root.update();
		}, false);
		cfg.status.menus.zoomIn.addEventListener('click', function (event) {
			// cancel this event
			event.preventDefault();
		}, false);
	};
	this.decreaser = function (element) {
		var root = this.root, parent = this.parent, cfg = root.cfg;
		// add the decrease button
		cfg.status.menus.zoomOut = document.createElement('button');
		cfg.status.menus.zoomOut.className = 'decrease';
		cfg.status.menus.zoomOutIcon = document.createElement('span');
		cfg.status.menus.zoomOutIcon.innerHTML = 'Zoom out';
		cfg.status.menus.zoomOut.appendChild(cfg.status.menus.zoomOutIcon);
		element.appendChild(cfg.status.menus.zoomOut);
		cfg.status.menus.zoomOut.addEventListener('mousedown', function (event) {
			// increase the zoom
			parent.decrease();
			// cancel streaming
			cfg.status.stream = false;
			// repeat
			cfg.status.menus.zoomOutRepeat = setInterval(function () { parent.decrease(); }, 300);
			// cancel this event
			event.preventDefault();
		}, false);
		cfg.status.menus.zoomOut.addEventListener('mouseup', function () {
			// stop repeating
			clearInterval(cfg.status.menus.zoomOutRepeat);
			// allow streaming
			cfg.status.stream = true;
			// redraw
			root.update();
		}, false);
		cfg.status.menus.zoomOut.addEventListener('click', function (event) {
			// cancel this event
			event.preventDefault();
		}, false);
	};
};

// return as a require.js module
if (typeof module !== 'undefined') {
	exports = module.exports = useful.Viewer.Zoom_Build;
}
