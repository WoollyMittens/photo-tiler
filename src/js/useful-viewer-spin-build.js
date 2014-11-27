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
	this.root = parent.parent;
	this.parent = parent;
	// methods
	this.slider = function (element) {
		var root = this.root, parent = this.parent, cfg = root.cfg;
		// add the slider to the menu
		cfg.status.menus.spinIndicator = (navigator.userAgent.match(/WebKit/) || true) ? document.createElement('div') : document.createElement('meter');
		cfg.status.menus.spinIndicator.className = 'meter';
		cfg.status.menus.spinIndicator.setAttribute('min', 1);
		cfg.status.menus.spinIndicator.setAttribute('max', cfg.figures.length);
		cfg.status.menus.spinIndicator.setAttribute('value', cfg.status.index);
		cfg.status.menus.spinSlider = document.createElement('div');
		cfg.status.menus.spinSliderIcon = document.createElement('span');
		cfg.status.menus.spinSliderIcon.innerHTML = cfg.status.index;
		cfg.status.menus.spinSlider.appendChild(cfg.status.menus.spinSliderIcon);
		cfg.status.menus.spinIndicator.appendChild(cfg.status.menus.spinSlider);
		element.appendChild(cfg.status.menus.spinIndicator);
	};
	this.cover = function (element) {
		var root = this.root, parent = this.parent, cfg = root.cfg;
		// add a touch cover to the menu
		cfg.status.menus.spinCover = document.createElement('div');
		cfg.status.menus.spinCover.className = 'cover';
		element.appendChild(cfg.status.menus.spinCover);
		var sims = cfg.status.menus.spinCover;
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
		var root = this.root, parent = this.parent, cfg = root.cfg;
		// add the increase button
		cfg.status.menus.spinIn = document.createElement('button');
		cfg.status.menus.spinIn.className = 'increase';
		cfg.status.menus.spinInIcon = document.createElement('span');
		cfg.status.menus.spinInIcon.innerHTML = 'Spin left';
		cfg.status.menus.spinIn.appendChild(cfg.status.menus.spinInIcon);
		element.appendChild(cfg.status.menus.spinIn);
		cfg.status.menus.spinIn.addEventListener('mousedown', function (event) {
			// increase the zoom
			parent.increase();
			// cancel streaming
			cfg.status.stream = false;
			// repeat
			cfg.status.menus.spinInRepeat = setInterval(function () { parent.increase(); }, 100);
			// cancel this event
			event.preventDefault();
		}, false);
		cfg.status.menus.spinIn.addEventListener('mouseup', function () {
			// stop repeating
			clearInterval(cfg.status.menus.spinInRepeat);
			// allow streaming
			cfg.status.stream = true;
			// redraw
			root.update();
		}, false);
	};
	this.decreaser = function (element) {
		var root = this.root, parent = this.parent, cfg = root.cfg;
		// add the decrease button
		cfg.status.menus.spinOut = document.createElement('button');
		cfg.status.menus.spinOut.className = 'decrease';
		cfg.status.menus.spinOutIcon = document.createElement('span');
		cfg.status.menus.spinOutIcon.innerHTML = 'Spin right';
		cfg.status.menus.spinOut.appendChild(cfg.status.menus.spinOutIcon);
		element.appendChild(cfg.status.menus.spinOut);
		cfg.status.menus.spinOut.addEventListener('mousedown', function (event) {
			// increase the zoom
			parent.decrease();
			// cancel streaming
			cfg.status.stream = false;
			// repeat
			cfg.status.menus.spinOutRepeat = setInterval(function () { parent.decrease(); }, 100);
			// cancel this event
			event.preventDefault();
		}, false);
		cfg.status.menus.spinOut.addEventListener('mouseup', function () {
			// stop repeating
			clearInterval(cfg.status.menus.spinOutRepeat);
			// allow streaming
			cfg.status.stream = true;
			// redraw
			root.update();
		}, false);
	};
};

// return as a require.js module
if (typeof module !== 'undefined') {
	exports = module.exports = useful.Viewer.Spin_Build;
}
