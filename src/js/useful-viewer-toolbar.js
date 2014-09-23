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
	useful.Viewer_Toolbar = function (parent) {
		this.root = parent;
		this.parent = parent;
		this.setup = function () {
			var root = this.root, parent = this.parent, cfg = root.cfg;
			// create the menu
			cfg.status.menus = cfg.status.menus || {};
			cfg.status.menus.toolbarNav = document.createElement('nav');
			cfg.status.menus.toolbarNav.className = cfg.toolbars + ' ' + cfg.spin;
			cfg.status.menus.toolbarNav.style.bottom = ((1 - cfg.divide) * 100) + '%';
			// add the zoom buttons
			cfg.status.menus.toolbarZoom = document.createElement('menu');
			cfg.status.menus.toolbarZoom.className = 'zoom';
			root.zoom.build.increaser(cfg.status.menus.toolbarZoom);
			root.zoom.build.decreaser(cfg.status.menus.toolbarZoom);
			cfg.status.menus.toolbarNav.appendChild(cfg.status.menus.toolbarZoom);
			// setup the right toolbar
			switch (cfg.spin) {
			case 'rotation' :
				// create the menu
				cfg.status.menus.toolbarSpin = document.createElement('menu');
				cfg.status.menus.toolbarSpin.className = 'spin';
				// add the spin buttons
				root.spin.build.decreaser(cfg.status.menus.toolbarSpin);
				root.spin.build.increaser(cfg.status.menus.toolbarSpin);
				// add the menu to the toolbar
				cfg.status.menus.toolbarNav.appendChild(cfg.status.menus.toolbarSpin);
				break;
			case 'slideshow' :
				// create the menu
				cfg.status.menus.toolbarLeaf = document.createElement('menu');
				cfg.status.menus.toolbarLeaf.className = 'leaf';
				// add the previous button
				root.leaf.build.decreaser(cfg.status.menus.toolbarLeaf);
				// add the next button
				root.leaf.build.increaser(cfg.status.menus.toolbarLeaf);
				// add the menu to the toolbar
				cfg.status.menus.toolbarNav.appendChild(cfg.status.menus.toolbarLeaf);
				break;
			case 'catalogue' :
				// create the menu
				cfg.status.menus.toolbarLeaf = document.createElement('menu');
				cfg.status.menus.toolbarLeaf.className = 'leaf';
				// add the reset button
				root.leaf.build.resetter(cfg.status.menus.toolbarLeaf);
				// add the indicator display
				root.leaf.build.indicator(cfg.status.menus.toolbarLeaf);
				// add the previous button
				root.leaf.build.decreaser(cfg.status.menus.toolbarLeaf);
				// add the next button
				root.leaf.build.increaser(cfg.status.menus.toolbarLeaf);
				// add the reset button
				//root.leaf.build.resetter(cfg.status.menus.toolbarLeaf);
				// add the menu to the toolbar
				cfg.status.menus.toolbarNav.appendChild(cfg.status.menus.toolbarLeaf);
				break;
			}
			// add the menu to the interface
			root.obj.appendChild(cfg.status.menus.toolbarNav);
		};
		this.update = function () {
			var root = this.root, parent = this.parent, cfg = root.cfg;
			// hide/show the zoom out button
			cfg.status.menus.zoomIn.className = cfg.status.menus.zoomIn.className.replace(/ disabled/gi, '');
			cfg.status.menus.zoomIn.className += (cfg.status.atMaxZoom) ? ' disabled' : '';
			// hide/show the zoom in button
			cfg.status.menus.zoomOut.className = cfg.status.menus.zoomOut.className.replace(/ disabled/gi, '');
			cfg.status.menus.zoomOut.className += (cfg.status.atMinZoom) ? ' disabled' : '';
			// update the right toolbar
			switch (cfg.spin) {
				case 'rotation' :
					break;
				case 'slideshow' :
					// hide/show the previous button
					cfg.status.menus.leafIn.className = cfg.status.menus.leafIn.className.replace(/ disabled/gi, '');
					cfg.status.menus.leafIn.className += (cfg.status.atMaxLeaf) ? ' disabled' : '';
					// hide/show the next button
					cfg.status.menus.leafOut.className = cfg.status.menus.leafOut.className.replace(/ disabled/gi, '');
					cfg.status.menus.leafOut.className += (cfg.status.atMinLeaf) ? ' disabled' : '';
					break;
				case 'catalogue' :
					// fill in the current page
					cfg.status.menus.leafPageInput.value = cfg.status.index;
					// fill in the page total
					cfg.status.menus.leafPageCount.innerHTML = 'of ' +	(cfg.status.figures.length - 1);
					break;
			}
		};
	};

	// return as a require.js module
	if (typeof module !== 'undefined') {
		exports = module.exports = useful.Viewer_Toolbar;
	}

})();
