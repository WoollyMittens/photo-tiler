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
useful.Viewer.prototype.Spin_Build = function (parent) {
	// properties
	"use strict";
	this.parent = parent;
	this.config = parent.config;
	this.context = parent.context;
	// methods
	this.slider = function (element) {
		var context = this.context, parent = this.parent, config = this.config;
		// add the slider to the menu
		config.status.menus.spinIndicator = (navigator.userAgent.match(/WebKit/) || true) ? document.createElement('div') : document.createElement('meter');
		config.status.menus.spinIndicator.className = 'meter';
		config.status.menus.spinIndicator.setAttribute('min', 1);
		config.status.menus.spinIndicator.setAttribute('max', config.figures.length);
		config.status.menus.spinIndicator.setAttribute('value', config.status.index);
		config.status.menus.spinSlider = document.createElement('div');
		config.status.menus.spinSliderIcon = document.createElement('span');
		config.status.menus.spinSliderIcon.innerHTML = config.status.index;
		config.status.menus.spinSlider.appendChild(config.status.menus.spinSliderIcon);
		config.status.menus.spinIndicator.appendChild(config.status.menus.spinSlider);
		element.appendChild(config.status.menus.spinIndicator);
	};
	this.cover = function (element) {
		var context = this.context, parent = this.parent, config = this.config;
		// add a touch cover to the menu
		config.status.menus.spinCover = document.createElement('div');
		config.status.menus.spinCover.className = 'cover';
		element.appendChild(config.status.menus.spinCover);
		var sims = config.status.menus.spinCover;
		// add the event handler
		sims.addEventListener('mousewheel', function (event) {
			parent.mouse.wheel(event);
		}, false);
		sims.addEventListener('DOMMouseScroll', function (event) {
			parent.mouse.wheel(event);
		}, false);
		sims.addEventListener('mousedown', function (event) {
			parent.mouse.start(event);
		}, false);
		sims.addEventListener('mousemove', function (event) {
			parent.mouse.move(event);
		}, false);
		sims.addEventListener('mouseup', function (event) {
			parent.mouse.end(event);
		}, false);
		sims.addEventListener('mouseout', function (event) {
			parent.mouse.end(event);
		}, false);
		// add the touch events
		sims.addEventListener('touchstart', function (event) {
			parent.touch.start(event);
		}, false);
		sims.addEventListener('touchmove', function (event) {
			parent.touch.move(event);
		}, false);
		sims.addEventListener('touchend', function (event) {
			parent.touch.end(event);
		}, false);
	};
	this.increaser = function (element) {
		var context = this.context, parent = this.parent, config = this.config;
		// add the increase button
		config.status.menus.spinIn = document.createElement('button');
		config.status.menus.spinIn.className = 'increase';
		config.status.menus.spinInIcon = document.createElement('span');
		config.status.menus.spinInIcon.innerHTML = 'Spin left';
		config.status.menus.spinIn.appendChild(config.status.menus.spinInIcon);
		element.appendChild(config.status.menus.spinIn);
		config.status.menus.spinIn.addEventListener('mousedown', function (event) {
			// increase the zoom
			parent.increase();
			// cancel streaming
			config.status.stream = false;
			// repeat
			config.status.menus.spinInRepeat = setInterval(function () { parent.increase(); }, 100);
			// cancel this event
			event.preventDefault();
		}, false);
		config.status.menus.spinIn.addEventListener('mouseup', function () {
			// stop repeating
			clearInterval(config.status.menus.spinInRepeat);
			// allow streaming
			config.status.stream = true;
			// redraw
			parent.parent.update();
		}, false);
	};
	this.decreaser = function (element) {
		var context = this.context, parent = this.parent, config = this.config;
		// add the decrease button
		config.status.menus.spinOut = document.createElement('button');
		config.status.menus.spinOut.className = 'decrease';
		config.status.menus.spinOutIcon = document.createElement('span');
		config.status.menus.spinOutIcon.innerHTML = 'Spin right';
		config.status.menus.spinOut.appendChild(config.status.menus.spinOutIcon);
		element.appendChild(config.status.menus.spinOut);
		config.status.menus.spinOut.addEventListener('mousedown', function (event) {
			// increase the zoom
			parent.decrease();
			// cancel streaming
			config.status.stream = false;
			// repeat
			config.status.menus.spinOutRepeat = setInterval(function () { parent.decrease(); }, 100);
			// cancel this event
			event.preventDefault();
		}, false);
		config.status.menus.spinOut.addEventListener('mouseup', function () {
			// stop repeating
			clearInterval(config.status.menus.spinOutRepeat);
			// allow streaming
			config.status.stream = true;
			// redraw
			parent.parent.update();
		}, false);
	};
};

// return as a require.js module
if (typeof module !== 'undefined') {
	exports = module.exports = useful.Viewer.Spin_Build;
}
