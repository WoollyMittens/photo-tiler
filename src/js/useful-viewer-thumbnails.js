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
	useful.Viewer_Thumbnails = function (parent) {
		this.root = parent;
		this.parent = parent;
		// build the thumbnail list
		this.setup = function () {
			var root = this.root, parent = this.parent, cfg = root.cfg;
			// create the navigation bar
			cfg.status.slideNav = document.createElement('nav');
			cfg.status.slideNav.className = 'thumbnails';
			cfg.status.slideDiv = document.createElement('div');
			cfg.status.slideUl = document.createElement('ul');
			// force the height of the nav if desired
			if (cfg.divide !== '100%') {
				cfg.status.slideNav.style.height = (100 - cfg.divide * 100 - parseInt(cfg.margin, 10)) + '%';
			}
			if (cfg.margin) {
				cfg.pixelMargin = parseInt(root.obj.offsetWidth * parseInt(cfg.margin, 10) / 100, 10);
			}
			// for all thumbnails in the root.cfg
			cfg.status.thumbnails = [0];
			for (var a = 1; a < cfg.thumbnails.length; a += 1) {
				// create a new thumbnail
				var newLi = document.createElement('li');
				var newA = document.createElement('a');
				newA.className = (a === 1) ? cfg.navigation + '_active' : cfg.navigation + '_passive';
				var newImage = document.createElement('img');
				newImage.alt = '';
				newImage.src = cfg.thumbnails[a];
				newA.appendChild(newImage);
				newLi.appendChild(newA);
				// insert the new nodes
				cfg.status.slideUl.appendChild(newLi);
				// store the dom pointers to the images
				cfg.status.thumbnails[a] = newA;
			}
			// insert the navigation bar
			cfg.status.slideDiv.appendChild(cfg.status.slideUl);
			cfg.status.slideNav.appendChild(cfg.status.slideDiv);
			root.obj.appendChild(cfg.status.slideNav);
			// for all thumbnails in the root.cfg
			for (a = 1; a < cfg.thumbnails.length; a += 1) {
				// assign the event handler
				this.onThumbnailClick(cfg.status.thumbnails[a]);
			}
			// start the menu
			this.menu.setup();
		};
		// event handlers
		this.onThumbnailClick = function (element) {
			var root = this.root, parent = this.parent, cfg = root.cfg;
			var _this = this;
			element.addEventListener('click', function (event) {
				_this.set(event, element);
			}, false);
		};
		// redraw/recentre the thumbnails according to the root.cfg
		this.update = function () {
			var root = this.root, parent = this.parent, cfg = root.cfg;
			// update the thumbnails menu
			this.menu.update();
			/// highlight the icons
			this.hightlightIcons();
			// centre the icons
			this.centreIcons();
			// centre the slider
			this.centreSlider();
		};
		// highlight active icon
		this.hightlightIcons = function () {
			var root = this.root, parent = this.parent, cfg = root.cfg;
			// for all thumbnails
			for (var a = 1, b = cfg.thumbnails.length; a < b; a += 1) {
				// highlight the active slide
				cfg.status.thumbnails[a].className = (cfg.status.index === a) ? cfg.navigation + '_active' : cfg.navigation + '_passive';
			}
		};
		// centre the icons in containers
		this.centreIcons = function () {
			var root = this.root, parent = this.parent, cfg = root.cfg;
			var imageObject, imageWidth, imageHeight, rowHeight;
			// measure the available space
			rowHeight = cfg.status.slideNav.offsetHeight;
			// for all thumbnails
			for (var a = 1, b = cfg.thumbnails.length; a < b; a += 1) {
				// centre the image in its surroundings
				cfg.status.thumbnails[a].style.width =  rowHeight + 'px';
				imageObject = cfg.status.thumbnails[a].getElementsByTagName('img')[0];
				imageWidth = imageObject.offsetWidth;
				imageHeight = imageObject.offsetHeight;
				if (imageWidth > imageHeight) {
					imageWidth = imageWidth / imageHeight * rowHeight;
					imageHeight = rowHeight;
				} else {
					imageHeight = imageHeight /  imageWidth * rowHeight;
					imageWidth = rowHeight;
				}
				imageObject.style.width = Math.round(imageWidth) + 'px';
				imageObject.style.height = Math.round(imageHeight) + 'px';
				imageObject.style.left = '50%';
				imageObject.style.top = '50%';
				imageObject.style.marginLeft = Math.round(-imageWidth / 2) + 'px';
				imageObject.style.marginTop = Math.round(-imageHeight / 2) + 'px';
			}
		};
		// centre the container around the active one
		this.centreSlider = function () {
			var root = this.root, parent = this.parent, cfg = root.cfg;
			// scroll the slider enough to center the active slide
			var activeThumbnail = cfg.status.thumbnails[cfg.status.index];
			var activePosition = activeThumbnail.offsetLeft;
			var activeWidth = activeThumbnail.offsetWidth;
			var scrollDistance = cfg.status.slideDiv.offsetWidth;
			var centeredPosition = -activePosition + scrollDistance / 2 - activeWidth / 2;
			centeredPosition = (centeredPosition > 0) ? 0 : centeredPosition;
			centeredPosition = (centeredPosition < cfg.scrollMax && cfg.scrollMax < 0) ? cfg.scrollMax : centeredPosition;
			// transition to the new position
			useful.transitions.byRules(
				cfg.status.slideUl,
				{'marginLeft' : centeredPosition + 'px'}
			);
		};
		// activate a corresponding figure
		this.set = function (event, node) {
			var root = this.root, parent = this.parent, cfg = root.cfg;
			// get the event properties
			event = event || window.event;
			// count which thumbnail this is
			for (var a = 1; a < cfg.status.thumbnails.length; a += 1) {
				if (cfg.status.thumbnails[a] === node) {
					// change the index to this slide
					cfg.status.index = a;
					// reset the zoom
					cfg.status.zoom = (cfg.zoom !== 'static') ? cfg.max : 1;
					// redraw all
					root.update();
				}
			}
			// cancel the click
			event.preventDefault();
		};
		// manages the thumbnail controls
		this.menu = new useful.Viewer_Thumbnails_Menu(this);
	};

	// return as a require.js module
	if (typeof module !== 'undefined') {
		exports = module.exports = useful.Viewer_Thumbnails;
	}

})();
