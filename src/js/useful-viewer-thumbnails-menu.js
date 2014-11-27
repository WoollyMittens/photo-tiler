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
	// properties
	"use strict";
	this.root = parent.parent;
	this.parent = parent;
	// build the menu options
	this.setup = function () {
		var root = this.root, parent = this.parent, cfg = root.cfg;
		// create the thumbnail controls
		cfg.status.pageMenu = document.createElement('menu');
		cfg.status.pageMenu.className = 'scroller';
		cfg.status.nextPage = document.createElement('button');
		cfg.status.nextPage.className = 'next';
		cfg.status.nextPageIcon = document.createElement('span');
		cfg.status.nextPageIcon.innerHTML = '&gt';
		cfg.status.prevPage = document.createElement('button');
		cfg.status.prevPage.className = 'previous';
		cfg.status.prevPageIcon = document.createElement('span');
		cfg.status.prevPageIcon.innerHTML = '&lt';
		cfg.status.nextPage.appendChild(cfg.status.nextPageIcon);
		cfg.status.pageMenu.appendChild(cfg.status.nextPage);
		cfg.status.prevPage.appendChild(cfg.status.prevPageIcon);
		cfg.status.pageMenu.appendChild(cfg.status.prevPage);
		cfg.status.slideNav.appendChild(cfg.status.pageMenu);
		// apply clicks to the thumbnail controls
		var _this = this;
		cfg.status.nextPage.addEventListener('click', function (event) {
			_this.next(event, cfg.status.nextSlide);
		}, false);
		cfg.status.prevPage.addEventListener('click', function (event) {
			_this.prev(event, cfg.status.prevSlide);
		}, false);
	};
	// show or hide the previous and next buttons
	this.update = function () {
		var root = this.root, parent = this.parent, cfg = root.cfg;
		// calculate the current position
		cfg.scrollPosition = (cfg.status.slideUl.style.marginLeft) ? parseInt(cfg.status.slideUl.style.marginLeft, 10) : 0;
		cfg.scrollDistance = cfg.status.slideDiv.offsetWidth;
		// calculate the minimum position
		cfg.scrollMin = 0;
		// calculate the maximum position
		var lastThumbnail = cfg.status.thumbnails[cfg.status.thumbnails.length - 1];
		cfg.scrollStep = lastThumbnail.offsetWidth;
		cfg.scrollMax = -1 * (lastThumbnail.offsetLeft + lastThumbnail.offsetWidth) + cfg.scrollDistance;
		// show or hide the prev button
		cfg.status.prevPage.className = cfg.status.prevPage.className.replace(/ disabled/gi, '');
		cfg.status.prevPage.className += (cfg.scrollPosition >= cfg.scrollMin) ? ' disabled' : '';
		// show or hide the next button
		cfg.status.nextPage.className = cfg.status.nextPage.className.replace(/ disabled/gi, '');
		cfg.status.nextPage.className += (cfg.scrollPosition <= cfg.scrollMax && cfg.scrollMax < 0) ? ' disabled' : '';
	};
	// show the next page of thumbnails
	this.next = function (event, node) {
		var root = this.root, parent = this.parent, cfg = root.cfg;
		// get the event properties
		event = event || window.event;
		var target = event.target || event.srcElement;
		// if the button is not disabled
		if (!target.className.match(/disabled/)) {
			// scroll one page's width of thumbnails
			var newPosition = cfg.scrollPosition - cfg.scrollDistance + cfg.scrollStep;
			// limit the scroll distance
			if (newPosition < cfg.scrollMax) {
				newPosition = cfg.scrollMax;
			}
			// transition to the new position
			useful.transitions.byRules(cfg.status.slideUl, {'marginLeft' : newPosition + 'px'});
			// redraw the menu buttons
			this.update();
		}
		// cancel the click
		target.blur();
		event.preventDefault();
	};
	// show the previous page of thumbnails
	this.prev = function (event, node) {
		var root = this.root, parent = this.parent, cfg = root.cfg;
		// get the event properties
		event = event || window.event;
		var target = event.target || event.srcElement;
		// if the button is not disabled
		if (!target.className.match(/disabled/)) {
			// scroll one page's width of thumbnails
			var newPosition = cfg.scrollPosition + cfg.scrollDistance - cfg.scrollStep;
			// limit the scroll distance
			if (newPosition > 0) {
				newPosition = 0;
			}
			// transition to the new position
			useful.transitions.byRules(cfg.status.slideUl, {'marginLeft' : newPosition + 'px'});
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
