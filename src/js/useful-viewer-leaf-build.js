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
	useful.Viewer_Leaf_Build = function (parent) {
		this.root = parent.parent;
		this.parent = parent;
		this.indicator = function (element) {
			var root = this.root, parent = this.parent, cfg = root.cfg;
			// create the page indicator
			cfg.status.menus.leafPage = document.createElement('form');
			cfg.status.menus.leafPageInput = document.createElement('input');
			cfg.status.menus.leafPageInput.setAttribute('type', 'text');
			cfg.status.menus.leafPageCount = document.createElement('span');
			cfg.status.menus.leafPageCount.className = 'count';
			cfg.status.menus.leafPageSubmit = document.createElement('button');
			cfg.status.menus.leafPageSubmit.setAttribute('type', 'submit');
			cfg.status.menus.leafPageSubmit.style.position = 'absolute';
			cfg.status.menus.leafPageSubmit.style.left = '-999em';
			cfg.status.menus.leafPage.appendChild(cfg.status.menus.leafPageInput);
			cfg.status.menus.leafPage.appendChild(cfg.status.menus.leafPageCount);
			element.appendChild(cfg.status.menus.leafPage);
			cfg.status.menus.leafPageInput.addEventListener('change', function (event) {
				parent.typed(event);
			}, false);
			cfg.status.menus.leafPage.addEventListener('submit', function (event) {
				parent.typed(event);
				event.preventDefault();
			}, false);
		};
		this.resetter = function (element) {
			var root = this.root, parent = this.parent, cfg = root.cfg;
			// create the reset button
			cfg.status.menus.leafReset = document.createElement('button');
			cfg.status.menus.leafReset.className = 'reset';
			cfg.status.menus.leafResetIcon = document.createElement('span');
			cfg.status.menus.leafResetIcon.innerHTML = 'Reset view';
			cfg.status.menus.leafReset.appendChild(cfg.status.menus.leafResetIcon);
			element.appendChild(cfg.status.menus.leafReset);
			cfg.status.menus.leafReset.addEventListener('click', function (event) {
				parent.reset(event);
			}, false);
		};
		this.increaser = function (element) {
			var root = this.root, parent = this.parent, cfg = root.cfg;
			// create the next button
			cfg.status.menus.leafIn = document.createElement('button');
			cfg.status.menus.leafIn.className = 'increase';
			cfg.status.menus.leafInIcon = document.createElement('span');
			cfg.status.menus.leafInIcon.innerHTML = 'Leaf forward';
			cfg.status.menus.leafIn.appendChild(cfg.status.menus.leafInIcon);
			element.appendChild(cfg.status.menus.leafIn);
			cfg.status.menus.leafIn.addEventListener('click', function (event) {
				parent.increase(event);
			}, false);
		};
		this.decreaser = function (element) {
			var root = this.root, parent = this.parent, cfg = root.cfg;
			// create the previous button
			cfg.status.menus.leafOut = document.createElement('button');
			cfg.status.menus.leafOut.className = 'decrease';
			cfg.status.menus.leafOutIcon = document.createElement('span');
			cfg.status.menus.leafOutIcon.innerHTML = 'Leaf back';
			cfg.status.menus.leafOut.appendChild(cfg.status.menus.leafOutIcon);
			element.appendChild(cfg.status.menus.leafOut);
			cfg.status.menus.leafOut.addEventListener('click', function (event) {
				parent.decrease(event);
			}, false);
		};
	};

	// return as a require.js module
	if (typeof module !== 'undefined') {
		exports = module.exports = useful.Viewer_Leaf_Build;
	}

})();
