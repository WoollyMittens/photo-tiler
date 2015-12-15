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
useful.Viewer.prototype.Thumbnails = function (parent) {

	// PROPERTIES
	
	"use strict";
	this.parent = parent;
	this.config = parent.config;
	this.context = parent.context;
	// build the thumbnail list
	this.setup = function () {
		var context = this.context, parent = this.parent, config = this.config;
		// create the navigation bar
		config.status.slideNav = document.createElement('nav');
		config.status.slideNav.className = 'thumbnails';
		config.status.slideDiv = document.createElement('div');
		config.status.slideUl = document.createElement('ul');
		// force the height of the nav if desired
		if (config.divide !== '100%') {
			config.status.slideNav.style.height = (100 - config.divide * 100 - parseInt(config.margin, 10)) + '%';
		}
		if (config.margin) {
			config.pixelMargin = parseInt(config.element.offsetWidth * parseInt(config.margin, 10) / 100, 10);
		}
		// for all thumbnails in the this.config
		config.status.thumbnails = [0];
		for (var a = 1; a < config.thumbnails.length; a += 1) {
			// create a new thumbnail
			var newLi = document.createElement('li');
			var newA = document.createElement('a');
			newA.className = (a === 1) ? config.navigation + '_active' : config.navigation + '_passive';
			var newImage = document.createElement('img');
			newImage.alt = '';
			newImage.src = config.thumbnails[a];
			newA.appendChild(newImage);
			newLi.appendChild(newA);
			// insert the new nodes
			config.status.slideUl.appendChild(newLi);
			// store the dom pointers to the images
			config.status.thumbnails[a] = newA;
		}
		// insert the navigation bar
		config.status.slideDiv.appendChild(config.status.slideUl);
		config.status.slideNav.appendChild(config.status.slideDiv);
		config.element.appendChild(config.status.slideNav);
		// for all thumbnails in the this.config
		for (a = 1; a < config.thumbnails.length; a += 1) {
			// assign the event handler
			this.onThumbnailClick(config.status.thumbnails[a]);
		}
		// start the menu
		this.menu.setup();
	};
	// event handlers
	this.onThumbnailClick = function (element) {
		var context = this.context, parent = this.parent, config = this.config;
		var _this = this;
		element.addEventListener('click', function (event) {
			_this.set(event, element);
		}, false);
	};
	// redraw/recentre the thumbnails according to the this.config
	this.update = function () {
		var context = this.context, parent = this.parent, config = this.config;
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
		var context = this.context, parent = this.parent, config = this.config;
		// for all thumbnails
		for (var a = 1, b = config.thumbnails.length; a < b; a += 1) {
			// highlight the active slide
			config.status.thumbnails[a].className = (config.status.index === a) ? config.navigation + '_active' : config.navigation + '_passive';
		}
	};
	// centre the icons in containers
	this.centreIcons = function () {
		var context = this.context, parent = this.parent, config = this.config;
		var imageObject, imageWidth, imageHeight, rowHeight;
		// measure the available space
		rowHeight = config.status.slideNav.offsetHeight;
		// for all thumbnails
		for (var a = 1, b = config.thumbnails.length; a < b; a += 1) {
			// centre the image in its surroundings
			config.status.thumbnails[a].style.width =  rowHeight + 'px';
			imageObject = config.status.thumbnails[a].getElementsByTagName('img')[0];
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
		var context = this.context, parent = this.parent, config = this.config;
		// scroll the slider enough to center the active slide
		var activeThumbnail = config.status.thumbnails[config.status.index];
		var activePosition = activeThumbnail.offsetLeft;
		var activeWidth = activeThumbnail.offsetWidth;
		var scrollDistance = config.status.slideDiv.offsetWidth;
		var centeredPosition = -activePosition + scrollDistance / 2 - activeWidth / 2;
		centeredPosition = (centeredPosition > 0) ? 0 : centeredPosition;
		centeredPosition = (centeredPosition < config.scrollMax && config.scrollMax < 0) ? config.scrollMax : centeredPosition;
		// transition to the new position
		useful.transitions.byRules(
			config.status.slideUl,
			{'marginLeft' : centeredPosition + 'px'}
		);
	};
	// activate a corresponding figure
	this.set = function (event, node) {
		var context = this.context, parent = this.parent, config = this.config;
		// get the event properties
		event = event || window.event;
		// count which thumbnail this is
		for (var a = 1; a < config.status.thumbnails.length; a += 1) {
			if (config.status.thumbnails[a] === node) {
				// change the index to this slide
				config.status.index = a;
				// reset the zoom
				config.status.zoom = (config.zoom !== 'static') ? config.max : 1;
				// redraw all
				parent.update();
			}
		}
		// cancel the click
		event.preventDefault();
	};
	// manages the thumbnail controls
	this.menu = new this.context.Thumbnails_Menu(this);
};

// return as a require.js module
if (typeof module !== 'undefined') {
	exports = module.exports = useful.Viewer.Thumbnails;
}
