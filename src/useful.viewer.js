/*
	Source:
	van Creij, Maurice (2012). "useful.context.js: A simple tile based image viewer", version 20120606, http://www.woollymittens.nl/.

	License:
	This work is licensed under a Creative Commons Attribution 3.0 Unported License.

	Prerequisites:
	<script src="./js/useful.js"></script>
	<!--[if IE]>
		<script src="./js/html5.js"></script>
		<script src="//ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js"></script>
	<![endif]-->
*/

(function (useful) {

	// invoke strict mode
	"use strict";

	// private functions
	useful.Viewer = function (obj, cfg) {
		// properties
		this.obj = obj;
		this.cfg = cfg;
		// methods
		this.start = function () {
			var context = this;
			// use the fallback to gather the asset urls
			if (!context.cfg.outlets) {
				// create the object to hold all the interface pointers
				context.cfg.outlets = {};
				// get the assets from the fallback html
				context.cfg.thumbnails = [0];
				context.cfg.figures = [0];
				context.cfg.titles = [0];
				context.cfg.descriptions = [0];
				context.cfg.widths = [0];
				context.cfg.heights = [0];
				var allLinks = context.obj.getElementsByTagName('a');
				var allImages = context.obj.getElementsByTagName('img');
				for (var a = 0, b = allLinks.length; a < b; a += 1) {
					// create a list of thumbnail urls and full urls
					context.cfg.thumbnails.push(allImages[a].getAttribute('src'));
					context.cfg.figures.push(context.cfg.urlprefix + allLinks[a].getAttribute('href'));
					context.cfg.titles.push(allImages[a].getAttribute('title'));
					context.cfg.descriptions.push(allImages[a].getAttribute('alt'));
					context.cfg.widths.push(allImages[a].getAttribute('width'));
					context.cfg.heights.push(allImages[a].getAttribute('height'));
				}
				// pick the initial active slide
				context.cfg.outlets.index = 1;
				// pick the initial zoom level
				context.cfg.outlets.zoom = 1;
				// pick the initial pan position
				context.cfg.outlets.pan = { x : 0.5, y : 0.5};
				// pick the initial canvas position
				context.cfg.outlets.pos = { x : 0, y : 0};
			}
			// fix some numbers in the context.cfg
			context.cfg.grid = parseInt(context.cfg.grid, 10);
			context.cfg.cache = parseInt(context.cfg.cache, 10);
			context.cfg.lens = parseFloat(context.cfg.lens);
			context.cfg.magnification = parseFloat(context.cfg.magnification);
			context.cfg.navigation = 'thumbnails';
			context.cfg.divide = (context.cfg.spin === 'rotation') ? 1 : parseInt(context.cfg.divide, 10) / 100;
			context.cfg.retry = null;
			// apply the custom styles
			context.styling(context);
			// if the sizes weren't given
			if (!context.cfg.widths[1]) {
				// request them using AJAX
				useful.request.send({
					url : context.cfg.imagesize + context.cfg.queryprefix + 'src=' + context.cfg.figures.join(',').substr(2),
					post : 'name=value&foo=bar',
					onSuccess : function (reply) { context.load(reply, context); }
				});
			// else
			} else {
				// run the viewer
				context.run(context);
			}
		};
		// implement customised styles
		this.styling = function (context) {
			// create a custom stylesheet
			var style = document.createElement("style");
			if (/webkit/gi.test(navigator.UserAgent)) { style.appendChild(document.createTextNode("")); }
			document.body.appendChild(style);
			var sheet = style.sheet || style.styleSheet;
			// add the custom styles
			if (sheet.insertRule) {
				sheet.insertRule(".viewer button {background-color : " + context.cfg.colorPassive + " !important;}", 0);
				sheet.insertRule(".viewer button:hover {background-color : " + context.cfg.colorHover + " !important;}", 0);
				sheet.insertRule(".viewer button.disabled {background-color : " + context.cfg.colorDisabled + " !important;}", 0);
				sheet.insertRule(".viewer .thumbnails_active {background-color : " + context.cfg.colorPassive + " !important;}", 0);
				sheet.insertRule(".viewer menu.slider {background-color : " + context.cfg.colorPassive + " !important;}", 0);
				sheet.insertRule(".viewer menu.slider meter div {background-color : " + context.cfg.colorPassive + " !important;}", 0);
			} else {
				sheet.addRule(".viewer button", "background-color : " + context.cfg.colorPassive + " !important;", 0);
				sheet.addRule(".viewer button:hover", "background-color : " + context.cfg.colorHover + " !important;", 0);
				sheet.addRule(".viewer button.disabled", "background-color : " + context.cfg.colorDisabled + " !important;", 0);
				sheet.addRule(".viewer .thumbnails_active", "background-color : " + context.cfg.colorPassive + " !important;", 0);
				sheet.addRule(".viewer menu.slider", "background-color : " + context.cfg.colorPassive + " !important;", 0);
				sheet.addRule(".viewer menu.slider meter div", "background-color : " + context.cfg.colorPassive + " !important;", 0);
			}
		};
		// run the slideshow
		this.run = function (context) {
			// hide the component
			context.obj.style.visibility = 'hidden';
			setTimeout(function () {
				// start the components
				context.setup(context);
				// start the redraw
				setTimeout(function () {
					// draw the component
					context.update(context);
					// reveal the component
					context.obj.style.visibility = 'visible';
				}, 400);
			}, 100);
		};
		// import sizes
		this.load = function (reply, context) {
			// process the reply
			var sizes = {};
			sizes = useful.request.decode(reply.responseText);
			context.cfg.widths = [0].concat(sizes.x);
			context.cfg.heights = [0].concat(sizes.y);
			// run the viewer
			context.run(context);
		};
		// build the app html
		this.setup = function (context) {
			// shortcut pointers
			var sip = context.obj;
			// clear the parent node
			sip.innerHTML = '';
			// apply optional dimensions
			if (context.cfg.width) {
				sip.style.width = context.cfg.width + context.cfg.widthUnit;
			}
			if (context.cfg.height) {
				sip.style.height = context.cfg.height + context.cfg.heightUnit;
			}
			// apply any context.cfg classes
			sip.className += ' spin_' + context.cfg.spin;
			// setup the sub components
			context.automatic.setup(context);
			context.figures.setup(context);
			// choose what type of toolbars to setup
			switch (context.cfg.toolbars) {
			// setup the slider toolbars
			case 'sliders' :
				context.zoom.setup(context);
				if (context.cfg.spin === 'rotation') {
					context.spin.setup(context);
				}
				if (context.cfg.spin === 'catalogue') {
					context.leaf.setup(context);
				}
				break;
			// setup the floating buttons
			case 'buttons' :
				context.toolbar.setup(context);
				break;
			// setup the default toolbar
			default :
				context.toolbar.setup(context);
			}
			// setup the thumbnails
			if (context.cfg.spin !== 'rotation') {
				context.thumbnails.setup(context);
			}
		};
		// update the whole app
		this.update = function (context) {
			// if the slideshow has been disabled
			if (context.obj.offsetHeight === 0) {
				// stop updating and try again later
				clearTimeout(context.cfg.retry);
				context.cfg.retry = setTimeout(function () {
					context.update(context);
				}, 1000);
			// else
			} else {
				// update the sub components
				context.figures.update(context);
				// choose what type of toolbars to update
				switch (context.cfg.toolbars) {
				// update the slider toolbars
				case 'sliders' :
					context.zoom.update(context);
					if (context.cfg.spin === 'rotation') {
						context.spin.update(context);
					}
					if (context.cfg.spin === 'catalogue') {
						context.leaf.update(context);
					}
					break;
				// update the floating buttons
				case 'buttons' :
					context.toolbar.update(context);
					break;
				// update the default toolbar
				default :
					context.toolbar.update(context);
				}
				// update the thumbnails
				if (context.cfg.spin !== 'rotation') {
					context.thumbnails.update(context);
				}
			}
		};
		// automatic idle slideshow
		this.automatic = {};
		this.automatic.setup = function () {};
		// manages the main view
		this.figures = {};
		// builds the figure
		this.figures.setup = function (context) {
			// enable the streaming of images
			context.cfg.outlets.stream = true;
			// set up a counter for the amount of images streamed
			context.cfg.outlets.count = 0;
			// create a storage place for the transition timeouts
			context.cfg.outlets.transitions = [];
			// create a wrapper for overflow management
			context.cfg.outlets.wrapper = document.createElement('div');
			context.cfg.outlets.wrapper.className = 'wrapper';
			// force the height of the wrapper if desired
			context.cfg.outlets.wrapper.style.height = (context.cfg.divide * 100) + '%';
			// create a canvas layer to contain the images
			context.cfg.outlets.canvas = document.createElement('div');
			context.cfg.outlets.canvas.className = 'canvas';
			// add the canvas to the parent
			context.cfg.outlets.wrapper.appendChild(context.cfg.outlets.canvas);
			// for all figures in the context.cfg
			context.cfg.outlets.figures = [0];
			var newImage, newWidth, newHeight;
			for (var a = 1, b = context.cfg.figures.length; a < b; a += 1) {
				// calculate the starting dimensions
				newHeight = context.obj.offsetHeight * context.cfg.divide;
				newWidth = newHeight / context.cfg.heights[a] * context.cfg.widths[a];
				// create a new slide
				context.cfg.outlets.figures[a] = document.createElement('figure');
				context.cfg.outlets.figures[a].className = (a === 1) ? 'figure_active' : 'figure_passive';
				context.cfg.outlets.figures[a].style.width = parseInt(newWidth, 10) + 'px';
				context.cfg.outlets.figures[a].style.height = parseInt(newHeight, 10) + 'px';
				context.cfg.outlets.figures[a].style.left = (context.cfg.outlets.pan.x * 100) + '%';
				context.cfg.outlets.figures[a].style.top = (context.cfg.outlets.pan.y * 100) + '%';
				context.cfg.outlets.figures[a].style.marginLeft = parseInt(newWidth / -2, 10) + 'px';
				context.cfg.outlets.figures[a].style.marginTop = parseInt(newHeight / -2, 10) + 'px';
				// add the default image to the slide
				newImage = document.createElement('img');
				// load starting images
				newImage.src = context.cfg.imageslice + context.cfg.queryprefix +
					'src=' + context.cfg.figures[a] +
					'&width=' + parseInt(newWidth, 10) +
					'&height=' + parseInt(newHeight, 10) +
					'&left=0&top=0&right=1&bottom=1';
				// set the image properties
				newImage.style.width = '100%';
				newImage.style.height = '100%';
				newImage.className = 'zoom_0';
				if (context.cfg.descriptions) {
					newImage.setAttribute('alt', context.cfg.descriptions[a]);
				} else {
					newImage.setAttribute('alt', '');
				}
				if (context.cfg.titles) {
					newImage.setAttribute('title', context.cfg.titles[a]);
				} else {
					newImage.setAttribute('title', '');
				}
				context.cfg.outlets.figures[a].appendChild(newImage);
				// insert the new nodes
				context.cfg.outlets.canvas.appendChild(context.cfg.outlets.figures[a]);
			}
			// add a top layer for uninterrupted touch events
			context.cfg.outlets.cover = document.createElement('div');
			context.cfg.outlets.cover.className = 'cover';
			context.cfg.outlets.wrapper.appendChild(context.cfg.outlets.cover);
			// clone the initial figure into a background layer on non-static zooms
			if (context.cfg.zoom !== 'static') {
				// create a background layer to contain all the low res backgrounds
				context.cfg.outlets.background = context.cfg.outlets.canvas.cloneNode(true);
				context.cfg.outlets.background.className = 'background';
				// insert the background into the parent
				context.cfg.outlets.wrapper.insertBefore(context.cfg.outlets.background, context.cfg.outlets.canvas);
				// apply a lens style to the canvas
				context.cfg.outlets.canvas.className += ' canvas_lens canvas_hidden';
				// set a starting zoom factor
				context.cfg.outlets.zoom = 999;
				// set the lens dimensions
				if (context.cfg.zoom === 'lens') {
					var lensSize = context.obj.offsetWidth * context.cfg.lens;
					context.cfg.outlets.canvas.style.width = lensSize + 'px';
					context.cfg.outlets.canvas.style.height = lensSize + 'px';
					if (navigator.userAgent.match(/firefox|webkit/gi)) {
						context.cfg.outlets.canvas.style.borderRadius = '50%';	//(lensSize / 2) + 'px';
					}
				}
				// store the backgrounds
				var backgroundFigures = context.cfg.outlets.background.getElementsByTagName('figure');
				context.cfg.outlets.backgrounds = [];
				for (a = 0 , b = backgroundFigures.length; a < b; a += 1) {
					context.cfg.outlets.backgrounds[a + 1] = backgroundFigures[a];
					context.cfg.outlets.backgrounds[a + 1].style.display = 'block';
					context.cfg.outlets.backgrounds[a + 1].style.position = 'absolute';
				}
			}
			// add the wrapper to the parent
			context.obj.appendChild(context.cfg.outlets.wrapper);
			// add the mouse events for the cover layer
			context.figures.onCoverScroll(context.cfg.outlets.cover, context);
			context.figures.onCoverMouse(context.cfg.outlets.cover, context);
			context.figures.onCoverTouch(context.cfg.outlets.cover, context);
			// add a place to contain the tiles
			context.cfg.outlets.tiles = {};
		};
		// set the mouse wheel events
		this.figures.onCoverScroll = function (cover, context) {
			cover.addEventListener('mousewheel', function (event) {
				context.figures.mouse.wheel(event, context);
			}, false);
			cover.addEventListener('DOMMouseScroll', function (event) {
				context.figures.mouse.wheel(event, context);
			}, false);
		};
		// add the mouse events
		this.figures.onCoverMouse = function (cover, context) {
			// set the right interactions for the zoom mode
			if (context.cfg.zoom !== 'static') {
				cover.addEventListener('mousemove', function (event) {
					context.figures.mouse.mirror(event, context);
				}, false);
			} else {
				cover.addEventListener('mousedown', function (event) {
					context.figures.mouse.start(event, context);
				}, false);
				cover.addEventListener('mousemove', function (event) {
					context.figures.mouse.move(event, context);
				}, false);
				cover.addEventListener('mouseup', function (event) {
					context.figures.mouse.end(event, context);
				}, false);
				cover.addEventListener('mouseout', function (event) {
					context.figures.mouse.end(event, context);
				}, false);
			}
		};
		// add the touch events
		this.figures.onCoverTouch = function (cover, context) {
			// set the right interactions for the zoom mode
			if (context.cfg.zoom !== 'static') {
				cover.addEventListener('move', function (event) {
					context.figures.touch.mirror(event, context);
				}, false);
			} else {
				cover.addEventListener('touchstart', function (event) {
					context.figures.touch.start(event, context);
				}, false);
				cover.addEventListener('touchmove', function (event) {
					context.figures.touch.move(event, context);
				}, false);
				cover.addEventListener('touchend', function (event) {
					context.figures.touch.end(event, context);
				}, false);
			}
		};
		// redraws the figure
		this.figures.update = function (context) {
			// validate the input
			context.figures.redraw.validate(context);
			// calculate the values
			context.figures.redraw.calculate(context);
			// normalise the values
			context.figures.redraw.normalise(context);
			// move the canvas around
			context.figures.redraw.canvas(context);
			// move the figure around
			context.figures.redraw.figures(context);
			// create new tiles
			context.figures.redraw.create(context);
			// display existing tiles
			context.figures.redraw.display(context);
			// spin the correct figure into view
			context.figures.redraw.spin(context);
		};
		this.figures.redraw = {};
		this.figures.redraw.validate = function (context) {
			// reset the stored limits
			context.cfg.outlets.atMinZoom = false;
			context.cfg.outlets.atMaxZoom = false;
			context.cfg.outlets.atMinLeaf = false;
			context.cfg.outlets.atMaxLeaf = false;
			// check the zoom level
			var minZoom = (context.cfg.zoom !== 'static') ? (1 / context.cfg.lens) : 1;
			if (context.cfg.outlets.zoom <= minZoom) {
				context.cfg.outlets.zoom = minZoom;
				context.cfg.outlets.atMinZoom = true;
			}
			if (context.cfg.outlets.index <= 1) {
				context.cfg.outlets.index = 1;
				context.cfg.outlets.atMinLeaf = true;
			}
			if (context.cfg.outlets.index >= context.cfg.outlets.figures.length) {
				context.cfg.outlets.index = context.cfg.outlets.figures.length - 1;
				context.cfg.outlets.atMaxLeaf = true;
			}
		};
		this.figures.redraw.calculate = function (context) {
			// shortcut pointer
			var vfr = context.figures.redraw;
			// calculate dimensions for a given zoom level
			vfr.canvasWidth = context.cfg.outlets.canvas.offsetWidth;
			vfr.canvasHeight = context.cfg.outlets.canvas.offsetHeight;
			vfr.canvasLeft = context.cfg.outlets.pos.x - vfr.canvasWidth / 2;
			vfr.canvasTop = context.cfg.outlets.pos.y - vfr.canvasHeight / 2;
			vfr.maxWidth = context.cfg.widths[context.cfg.outlets.index];
			vfr.maxHeight = context.cfg.heights[context.cfg.outlets.index];
			vfr.figureAspect = vfr.maxWidth / vfr.maxHeight;
			vfr.figureWidth = vfr.canvasHeight * vfr.figureAspect * context.cfg.outlets.zoom;
			vfr.figureHeight = vfr.canvasHeight * context.cfg.outlets.zoom;
			vfr.figureLeft = (context.cfg.outlets.pan.x - 0.5) * vfr.canvasWidth;
			vfr.figureTop = (context.cfg.outlets.pan.y - 0.5) * vfr.canvasHeight;
			vfr.overscanLeft = (vfr.figureWidth - vfr.canvasWidth) / 2;
			vfr.overscanTop = (vfr.figureHeight - vfr.canvasHeight) / 2;
			vfr.offsetLeft = vfr.overscanLeft - vfr.figureLeft;
			vfr.offsetTop = vfr.overscanTop - vfr.figureTop;
			vfr.minPanLeft = -vfr.overscanLeft / vfr.canvasWidth + 0.5;
			vfr.maxPanLeft = vfr.overscanLeft / vfr.canvasWidth + 0.5;
			vfr.minPanTop = -vfr.overscanTop / vfr.canvasHeight + 0.5;
			vfr.maxPanTop = vfr.overscanTop / vfr.canvasHeight + 0.5;
			vfr.maxZoom = vfr.maxHeight / vfr.canvasHeight;
			// extra dimensions for non static zooms
			if (context.cfg.zoom !== 'static') {
				vfr.backgroundWidth = context.cfg.outlets.background.offsetWidth;
				vfr.backgroundHeight = context.cfg.outlets.background.offsetHeight;
				vfr.backgroundLeft = (vfr.backgroundHeight * vfr.figureAspect - vfr.backgroundWidth) / 2;
				vfr.backgroundTop = 0;
			}
		};
		this.figures.redraw.normalise = function (context) {
			// shortcut pointer
			var vfr = context.figures.redraw;
			// normalise the canvas position

			// normalise the figure position
			if (vfr.figureWidth >= vfr.maxWidth || vfr.figureHeight >= vfr.maxHeight) {
				vfr.figureWidth = vfr.maxWidth;
				vfr.figureHeight = vfr.maxHeight;
				context.cfg.outlets.zoom = vfr.maxZoom;
				context.cfg.outlets.atMaxZoom = true;
			}
			if (vfr.figureLeft > vfr.overscanLeft) {
				vfr.figureLeft = vfr.overscanLeft;
				context.cfg.outlets.pan.x = vfr.maxPanLeft;
			}
			if (vfr.figureLeft < -vfr.overscanLeft) {
				vfr.figureLeft = -vfr.overscanLeft;
				context.cfg.outlets.pan.x = vfr.minPanLeft;
			}
			if (vfr.figureTop > vfr.overscanTop) {
				vfr.figureTop = vfr.overscanTop;
				context.cfg.outlets.pan.y = vfr.maxPanTop;
			}
			if (vfr.figureTop < -vfr.overscanTop) {
				vfr.figureTop = -vfr.overscanTop;
				context.cfg.outlets.pan.y = vfr.minPanTop;
			}
			if (vfr.figureHeight < vfr.canvasHeight) {
				vfr.figureWidth = vfr.canvasHeight / vfr.maxHeight * vfr.maxWidth;
				vfr.figureHeight = vfr.canvasHeight;
				context.cfg.outlets.zoom = 1;
				context.cfg.outlets.pan.y = 0.5;
			}
			if (vfr.figureWidth < vfr.canvasWidth) {
				vfr.figureLeft = 0;
				context.cfg.outlets.pan.x = 0.5;
			}
		};
		this.figures.redraw.canvas = function (context) {
			// shortcut pointer
			var vfr = context.figures.redraw;
			// figure out the relevant movement
			switch (context.cfg.zoom) {
			case 'lens' :
				var fraction, extra, range, offset;
				// set the horizontal shift
				fraction = (1 - (context.cfg.outlets.pos.x + vfr.backgroundLeft) / (vfr.backgroundHeight * vfr.figureAspect));
				extra = vfr.canvasWidth / vfr.figureWidth;
				range = vfr.maxPanLeft - vfr.minPanLeft + extra * 2;
				offset = vfr.minPanLeft - extra;
				context.cfg.outlets.pan.x = fraction * range + offset;
				// set the vertical shift
				fraction = (1 - (context.cfg.outlets.pos.y + vfr.backgroundTop) / vfr.backgroundHeight);
				extra = vfr.canvasHeight / vfr.figureHeight;
				range = vfr.maxPanTop - vfr.minPanTop + extra * 2;
				offset = vfr.minPanTop - extra;
				context.cfg.outlets.pan.y = fraction * range + offset;
				// set the positions
				context.cfg.outlets.canvas.style.left = parseInt(vfr.canvasLeft, 10) + 'px';
				context.cfg.outlets.canvas.style.top = parseInt(vfr.canvasTop, 10) + 'px';
				break;
			case 'top' :
				context.cfg.outlets.canvas.style.left = '0px';
				context.cfg.outlets.canvas.style.top = '-' + context.cfg.outlets.canvas.offsetHeight + 'px';
				break;
			case 'right' :
				context.cfg.outlets.canvas.style.left = context.cfg.outlets.canvas.offsetWidth + 'px';
				context.cfg.outlets.canvas.style.top = '0px';
				break;
			case 'bottom' :
				context.cfg.outlets.canvas.style.left = '0px';
				context.cfg.outlets.canvas.style.top = context.cfg.outlets.canvas.offsetHeight + 'px';
				break;
			case 'left' :
				context.cfg.outlets.canvas.style.left = '-' + context.cfg.outlets.canvas.offsetHeight + 'px';
				context.cfg.outlets.canvas.style.top = '0px';
				break;
			}
			// show the appropriate cursor
			if (context.cfg.zoom === 'lens') {
				context.cfg.outlets.cover.style.cursor = 'crosshair';
			} else if (context.cfg.outlets.zoom > 1 || context.cfg.spin === 'rotation') {
				context.cfg.outlets.cover.style.cursor = 'move';
			} else {
				context.cfg.outlets.cover.style.cursor = 'auto';
			}
		};
		this.figures.redraw.figures = function (context) {
			// shortcut pointer
			var vfr = context.figures.redraw;
			// set the zoomed figure dimensions
			context.cfg.outlets.figures[context.cfg.outlets.index].style.left = (context.cfg.outlets.pan.x * 100) + '%';
			context.cfg.outlets.figures[context.cfg.outlets.index].style.top = (context.cfg.outlets.pan.y * 100) + '%';
			context.cfg.outlets.figures[context.cfg.outlets.index].style.marginLeft = parseInt(vfr.figureWidth / -2, 10) + 'px';
			context.cfg.outlets.figures[context.cfg.outlets.index].style.marginTop = parseInt(vfr.figureHeight / -2, 10) + 'px';
			context.cfg.outlets.figures[context.cfg.outlets.index].style.width = parseInt(vfr.figureWidth, 10) + 'px';
			context.cfg.outlets.figures[context.cfg.outlets.index].style.height = parseInt(vfr.figureHeight, 10) + 'px';
		};
		this.figures.redraw.create = function (context) {
			// shortcut pointer
			var vfr = context.figures.redraw;
			// if streaming new tiles is allowed
			if (
				// allow/disallow streaming switch
				context.cfg.outlets.stream &&
				// don't stream at the initial zoom in the rotation (the initial images will be of high enough resolution)
				context.cfg.outlets.zoom > 1
			) {
				// divide the dimension into tiles
				var horizontalTiles = Math.ceil(vfr.figureWidth / context.cfg.grid);
				var verticalTiles = Math.ceil(vfr.figureHeight / context.cfg.grid);
				var tileName, tileWidth, tileHeight, tileTop, tileRight, tileBottom, tileLeft,
					tileId = context.cfg.figures[context.cfg.outlets.index],	//.split('src=')[1].split('&')[0].replace(/\//gi, ''),
					tileZoom = context.cfg.outlets.zoom.toString().replace('.', 'D');
				// for all columns
				for (var x = 0; x < horizontalTiles; x += 1) {
					// for all rows
					for (var y = 0; y < verticalTiles; y += 1) {
						// formulate the tile name
						tileName = 'fig_' + tileId + '_zoom_' + tileZoom + '_x_' + x + '_y_' + y;
						// if the tile is within the bounds of the canvas
						if (
							(x + 1) * context.cfg.grid >= vfr.offsetLeft &&
							(x) * context.cfg.grid <= vfr.offsetLeft + vfr.canvasWidth &&
							(y + 1) * context.cfg.grid >= vfr.offsetTop &&
							(y) * context.cfg.grid <= vfr.offsetTop + vfr.canvasHeight
						) {
							// if this tile doesn't exist (naming convention: tiles['fig_1_zoom_1_x_1_y_1'] = {})
							if (!context.cfg.outlets.tiles[tileName]) {
								// count the new tile
								context.cfg.outlets.count += 1;
								// create a tile at this zoom level
								context.cfg.outlets.tiles[tileName] = {
									'object' : document.createElement('img'),
									'figure' : context.cfg.outlets.index,
									'zoom' : context.cfg.outlets.zoom,
									'x' : x,
									'y' : y,
									'index' : context.cfg.outlets.count
								};
								// reveal it onload
								context.cfg.outlets.tiles[tileName].object.className = 'tile_hidden';
								context.figures.redraw.onTileLoad(context.cfg.outlets.tiles[tileName].object, context);
								// calculate the positions
								tileWidth = context.cfg.grid;
								tileHeight = context.cfg.grid;
								tileTop = (y * tileHeight / vfr.figureHeight);
								tileRight = ((x + 1) * tileWidth / vfr.figureWidth);
								tileBottom = ((y + 1) * tileHeight / vfr.figureHeight);
								tileLeft = (x * tileWidth / vfr.figureWidth);
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
								context.cfg.outlets.tiles[tileName].object.className = 'tile_hidden';
								context.cfg.outlets.tiles[tileName].object.src = context.cfg.imageslice + context.cfg.queryprefix +
									'src=' + context.cfg.figures[context.cfg.outlets.index] +
									'&width=' + tileWidth +
									'&height=' + tileHeight +
									'&top=' + tileTop +
									'&right=' + tileRight +
									'&bottom=' + tileBottom +
									'&left=' + tileLeft;
								// position it on the grid
								context.cfg.outlets.tiles[tileName].object.style.position = 'absolute';
								context.cfg.outlets.tiles[tileName].object.style.left = (tileLeft * 100) + '%';
								context.cfg.outlets.tiles[tileName].object.style.top = (tileTop * 100) + '%';
								context.cfg.outlets.tiles[tileName].object.style.width = (tileWidth / vfr.figureWidth * 100) + '%';
								context.cfg.outlets.tiles[tileName].object.style.height = (tileHeight / vfr.figureHeight * 100) + '%';
								context.cfg.outlets.tiles[tileName].object.style.zIndex = parseInt(context.cfg.outlets.zoom * 100, 10);
								// add it to the figure
								context.cfg.outlets.figures[context.cfg.outlets.index].appendChild(context.cfg.outlets.tiles[tileName].object);
							}
						}
					}
				}
			}
		};
		this.figures.redraw.display = function (context) {
			// shortcut pointer
			var vfr = context.figures.redraw;
			// for all tiles
			var tile = '', checkedTile;
			for (tile in context.cfg.outlets.tiles) {
				// validate
				if (context.cfg.outlets.tiles.hasOwnProperty(tile)) {
					// get the target tile
					checkedTile = context.cfg.outlets.tiles[tile];
					// if this is a surplus tile
					if (context.cfg.outlets.tiles[tile].index < context.cfg.outlets.count - context.cfg.cache) {
						// remove it
						context.cfg.outlets.tiles[tile].object.parentNode.removeChild(context.cfg.outlets.tiles[tile].object);
						delete context.cfg.outlets.tiles[tile];
					// if the tile is within the bounds of the canvas
					} else if (
						(checkedTile.x + 1) * context.cfg.grid >= vfr.offsetLeft &&
						(checkedTile.x) * context.cfg.grid <= vfr.offsetLeft + vfr.canvasWidth &&
						(checkedTile.y + 1) * context.cfg.grid >= vfr.offsetTop &&
						(checkedTile.y) * context.cfg.grid <= vfr.offsetTop + vfr.canvasHeight &&
						checkedTile.zoom <= context.cfg.outlets.zoom
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
		this.figures.redraw.spin = function (context) {
			// decide on the transition effect
			switch (context.cfg.spin) {
			// in case of a catalogue
			case 'catalogue' :
				// for all figures
				var clipWidth;
				for (var a = 1, b = context.cfg.outlets.figures.length; a < b; a += 1) {
					// clear any transition that may be in effect on this figure
					clearTimeout(context.cfg.outlets.transitions[a]);
					// measure the slide width
					clipWidth = context.cfg.outlets.figures[a].offsetWidth;
					// if this is an active slide
					if (a === context.cfg.outlets.index) {
						// if there is a zoom factor, disable the clipping
						if (context.cfg.outlets.zoom > 1) {
							context.cfg.outlets.figures[a].style.clip = 'rect(auto 10000px auto 0px)';
						}
						// else if the figure wasn't revealed yet
						else if (context.cfg.outlets.figures[a].className !== 'figure_leafin') {
							// force the clip's start situation
							context.cfg.outlets.figures[a].style.clip = 'rect(auto ' + clipWidth + 'px auto ' + clipWidth + 'px)';
							// apply the figure class
							context.cfg.outlets.figures[a].className = 'figure_leafin';
							// apply the figure style
							useful.transitions.byRules(
								context.cfg.outlets.figures[a],
								{'clip' : 'rect(auto ' + clipWidth + 'px auto 0px)', 'transform' : 'translate(0%,0%) rotate(0deg)'},
								null,
								600
							);
						}
					}
					// else if this is a passive slide, but not unrevealed yet
					else if (context.cfg.outlets.figures[a].className !== 'figure_leafout') {
						// delay its return
						context.figures.redraw.onFigureUnreveal(context.cfg, a, clipWidth);
						// apply the figure class
						context.cfg.outlets.figures[a].className = 'figure_leafout';
					}
				}
				break;
			// in case of a slideshow
			case 'slideshow' :
				// for all figures
				for (a = 1 , b = context.cfg.outlets.figures.length; a < b; a += 1) {
					// apply the figure class
					context.cfg.outlets.figures[a].className = (a === context.cfg.outlets.index) ? 'figure_fadein' : 'figure_fadeout';
					if (context.cfg.zoom !== 'static') {
						context.cfg.outlets.backgrounds[a].className = (a === context.cfg.outlets.index) ? 'figure_fadein' : 'figure_fadeout';
					}
				}
				break;
			// for a generic transition
			default :
				// for all figures
				for (a = 1 , b = context.cfg.outlets.figures.length; a < b; a += 1) {
					// apply the figure class
					context.cfg.outlets.figures[a].className = (a === context.cfg.outlets.index) ? 'figure_active' : 'figure_passive';
					if (context.cfg.zoom !== 'static') {
						context.cfg.outlets.backgrounds[a].className = (a === context.cfg.outlets.index) ? 'figure_active' : 'figure_passive';
					}
				}
			}
		};
		// handlers for the events
		this.figures.redraw.onTileLoad = function (element) {
			element.addEventListener('load', function () {
				element.className = 'tile_visible';
			}, false);
		};
		this.figures.redraw.onFigureUnreveal = function (context, a, clipWidth) {
			setTimeout(function () {
				// apply the figure style
				context.cfg.outlets.figures[a].style.clip = 'rect(auto ' + clipWidth + 'px auto ' + clipWidth + 'px)';
				context.cfg.outlets.figures[a].style.webkitTransform = 'translate(25%,25%) rotate(45deg)';
				context.cfg.outlets.figures[a].style.MozTransform = 'translate(25%,25%) rotate(45deg)';
				context.cfg.outlets.figures[a].style.msTransform = 'translate(25%,25%) rotate(45deg)';
				context.cfg.outlets.figures[a].style.oTransform = 'translate(25%,25%) rotate(45deg)';
				context.cfg.outlets.figures[a].style.transform = 'translate(25%,25%) rotate(45deg)';
			}, 750);
		};
		// mouse controls
		this.figures.mouse = {};
		this.figures.mouse.x = null;
		this.figures.mouse.y = null;
		this.figures.mouse.sensitivity = null;
		this.figures.mouse.treshold = null;
		this.figures.mouse.flick = null;
		this.figures.mouse.delay = null;
		// mouse wheel controls
		this.figures.mouse.wheel = function (event, context) {
			// shortcut pointer
			var uvfm = context.figures.mouse;
			// get the reading from the mouse wheel
			var distance = (window.event) ? window.event.wheelDelta / 120 : -event.detail / 3;
			// do not loop around
			if (distance < 0) {
				// increase the zoom factor
				context.cfg.outlets.zoom = context.cfg.outlets.zoom * context.cfg.magnification;
			} else if (distance > 0) {
				// decrease the zoom factor
				context.cfg.outlets.zoom = context.cfg.outlets.zoom / context.cfg.magnification;
			}
			// temporarily disable streaming for a while to avoid flooding
			context.cfg.outlets.stream = false;
			clearTimeout(uvfm.delay);
			uvfm.delay = setTimeout(function () {
				context.cfg.outlets.stream = true;
				context.update(context);
			}, 500);
			// call for a redraw
			context.update(context);
			// cancel the scrolling
			event.preventDefault();
		};
		// mouse gesture controls
		this.figures.mouse.start = function (event, context) {
			// get the event properties
			event = event || window.event;
			// shortcut pointer
			var uvfm = context.figures.mouse;
			// store the touch positions
			uvfm.x = event.pageX || event.x;
			uvfm.y = event.pageY || event.y;
			// calculate the sensitivity
			uvfm.treshold = context.cfg.outlets.cover.offsetWidth / 10;
			uvfm.flick = context.cfg.outlets.cover.offsetWidth * 0.6;
			// cancel the click
			event.preventDefault();
		};
		this.figures.mouse.move = function (event, context) {
			// get the event properties
			event = event || window.event;
			// shortcut pointer
			var uvfm = context.figures.mouse;
			// if there is a touch in progress
			if (uvfm.x !== null) {
				// store the touch positions
				var x = event.pageX || event.x;
				var y = event.pageY || event.y;
				var xDelta = uvfm.x - x;
				var yDelta = uvfm.y - y;
				// if the image was zoomed in
				if (context.cfg.outlets.zoom > 1) {
					// calculate the drag distance into %
					context.cfg.outlets.pan.x -= xDelta * context.cfg.outlets.zoom / context.cfg.outlets.figures[context.cfg.outlets.index].offsetWidth;
					context.cfg.outlets.pan.y -= yDelta * context.cfg.outlets.zoom / context.cfg.outlets.figures[context.cfg.outlets.index].offsetHeight;
					// reset the distance
					uvfm.x = x;
					uvfm.y = y;
					// order a redraw
					context.update(context);
				// else there was a spin gesture
				} else if (
					(Math.abs(xDelta) > uvfm.treshold && context.cfg.spin === 'rotation') ||
					Math.abs(xDelta) > uvfm.flick
				) {
					// increase the spin
					context.cfg.outlets.index += (xDelta > 0) ? 1 : -1;
					// if in spin mode
					if (context.cfg.spin === 'rotation') {
						// loop the value if needed
						if (context.cfg.outlets.index >= context.cfg.outlets.figures.length) {
							context.cfg.outlets.index = 1;
						}
						// loop the value if needed
						if (context.cfg.outlets.index <= 0) {
							context.cfg.outlets.index = context.cfg.outlets.figures.length - 1;
						}
					}
					// reset the distance
					uvfm.x = x;
					uvfm.y = y;
					// order a redraw
					context.update(context);
				}
			}
			// cancel the click
			event.preventDefault();
		};
		this.figures.mouse.end = function (event, context) {
			// get the event properties
			event = event || window.event;
			// shortcut pointer
			var uvfm = context.figures.mouse;
			// if there was a motion
			if (uvfm.x !== null) {
				// order a redraw
				context.update(context);
			}
			// clear the positions
			uvfm.x = null;
			uvfm.y = null;
			// cancel the click
			event.preventDefault();
		};
		this.figures.mouse.mirror = function (event, context) {
			// retrieve the mouse position
			var pos = useful.positions.cursor(event, context.cfg.outlets.cover);
			// measure the exact location of the interaction
			context.cfg.outlets.pos.x = pos.x;
			context.cfg.outlets.pos.y = pos.y;
			// order a redraw
			context.update(context);
			// cancel the scrolling
			event.preventDefault();
		};
		// touch screen controls
		this.figures.touch = {};
		this.figures.touch.x = null;
		this.figures.touch.y = null;
		this.figures.touch.sensitivity = null;
		this.figures.touch.treshold = null;
		this.figures.touch.flick = null;
		this.figures.touch.delay = null;
		this.figures.touch.start = function (event, context) {
			// shortcut pointer
			var uvft = context.figures.touch;
			// store the touch positions
			uvft.x = [];
			uvft.y = [];
			for (var a = 0, b = event.touches.length; a < b; a += 1) {
				uvft.x.push(event.touches[a].pageX);
				uvft.y.push(event.touches[a].pageY);
			}
			// adjust the sensitivity
			uvft.sensitivity = (context.cfg.magnification - 1) / 5 + 1;
			uvft.treshold = context.cfg.outlets.cover.offsetWidth / 10;
			uvft.flick = context.cfg.outlets.cover.offsetWidth * 0.6;
		};
		this.figures.touch.move = function (event, context) {
			// get the event properties
			event = event || window.event;
			var target = event.target || event.srcElement;
			// shortcut pointer
			var uvft = context.figures.touch;
			// if there is a touch in progress
			if (uvft.x !== null) {
				// store the touch positions
				var x = [];
				var y = [];
				for (var a = 0, b = event.touches.length; a < b; a += 1) {
					x.push(event.touches[a].pageX);
					y.push(event.touches[a].pageY);
				}
				var xDelta = uvft.x[0] - x[0];
				var yDelta = uvft.y[0] - y[0];
				// if there was a pinch motion
				if (x.length > 1 && uvft.x.length > 1) {
					// if the distances decreased
					if (
						Math.abs(x[0] - x[1]) + Math.abs(y[0] - y[1]) <
						Math.abs(uvft.x[0] - uvft.x[1]) + Math.abs(uvft.y[0] - uvft.y[1])
					) {
						// zoom out
						context.cfg.outlets.zoom = context.cfg.outlets.zoom / uvft.sensitivity;
					// else
					} else {
						// zoom in
						context.cfg.outlets.zoom = context.cfg.outlets.zoom * uvft.sensitivity;
					}
					// reset the distance
					uvft.x[0] = x[0];
					uvft.y[0] = y[0];
					uvft.x[1] = x[1];
					uvft.y[1] = y[1];
					// temporarily disable streaming for a while to avoid flooding
					context.cfg.outlets.stream = false;
					clearTimeout(uvft.delay);
					uvft.delay = setTimeout(function () {
						context.cfg.outlets.stream = true;
						context.update(context);
					}, 500);
				// else if there was a drag motion
				} else if (context.cfg.outlets.zoom > 1 || context.cfg.spin === 'slideshow') {
					// calculate the drag distance into %
					context.cfg.outlets.pan.x -= xDelta * context.cfg.outlets.zoom / context.cfg.outlets.figures[context.cfg.outlets.index].offsetWidth;
					context.cfg.outlets.pan.y -= yDelta * context.cfg.outlets.zoom / context.cfg.outlets.figures[context.cfg.outlets.index].offsetHeight;
					// reset the distance
					uvft.x[0] = x[0];
					uvft.y[0] = y[0];
				// else there was a spin gesture
				} else if (
					(Math.abs(xDelta) > uvft.treshold && context.cfg.spin === 'rotation') ||
					Math.abs(xDelta) > uvft.flick
				) {
					// increase the spin
					context.cfg.outlets.index += (xDelta > 0) ? 1 : -1;
					// if in spin mode
					if (context.cfg.spin === 'rotation') {
						// loop the value if needed
						if (context.cfg.outlets.index >= context.cfg.outlets.figures.length) {
							context.cfg.outlets.index = 1;
						}
						// loop the value if needed
						if (context.cfg.outlets.index <= 0) {
							context.cfg.outlets.index = context.cfg.outlets.figures.length - 1;
						}
					}
					// reset the distance
					uvft.x[0] = x[0];
					uvft.y[0] = y[0];
					// order a redraw
					context.update(context);
				}
				// order a redraw
				context.update(context);
			}
			// cancel the click
			target.blur();
			event.preventDefault();
		};
		this.figures.touch.end = function (event, context) {
			// shortcut pointer
			var uvft = context.figures.touch;
			// clear the positions
			uvft.x = null;
			uvft.y = null;
			// order a redraw
			context.update(context);
		};
		this.figures.touch.mirror = function (event, context) {
			// retrieve the touch position
			var pos = useful.positions.touch(event, context.cfg.outlets.cover);
			// measure the exact location of the interaction
			context.cfg.outlets.pos.x = pos.x;
			context.cfg.outlets.pos.y = pos.y;
			// order a redraw
			context.update(context);
			// cancel the scrolling
			event.preventDefault();
		};
		// zoom slider
		this.zoom = {};
		this.zoom.setup = function (context) {
			// create the menu
			context.cfg.outlets.menus = context.cfg.outlets.menus || {};
			context.cfg.outlets.menus.zoomMenu = document.createElement('menu');
			context.cfg.outlets.menus.zoomMenu.className = 'slider zoom';
			context.cfg.outlets.menus.zoomMenu.style.bottom = ((1 - context.cfg.divide) * 100) + '%';
			// add the slider to the menu
			context.zoom.build.slider(context.cfg.outlets.menus.zoomMenu, context);
			// add a touch cover to the menu
			context.zoom.build.cover(context.cfg.outlets.menus.zoomMenu, context);
			// add the increase button
			context.zoom.build.increaser(context.cfg.outlets.menus.zoomMenu, context);
			// add the decrease button
			context.zoom.build.decreaser(context.cfg.outlets.menus.zoomMenu, context);
			// add the menu to the interface
			context.obj.appendChild(context.cfg.outlets.menus.zoomMenu);
		};
		this.zoom.build = {};
		this.zoom.build.slider = function (parent, context) {
			// add the slider to the menu
			context.cfg.outlets.menus.zoomIndicator = (navigator.userAgent.match(/WebKit/) || true) ? document.createElement('div') : document.createElement('meter');
			context.cfg.outlets.menus.zoomIndicator.className = 'meter';
			context.cfg.outlets.menus.zoomIndicator.setAttribute('min', 1);
			context.cfg.outlets.menus.zoomIndicator.setAttribute('max', context.cfg.heights[context.cfg.outlets.index] / context.cfg.outlets.canvas.offsetHeight);
			context.cfg.outlets.menus.zoomIndicator.setAttribute('value', context.cfg.outlets.zoom);
			context.cfg.outlets.menus.zoomSlider = document.createElement('div');
			context.cfg.outlets.menus.zoomSliderIcon = document.createElement('span');
			context.cfg.outlets.menus.zoomSliderIcon.innerHTML = context.cfg.outlets.zoom;
			context.cfg.outlets.menus.zoomSlider.appendChild(context.cfg.outlets.menus.zoomSliderIcon);
			context.cfg.outlets.menus.zoomIndicator.appendChild(context.cfg.outlets.menus.zoomSlider);
			parent.appendChild(context.cfg.outlets.menus.zoomIndicator);
		};
		this.zoom.build.cover = function (parent, context) {
			// add a touch cover to the menu
			context.cfg.outlets.menus.zoomCover = document.createElement('div');
			context.cfg.outlets.menus.zoomCover.className = 'cover';
			parent.appendChild(context.cfg.outlets.menus.zoomCover);
			// add the event handler
			var simz = context.cfg.outlets.menus.zoomCover;
			simz.addEventListener('mousewheel', function (event) {
				context.zoom.mouse.wheel(event, context);
			}, false);
			simz.addEventListener('DOMMouseScroll', function (event) {
				context.zoom.mouse.wheel(event, context);
			}, false);
			simz.addEventListener('mousedown', function (event) {
				context.zoom.mouse.start(event, context);
			}, false);
			simz.addEventListener('mousemove', function (event) {
				context.zoom.mouse.move(event, context);
			}, false);
			simz.addEventListener('mouseup', function (event) {
				context.zoom.mouse.end(event, context);
			}, false);
			simz.addEventListener('mouseout', function (event) {
				context.zoom.mouse.end(event, context);
			}, false);
			// add the touch events
			simz.addEventListener('touchstart', function (event) {
				context.zoom.touch.start(event, context);
			}, false);
			simz.addEventListener('touchmove', function (event) {
				context.zoom.touch.move(event, context);
			}, false);
			simz.addEventListener('touchend', function (event) {
				context.zoom.touch.end(event, context);
			}, false);
		};
		this.zoom.build.increaser = function (parent, context) {
			// add the increase button
			context.cfg.outlets.menus.zoomIn = document.createElement('button');
			context.cfg.outlets.menus.zoomIn.className = 'increase';
			context.cfg.outlets.menus.zoomInIcon = document.createElement('span');
			context.cfg.outlets.menus.zoomInIcon.innerHTML = 'Zoom in';
			context.cfg.outlets.menus.zoomIn.appendChild(context.cfg.outlets.menus.zoomInIcon);
			parent.appendChild(context.cfg.outlets.menus.zoomIn);
			// add the event handlers
			context.cfg.outlets.menus.zoomIn.addEventListener('mousedown', function (event) {
				// increase the zoom
				context.zoom.increase(event, context);
				// cancel streaming
				context.cfg.outlets.stream = false;
				// repeat
				context.cfg.outlets.menus.zoomInRepeat = setInterval(function () { context.zoom.increase(event, context); }, 300);
			}, false);
			context.cfg.outlets.menus.zoomIn.addEventListener('mouseup', function () {
				// stop repeating
				clearInterval(context.cfg.outlets.menus.zoomInRepeat);
				// allow streaming
				context.cfg.outlets.stream = true;
				// redraw
				context.update(context);
			}, false);
			context.cfg.outlets.menus.zoomIn.addEventListener('click', function (event) {
				// cancel this event
				event.preventDefault();
			}, false);
		};
		this.zoom.build.decreaser = function (parent, context) {
			// add the decrease button
			context.cfg.outlets.menus.zoomOut = document.createElement('button');
			context.cfg.outlets.menus.zoomOut.className = 'decrease';
			context.cfg.outlets.menus.zoomOutIcon = document.createElement('span');
			context.cfg.outlets.menus.zoomOutIcon.innerHTML = 'Zoom out';
			context.cfg.outlets.menus.zoomOut.appendChild(context.cfg.outlets.menus.zoomOutIcon);
			parent.appendChild(context.cfg.outlets.menus.zoomOut);
			context.cfg.outlets.menus.zoomOut.addEventListener('mousedown', function (event) {
				// increase the zoom
				context.zoom.decrease(event, context);
				// cancel streaming
				context.cfg.outlets.stream = false;
				// repeat
				context.cfg.outlets.menus.zoomOutRepeat = setInterval(function () { context.zoom.decrease(event, context); }, 300);
			}, false);
			context.cfg.outlets.menus.zoomOut.addEventListener('mouseup', function () {
				// stop repeating
				clearInterval(context.cfg.outlets.menus.zoomOutRepeat);
				// allow streaming
				context.cfg.outlets.stream = true;
				// redraw
				context.update(context);
			}, false);
			context.cfg.outlets.menus.zoomOut.addEventListener('click', function (event) {
				// cancel this event
				event.preventDefault();
			}, false);
		};
		this.zoom.update = function (context) {
			// gather the constants
			var minZoom = 1,
				maxZoom = context.cfg.heights[context.cfg.outlets.index] / context.cfg.outlets.canvas.offsetHeight,
				curZoom = context.cfg.outlets.zoom;
			// update the value
			context.cfg.outlets.menus.zoomIndicator.setAttribute('value', curZoom);
			context.cfg.outlets.menus.zoomSliderIcon.innerHTML = curZoom;
			// reposition the slider
			context.cfg.outlets.menus.zoomSlider.style.top = (100 - (curZoom - minZoom) / (maxZoom - minZoom) * 100) + '%';
		};
		this.zoom.increase = function (event, context) {
			// increase the zoom factor
			context.cfg.outlets.zoom = context.cfg.outlets.zoom * context.cfg.magnification;
			// order a redraw
			context.update(context);
			// cancel the click
			event.preventDefault();
		};
		this.zoom.decrease = function (event, context) {
			// decrease the zoom factor
			context.cfg.outlets.zoom = context.cfg.outlets.zoom / context.cfg.magnification;
			// order a redraw
			context.update(context);
			// cancel the click
			event.preventDefault();
		};
		// mouse controls
		this.zoom.mouse = {};
		this.zoom.mouse.y = null;
		this.zoom.mouse.distance = null;
		this.zoom.mouse.sensitivity = null;
		this.zoom.mouse.fudge = 1.1;
		// mouse wheel controls
		this.zoom.mouse.wheel = function (event, context) {
			// get the reading from the mouse wheel
			var distance = (window.event) ? window.event.wheelDelta / 120 : -event.detail / 3;
			// do not loop around
			if (distance < 0) {
				// increase the zoom factor
				context.cfg.outlets.zoom = context.cfg.outlets.zoom * context.cfg.magnification;
			} else if (distance > 0) {
				// decrease the zoom factor
				context.cfg.outlets.zoom = context.cfg.outlets.zoom / context.cfg.magnification;
			}
			// call for a redraw
			context.update(context);
			// cancel the scrolling
			event.preventDefault();
		};
		// mouse gesture controls
		this.zoom.mouse.start = function (event, context) {
			// get the event properties
			event = event || window.event;
			// shortcut pointer
			var uvzm = context.zoom.mouse;
			// store the touch positions
			uvzm.y = event.pageY || event.y;
			uvzm.distance = context.cfg.outlets.menus.zoomCover.offsetHeight - context.cfg.outlets.menus.zoomIn.offsetHeight - context.cfg.outlets.menus.zoomOut.offsetHeight;
			uvzm.sensitivity = context.cfg.heights[context.cfg.outlets.index] / context.cfg.outlets.canvas.offsetHeight - 1;
			// cancel the click
			event.preventDefault();
		};
		this.zoom.mouse.move = function (event, context) {
			// get the event properties
			event = event || window.event;
			// shortcut pointer
			var uvzm = context.zoom.mouse;
			// if there is a touch in progress
			if (uvzm.y !== null) {
				// store the touch positions
				var y = event.pageY || event.y;
				// calculate the drag distance into %
				context.cfg.outlets.zoom += (uvzm.y - y) / uvzm.distance * uvzm.sensitivity * uvzm.fudge;
				// reset the distance
				uvzm.y = y;
				// disable streaming new images
				context.cfg.outlets.stream = false;
				// order a redraw
				context.update(context);
			}
			// cancel the click
			event.preventDefault();
		};
		this.zoom.mouse.end = function (event, context) {
			// get the event properties
			event = event || window.event;
			// shortcut pointer
			var uvzm = context.zoom.mouse;
			// clear the positions
			uvzm.y = null;
			// enable streaming new images
			context.cfg.outlets.stream = true;
			// order a redraw
			context.update(context);
			// cancel the click
			event.preventDefault();
		};
		// touch screen controls
		this.zoom.touch = {};
		this.zoom.touch.y = null;
		this.zoom.touch.distance = null;
		this.zoom.touch.sensitivity = null;
		this.zoom.touch.fudge = 1.1;
		this.zoom.touch.start = function (event, context) {
			// shortcut pointer
			var uvzt = context.zoom.touch;
			// store the touch positions
			uvzt.y = [];
			for (var a = 0, b = event.touches.length; a < b; a += 1) {
				uvzt.y.push(event.touches[a].pageY);
			}
			// calculate the sensitivity
			uvzt.distance = context.cfg.outlets.menus.zoomCover.offsetHeight - context.cfg.outlets.menus.zoomIn.offsetHeight - context.cfg.outlets.menus.zoomOut.offsetHeight;
			uvzt.sensitivity = context.cfg.heights[context.cfg.outlets.index] / context.cfg.outlets.canvas.offsetHeight - 1;
		};
		this.zoom.touch.move = function (event, context) {
			// get the event properties
			event = event || window.event;
			var target = event.target || event.srcElement;
			// shortcut pointer
			var uvzt = context.zoom.touch;
			// if there is a touch in progress
			if (uvzt.y !== null) {
				// store the touch positions
				var y;
				y = [];
				for (var a = 0, b = event.touches.length; a < b; a += 1) {
					y.push(event.touches[a].pageY);
				}
				// calculate the drag distance into %
				context.cfg.outlets.zoom += (uvzt.y[0] - y[0]) / uvzt.distance * uvzt.sensitivity * uvzt.fudge;
				// reset the distance
				uvzt.y[0] = y[0];
				// disable streaming new images
				context.cfg.outlets.stream = false;
				// order a redraw
				context.update(context);
			}
			// cancel the click
			target.blur();
			event.preventDefault();
		};
		this.zoom.touch.end = function (event, context) {
			// shortcut pointer
			var uvzt = context.zoom.touch;
			// clear the positions
			uvzt.y = null;
			// enable streaming new images
			context.cfg.outlets.stream = true;
			// order a redraw
			context.update(context);
		};
		// spin slider
		this.spin = {};
		this.spin.setup = function (context) {
			// create the menu
			context.cfg.outlets.menus = context.cfg.outlets.menus || {};
			context.cfg.outlets.menus.spinMenu = document.createElement('menu');
			context.cfg.outlets.menus.spinMenu.className = 'slider spin';
			context.cfg.outlets.menus.spinMenu.style.bottom = ((1 - context.cfg.divide) * 100) + '%';
			// add the slider to the menu
			context.spin.build.slider(context.cfg.outlets.menus.spinMenu, context);
			// add a touch cover to the menu
			context.spin.build.cover(context.cfg.outlets.menus.spinMenu, context);
			// add the increase button
			context.spin.build.increaser(context.cfg.outlets.menus.spinMenu, context);
			// add the decrease button
			context.spin.build.decreaser(context.cfg.outlets.menus.spinMenu, context);
			// add the menu to the interface
			context.obj.appendChild(context.cfg.outlets.menus.spinMenu);
		};
		this.spin.build = {};
		this.spin.build.slider = function (parent, context) {
			// add the slider to the menu
			context.cfg.outlets.menus.spinIndicator = (navigator.userAgent.match(/WebKit/) || true) ? document.createElement('div') : document.createElement('meter');
			context.cfg.outlets.menus.spinIndicator.className = 'meter';
			context.cfg.outlets.menus.spinIndicator.setAttribute('min', 1);
			context.cfg.outlets.menus.spinIndicator.setAttribute('max', context.cfg.figures.length);
			context.cfg.outlets.menus.spinIndicator.setAttribute('value', context.cfg.outlets.index);
			context.cfg.outlets.menus.spinSlider = document.createElement('div');
			context.cfg.outlets.menus.spinSliderIcon = document.createElement('span');
			context.cfg.outlets.menus.spinSliderIcon.innerHTML = context.cfg.outlets.index;
			context.cfg.outlets.menus.spinSlider.appendChild(context.cfg.outlets.menus.spinSliderIcon);
			context.cfg.outlets.menus.spinIndicator.appendChild(context.cfg.outlets.menus.spinSlider);
			parent.appendChild(context.cfg.outlets.menus.spinIndicator);
		};
		this.spin.build.cover = function (parent, context) {
			// add a touch cover to the menu
			context.cfg.outlets.menus.spinCover = document.createElement('div');
			context.cfg.outlets.menus.spinCover.className = 'cover';
			parent.appendChild(context.cfg.outlets.menus.spinCover);
			var sims = context.cfg.outlets.menus.spinCover;
			// add the event handler
			sims.addEventListener('mousewheel', function (event) {
				context.spin.mouse.wheel(event, context);
			}, false);
			sims.addEventListener('DOMMouseScroll', function (event) {
				context.spin.mouse.wheel(event, context);
			}, false);
			sims.addEventListener('mousedown', function (event) {
				context.spin.mouse.start(event, context);
			}, false);
			sims.addEventListener('mousemove', function (event) {
				context.spin.mouse.move(event, context);
			}, false);
			sims.addEventListener('mouseup', function (event) {
				context.spin.mouse.end(event, context);
			}, false);
			sims.addEventListener('mouseout', function (event) {
				context.spin.mouse.end(event, context);
			}, false);
			// add the touch events
			sims.addEventListener('touchstart', function (event) {
				context.spin.touch.start(event, context);
			}, false);
			sims.addEventListener('touchmove', function (event) {
				context.spin.touch.move(event, context);
			}, false);
			sims.addEventListener('touchend', function (event) {
				context.spin.touch.end(event, context);
			}, false);
		};
		this.spin.build.increaser = function (parent, context) {
			// add the increase button
			context.cfg.outlets.menus.spinIn = document.createElement('button');
			context.cfg.outlets.menus.spinIn.className = 'increase';
			context.cfg.outlets.menus.spinInIcon = document.createElement('span');
			context.cfg.outlets.menus.spinInIcon.innerHTML = 'Spin left';
			context.cfg.outlets.menus.spinIn.appendChild(context.cfg.outlets.menus.spinInIcon);
			parent.appendChild(context.cfg.outlets.menus.spinIn);
			context.cfg.outlets.menus.spinIn.addEventListener('mousedown', function (event) {
				// increase the zoom
				context.spin.increase(event, context);
				// cancel streaming
				context.cfg.outlets.stream = false;
				// repeat
				context.cfg.outlets.menus.spinInRepeat = setInterval(function () { context.spin.increase(event, context); }, 300);
			}, false);
			context.cfg.outlets.menus.spinIn.addEventListener('mouseup', function () {
				// stop repeating
				clearInterval(context.cfg.outlets.menus.spinInRepeat);
				// allow streaming
				context.cfg.outlets.stream = true;
				// redraw
				context.update(context);
			}, false);
		};
		this.spin.build.decreaser = function (parent, context) {
			// add the decrease button
			context.cfg.outlets.menus.spinOut = document.createElement('button');
			context.cfg.outlets.menus.spinOut.className = 'decrease';
			context.cfg.outlets.menus.spinOutIcon = document.createElement('span');
			context.cfg.outlets.menus.spinOutIcon.innerHTML = 'Spin right';
			context.cfg.outlets.menus.spinOut.appendChild(context.cfg.outlets.menus.spinOutIcon);
			parent.appendChild(context.cfg.outlets.menus.spinOut);
			context.cfg.outlets.menus.spinOut.addEventListener('mousedown', function (event) {
				// increase the zoom
				context.spin.decrease(event, context);
				// cancel streaming
				context.cfg.outlets.stream = false;
				// repeat
				context.cfg.outlets.menus.spinOutRepeat = setInterval(function () { context.spin.decrease(event, context); }, 300);
			}, false);
			context.cfg.outlets.menus.spinOut.addEventListener('mouseup', function () {
				// stop repeating
				clearInterval(context.cfg.outlets.menus.spinOutRepeat);
				// allow streaming
				context.cfg.outlets.stream = true;
				// redraw
				context.update(context);
			}, false);
		};
		this.spin.update = function (context) {
			// reposition the slider
			context.cfg.outlets.menus.spinSlider.style.left = ((context.cfg.outlets.index - 1) / (context.cfg.outlets.figures.length - 2) * 100) + '%';
			// update the value
			context.cfg.outlets.menus.spinIndicator.setAttribute('value', context.cfg.outlets.index);
			context.cfg.outlets.menus.spinSliderIcon.innerHTML = context.cfg.outlets.index;
		};
		this.spin.increase = function (event, context) {
			// decrease the spin index
			context.cfg.outlets.index -= 1;
			// loop the value if needed
			if (context.cfg.outlets.index <= 0) {
				context.cfg.outlets.index = context.cfg.outlets.figures.length - 1;
			}
			// order a redraw
			context.update(context);
			// cancel the click
			event.preventDefault();
		};
		this.spin.decrease = function (event, context) {
			// increase the spin index
			context.cfg.outlets.index += 1;
			// loop the value if needed
			if (context.cfg.outlets.index >= context.cfg.outlets.figures.length) {
				context.cfg.outlets.index = 1;
			}
			// order a redraw
			context.update(context);
			// cancel the click
			event.preventDefault();
		};
		// mouse wheel controls
		this.spin.mouse = {};
		this.spin.mouse.x = null;
		this.spin.mouse.sensitivity = null;
		this.spin.mouse.fudge = 0.7;
		// mouse wheel controls
		this.spin.mouse.wheel = function (event, context) {
			// shortcut pointer
			var uvs = context.spin;
			// get the reading from the mouse wheel
			var distance = (window.event) ? window.event.wheelDelta / 120 : -event.detail / 3;
			// do not loop around
			if (distance < 0) {
				// increase the spin index
				uvs.increase(event, context);
			} else if (distance > 0) {
				// decrease the spin index
				uvs.decrease(event, context);
			}
		};
		// mouse gesture controls
		this.spin.mouse.start = function (event, context) {
			// get the event properties
			event = event || window.event;
			// shortcut pointer
			var uvsm = context.spin.mouse;
			// store the touch positions
			uvsm.x = event.pageX || event.x;
			// calculate the sensitivity
			uvsm.sensitivity = (context.cfg.outlets.menus.spinCover.offsetWidth - context.cfg.outlets.menus.spinIn.offsetWidth - context.cfg.outlets.menus.spinOut.offsetWidth) / context.cfg.outlets.figures.length * uvsm.fudge;
			// cancel the click
			event.preventDefault();
		};
		this.spin.mouse.move = function (event, context) {
			// get the event properties
			event = event || window.event;
			// shortcut pointer
			var uvsm = context.spin.mouse;
			// if there is a touch in progress
			if (uvsm.x !== null) {
				// store the touch positions
				var x = event.pageX || event.x;
				var distance = uvsm.x - x;
				// if the draw was to the left
				if (distance < -uvsm.sensitivity) {
					// increase the spin index
					context.cfg.outlets.index += 1;
					// reset the distance
					uvsm.x = x;
					// order a redraw
					context.update(context);
				// else if the drag was to the right
				} else if (distance > uvsm.sensitivity) {
					// decrease the spin index
					context.cfg.outlets.index -= 1;
					// reset the distance
					uvsm.x = x;
					// order a redraw
					context.update(context);
				}
			}
			// cancel the click
			event.preventDefault();
		};
		this.spin.mouse.end = function (event, context) {
			// get the event properties
			event = event || window.event;
			// shortcut pointer
			var uvsm = context.spin.mouse;
			// clear the positions
			uvsm.x = null;
			// cancel the click
			event.preventDefault();
		};
		// touch screen controls
		this.spin.touch = {};
		this.spin.touch.x = null;
		this.spin.touch.sensitivity = null;
		// mouse gesture controls
		this.spin.touch.start = function (event, context) {
			// get the event properties
			event = event || window.event;
			// shortcut pointer
			var uvst = context.spin.touch;
			// store the touch positions
			uvst.x = [];
			for (var a = 0, b = event.touches.length; a < b; a += 1) {
				uvst.x.push(event.touches[a].pageX);
			}
			// calculate the sensitivity
			uvst.sensitivity = (context.cfg.outlets.menus.spinCover.offsetWidth - context.cfg.outlets.menus.spinIn.offsetWidth - context.cfg.outlets.menus.spinOut.offsetWidth) / context.cfg.outlets.figures.length;
			// cancel the click
			event.preventDefault();
		};
		this.spin.touch.move = function (event, context) {
			// get the event properties
			event = event || window.event;
			// shortcut pointer
			var uvst = context.spin.touch;
			// if there is a touch in progress
			if (uvst.x !== null) {
				// store the touch positions
				var x = [];
				for (var a = 0, b = event.touches.length; a < b; a += 1) {
					x.push(event.touches[a].pageX);
				}
				var distance = uvst.x[0] - x[0];
				// if the draw was to the left
				if (distance < -uvst.sensitivity) {
					// increase the spin index
					context.cfg.outlets.index += 1;
					// loop the value if needed
					if (context.cfg.outlets.index >= context.cfg.outlets.figures.length) {
						context.cfg.outlets.index = 1;
					}
					// reset the distance
					uvst.x[0] = x[0];
					// order a redraw
					context.update(context);
				// else if the drag was to the right
				} else if (distance > uvst.sensitivity) {
					// decrease the spin index
					context.cfg.outlets.index -= 1;
					// loop the value if needed
					if (context.cfg.outlets.index <= 0) {
						context.cfg.outlets.index = context.cfg.outlets.figures.length - 1;
					}
					// reset the distance
					uvst.x[0] = x[0];
					// order a redraw
					context.update(context);
				}
			}
		};
		this.spin.touch.end = function (event, context) {
			// get the event properties
			event = event || window.event;
			// shortcut pointer
			var uvst = context.spin.touch;
			// clear the positions
			uvst.x = null;
			// cancel the click
			event.preventDefault();
		};
		// manages the thumbnails
		this.thumbnails = {};
		// build the thumbnail list
		this.thumbnails.setup = function (context) {
			// create the navigation bar
			context.cfg.outlets.slideNav = document.createElement('nav');
			context.cfg.outlets.slideNav.className = 'thumbnails';
			context.cfg.outlets.slideDiv = document.createElement('div');
			context.cfg.outlets.slideUl = document.createElement('ul');
			// force the height of the nav if desired
			if (context.cfg.divide !== '100%') {
				context.cfg.outlets.slideNav.style.height = (100 - context.cfg.divide * 100 - parseInt(context.cfg.margin, 10)) + '%';
			}
			if (context.cfg.margin) {
				context.cfg.pixelMargin = parseInt(context.obj.offsetWidth * parseInt(context.cfg.margin, 10) / 100, 10);
			}
			// for all thumbnails in the context.cfg
			context.cfg.outlets.thumbnails = [0];
			for (var a = 1; a < context.cfg.thumbnails.length; a += 1) {
				// create a new thumbnail
				var newLi = document.createElement('li');
				var newA = document.createElement('a');
				newA.className = (a === 1) ? context.cfg.navigation + '_active' : context.cfg.navigation + '_passive';
				var newImage = document.createElement('img');
				newImage.alt = '';
				newImage.src = context.cfg.thumbnails[a];
				newA.appendChild(newImage);
				newLi.appendChild(newA);
				// insert the new nodes
				context.cfg.outlets.slideUl.appendChild(newLi);
				// store the dom pointers to the images
				context.cfg.outlets.thumbnails[a] = newA;
			}
			// insert the navigation bar
			context.cfg.outlets.slideDiv.appendChild(context.cfg.outlets.slideUl);
			context.cfg.outlets.slideNav.appendChild(context.cfg.outlets.slideDiv);
			context.obj.appendChild(context.cfg.outlets.slideNav);
			// for all thumbnails in the context.cfg
			for (a = 1; a < context.cfg.thumbnails.length; a += 1) {
				// assign the event handler
				context.thumbnails.onThumbnailClick(context.cfg.outlets.thumbnails[a], context);
			}
			// start the menu
			context.thumbnails.menu.setup(context);
		};
		// event handlers
		this.thumbnails.onThumbnailClick = function (element, context) {
			element.addEventListener('click', function (event) {
				context.thumbnails.set(event, element, context);
			}, false);
		};
		// redraw/recentre the thumbnails according to the context.cfg
		this.thumbnails.update = function (context) {
			// update the thumbnails menu
			context.thumbnails.menu.update(context);
			/// highlight the icons
			context.thumbnails.hightlightIcons(context);
			// centre the icons
			context.thumbnails.centreIcons(context);
			// centre the slider
			context.thumbnails.centreSlider(context);
		};
		// highlight active icon
		this.thumbnails.hightlightIcons = function (context) {
			// for all thumbnails
			for (var a = 1, b = context.cfg.thumbnails.length; a < b; a += 1) {
				// highlight the active slide
				context.cfg.outlets.thumbnails[a].className = (context.cfg.outlets.index === a) ? context.cfg.navigation + '_active' : context.cfg.navigation + '_passive';
			}
		};
		// centre the icons in containers
		this.thumbnails.centreIcons = function (context) {
			var imageObject, imageWidth, imageHeight, rowHeight;
			// measure the available space
			rowHeight = context.cfg.outlets.slideNav.offsetHeight;
			// for all thumbnails
			for (var a = 1, b = context.cfg.thumbnails.length; a < b; a += 1) {
				// centre the image in its surroundings
				context.cfg.outlets.thumbnails[a].style.width =  rowHeight + 'px';
				imageObject = context.cfg.outlets.thumbnails[a].getElementsByTagName('img')[0];
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
		this.thumbnails.centreSlider = function (context) {
			// scroll the slider enough to center the active slide
			var activeThumbnail = context.cfg.outlets.thumbnails[context.cfg.outlets.index];
			var activePosition = activeThumbnail.offsetLeft;
			var activeWidth = activeThumbnail.offsetWidth;
			var scrollDistance = context.cfg.outlets.slideDiv.offsetWidth;
			var centeredPosition = -activePosition + scrollDistance / 2 - activeWidth / 2;
			centeredPosition = (centeredPosition > 0) ? 0 : centeredPosition;
			centeredPosition = (centeredPosition < context.cfg.scrollMax && context.cfg.scrollMax < 0) ? context.cfg.scrollMax : centeredPosition;
			// transition to the new position
			useful.transitions.byRules(
				context.cfg.outlets.slideUl,
				{'marginLeft' : centeredPosition + 'px'}
			);
		};
		// activate a corresponding figure
		this.thumbnails.set = function (event, node, context) {
			// get the event properties
			event = event || window.event;
			// count which thumbnail this is
			for (var a = 1; a < context.cfg.outlets.thumbnails.length; a += 1) {
				if (context.cfg.outlets.thumbnails[a] === node) {
					// change the index to this slide
					context.cfg.outlets.index = a;
					// reset the zoom
					context.cfg.outlets.zoom = (context.cfg.zoom !== 'static') ? 999 : 1;
					// redraw all
					context.update(context);
				}
			}
			// cancel the click
			event.preventDefault();
		};
		// manages the thumbnail controls
		this.thumbnails.menu = {};
		// build the menu options
		this.thumbnails.menu.setup = function (context) {
			// create the thumbnail controls
			context.cfg.outlets.pageMenu = document.createElement('menu');
			context.cfg.outlets.pageMenu.className = 'scroller';
			context.cfg.outlets.nextPage = document.createElement('button');
			context.cfg.outlets.nextPage.className = 'next';
			context.cfg.outlets.nextPageIcon = document.createElement('span');
			context.cfg.outlets.nextPageIcon.innerHTML = '&gt';
			context.cfg.outlets.prevPage = document.createElement('button');
			context.cfg.outlets.prevPage.className = 'previous';
			context.cfg.outlets.prevPageIcon = document.createElement('span');
			context.cfg.outlets.prevPageIcon.innerHTML = '&lt';
			context.cfg.outlets.nextPage.appendChild(context.cfg.outlets.nextPageIcon);
			context.cfg.outlets.pageMenu.appendChild(context.cfg.outlets.nextPage);
			context.cfg.outlets.prevPage.appendChild(context.cfg.outlets.prevPageIcon);
			context.cfg.outlets.pageMenu.appendChild(context.cfg.outlets.prevPage);
			context.cfg.outlets.slideNav.appendChild(context.cfg.outlets.pageMenu);
			// apply clicks to the thumbnail controls
			context.cfg.outlets.nextPage.addEventListener('click', function (event) {
				context.thumbnails.menu.next(event, context.cfg.outlets.nextSlide, context);
			}, false);
			context.cfg.outlets.prevPage.addEventListener('click', function (event) {
				context.thumbnails.menu.prev(event, context.cfg.outlets.prevSlide, context);
			}, false);
		};
		// show or hide the previous and next buttons
		this.thumbnails.menu.update = function (context) {
			// calculate the current position
			context.cfg.scrollPosition = (context.cfg.outlets.slideUl.style.marginLeft) ? parseInt(context.cfg.outlets.slideUl.style.marginLeft, 10) : 0;
			context.cfg.scrollDistance = context.cfg.outlets.slideDiv.offsetWidth;
			// calculate the minimum position
			context.cfg.scrollMin = 0;
			// calculate the maximum position
			var lastThumbnail = context.cfg.outlets.thumbnails[context.cfg.outlets.thumbnails.length - 1];
			context.cfg.scrollStep = lastThumbnail.offsetWidth;
			context.cfg.scrollMax = -1 * (lastThumbnail.offsetLeft + lastThumbnail.offsetWidth) + context.cfg.scrollDistance;
			// show or hide the prev button
			context.cfg.outlets.prevPage.className = context.cfg.outlets.prevPage.className.replace(/ disabled/gi, '');
			context.cfg.outlets.prevPage.className += (context.cfg.scrollPosition >= context.cfg.scrollMin) ? ' disabled' : '';
			// show or hide the next button
			context.cfg.outlets.nextPage.className = context.cfg.outlets.nextPage.className.replace(/ disabled/gi, '');
			context.cfg.outlets.nextPage.className += (context.cfg.scrollPosition <= context.cfg.scrollMax && context.cfg.scrollMax < 0) ? ' disabled' : '';
		};
		// show the next page of thumbnails
		this.thumbnails.menu.next = function (event, node, context) {
			// get the event properties
			event = event || window.event;
			var target = event.target || event.srcElement;
			// if the button is not disabled
			if (!target.className.match(/disabled/)) {
				// scroll one page's width of thumbnails
				var newPosition = context.cfg.scrollPosition - context.cfg.scrollDistance + context.cfg.scrollStep;
				// limit the scroll distance
				if (newPosition < context.cfg.scrollMax) {
					newPosition = context.cfg.scrollMax;
				}
				// transition to the new position
				useful.transitions.byRules(context.cfg.outlets.slideUl, {'marginLeft' : newPosition + 'px'});
				// redraw the menu buttons
				context.thumbnails.menu.update(context);
			}
			// cancel the click
			target.blur();
			event.preventDefault();
		};
		// show the previous page of thumbnails
		this.thumbnails.menu.prev = function (event, node, context) {
			// get the event properties
			event = event || window.event;
			var target = event.target || event.srcElement;
			// if the button is not disabled
			if (!target.className.match(/disabled/)) {
				// scroll one page's width of thumbnails
				var newPosition = context.cfg.scrollPosition + context.cfg.scrollDistance - context.cfg.scrollStep;
				// limit the scroll distance
				if (newPosition > 0) {
					newPosition = 0;
				}
				// transition to the new position
				useful.transitions.byRules(context.cfg.outlets.slideUl, {'marginLeft' : newPosition + 'px'});
				// redraw the menu buttons
				context.thumbnails.menu.update(context);
			}
			// cancel the click
			target.blur();
			event.preventDefault();
		};
		this.leaf = {};
		// build the leafing toolbar
		this.leaf.setup = function (context) {
			// create the menu
			context.cfg.outlets.menus = context.cfg.outlets.menus || {};
			context.cfg.outlets.menus.leafMenu = document.createElement('menu');
			context.cfg.outlets.menus.leafMenu.className = 'slider leaf';
			context.cfg.outlets.menus.leafMenu.style.bottom = ((1 - context.cfg.divide) * 100) + '%';
			// create the page indicator
			context.leaf.build.indicator(context.cfg.outlets.menus.leafMenu, context);
			// create the reset button
			context.leaf.build.resetter(context.cfg.outlets.menus.leafMenu, context);
			// create the next button
			context.leaf.build.increaser(context.cfg.outlets.menus.leafMenu, context);
			// create the previous button
			context.leaf.build.decreaser(context.cfg.outlets.menus.leafMenu, context);
			// add the menu to the interface
			context.obj.appendChild(context.cfg.outlets.menus.leafMenu);
		};
		this.leaf.build = {};
		this.leaf.build.indicator = function (parent, context) {
			// create the page indicator
			context.cfg.outlets.menus.leafPage = document.createElement('form');
			context.cfg.outlets.menus.leafPageInput = document.createElement('input');
			context.cfg.outlets.menus.leafPageInput.setAttribute('type', 'text');
			context.cfg.outlets.menus.leafPageCount = document.createElement('span');
			context.cfg.outlets.menus.leafPageCount.className = 'count';
			context.cfg.outlets.menus.leafPageSubmit = document.createElement('button');
			context.cfg.outlets.menus.leafPageSubmit.setAttribute('type', 'submit');
			context.cfg.outlets.menus.leafPageSubmit.style.position = 'absolute';
			context.cfg.outlets.menus.leafPageSubmit.style.left = '-999em';
			context.cfg.outlets.menus.leafPage.appendChild(context.cfg.outlets.menus.leafPageInput);
			context.cfg.outlets.menus.leafPage.appendChild(context.cfg.outlets.menus.leafPageCount);
			parent.appendChild(context.cfg.outlets.menus.leafPage);
			context.cfg.outlets.menus.leafPageInput.addEventListener('change', function (event) {
				context.leaf.typed(event, context);
			}, false);
			context.cfg.outlets.menus.leafPage.addEventListener('submit', function (event) {
				context.leaf.typed(event, context);
				event.preventDefault();
			}, false);
		};
		this.leaf.build.resetter = function (parent, context) {
			// create the reset button
			context.cfg.outlets.menus.leafReset = document.createElement('button');
			context.cfg.outlets.menus.leafReset.className = 'reset';
			context.cfg.outlets.menus.leafResetIcon = document.createElement('span');
			context.cfg.outlets.menus.leafResetIcon.innerHTML = 'Reset view';
			context.cfg.outlets.menus.leafReset.appendChild(context.cfg.outlets.menus.leafResetIcon);
			parent.appendChild(context.cfg.outlets.menus.leafReset);
			context.cfg.outlets.menus.leafReset.addEventListener('click', function (event) {
				context.leaf.reset(event, context);
			}, false);
		};
		this.leaf.build.increaser = function (parent, context) {
			// create the next button
			context.cfg.outlets.menus.leafIn = document.createElement('button');
			context.cfg.outlets.menus.leafIn.className = 'increase';
			context.cfg.outlets.menus.leafInIcon = document.createElement('span');
			context.cfg.outlets.menus.leafInIcon.innerHTML = 'Leaf forward';
			context.cfg.outlets.menus.leafIn.appendChild(context.cfg.outlets.menus.leafInIcon);
			parent.appendChild(context.cfg.outlets.menus.leafIn);
			context.cfg.outlets.menus.leafIn.addEventListener('click', function (event) {
				context.leaf.increase(event, context);
			}, false);
		};
		this.leaf.build.decreaser = function (parent, context) {
			// create the previous button
			context.cfg.outlets.menus.leafOut = document.createElement('button');
			context.cfg.outlets.menus.leafOut.className = 'decrease';
			context.cfg.outlets.menus.leafOutIcon = document.createElement('span');
			context.cfg.outlets.menus.leafOutIcon.innerHTML = 'Leaf back';
			context.cfg.outlets.menus.leafOut.appendChild(context.cfg.outlets.menus.leafOutIcon);
			parent.appendChild(context.cfg.outlets.menus.leafOut);
			context.cfg.outlets.menus.leafOut.addEventListener('click', function (event) {
				context.leaf.decrease(event, context);
			}, false);
		};
		// updates the leafing toolbar
		this.leaf.update = function (context) {
			// fill in the current page
			context.cfg.outlets.menus.leafPageInput.value = context.cfg.outlets.index;
			// fill in the page total
			context.cfg.outlets.menus.leafPageCount.innerHTML = 'of ' +	(context.cfg.outlets.figures.length - 1);
		};
		this.leaf.increase = function (event, context) {
			// decrease the spin index
			context.cfg.outlets.index += 1;
			// look if needed
			if (context.cfg.toolbars === 'buttons') {
				// loop the value if needed
				if (context.cfg.outlets.index >= context.cfg.outlets.figures.length) {
					context.cfg.outlets.index = 1;
				}
				// loop the value if needed
				if (context.cfg.outlets.index <= 0) {
					context.cfg.outlets.index = context.cfg.outlets.figures.length - 1;
				}
			}
			// redraw
			context.update(context);
			// cancel the click
			event.preventDefault();
		};
		this.leaf.decrease = function (event, context) {
			// decrease the spin index
			context.cfg.outlets.index -= 1;
			// redraw
			context.update(context);
			// cancel the click
			event.preventDefault();
		};
		this.leaf.typed = function (event, context) {
			// get the typed number
			var number = parseInt(context.cfg.outlets.menus.leafPageInput.value, 10);
			// if the typed number is acceptable
			if (!isNaN(number)) {
				// accept the value
				context.cfg.outlets.index = number;
			}
			// update the interface
			context.update(context);
		};
		this.leaf.reset = function (event, context) {
			// reset the zoom level
			context.cfg.outlets.zoom = (context.cfg.zoom !== 'static') ? 999 : 1;
			// redraw
			context.update(context);
			// cancel the click
			event.preventDefault();
		};
		// minimal superset of controls
		this.toolbar = {};
		this.toolbar.setup = function (context) {
			// create the menu
			context.cfg.outlets.menus = context.cfg.outlets.menus || {};
			context.cfg.outlets.menus.toolbarNav = document.createElement('nav');
			context.cfg.outlets.menus.toolbarNav.className = context.cfg.toolbars + ' ' + context.cfg.spin;
			context.cfg.outlets.menus.toolbarNav.style.bottom = ((1 - context.cfg.divide) * 100) + '%';
			// add the zoom buttons
			context.cfg.outlets.menus.toolbarZoom = document.createElement('menu');
			context.cfg.outlets.menus.toolbarZoom.className = 'zoom';
			context.zoom.build.increaser(context.cfg.outlets.menus.toolbarZoom, context);
			context.zoom.build.decreaser(context.cfg.outlets.menus.toolbarZoom, context);
			context.cfg.outlets.menus.toolbarNav.appendChild(context.cfg.outlets.menus.toolbarZoom);
			// setup the right toolbar
			switch (context.cfg.spin) {
			case 'rotation' :
				// create the menu
				context.cfg.outlets.menus.toolbarSpin = document.createElement('menu');
				context.cfg.outlets.menus.toolbarSpin.className = 'spin';
				// add the spin buttons
				context.spin.build.decreaser(context.cfg.outlets.menus.toolbarSpin, context);
				context.spin.build.increaser(context.cfg.outlets.menus.toolbarSpin, context);
				// add the menu to the toolbar
				context.cfg.outlets.menus.toolbarNav.appendChild(context.cfg.outlets.menus.toolbarSpin);
				break;
			case 'slideshow' :
				// create the menu
				context.cfg.outlets.menus.toolbarLeaf = document.createElement('menu');
				context.cfg.outlets.menus.toolbarLeaf.className = 'leaf';
				// add the previous button
				context.leaf.build.decreaser(context.cfg.outlets.menus.toolbarLeaf, context);
				// add the next button
				context.leaf.build.increaser(context.cfg.outlets.menus.toolbarLeaf, context);
				// add the menu to the toolbar
				context.cfg.outlets.menus.toolbarNav.appendChild(context.cfg.outlets.menus.toolbarLeaf);
				break;
			case 'catalogue' :
				// create the menu
				context.cfg.outlets.menus.toolbarLeaf = document.createElement('menu');
				context.cfg.outlets.menus.toolbarLeaf.className = 'leaf';
				// add the reset button
				context.leaf.build.resetter(context.cfg.outlets.menus.toolbarLeaf, context);
				// add the indicator display
				context.leaf.build.indicator(context.cfg.outlets.menus.toolbarLeaf, context);
				// add the previous button
				context.leaf.build.decreaser(context.cfg.outlets.menus.toolbarLeaf, context);
				// add the next button
				context.leaf.build.increaser(context.cfg.outlets.menus.toolbarLeaf, context);
				// add the reset button
				//context.leaf.build.resetter(context.cfg.outlets.menus.toolbarLeaf, context);
				// add the menu to the toolbar
				context.cfg.outlets.menus.toolbarNav.appendChild(context.cfg.outlets.menus.toolbarLeaf);
				break;
			}
			// add the menu to the interface
			context.obj.appendChild(context.cfg.outlets.menus.toolbarNav);
		};
		this.toolbar.update = function (context) {
			// hide/show the zoom out button
			context.cfg.outlets.menus.zoomIn.className = context.cfg.outlets.menus.zoomIn.className.replace(/ disabled/gi, '');
			context.cfg.outlets.menus.zoomIn.className += (context.cfg.outlets.atMaxZoom) ? ' disabled' : '';
			// hide/show the zoom in button
			context.cfg.outlets.menus.zoomOut.className = context.cfg.outlets.menus.zoomOut.className.replace(/ disabled/gi, '');
			context.cfg.outlets.menus.zoomOut.className += (context.cfg.outlets.atMinZoom) ? ' disabled' : '';
			// update the right toolbar
			switch (context.cfg.spin) {
			case 'rotation' :
				break;
			case 'slideshow' :
				// hide/show the previous button
				context.cfg.outlets.menus.leafIn.className = context.cfg.outlets.menus.leafIn.className.replace(/ disabled/gi, '');
				context.cfg.outlets.menus.leafIn.className += (context.cfg.outlets.atMaxLeaf) ? ' disabled' : '';
				// hide/show the next button
				context.cfg.outlets.menus.leafOut.className = context.cfg.outlets.menus.leafOut.className.replace(/ disabled/gi, '');
				context.cfg.outlets.menus.leafOut.className += (context.cfg.outlets.atMinLeaf) ? ' disabled' : '';
				break;
			case 'catalogue' :
				// fill in the current page
				context.cfg.outlets.menus.leafPageInput.value = context.cfg.outlets.index;
				// fill in the page total
				context.cfg.outlets.menus.leafPageCount.innerHTML = 'of ' +	(context.cfg.outlets.figures.length - 1);
				break;
			}
		};
		// external API
		this.focus = function (index) {
			this.cfg.outlets.index = index;
			this.update(this);
		};
		this.previous = function () {
			this.cfg.outlets.index -= 1;
			this.update(this);
		};
		this.next = function () {
			this.cfg.outlets.index += 1;
			this.update(this);
		};
	};

}(window.useful = window.useful || {}));
