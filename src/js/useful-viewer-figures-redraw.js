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
useful.Viewer.prototype.Figures_Redraw = function (parent) {
	// properties
	"use strict";
	this.root = parent.parent;
	this.parent = parent;
	// methods
	this.validate = function () {
		var root = this.root, parent = this.parent, cfg = root.cfg;
		// reset the stored limits
		cfg.status.atMinZoom = false;
		cfg.status.atMaxZoom = false;
		cfg.status.atMinLeaf = false;
		cfg.status.atMaxLeaf = false;
		// check the zoom level
		var minZoom = (cfg.zoom !== 'static') ? (1 / cfg.lens) : 1;
		if (cfg.status.zoom <= minZoom) {
			cfg.status.zoom = minZoom;
			cfg.status.atMinZoom = true;
		}
		if (cfg.status.index <= 1) {
			cfg.status.index = 1;
			cfg.status.atMinLeaf = true;
		}
		if (cfg.status.index >= cfg.status.figures.length) {
			cfg.status.index = cfg.status.figures.length - 1;
			cfg.status.atMaxLeaf = true;
		}
	};
	this.calculate = function () {
		var root = this.root, parent = this.parent, cfg = root.cfg;
		// calculate dimensions for a given zoom level
		this.canvasWidth = cfg.status.canvas.offsetWidth;
		this.canvasHeight = cfg.status.canvas.offsetHeight;
		this.canvasLeft = cfg.status.pos.x - this.canvasWidth / 2;
		this.canvasTop = cfg.status.pos.y - this.canvasHeight / 2;
		this.maxWidth = cfg.widths[cfg.status.index] * (cfg.rights[cfg.status.index] - cfg.lefts[cfg.status.index]);
		this.maxHeight = cfg.heights[cfg.status.index] * (cfg.bottoms[cfg.status.index] - cfg.tops[cfg.status.index]);
		this.figureAspect = this.maxWidth / this.maxHeight;
		this.figureWidth = this.canvasHeight * this.figureAspect * cfg.status.zoom;
		this.figureHeight = this.canvasHeight * cfg.status.zoom;
		this.figureLeft = (cfg.status.pan.x - 0.5) * this.canvasWidth;
		this.figureTop = (cfg.status.pan.y - 0.5) * this.canvasHeight;
		this.overscanLeft = (this.figureWidth - this.canvasWidth) / 2;
		this.overscanTop = (this.figureHeight - this.canvasHeight) / 2;
		this.offsetLeft = this.overscanLeft - this.figureLeft;
		this.offsetTop = this.overscanTop - this.figureTop;
		this.minPanLeft = -this.overscanLeft / this.canvasWidth + 0.5;
		this.maxPanLeft = this.overscanLeft / this.canvasWidth + 0.5;
		this.minPanTop = -this.overscanTop / this.canvasHeight + 0.5;
		this.maxPanTop = this.overscanTop / this.canvasHeight + 0.5;
		this.maxZoom = this.maxHeight / this.canvasHeight;
		// extra dimensions for non static zooms
		if (cfg.zoom !== 'static') {
			this.backgroundWidth = cfg.status.background.offsetWidth;
			this.backgroundHeight = cfg.status.background.offsetHeight;
			this.backgroundLeft = (this.backgroundHeight * this.figureAspect - this.backgroundWidth) / 2;
			this.backgroundTop = 0;
		}
	};
	this.normalise = function () {
		var root = this.root, parent = this.parent, cfg = root.cfg;
		// normalise the figure position
		if (this.figureWidth >= this.maxWidth || this.figureHeight >= this.maxHeight) {
			this.figureWidth = this.maxWidth;
			this.figureHeight = this.maxHeight;
			cfg.status.zoom = this.maxZoom;
			cfg.status.atMaxZoom = true;
		}
		if (this.figureLeft > this.overscanLeft) {
			this.figureLeft = this.overscanLeft;
			cfg.status.pan.x = this.maxPanLeft;
		}
		if (this.figureLeft < -this.overscanLeft) {
			this.figureLeft = -this.overscanLeft;
			cfg.status.pan.x = this.minPanLeft;
		}
		if (this.figureTop > this.overscanTop) {
			this.figureTop = this.overscanTop;
			cfg.status.pan.y = this.maxPanTop;
		}
		if (this.figureTop < -this.overscanTop) {
			this.figureTop = -this.overscanTop;
			cfg.status.pan.y = this.minPanTop;
		}
		if (this.figureHeight < this.canvasHeight) {
			this.figureWidth = this.canvasHeight / this.maxHeight * this.maxWidth;
			this.figureHeight = this.canvasHeight;
			cfg.status.zoom = 1;
			cfg.status.pan.y = 0.5;
		}
		if (this.figureWidth < this.canvasWidth) {
			this.figureLeft = 0;
			cfg.status.pan.x = 0.5;
		}
	};
	this.canvas = function () {
		var root = this.root, parent = this.parent, cfg = root.cfg;
		// figure out the relevant movement
		switch (cfg.zoom) {
		case 'lens' :
			var fraction, extra, range, offset;
			// set the horizontal shift
			fraction = (1 - (cfg.status.pos.x + this.backgroundLeft) / (this.backgroundHeight * this.figureAspect));
			extra = this.canvasWidth / this.figureWidth;
			range = this.maxPanLeft - this.minPanLeft + extra * 2;
			offset = this.minPanLeft - extra;
			cfg.status.pan.x = fraction * range + offset;
			// set the vertical shift
			fraction = (1 - (cfg.status.pos.y + this.backgroundTop) / this.backgroundHeight);
			extra = this.canvasHeight / this.figureHeight;
			range = this.maxPanTop - this.minPanTop + extra * 2;
			offset = this.minPanTop - extra;
			cfg.status.pan.y = fraction * range + offset;
			// set the positions
			cfg.status.canvas.style.left = parseInt(this.canvasLeft, 10) + 'px';
			cfg.status.canvas.style.top = parseInt(this.canvasTop, 10) + 'px';
			break;
		case 'top' :
			cfg.status.canvas.style.left = '0px';
			cfg.status.canvas.style.top = '-' + cfg.status.canvas.offsetHeight + 'px';
			break;
		case 'right' :
			cfg.status.canvas.style.left = cfg.status.canvas.offsetWidth + 'px';
			cfg.status.canvas.style.top = '0px';
			break;
		case 'bottom' :
			cfg.status.canvas.style.left = '0px';
			cfg.status.canvas.style.top = cfg.status.canvas.offsetHeight + 'px';
			break;
		case 'left' :
			cfg.status.canvas.style.left = '-' + cfg.status.canvas.offsetHeight + 'px';
			cfg.status.canvas.style.top = '0px';
			break;
		}
		// show the appropriate cursor
		if (cfg.zoom === 'lens') {
			cfg.status.cover.style.cursor = 'crosshair';
		} else if (cfg.status.zoom > 1 || cfg.spin === 'rotation') {
			cfg.status.cover.style.cursor = 'move';
		} else {
			cfg.status.cover.style.cursor = 'auto';
		}
	};
	this.figures = function () {
		var root = this.root, parent = this.parent, cfg = root.cfg;
		// use CSS3 transforms if allowed
		if (root.cfg.transforms) {
			// calculate the transformation properties
			var x = (cfg.status.pan.x * 100 - 50) / this.figureAspect,
				y = cfg.status.pan.y * 100 - 50,
				z =	cfg.status.zoom;
			// formulate the css rule
			var transformation = 'translate(' + x + '%, ' + y + '%) scale(' + z + ', ' + z + ')';
			// set the transformation styles
			cfg.status.figures[cfg.status.index].style.msTransform = transformation;
			cfg.status.figures[cfg.status.index].style.webkitTransform = transformation;
			cfg.status.figures[cfg.status.index].style.transform = transformation;
		// else use CSS2
		} else {
			// set the zoomed figure dimensions
			cfg.status.figures[cfg.status.index].style.left = (cfg.status.pan.x * 100) + '%';
			cfg.status.figures[cfg.status.index].style.top = (cfg.status.pan.y * 100) + '%';
			cfg.status.figures[cfg.status.index].style.marginLeft = parseInt(this.figureWidth / -2, 10) + 'px';
			cfg.status.figures[cfg.status.index].style.marginTop = parseInt(this.figureHeight / -2, 10) + 'px';
			cfg.status.figures[cfg.status.index].style.width = parseInt(this.figureWidth, 10) + 'px';
			cfg.status.figures[cfg.status.index].style.height = parseInt(this.figureHeight, 10) + 'px';
		}
	};
	this.create = function () {
		var root = this.root, parent = this.parent, cfg = root.cfg;
		// if streaming new tiles is allowed
		if (
			// allow/disallow streaming switch
			cfg.status.stream &&
			// don't stream at the initial zoom in the rotation (the initial images will be of high enough resolution)
			cfg.status.zoom > 1
		) {
			// divide the dimension into tiles
			var horizontalTiles = Math.ceil(this.figureWidth / cfg.grid);
			var verticalTiles = Math.ceil(this.figureHeight / cfg.grid);
			var tileName, tileWidth, tileHeight, tileTop, tileRight, tileBottom, tileLeft,
				tileId = cfg.figures[cfg.status.index],
				tileZoom = cfg.status.zoom.toString().replace('.', 'D'),
				cropLeft = cfg.lefts[cfg.status.index],
				cropTop = cfg.tops[cfg.status.index],
				cropWidth = cfg.rights[cfg.status.index] - cropLeft,
				cropHeight = cfg.bottoms[cfg.status.index] - cropTop;
			// for all columns
			for (var x = 0; x < horizontalTiles; x += 1) {
				// for all rows
				for (var y = 0; y < verticalTiles; y += 1) {
					// formulate the tile name
					tileName = 'fig_' + tileId + '_zoom_' + tileZoom + '_x_' + x + '_y_' + y;
					// if the tile is within the bounds of the canvas
					if (
						(x + 1) * cfg.grid >= this.offsetLeft &&
						(x) * cfg.grid <= this.offsetLeft + this.canvasWidth &&
						(y + 1) * cfg.grid >= this.offsetTop &&
						(y) * cfg.grid <= this.offsetTop + this.canvasHeight
					) {
						// if this tile doesn't exist (naming convention: tiles['fig_1_zoom_1_x_1_y_1'] = {})
						if (!cfg.status.tiles[tileName]) {
							// count the new tile
							cfg.status.count += 1;
							// create a tile at this zoom level
							cfg.status.tiles[tileName] = {
								'object' : document.createElement('img'),
								'figure' : cfg.status.index,
								'zoom' : cfg.status.zoom,
								'x' : x,
								'y' : y,
								'index' : cfg.status.count
							};
							// reveal it onload
							cfg.status.tiles[tileName].object.className = 'tile_hidden';
							this.onTileLoad(cfg.status.tiles[tileName].object);
							// calculate the positions
							tileWidth = cfg.grid;
							tileHeight = cfg.grid;
							tileTop = (y * tileHeight / this.figureHeight);
							tileRight = ((x + 1) * tileWidth / this.figureWidth);
							tileBottom = ((y + 1) * tileHeight / this.figureHeight);
							tileLeft = (x * tileWidth / this.figureWidth);
							// normalise the sizes
							if (tileRight > 1) {
								tileWidth = Math.round((1 - tileLeft) / (tileRight - tileLeft) * tileWidth);
								tileRight = 1;
							}
							if (tileBottom > 1) {
								tileHeight = Math.round((1 - tileTop) / (tileBottom - tileTop) * tileHeight);
								tileBottom = 1;
							}
							// costruct the tile url
							cfg.status.tiles[tileName].object.className = 'tile_hidden';
							cfg.status.tiles[tileName].object.src = cfg.imageslice
								.replace(cfg.regSrc, cfg.figures[cfg.status.index])
								.replace(cfg.regWidth, tileWidth)
								.replace(cfg.regHeight, tileHeight)
								.replace(cfg.regLeft, tileLeft * cropWidth + cropLeft)
								.replace(cfg.regTop, tileTop * cropHeight + cropTop)
								.replace(cfg.regRight, tileRight * cropWidth + cropLeft)
								.replace(cfg.regBottom, tileBottom * cropHeight + cropTop);
							// position it on the grid
							cfg.status.tiles[tileName].object.style.position = 'absolute';
							cfg.status.tiles[tileName].object.style.left = (tileLeft * 100) + '%';
							cfg.status.tiles[tileName].object.style.top = (tileTop * 100) + '%';
							cfg.status.tiles[tileName].object.style.width = (tileWidth / this.figureWidth * 100) + '%';
							cfg.status.tiles[tileName].object.style.height = (tileHeight / this.figureHeight * 100) + '%';
							cfg.status.tiles[tileName].object.style.zIndex = parseInt(cfg.status.zoom * 100, 10);
							// add it to the figure
							cfg.status.figures[cfg.status.index].appendChild(cfg.status.tiles[tileName].object);
						}
					}
				}
			}
		}
	};
	this.display = function () {
		var root = this.root, parent = this.parent, cfg = root.cfg;
		// for all tiles
		var tile = '', checkedTile;
		for (tile in cfg.status.tiles) {
			// validate
			if (cfg.status.tiles.hasOwnProperty(tile)) {
				// get the target tile
				checkedTile = cfg.status.tiles[tile];
				// if this is a surplus tile
				if (cfg.status.tiles[tile].index < cfg.status.count - cfg.cache) {
					// remove it
					cfg.status.tiles[tile].object.parentNode.removeChild(cfg.status.tiles[tile].object);
					delete cfg.status.tiles[tile];
				// if the tile is within the bounds of the canvas
				} else if (
					(checkedTile.x + 1) * cfg.grid >= this.offsetLeft &&
					(checkedTile.x) * cfg.grid <= this.offsetLeft + this.canvasWidth &&
					(checkedTile.y + 1) * cfg.grid >= this.offsetTop &&
					(checkedTile.y) * cfg.grid <= this.offsetTop + this.canvasHeight &&
					checkedTile.zoom <= cfg.status.zoom
				) {
					// display the tile
					checkedTile.object.style.display = 'block';
				// else
				} else {
					// undisplay the tile
					checkedTile.object.style.display = 'none';
				}
			}
		}
	};
	this.spin = function () {
		var root = this.root, parent = this.parent, cfg = root.cfg;
		// decide on the transition effect
		switch (cfg.spin) {
		// in case of a catalogue
		case 'catalogue' :
			// for all figures
			var clipWidth;
			for (var a = 1, b = cfg.status.figures.length; a < b; a += 1) {
				// clear any transition that may be in effect on this figure
				clearTimeout(cfg.status.transitions[a]);
				// measure the slide width
				clipWidth = cfg.status.figures[a].offsetWidth;
				// if this is an active slide
				if (a === cfg.status.index) {
					// if there is a zoom factor, disable the clipping
					if (cfg.status.zoom > 1) {
						cfg.status.figures[a].style.clip = 'rect(auto 10000px auto 0px)';
					}
					// else if the figure wasn't revealed yet
					else if (cfg.status.figures[a].className !== 'figure_leafin') {
						// force the clip's start situation
						cfg.status.figures[a].style.clip = 'rect(auto ' + clipWidth + 'px auto ' + clipWidth + 'px)';
						// apply the figure class
						cfg.status.figures[a].className = 'figure_leafin';
						// apply the figure style
						useful.transitions.byRules(
							cfg.status.figures[a],
							{'clip' : 'rect(auto ' + clipWidth + 'px auto 0px)', 'transform' : 'translate(0%,0%) rotate(0deg)'},
							null,
							600
						);
					}
				}
				// else if this is a passive slide, but not unrevealed yet
				else if (cfg.status.figures[a].className !== 'figure_leafout') {
					// delay its return
					this.onFigureUnreveal(a, clipWidth);
					// apply the figure class
					cfg.status.figures[a].className = 'figure_leafout';
				}
			}
			break;
		// in case of a slideshow
		case 'slideshow' :
			// for all figures
			for (a = 1, b = cfg.status.figures.length; a < b; a += 1) {
				// apply the figure class
				cfg.status.figures[a].className = (a === cfg.status.index) ? 'figure_fadein' : 'figure_fadeout';
				if (cfg.zoom !== 'static') {
					cfg.status.backgrounds[a].className = (a === cfg.status.index) ? 'figure_fadein' : 'figure_fadeout';
				}
			}
			break;
		// for a generic transition
		default :
			// for all figures
			for (a = 1, b = cfg.status.figures.length; a < b; a += 1) {
				// apply the figure class
				cfg.status.figures[a].className = (a === cfg.status.index) ? 'figure_active' : 'figure_passive';
				if (cfg.zoom !== 'static') {
					cfg.status.backgrounds[a].className = (a === cfg.status.index) ? 'figure_active' : 'figure_passive';
				}
			}
		}
	};
	// handlers for the events
	this.onTileLoad = function (element) {
		var root = this.root, parent = this.parent, cfg = root.cfg;
		element.addEventListener('load', function () {
			element.className = 'tile_visible';
		}, false);
	};
	this.onFigureUnreveal = function (a, clipWidth) {
		var root = this.root, parent = this.parent, cfg = root.cfg;
		setTimeout(function () {
			// apply the figure style
			cfg.status.figures[a].style.clip = 'rect(auto ' + clipWidth + 'px auto ' + clipWidth + 'px)';
			cfg.status.figures[a].style.webkitTransform = 'translate(25%,25%) rotate(45deg)';
			cfg.status.figures[a].style.MozTransform = 'translate(25%,25%) rotate(45deg)';
			cfg.status.figures[a].style.msTransform = 'translate(25%,25%) rotate(45deg)';
			cfg.status.figures[a].style.oTransform = 'translate(25%,25%) rotate(45deg)';
			cfg.status.figures[a].style.transform = 'translate(25%,25%) rotate(45deg)';
		}, 750);
	};
};

// return as a require.js module
if (typeof module !== 'undefined') {
	exports = module.exports = useful.Viewer.Figures_Redraw;
}
