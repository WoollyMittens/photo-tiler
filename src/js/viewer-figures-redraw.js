// extend the class
Viewer.prototype.Figures_Redraw = function (parent) {

	// PROPERTIES

	this.parent = parent;
	this.config = parent.config;
	this.context = parent.context;

	// METHODS

	this.validate = function () {
		var context = this.context, parent = this.parent, config = this.config;
		// reset the stored limits
		config.status.atMinZoom = false;
		config.status.atMaxZoom = false;
		config.status.atMinLeaf = false;
		config.status.atMaxLeaf = false;
		// check the zoom level
		var minZoom = (config.zoom !== 'static') ? (1 / config.lens) : 1;
		if (config.status.zoom <= minZoom) {
			config.status.zoom = minZoom;
			config.status.atMinZoom = true;
		}
		if (config.status.index <= 1) {
			config.status.index = 1;
			config.status.atMinLeaf = true;
		}
		if (config.status.index >= config.status.figures.length) {
			config.status.index = config.status.figures.length - 1;
			config.status.atMaxLeaf = true;
		}
	};

	this.calculate = function () {
		var context = this.context, parent = this.parent, config = this.config;
		// calculate dimensions for a given zoom level
		this.canvasWidth = config.status.canvas.offsetWidth;
		this.canvasHeight = config.status.canvas.offsetHeight;
		this.canvasLeft = config.status.pos.x - this.canvasWidth / 2;
		this.canvasTop = config.status.pos.y - this.canvasHeight / 2;
		this.maxWidth = config.widths[config.status.index] * (config.rights[config.status.index] - config.lefts[config.status.index]);
		this.maxHeight = config.heights[config.status.index] * (config.bottoms[config.status.index] - config.tops[config.status.index]);
		this.figureAspect = this.maxWidth / this.maxHeight;
		this.figureWidth = this.canvasHeight * this.figureAspect * config.status.zoom;
		this.figureHeight = this.canvasHeight * config.status.zoom;
		this.figureLeft = (config.status.pan.x - 0.5) * this.canvasWidth;
		this.figureTop = (config.status.pan.y - 0.5) * this.canvasHeight;
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
		if (config.zoom !== 'static') {
			this.backgroundWidth = config.status.background.offsetWidth;
			this.backgroundHeight = config.status.background.offsetHeight;
			this.backgroundLeft = (this.backgroundHeight * this.figureAspect - this.backgroundWidth) / 2;
			this.backgroundTop = 0;
		}
	};

	this.normalise = function () {
		var context = this.context, parent = this.parent, config = this.config;
		// normalise the figure position
		if (this.figureWidth >= this.maxWidth || this.figureHeight >= this.maxHeight) {
			this.figureWidth = this.maxWidth;
			this.figureHeight = this.maxHeight;
			config.status.zoom = this.maxZoom;
			config.status.atMaxZoom = true;
		}
		if (this.figureLeft > this.overscanLeft) {
			this.figureLeft = this.overscanLeft;
			config.status.pan.x = this.maxPanLeft;
		}
		if (this.figureLeft < -this.overscanLeft) {
			this.figureLeft = -this.overscanLeft;
			config.status.pan.x = this.minPanLeft;
		}
		if (this.figureTop > this.overscanTop) {
			this.figureTop = this.overscanTop;
			config.status.pan.y = this.maxPanTop;
		}
		if (this.figureTop < -this.overscanTop) {
			this.figureTop = -this.overscanTop;
			config.status.pan.y = this.minPanTop;
		}
		if (this.figureHeight < this.canvasHeight) {
			this.figureWidth = this.canvasHeight / this.maxHeight * this.maxWidth;
			this.figureHeight = this.canvasHeight;
			config.status.zoom = 1;
			config.status.pan.y = 0.5;
		}
		if (this.figureWidth < this.canvasWidth) {
			this.figureLeft = 0;
			config.status.pan.x = 0.5;
		}
	};

	this.canvas = function () {
		var context = this.context, parent = this.parent, config = this.config;
		// figure out the relevant movement
		switch (config.zoom) {
		case 'lens' :
			var fraction, extra, range, offset;
			// set the horizontal shift
			fraction = (1 - (config.status.pos.x + this.backgroundLeft) / (this.backgroundHeight * this.figureAspect));
			extra = this.canvasWidth / this.figureWidth;
			range = this.maxPanLeft - this.minPanLeft + extra * 2;
			offset = this.minPanLeft - extra;
			config.status.pan.x = fraction * range + offset;
			// set the vertical shift
			fraction = (1 - (config.status.pos.y + this.backgroundTop) / this.backgroundHeight);
			extra = this.canvasHeight / this.figureHeight;
			range = this.maxPanTop - this.minPanTop + extra * 2;
			offset = this.minPanTop - extra;
			config.status.pan.y = fraction * range + offset;
			// set the positions
			config.status.canvas.style.left = parseInt(this.canvasLeft, 10) + 'px';
			config.status.canvas.style.top = parseInt(this.canvasTop, 10) + 'px';
			break;
		case 'top' :
			config.status.canvas.style.left = '0px';
			config.status.canvas.style.top = '-' + config.status.canvas.offsetHeight + 'px';
			break;
		case 'right' :
			config.status.canvas.style.left = config.status.canvas.offsetWidth + 'px';
			config.status.canvas.style.top = '0px';
			break;
		case 'bottom' :
			config.status.canvas.style.left = '0px';
			config.status.canvas.style.top = config.status.canvas.offsetHeight + 'px';
			break;
		case 'left' :
			config.status.canvas.style.left = '-' + config.status.canvas.offsetHeight + 'px';
			config.status.canvas.style.top = '0px';
			break;
		}
		// show the appropriate cursor
		if (config.zoom === 'lens') {
			config.status.cover.style.cursor = 'crosshair';
		} else if (config.status.zoom > 1 || config.spin === 'rotation') {
			config.status.cover.style.cursor = 'move';
		} else {
			config.status.cover.style.cursor = 'auto';
		}
	};

	this.figures = function () {
		var context = this.context, parent = this.parent, config = this.config;
		// use CSS3 transforms if allowed
		if (this.config.transforms) {
			// calculate the transformation properties
			var x = (config.status.pan.x * 100 - 50) / this.figureAspect,
				y = config.status.pan.y * 100 - 50,
				z =	config.status.zoom;
			// formulate the css rule
			var transformation = 'translate(' + x + '%, ' + y + '%) scale(' + z + ', ' + z + ')';
			// set the transformation styles
			config.status.figures[config.status.index].style.msTransform = transformation;
			config.status.figures[config.status.index].style.webkitTransform = transformation;
			config.status.figures[config.status.index].style.transform = transformation;
		// else use CSS2
		} else {
			// set the zoomed figure dimensions
			config.status.figures[config.status.index].style.left = (config.status.pan.x * 100) + '%';
			config.status.figures[config.status.index].style.top = (config.status.pan.y * 100) + '%';
			config.status.figures[config.status.index].style.marginLeft = parseInt(this.figureWidth / -2, 10) + 'px';
			config.status.figures[config.status.index].style.marginTop = parseInt(this.figureHeight / -2, 10) + 'px';
			config.status.figures[config.status.index].style.width = parseInt(this.figureWidth, 10) + 'px';
			config.status.figures[config.status.index].style.height = parseInt(this.figureHeight, 10) + 'px';
		}
	};

	this.create = function () {
		var context = this.context, parent = this.parent, config = this.config;
		// if streaming new tiles is allowed
		if (
			// allow/disallow streaming switch
			config.status.stream &&
			// don't stream at the initial zoom in the rotation (the initial images will be of high enough resolution)
			config.status.zoom > 1
		) {
			// divide the dimension into tiles
			var horizontalTiles = Math.ceil(this.figureWidth / config.grid);
			var verticalTiles = Math.ceil(this.figureHeight / config.grid);
			var tileName, tileWidth, tileHeight, tileTop, tileRight, tileBottom, tileLeft,
				tileId = config.figures[config.status.index],
				tileZoom = config.status.zoom.toString().replace('.', 'D'),
				cropLeft = config.lefts[config.status.index],
				cropTop = config.tops[config.status.index],
				cropWidth = config.rights[config.status.index] - cropLeft,
				cropHeight = config.bottoms[config.status.index] - cropTop;
			// for all columns
			for (var x = 0; x < horizontalTiles; x += 1) {
				// for all rows
				for (var y = 0; y < verticalTiles; y += 1) {
					// formulate the tile name
					tileName = 'fig_' + tileId + '_zoom_' + tileZoom + '_x_' + x + '_y_' + y;
					// if the tile is within the bounds of the canvas
					if (
						(x + 1) * config.grid >= this.offsetLeft &&
						(x) * config.grid <= this.offsetLeft + this.canvasWidth &&
						(y + 1) * config.grid >= this.offsetTop &&
						(y) * config.grid <= this.offsetTop + this.canvasHeight
					) {
						// if this tile doesn't exist (naming convention: tiles['fig_1_zoom_1_x_1_y_1'] = {})
						if (!config.status.tiles[tileName]) {
							// count the new tile
							config.status.count += 1;
							// create a tile at this zoom level
							config.status.tiles[tileName] = {
								'object' : document.createElement('img'),
								'figure' : config.status.index,
								'zoom' : config.status.zoom,
								'x' : x,
								'y' : y,
								'index' : config.status.count
							};
							// reveal it onload
							config.status.tiles[tileName].object.className = 'tile_hidden';
							this.onTileLoad(config.status.tiles[tileName].object);
							// calculate the positions
							tileWidth = config.grid;
							tileHeight = config.grid;
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
							config.status.tiles[tileName].object.className = 'tile_hidden';
							config.status.tiles[tileName].object.src = config.imageslice
								.replace(config.regSrc, config.figures[config.status.index])
								.replace(config.regWidth, tileWidth)
								.replace(config.regHeight, tileHeight)
								.replace(config.regLeft, tileLeft * cropWidth + cropLeft)
								.replace(config.regTop, tileTop * cropHeight + cropTop)
								.replace(config.regRight, tileRight * cropWidth + cropLeft)
								.replace(config.regBottom, tileBottom * cropHeight + cropTop);
							// position it on the grid
							config.status.tiles[tileName].object.style.position = 'absolute';
							config.status.tiles[tileName].object.style.left = (tileLeft * 100) + '%';
							config.status.tiles[tileName].object.style.top = (tileTop * 100) + '%';
							config.status.tiles[tileName].object.style.width = (tileWidth / this.figureWidth * 100) + '%';
							config.status.tiles[tileName].object.style.height = (tileHeight / this.figureHeight * 100) + '%';
							config.status.tiles[tileName].object.style.zIndex = parseInt(config.status.zoom * 100, 10);
							// add it to the figure
							config.status.figures[config.status.index].appendChild(config.status.tiles[tileName].object);
						}
					}
				}
			}
		}
	};

	this.display = function () {
		var context = this.context, parent = this.parent, config = this.config;
		// for all tiles
		var tile = '', checkedTile;
		for (tile in config.status.tiles) {
			// validate
			if (config.status.tiles.hasOwnProperty(tile)) {
				// get the target tile
				checkedTile = config.status.tiles[tile];
				// if this is a surplus tile
				if (config.status.tiles[tile].index < config.status.count - config.cache) {
					// remove it
					config.status.tiles[tile].object.parentNode.removeChild(config.status.tiles[tile].object);
					delete config.status.tiles[tile];
				// if the tile is within the bounds of the canvas
				} else if (
					(checkedTile.x + 1) * config.grid >= this.offsetLeft &&
					(checkedTile.x) * config.grid <= this.offsetLeft + this.canvasWidth &&
					(checkedTile.y + 1) * config.grid >= this.offsetTop &&
					(checkedTile.y) * config.grid <= this.offsetTop + this.canvasHeight &&
					checkedTile.zoom <= config.status.zoom
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
		var context = this.context, parent = this.parent, config = this.config;
		// decide on the transition effect
		switch (config.spin) {
		// in case of a catalogue
		case 'catalogue' :
			// for all figures
			var clipWidth;
			for (var a = 1, b = config.status.figures.length; a < b; a += 1) {
				// clear any transition that may be in effect on this figure
				clearTimeout(config.status.transitions[a]);
				// measure the slide width
				clipWidth = config.status.figures[a].offsetWidth;
				// if this is an active slide
				if (a === config.status.index) {
					// if there is a zoom factor, disable the clipping
					if (config.status.zoom > 1) {
						config.status.figures[a].style.clip = 'rect(auto 10000px auto 0px)';
					}
					// else if the figure wasn't revealed yet
					else if (config.status.figures[a].className !== 'figure_leafin') {
						// force the clip's start situation
						config.status.figures[a].style.clip = 'rect(auto ' + clipWidth + 'px auto ' + clipWidth + 'px)';
						// apply the figure class
						config.status.figures[a].className = 'figure_leafin';
						// apply the figure style
						transitions.byRules(
							config.status.figures[a],
							{'clip' : 'rect(auto ' + clipWidth + 'px auto 0px)', 'transform' : 'translate(0%,0%) rotate(0deg)'},
							null,
							600
						);
					}
				}
				// else if this is a passive slide, but not unrevealed yet
				else if (config.status.figures[a].className !== 'figure_leafout') {
					// delay its return
					this.onFigureUnreveal(a, clipWidth);
					// apply the figure class
					config.status.figures[a].className = 'figure_leafout';
				}
			}
			break;
		// in case of a slideshow
		case 'slideshow' :
			// for all figures
			for (a = 1, b = config.status.figures.length; a < b; a += 1) {
				// apply the figure class
				config.status.figures[a].className = (a === config.status.index) ? 'figure_fadein' : 'figure_fadeout';
				if (config.zoom !== 'static') {
					config.status.backgrounds[a].className = (a === config.status.index) ? 'figure_fadein' : 'figure_fadeout';
				}
			}
			break;
		// for a generic transition
		default :
			// for all figures
			for (a = 1, b = config.status.figures.length; a < b; a += 1) {
				// apply the figure class
				config.status.figures[a].className = (a === config.status.index) ? 'figure_active' : 'figure_passive';
				if (config.zoom !== 'static') {
					config.status.backgrounds[a].className = (a === config.status.index) ? 'figure_active' : 'figure_passive';
				}
			}
		}
	};
	// handlers for the events
	this.onTileLoad = function (element) {
		var context = this.context, parent = this.parent, config = this.config;
		element.addEventListener('load', function () {
			element.className = 'tile_visible';
		}, false);
	};

	this.onFigureUnreveal = function (a, clipWidth) {
		var context = this.context, parent = this.parent, config = this.config;
		setTimeout(function () {
			// apply the figure style
			config.status.figures[a].style.clip = 'rect(auto ' + clipWidth + 'px auto ' + clipWidth + 'px)';
			config.status.figures[a].style.webkitTransform = 'translate(25%,25%) rotate(45deg)';
			config.status.figures[a].style.MozTransform = 'translate(25%,25%) rotate(45deg)';
			config.status.figures[a].style.msTransform = 'translate(25%,25%) rotate(45deg)';
			config.status.figures[a].style.oTransform = 'translate(25%,25%) rotate(45deg)';
			config.status.figures[a].style.transform = 'translate(25%,25%) rotate(45deg)';
		}, 750);
	};
};
