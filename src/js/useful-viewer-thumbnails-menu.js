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
useful.Viewer.prototype.Thumbnails_Menu = function (parent) {

	// PROPERTIES
	
	"use strict";
	this.parent = parent;
	this.config = parent.config;
	this.context = parent.context;
	// build the menu options
	this.setup = function () {
		var context = this.context, parent = this.parent, config = this.config;
		// create the thumbnail controls
		config.status.pageMenu = document.createElement('menu');
		config.status.pageMenu.className = 'scroller';
		config.status.nextPage = document.createElement('button');
		config.status.nextPage.className = 'next';
		config.status.nextPageIcon = document.createElement('span');
		config.status.nextPageIcon.innerHTML = '&gt';
		config.status.prevPage = document.createElement('button');
		config.status.prevPage.className = 'previous';
		config.status.prevPageIcon = document.createElement('span');
		config.status.prevPageIcon.innerHTML = '&lt';
		config.status.nextPage.appendChild(config.status.nextPageIcon);
		config.status.pageMenu.appendChild(config.status.nextPage);
		config.status.prevPage.appendChild(config.status.prevPageIcon);
		config.status.pageMenu.appendChild(config.status.prevPage);
		config.status.slideNav.appendChild(config.status.pageMenu);
		// apply clicks to the thumbnail controls
		var _this = this;
		config.status.nextPage.addEventListener('click', function (event) {
			_this.next(event, config.status.nextSlide);
		}, false);
		config.status.prevPage.addEventListener('click', function (event) {
			_this.prev(event, config.status.prevSlide);
		}, false);
	};
	// show or hide the previous and next buttons
	this.update = function () {
		var context = this.context, parent = this.parent, config = this.config;
		// calculate the current position
		config.scrollPosition = (config.status.slideUl.style.marginLeft) ? parseInt(config.status.slideUl.style.marginLeft, 10) : 0;
		config.scrollDistance = config.status.slideDiv.offsetWidth;
		// calculate the minimum position
		config.scrollMin = 0;
		// calculate the maximum position
		var lastThumbnail = config.status.thumbnails[config.status.thumbnails.length - 1];
		config.scrollStep = lastThumbnail.offsetWidth;
		config.scrollMax = -1 * (lastThumbnail.offsetLeft + lastThumbnail.offsetWidth) + config.scrollDistance;
		// show or hide the prev button
		config.status.prevPage.className = config.status.prevPage.className.replace(/ disabled/gi, '');
		config.status.prevPage.className += (config.scrollPosition >= config.scrollMin) ? ' disabled' : '';
		// show or hide the next button
		config.status.nextPage.className = config.status.nextPage.className.replace(/ disabled/gi, '');
		config.status.nextPage.className += (config.scrollPosition <= config.scrollMax && config.scrollMax < 0) ? ' disabled' : '';
	};
	// show the next page of thumbnails
	this.next = function (event, node) {
		var context = this.context, parent = this.parent, config = this.config;
		// get the event properties
		event = event || window.event;
		var target = event.target || event.srcElement;
		// if the button is not disabled
		if (!target.className.match(/disabled/)) {
			// scroll one page's width of thumbnails
			var newPosition = config.scrollPosition - config.scrollDistance + config.scrollStep;
			// limit the scroll distance
			if (newPosition < config.scrollMax) {
				newPosition = config.scrollMax;
			}
			// transition to the new position
			useful.transitions.byRules(config.status.slideUl, {'marginLeft' : newPosition + 'px'});
			// redraw the menu buttons
			this.update();
		}
		// cancel the click
		target.blur();
		event.preventDefault();
	};
	// show the previous page of thumbnails
	this.prev = function (event, node) {
		var context = this.context, parent = this.parent, config = this.config;
		// get the event properties
		event = event || window.event;
		var target = event.target || event.srcElement;
		// if the button is not disabled
		if (!target.className.match(/disabled/)) {
			// scroll one page's width of thumbnails
			var newPosition = config.scrollPosition + config.scrollDistance - config.scrollStep;
			// limit the scroll distance
			if (newPosition > 0) {
				newPosition = 0;
			}
			// transition to the new position
			useful.transitions.byRules(config.status.slideUl, {'marginLeft' : newPosition + 'px'});
			// redraw the menu buttons
			this.update();
		}
		// cancel the click
		target.blur();
		event.preventDefault();
	};
};

// return as a require.js module
if (typeof module !== 'undefined') {
	exports = module.exports = useful.Viewer.Thumbnails_Menu;
}
