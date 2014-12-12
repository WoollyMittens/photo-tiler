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
useful.Viewer.prototype.Toolbar = function (parent) {
	// properties
	"use strict";
	this.parent = parent;
	this.config = parent.config;
	this.context = parent.context;
	// methods
	this.setup = function () {
		var context = this.context, parent = this.parent, config = this.config;
		// create the menu
		config.status.menus = config.status.menus || {};
		config.status.menus.toolbarNav = document.createElement('nav');
		config.status.menus.toolbarNav.className = config.toolbars + ' ' + config.spin;
		config.status.menus.toolbarNav.style.bottom = ((1 - config.divide) * 100) + '%';
		// add the zoom buttons
		config.status.menus.toolbarZoom = document.createElement('menu');
		config.status.menus.toolbarZoom.className = 'zoom';
		parent.zoom.build.increaser(config.status.menus.toolbarZoom);
		parent.zoom.build.decreaser(config.status.menus.toolbarZoom);
		config.status.menus.toolbarNav.appendChild(config.status.menus.toolbarZoom);
		// setup the right toolbar
		switch (config.spin) {
		case 'rotation' :
			// create the menu
			config.status.menus.toolbarSpin = document.createElement('menu');
			config.status.menus.toolbarSpin.className = 'spin';
			// add the spin buttons
			parent.spin.build.decreaser(config.status.menus.toolbarSpin);
			parent.spin.build.increaser(config.status.menus.toolbarSpin);
			// add the menu to the toolbar
			config.status.menus.toolbarNav.appendChild(config.status.menus.toolbarSpin);
			break;
		case 'slideshow' :
			// create the menu
			config.status.menus.toolbarLeaf = document.createElement('menu');
			config.status.menus.toolbarLeaf.className = 'leaf';
			// add the previous button
			parent.leaf.build.decreaser(config.status.menus.toolbarLeaf);
			// add the next button
			parent.leaf.build.increaser(config.status.menus.toolbarLeaf);
			// add the menu to the toolbar
			config.status.menus.toolbarNav.appendChild(config.status.menus.toolbarLeaf);
			break;
		case 'catalogue' :
			// create the menu
			config.status.menus.toolbarLeaf = document.createElement('menu');
			config.status.menus.toolbarLeaf.className = 'leaf';
			// add the reset button
			parent.leaf.build.resetter(config.status.menus.toolbarLeaf);
			// add the indicator display
			parent.leaf.build.indicator(config.status.menus.toolbarLeaf);
			// add the previous button
			parent.leaf.build.decreaser(config.status.menus.toolbarLeaf);
			// add the next button
			parent.leaf.build.increaser(config.status.menus.toolbarLeaf);
			// add the reset button
			//parent.leaf.build.resetter(config.status.menus.toolbarLeaf);
			// add the menu to the toolbar
			config.status.menus.toolbarNav.appendChild(config.status.menus.toolbarLeaf);
			break;
		}
		// add the menu to the interface
		config.element.appendChild(config.status.menus.toolbarNav);
	};
	this.update = function () {
		var context = this.context, parent = this.parent, config = this.config;
		// hide/show the zoom out button
		config.status.menus.zoomIn.className = config.status.menus.zoomIn.className.replace(/ disabled/gi, '');
		config.status.menus.zoomIn.className += (config.status.atMaxZoom) ? ' disabled' : '';
		// hide/show the zoom in button
		config.status.menus.zoomOut.className = config.status.menus.zoomOut.className.replace(/ disabled/gi, '');
		config.status.menus.zoomOut.className += (config.status.atMinZoom) ? ' disabled' : '';
		// update the right toolbar
		switch (config.spin) {
			case 'rotation' :
				break;
			case 'slideshow' :
				// hide/show the previous button
				config.status.menus.leafIn.className = config.status.menus.leafIn.className.replace(/ disabled/gi, '');
				config.status.menus.leafIn.className += (config.status.atMaxLeaf) ? ' disabled' : '';
				// hide/show the next button
				config.status.menus.leafOut.className = config.status.menus.leafOut.className.replace(/ disabled/gi, '');
				config.status.menus.leafOut.className += (config.status.atMinLeaf) ? ' disabled' : '';
				break;
			case 'catalogue' :
				// fill in the current page
				config.status.menus.leafPageInput.value = config.status.index;
				// fill in the page total
				config.status.menus.leafPageCount.innerHTML = 'of ' +	(config.status.figures.length - 1);
				break;
		}
	};
};

// return as a require.js module
if (typeof module !== 'undefined') {
	exports = module.exports = useful.Viewer.Toolbar;
}
