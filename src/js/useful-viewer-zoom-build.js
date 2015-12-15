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

	// PROPERTIES
	
	"use strict";
	this.parent = parent;
	this.config = parent.config;
	this.context = parent.context;

	// METHODS
	
	this.slider = function (element) {
		var context = this.context, parent = this.parent, config = this.config;
		// add the slider to the menu
		config.status.menus.zoomIndicator = (navigator.userAgent.match(/WebKit/) || true) ? document.createElement('div') : document.createElement('meter');
		config.status.menus.zoomIndicator.className = 'meter';
		config.status.menus.zoomIndicator.setAttribute('min', 1);
		config.status.menus.zoomIndicator.setAttribute('max', config.heights[config.status.index] / config.status.canvas.offsetHeight);
		config.status.menus.zoomIndicator.setAttribute('value', config.status.zoom);
		config.status.menus.zoomSlider = document.createElement('div');
		config.status.menus.zoomSliderIcon = document.createElement('span');
		config.status.menus.zoomSliderIcon.innerHTML = config.status.zoom;
		config.status.menus.zoomSlider.appendChild(config.status.menus.zoomSliderIcon);
		config.status.menus.zoomIndicator.appendChild(config.status.menus.zoomSlider);
		element.appendChild(config.status.menus.zoomIndicator);
	};
	
	this.cover = function (element) {
		var context = this.context, parent = this.parent, config = this.config;
		// add a touch cover to the menu
		config.status.menus.zoomCover = document.createElement('div');
		config.status.menus.zoomCover.className = 'cover';
		element.appendChild(config.status.menus.zoomCover);
		// add the event handler
		var simz = config.status.menus.zoomCover;
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
		var context = this.context, parent = this.parent, config = this.config;
		// add the increase button
		config.status.menus.zoomIn = document.createElement('button');
		config.status.menus.zoomIn.className = 'increase';
		config.status.menus.zoomInIcon = document.createElement('span');
		config.status.menus.zoomInIcon.innerHTML = 'Zoom in';
		config.status.menus.zoomIn.appendChild(config.status.menus.zoomInIcon);
		element.appendChild(config.status.menus.zoomIn);
		// add the event handlers
		config.status.menus.zoomIn.addEventListener('mousedown', function (event) {
			// increase the zoom
			parent.increase();
			// cancel streaming
			config.status.stream = false;
			// repeat
			config.status.menus.zoomInRepeat = setInterval(function () { parent.increase(); }, 300);
			// cancel this event
			event.preventDefault();
		}, false);
		config.status.menus.zoomIn.addEventListener('mouseup', function () {
			// stop repeating
			clearInterval(config.status.menus.zoomInRepeat);
			// allow streaming
			config.status.stream = true;
			// redraw
			parent.parent.update();
		}, false);
		config.status.menus.zoomIn.addEventListener('click', function (event) {
			// cancel this event
			event.preventDefault();
		}, false);
	};
	
	this.decreaser = function (element) {
		var context = this.context, parent = this.parent, config = this.config;
		// add the decrease button
		config.status.menus.zoomOut = document.createElement('button');
		config.status.menus.zoomOut.className = 'decrease';
		config.status.menus.zoomOutIcon = document.createElement('span');
		config.status.menus.zoomOutIcon.innerHTML = 'Zoom out';
		config.status.menus.zoomOut.appendChild(config.status.menus.zoomOutIcon);
		element.appendChild(config.status.menus.zoomOut);
		config.status.menus.zoomOut.addEventListener('mousedown', function (event) {
			// increase the zoom
			parent.decrease();
			// cancel streaming
			config.status.stream = false;
			// repeat
			config.status.menus.zoomOutRepeat = setInterval(function () { parent.decrease(); }, 300);
			// cancel this event
			event.preventDefault();
		}, false);
		config.status.menus.zoomOut.addEventListener('mouseup', function () {
			// stop repeating
			clearInterval(config.status.menus.zoomOutRepeat);
			// allow streaming
			config.status.stream = true;
			// redraw
			parent.parent.update();
		}, false);
		config.status.menus.zoomOut.addEventListener('click', function (event) {
			// cancel this event
			event.preventDefault();
		}, false);
	};
};

// return as a require.js module
if (typeof module !== 'undefined') {
	exports = module.exports = useful.Viewer.Zoom_Build;
}
