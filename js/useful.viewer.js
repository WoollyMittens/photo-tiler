/*
	Source:
	van Creij, Maurice (2012). "useful.viewer.js: A simple tile based image viewer", version 20120606, http://www.woollymittens.nl/.

	License:
	This work is licensed under a Creative Commons Attribution 3.0 Unported License.

	Prerequisites:
	<script src="./js/useful.js"></script>
	<!--[if IE]>
		<script src="./js/html5.js"></script>
		<script src="//ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js"></script>
		<script src="//ajax.googleapis.com/ajax/libs/jqueryui/1.9.2/jquery-ui.min.js"></script>
	<![endif]-->
*/

(function (useful) {

	// invoke strict mode
	"use strict";

	// private functions
	var viewer = {};
	viewer = {
		start : function (node, settings) {
			// use the fallback to gather the asset urls
			if (!settings.outlets) {
				// create the object to hold all the interface pointers
				settings.outlets = {};
				// get the assets from the fallback html
				settings.thumbnails = [0];
				settings.figures = [0];
				settings.titles = [0];
				settings.descriptions = [0];
				settings.widths = [0];
				settings.heights = [0];
				var allLinks = node.getElementsByTagName('a');
				var allImages = node.getElementsByTagName('img');
				for (var a = 0, b = allLinks.length; a < b; a += 1) {
					// create a list of thumbnail urls and full urls
					settings.thumbnails.push(allImages[a].getAttribute('src'));
					settings.figures.push(settings.urlprefix + allLinks[a].getAttribute('href'));
					settings.titles.push(allImages[a].getAttribute('title'));
					settings.descriptions.push(allImages[a].getAttribute('alt'));
					settings.widths.push(allImages[a].getAttribute('width'));
					settings.heights.push(allImages[a].getAttribute('height'));
				}
				// pick the initial active slide
				settings.outlets.index = 1;
				// pick the initial zoom level
				settings.outlets.zoom = 1;
				// pick the initial pan position
				settings.outlets.pan = { x : 0.5, y : 0.5};
				// pick the initial canvas position
				settings.outlets.pos = { x : 0, y : 0};
				// store the parent node
				settings.outlets.parent = node;
			}
			// fix some numbers in the settings
			settings.grid = parseInt(settings.grid, 10);
			settings.cache = parseInt(settings.cache, 10);
			settings.lens = parseFloat(settings.lens);
			settings.magnification = parseFloat(settings.magnification);
			settings.navigation = 'thumbnails';
			settings.divide = (settings.spin === 'rotation') ? 1 : parseInt(settings.divide, 10) / 100;
			settings.retry = null;
			// if the sizes weren't given
			if (!settings.widths[1]) {
				// request them using AJAX
				useful.request.send({
					url : settings.imagesize + '?src=' + settings.figures.join(',').substr(2),
					post : 'name=value&foo=bar',
					onSuccess : function (reply) { viewer.load(reply, settings); }
				});
			// else
			} else {
				// run the viewer
				viewer.run(settings);
			}
		},
		// run the slideshow
		run : function (settings) {
			// hide the component
			settings.outlets.parent.style.visibility = 'hidden';
			setTimeout(function () {
				// start the components
				viewer.setup(settings);
				// start the redraw
				setTimeout(function () {
					// draw the component
					viewer.update(settings);
					// reveal the component
					settings.outlets.parent.style.visibility = 'visible';
				}, 400);
			}, 100);
		},
		// import sizes
		load : function (reply, settings) {
			// process the reply
			var sizes = {};
			sizes = useful.request.decode(reply.responseText);
			settings.widths = [0].concat(sizes.x);
			settings.heights = [0].concat(sizes.y);
			// run the viewer
			viewer.run(settings);
		},
		// build the app html
		setup : function (settings) {
			// shortcut pointers
			var sip = settings.outlets.parent;
			// clear the parent node
			sip.innerHTML = '';
			// apply optional dimensions
			if (settings.width) {
				sip.style.width = settings.width + settings.widthUnit;
			}
			if (settings.height) {
				sip.style.height = settings.height + settings.heightUnit;
			}
			// apply any settings classes
			sip.className += ' spin_' + settings.spin;
			// setup the sub components
			viewer.automatic.setup(settings);
			viewer.figures.setup(settings);
			// choose what type of toolbars to setup
			switch (settings.toolbars) {
			// setup the slider toolbars
			case 'sliders' :
				viewer.zoom.setup(settings);
				if (settings.spin === 'rotation') {
					viewer.spin.setup(settings);
				}
				if (settings.spin === 'catalogue') {
					viewer.leaf.setup(settings);
				}
				break;
			// setup the floating buttons
			case 'buttons' :
				viewer.toolbar.setup(settings);
				break;
			// setup the default toolbar
			default :
				viewer.toolbar.setup(settings);
			}
			// setup the thumbnails
			if (settings.spin !== 'rotation') {
				viewer.thumbnails.setup(settings);
			}
		},
		// update the whole app
		update : function (settings) {
			// if the slideshow has been disabled
			if (settings.outlets.parent.offsetHeight === 0) {
				// stop updating and try again later
				clearTimeout(settings.retry);
				settings.retry = setTimeout(function () {
					viewer.update(settings);
				}, 1000);
			// else
			} else {
				// update the sub components
				viewer.figures.update(settings);
				// choose what type of toolbars to update
				switch (settings.toolbars) {
				// update the slider toolbars
				case 'sliders' :
					viewer.zoom.update(settings);
					if (settings.spin === 'rotation') {
						viewer.spin.update(settings);
					}
					if (settings.spin === 'catalogue') {
						viewer.leaf.update(settings);
					}
					break;
				// update the floating buttons
				case 'buttons' :
					viewer.toolbar.update(settings);
					break;
				// update the default toolbar
				default :
					viewer.toolbar.update(settings);
				}
				// update the thumbnails
				if (settings.spin !== 'rotation') {
					viewer.thumbnails.update(settings);
				}
			}
		},
		// automatic idle slideshow
		automatic : {
			setup : function () {

			}
		},
		// manages the main view
		figures : {
			// builds the figure
			setup : function (settings) {
				// enable the streaming of images
				settings.outlets.stream = true;
				// set up a counter for the amount of images streamed
				settings.outlets.count = 0;
				// create a storage place for the transition timeouts
				settings.outlets.transitions = [];
				// create a wrapper for overflow management
				settings.outlets.wrapper = document.createElement('div');
				settings.outlets.wrapper.className = 'wrapper';
				// force the height of the wrapper if desired
				settings.outlets.wrapper.style.height = (settings.divide * 100) + '%';
				// create a canvas layer to contain the images
				settings.outlets.canvas = document.createElement('div');
				settings.outlets.canvas.className = 'canvas';
				// add the canvas to the parent
				settings.outlets.wrapper.appendChild(settings.outlets.canvas);
				// for all figures in the settings
				settings.outlets.figures = [0];
				var newImage, newWidth, newHeight;
				for (var a = 1, b = settings.figures.length; a < b; a += 1) {
					// calculate the starting dimensions
					newHeight = settings.outlets.parent.offsetHeight * settings.divide;
					newWidth = newHeight / settings.heights[a] * settings.widths[a];
					// create a new slide
					settings.outlets.figures[a] = document.createElement('figure');
					settings.outlets.figures[a].className = (a === 1) ? 'figure_active' : 'figure_passive';
					settings.outlets.figures[a].style.width = parseInt(newWidth, 10) + 'px';
					settings.outlets.figures[a].style.height = parseInt(newHeight, 10) + 'px';
					settings.outlets.figures[a].style.left = (settings.outlets.pan.x * 100) + '%';
					settings.outlets.figures[a].style.top = (settings.outlets.pan.y * 100) + '%';
					settings.outlets.figures[a].style.marginLeft = parseInt(newWidth / -2, 10) + 'px';
					settings.outlets.figures[a].style.marginTop = parseInt(newHeight / -2, 10) + 'px';
					// add the default image to the slide
					newImage = document.createElement('img');
					// load starting images
					newImage.src = settings.imageslice +
						'?src=' + settings.figures[a] +
						'&width=' + parseInt(newWidth, 10) +
						'&height=' + parseInt(newHeight, 10) +
						'&left=0&top=0&right=1&bottom=1';
					// set the image properties
					newImage.style.width = '100%';
					newImage.style.height = '100%';
					newImage.className = 'zoom_0';
					if (settings.descriptions) {
						newImage.setAttribute('alt', settings.descriptions[a]);
					} else {
						newImage.setAttribute('alt', '');
					}
					if (settings.titles) {
						newImage.setAttribute('title', settings.titles[a]);
					} else {
						newImage.setAttribute('title', '');
					}
					settings.outlets.figures[a].appendChild(newImage);
					// insert the new nodes
					settings.outlets.canvas.appendChild(settings.outlets.figures[a]);
				}
				// add a top layer for uninterrupted touch events
				settings.outlets.cover = document.createElement('div');
				settings.outlets.cover.className = 'cover';
				settings.outlets.wrapper.appendChild(settings.outlets.cover);
				// clone the initial figure into a background layer on non-static zooms
				if (settings.zoom !== 'static') {
					// create a background layer to contain all the low res backgrounds
					settings.outlets.background = settings.outlets.canvas.cloneNode(true);
					settings.outlets.background.className = 'background';
					// insert the background into the parent
					settings.outlets.wrapper.insertBefore(settings.outlets.background, settings.outlets.canvas);
					// apply a lens style to the canvas
					settings.outlets.canvas.className += ' canvas_lens canvas_hidden';
					// set a starting zoom factor
					settings.outlets.zoom = 999;
					// set the lens dimensions
					if (settings.zoom === 'lens') {
						var lensSize = settings.outlets.parent.offsetWidth * settings.lens;
						settings.outlets.canvas.style.width = lensSize + 'px';
						settings.outlets.canvas.style.height = lensSize + 'px';
						if (navigator.userAgent.match(/firefox|webkit/gi)) {
							settings.outlets.canvas.style.borderRadius = '50%';	//(lensSize / 2) + 'px';
						}
					}
					// store the backgrounds
					var backgroundFigures = settings.outlets.background.getElementsByTagName('figure');
					settings.outlets.backgrounds = [];
					for (a = 0 , b = backgroundFigures.length; a < b; a += 1) {
						settings.outlets.backgrounds[a + 1] = backgroundFigures[a];
						settings.outlets.backgrounds[a + 1].style.display = 'block';
						settings.outlets.backgrounds[a + 1].style.position = 'absolute';
					}
				}
				// add the wrapper to the parent
				settings.outlets.parent.appendChild(settings.outlets.wrapper);
				// add the mouse events for the cover layer
				viewer.figures.events.coverScroll(settings.outlets.cover, settings);
				viewer.figures.events.coverMouse(settings.outlets.cover, settings);
				viewer.figures.events.coverTouch(settings.outlets.cover, settings);
				// add a place to contain the tiles
				settings.outlets.tiles = {};
			},
			// event handlers
			events : {
				// set the mouse wheel events
				coverScroll : function (cover, settings) {
					if (cover.addEventListener) {
						cover.addEventListener('mousewheel', function (event) {
							viewer.figures.mouse.wheel(event, settings);
						}, false);
					} else {
						cover.attachEvent('onmousewheel', function (event) {
							viewer.figures.mouse.wheel(event, settings);
						});
					}
					if (cover.addEventListener) {
						cover.addEventListener('DOMMouseScroll', function (event) {
							viewer.figures.mouse.wheel(event, settings);
						}, false);
					}
				},
				// add the mouse events
				coverMouse : function (cover, settings) {
					// set the right interactions for the zoom mode
					if (settings.zoom !== 'static') {
						cover.onmousemove = function (event) {
							viewer.figures.mouse.mirror(event, settings);
						};
					} else {
						cover.onmousedown = function (event) {
							viewer.figures.mouse.start(event, settings);
						};
						cover.onmousemove = function (event) {
							viewer.figures.mouse.move(event, settings);
						};
						cover.onmouseup = function (event) {
							viewer.figures.mouse.end(event, settings);
						};
						cover.onmouseout = function (event) {
							viewer.figures.mouse.end(event, settings);
						};
					}
				},
				// add the touch events
				coverTouch : function (cover, settings) {
					// set the right interactions for the zoom mode
					if (settings.zoom !== 'static') {
						cover.ontouchmove = function (event) {
							viewer.figures.touch.mirror(event, settings);
						};
					} else {
						cover.ontouchstart = function (event) {
							viewer.figures.touch.start(event, settings);
						};
						cover.ontouchmove = function (event) {
							viewer.figures.touch.move(event, settings);
						};
						cover.ontouchend = function (event) {
							viewer.figures.touch.end(event, settings);
						};
					}
				}
			},
			// redraws the figure
			update : function (settings) {
				// validate the input
				viewer.figures.redraw.validate(settings);
				// calculate the values
				viewer.figures.redraw.calculate(settings);
				// normalise the values
				viewer.figures.redraw.normalise(settings);
				// move the canvas around
				viewer.figures.redraw.canvas(settings);
				// move the figure around
				viewer.figures.redraw.figures(settings);
				// create new tiles
				viewer.figures.redraw.create(settings);
				// display existing tiles
				viewer.figures.redraw.display(settings);
				// spin the correct figure into view
				viewer.figures.redraw.spin(settings);
			},
			redraw : {
				validate : function (settings) {
					// reset the stored limits
					settings.outlets.atMinZoom = false;
					settings.outlets.atMaxZoom = false;
					settings.outlets.atMinLeaf = false;
					settings.outlets.atMaxLeaf = false;
					// check the zoom level
					var minZoom = (settings.zoom !== 'static') ? (1 / settings.lens) : 1;
					if (settings.outlets.zoom <= minZoom) {
						settings.outlets.zoom = minZoom;
						settings.outlets.atMinZoom = true;
					}
					if (settings.outlets.index <= 1) {
						settings.outlets.index = 1;
						settings.outlets.atMinLeaf = true;
					}
					if (settings.outlets.index >= settings.outlets.figures.length) {
						settings.outlets.index = settings.outlets.figures.length - 1;
						settings.outlets.atMaxLeaf = true;
					}
				},
				calculate : function (settings) {
					// shortcut pointer
					var vfr = viewer.figures.redraw;
					// calculate dimensions for a given zoom level
					vfr.canvasWidth = settings.outlets.canvas.offsetWidth;
					vfr.canvasHeight = settings.outlets.canvas.offsetHeight;
					vfr.canvasLeft = settings.outlets.pos.x - vfr.canvasWidth / 2;
					vfr.canvasTop = settings.outlets.pos.y - vfr.canvasHeight / 2;
					vfr.maxWidth = settings.widths[settings.outlets.index];
					vfr.maxHeight = settings.heights[settings.outlets.index];
					vfr.figureAspect = vfr.maxWidth / vfr.maxHeight;
					vfr.figureWidth = vfr.canvasHeight * vfr.figureAspect * settings.outlets.zoom;
					vfr.figureHeight = vfr.canvasHeight * settings.outlets.zoom;
					vfr.figureLeft = (settings.outlets.pan.x - 0.5) * vfr.canvasWidth;
					vfr.figureTop = (settings.outlets.pan.y - 0.5) * vfr.canvasHeight;
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
					if (settings.zoom !== 'static') {
						vfr.backgroundWidth = settings.outlets.background.offsetWidth;
						vfr.backgroundHeight = settings.outlets.background.offsetHeight;
						vfr.backgroundLeft = (vfr.backgroundHeight * vfr.figureAspect - vfr.backgroundWidth) / 2;
						vfr.backgroundTop = 0;
					}
				},
				normalise : function (settings) {
					// shortcut pointer
					var vfr = viewer.figures.redraw;
					// normalise the canvas position

					// normalise the figure position
					if (vfr.figureWidth >= vfr.maxWidth || vfr.figureHeight >= vfr.maxHeight) {
						vfr.figureWidth = vfr.maxWidth;
						vfr.figureHeight = vfr.maxHeight;
						settings.outlets.zoom = vfr.maxZoom;
						settings.outlets.atMaxZoom = true;
					}
					if (vfr.figureLeft > vfr.overscanLeft) {
						vfr.figureLeft = vfr.overscanLeft;
						settings.outlets.pan.x = vfr.maxPanLeft;
					}
					if (vfr.figureLeft < -vfr.overscanLeft) {
						vfr.figureLeft = -vfr.overscanLeft;
						settings.outlets.pan.x = vfr.minPanLeft;
					}
					if (vfr.figureTop > vfr.overscanTop) {
						vfr.figureTop = vfr.overscanTop;
						settings.outlets.pan.y = vfr.maxPanTop;
					}
					if (vfr.figureTop < -vfr.overscanTop) {
						vfr.figureTop = -vfr.overscanTop;
						settings.outlets.pan.y = vfr.minPanTop;
					}
					if (vfr.figureHeight < vfr.canvasHeight) {
						vfr.figureWidth = vfr.canvasHeight / vfr.maxHeight * vfr.maxWidth;
						vfr.figureHeight = vfr.canvasHeight;
						settings.outlets.zoom = 1;
						settings.outlets.pan.y = 0.5;
					}
					if (vfr.figureWidth < vfr.canvasWidth) {
						vfr.figureLeft = 0;
						settings.outlets.pan.x = 0.5;
					}
				},
				canvas : function (settings) {
					// shortcut pointer
					var vfr = viewer.figures.redraw;
					// figure out the relevant movement
					switch (settings.zoom) {
					case 'lens' :
						var fraction, extra, range, offset;
						// set the horizontal shift
						fraction = (1 - (settings.outlets.pos.x + vfr.backgroundLeft) / (vfr.backgroundHeight * vfr.figureAspect));
						extra = vfr.canvasWidth / vfr.figureWidth;
						range = vfr.maxPanLeft - vfr.minPanLeft + extra * 2;
						offset = vfr.minPanLeft - extra;
						settings.outlets.pan.x = fraction * range + offset;
						// set the vertical shift
						fraction = (1 - (settings.outlets.pos.y + vfr.backgroundTop) / vfr.backgroundHeight);
						extra = vfr.canvasHeight / vfr.figureHeight;
						range = vfr.maxPanTop - vfr.minPanTop + extra * 2;
						offset = vfr.minPanTop - extra;
						settings.outlets.pan.y = fraction * range + offset;
						// set the positions
						settings.outlets.canvas.style.left = parseInt(vfr.canvasLeft, 10) + 'px';
						settings.outlets.canvas.style.top = parseInt(vfr.canvasTop, 10) + 'px';
						break;
					case 'top' :
						settings.outlets.canvas.style.left = '0px';
						settings.outlets.canvas.style.top = '-' + settings.outlets.canvas.offsetHeight + 'px';
						break;
					case 'right' :
						settings.outlets.canvas.style.left = settings.outlets.canvas.offsetWidth + 'px';
						settings.outlets.canvas.style.top = '0px';
						break;
					case 'bottom' :
						settings.outlets.canvas.style.left = '0px';
						settings.outlets.canvas.style.top = settings.outlets.canvas.offsetHeight + 'px';
						break;
					case 'left' :
						settings.outlets.canvas.style.left = '-' + settings.outlets.canvas.offsetHeight + 'px';
						settings.outlets.canvas.style.top = '0px';
						break;
					}
					// show the appropriate cursor
					if (settings.zoom === 'lens') {
						settings.outlets.cover.style.cursor = 'crosshair';
					} else if (settings.outlets.zoom > 1 || settings.spin === 'rotation') {
						settings.outlets.cover.style.cursor = 'move';
					} else {
						settings.outlets.cover.style.cursor = 'auto';
					}
				},
				figures : function (settings) {
					// shortcut pointer
					var vfr = viewer.figures.redraw;
					// set the zoomed figure dimensions
					settings.outlets.figures[settings.outlets.index].style.left = (settings.outlets.pan.x * 100) + '%';
					settings.outlets.figures[settings.outlets.index].style.top = (settings.outlets.pan.y * 100) + '%';
					settings.outlets.figures[settings.outlets.index].style.marginLeft = parseInt(vfr.figureWidth / -2, 10) + 'px';
					settings.outlets.figures[settings.outlets.index].style.marginTop = parseInt(vfr.figureHeight / -2, 10) + 'px';
					settings.outlets.figures[settings.outlets.index].style.width = parseInt(vfr.figureWidth, 10) + 'px';
					settings.outlets.figures[settings.outlets.index].style.height = parseInt(vfr.figureHeight, 10) + 'px';
				},
				create : function (settings) {
					// shortcut pointer
					var vfr = viewer.figures.redraw;
					// if streaming new tiles is allowed
					if (
						// allow/disallow streaming switch
						settings.outlets.stream &&
						// don't stream at the initial zoom in the rotation (the initial images will be of high enough resolution)
						settings.outlets.zoom > 1
					) {
						// divide the dimension into tiles
						var horizontalTiles = Math.ceil(vfr.figureWidth / settings.grid);
						var verticalTiles = Math.ceil(vfr.figureHeight / settings.grid);
						var tileName, tileWidth, tileHeight, tileTop, tileRight, tileBottom, tileLeft,
							tileId = settings.figures[settings.outlets.index],	//.split('src=')[1].split('&')[0].replace(/\//gi, ''),
							tileZoom = settings.outlets.zoom.toString().replace('.', 'D');
						// for all columns
						for (var x = 0; x < horizontalTiles; x += 1) {
							// for all rows
							for (var y = 0; y < verticalTiles; y += 1) {
								// formulate the tile name
								tileName = 'fig_' + tileId + '_zoom_' + tileZoom + '_x_' + x + '_y_' + y;
								// if the tile is within the bounds of the canvas
								if (
									(x + 1) * settings.grid >= vfr.offsetLeft &&
									(x) * settings.grid <= vfr.offsetLeft + vfr.canvasWidth &&
									(y + 1) * settings.grid >= vfr.offsetTop &&
									(y) * settings.grid <= vfr.offsetTop + vfr.canvasHeight
								) {
									// if this tile doesn't exist (naming convention: tiles['fig_1_zoom_1_x_1_y_1'] = {})
									if (!settings.outlets.tiles[tileName]) {
										// count the new tile
										settings.outlets.count += 1;
										// create a tile at this zoom level
										settings.outlets.tiles[tileName] = {
											'object' : document.createElement('img'),
											'figure' : settings.outlets.index,
											'zoom' : settings.outlets.zoom,
											'x' : x,
											'y' : y,
											'index' : settings.outlets.count
										};
										// reveal it onload
										settings.outlets.tiles[tileName].object.className = 'tile_hidden';
										viewer.figures.redraw.events.tileLoad(settings.outlets.tiles[tileName].object, settings);
										// calculate the positions
										tileWidth = settings.grid;
										tileHeight = settings.grid;
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
										settings.outlets.tiles[tileName].object.className = 'tile_hidden';
										settings.outlets.tiles[tileName].object.src = settings.imageslice +
											'?src=' + settings.figures[settings.outlets.index] +
											'&width=' + tileWidth +
											'&height=' + tileHeight +
											'&top=' + tileTop +
											'&right=' + tileRight +
											'&bottom=' + tileBottom +
											'&left=' + tileLeft;
										// position it on the grid
										settings.outlets.tiles[tileName].object.style.position = 'absolute';
										settings.outlets.tiles[tileName].object.style.left = (tileLeft * 100) + '%';
										settings.outlets.tiles[tileName].object.style.top = (tileTop * 100) + '%';
										settings.outlets.tiles[tileName].object.style.width = (tileWidth / vfr.figureWidth * 100) + '%';
										settings.outlets.tiles[tileName].object.style.height = (tileHeight / vfr.figureHeight * 100) + '%';
										settings.outlets.tiles[tileName].object.style.zIndex = parseInt(settings.outlets.zoom * 100, 10);
										// add it to the figure
										settings.outlets.figures[settings.outlets.index].appendChild(settings.outlets.tiles[tileName].object);
									}
								}
							}
						}
					}
				},
				display : function (settings) {
					// shortcut pointer
					var vfr = viewer.figures.redraw;
					// for all tiles
					var tile = '', checkedTile;
					for (tile in settings.outlets.tiles) {
						// validate
						if (settings.outlets.tiles.hasOwnProperty(tile)) {
							// get the target tile
							checkedTile = settings.outlets.tiles[tile];
							// if this is a surplus tile
							if (settings.outlets.tiles[tile].index < settings.outlets.count - settings.cache) {
								// remove it
								settings.outlets.tiles[tile].object.parentNode.removeChild(settings.outlets.tiles[tile].object);
								delete settings.outlets.tiles[tile];
							// if the tile is within the bounds of the canvas
							} else if (
								(checkedTile.x + 1) * settings.grid >= vfr.offsetLeft &&
								(checkedTile.x) * settings.grid <= vfr.offsetLeft + vfr.canvasWidth &&
								(checkedTile.y + 1) * settings.grid >= vfr.offsetTop &&
								(checkedTile.y) * settings.grid <= vfr.offsetTop + vfr.canvasHeight &&
								checkedTile.zoom <= settings.outlets.zoom
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
				},
				spin : function (settings) {
					// decide on the transition effect
					switch (settings.spin) {
					// in case of a catalogue
					case 'catalogue' :
						// for all figures
						var clipWidth;
						for (var a = 1, b = settings.outlets.figures.length; a < b; a += 1) {
							// clear any transition that may be in effect on this figure
							clearTimeout(settings.outlets.transitions[a]);
							// measure the slide width
							clipWidth = settings.outlets.figures[a].offsetWidth;
							// if this is an active slide
							if (a === settings.outlets.index) {
								// if there is a zoom factor, disable the clipping
								if (settings.outlets.zoom > 1) {
									settings.outlets.figures[a].style.clip = 'rect(auto 10000px auto 0px)';
								}
								// else if the figure wasn't revealed yet
								else if (settings.outlets.figures[a].className !== 'figure_leafin') {
									// force the clip's start situation
									settings.outlets.figures[a].style.clip = 'rect(auto ' + clipWidth + 'px auto ' + clipWidth + 'px)';
									// apply the figure class
									settings.outlets.figures[a].className = 'figure_leafin';
									// apply the figure style
									useful.css.setRules(
										settings.outlets.figures[a],
										{'clip' : 'rect(auto ' + clipWidth + 'px auto 0px)', 'transform' : 'translate(0%,0%) rotate(0deg)'},
										null,
										600
									);
								}
							}
							// else if this is a passive slide, but not unrevealed yet
							else if (settings.outlets.figures[a].className !== 'figure_leafout') {
								// delay its return
								viewer.figures.redraw.events.figureUnreveal(settings, a, clipWidth);
								// apply the figure class
								settings.outlets.figures[a].className = 'figure_leafout';
							}
						}
						break;
					// in case of a slideshow
					case 'slideshow' :
						// for all figures
						for (a = 1 , b = settings.outlets.figures.length; a < b; a += 1) {
							// apply the figure class
							settings.outlets.figures[a].className = (a === settings.outlets.index) ? 'figure_fadein' : 'figure_fadeout';
							if (settings.zoom !== 'static') {
								settings.outlets.backgrounds[a].className = (a === settings.outlets.index) ? 'figure_fadein' : 'figure_fadeout';
							}
						}
						break;
					// for a generic transition
					default :
						// for all figures
						for (a = 1 , b = settings.outlets.figures.length; a < b; a += 1) {
							// apply the figure class
							settings.outlets.figures[a].className = (a === settings.outlets.index) ? 'figure_active' : 'figure_passive';
							if (settings.zoom !== 'static') {
								settings.outlets.backgrounds[a].className = (a === settings.outlets.index) ? 'figure_active' : 'figure_passive';
							}
						}
					}
				},
				// handlers for the events
				events : {
					tileLoad : function (element) {
						element.onload = function () {
							element.className = 'tile_visible';
						};
					},
					figureUnreveal : function (settings, a, clipWidth) {
						setTimeout(function () {
							// apply the figure style
							settings.outlets.figures[a].style.clip = 'rect(auto ' + clipWidth + 'px auto ' + clipWidth + 'px)';
							settings.outlets.figures[a].style.webkitTransform = 'translate(25%,25%) rotate(45deg)';
							settings.outlets.figures[a].style.MozTransform = 'translate(25%,25%) rotate(45deg)';
							settings.outlets.figures[a].style.msTransform = 'translate(25%,25%) rotate(45deg)';
							settings.outlets.figures[a].style.oTransform = 'translate(25%,25%) rotate(45deg)';
							settings.outlets.figures[a].style.transform = 'translate(25%,25%) rotate(45deg)';
						}, 750);
					}
				}
			},
			// mouse controls
			mouse : {
				x : null,
				y : null,
				sensitivity : null,
				treshold : null,
				flick : null,
				delay : null,
				// mouse wheel controls
				wheel : function (event, settings) {
					// shortcut pointer
					var uvfm = viewer.figures.mouse;
					// get the reading from the mouse wheel
					var distance = (window.event) ? window.event.wheelDelta / 120 : -event.detail / 3;
					// do not loop around
					if (distance < 0) {
						// increase the zoom factor
						settings.outlets.zoom = settings.outlets.zoom * settings.magnification;
					} else if (distance > 0) {
						// decrease the zoom factor
						settings.outlets.zoom = settings.outlets.zoom / settings.magnification;
					}
					// temporarily disable streaming for a while to avoid flooding
					settings.outlets.stream = false;
					clearTimeout(uvfm.delay);
					uvfm.delay = setTimeout(function () {
						settings.outlets.stream = true;
						viewer.update(settings);
					}, 500);
					// call for a redraw
					viewer.update(settings);
					// cancel the scrolling
					useful.events.cancel(event);
				},
				// mouse gesture controls
				start : function (event, settings) {
					// get the event properties
					event = event || window.event;
					// shortcut pointer
					var uvfm = viewer.figures.mouse;
					// store the touch positions
					uvfm.x = event.pageX || event.x;
					uvfm.y = event.pageY || event.y;
					// calculate the sensitivity
					uvfm.treshold = settings.outlets.cover.offsetWidth / 10;
					uvfm.flick = settings.outlets.cover.offsetWidth * 0.6;
					// cancel the click
					useful.events.cancel(event);
				},
				move : function (event, settings) {
					// get the event properties
					event = event || window.event;
					// shortcut pointer
					var uvfm = viewer.figures.mouse;
					// if there is a touch in progress
					if (uvfm.x !== null) {
						// store the touch positions
						var x = event.pageX || event.x;
						var y = event.pageY || event.y;
						var xDelta = uvfm.x - x;
						var yDelta = uvfm.y - y;
						// if the image was zoomed in
						if (settings.outlets.zoom > 1) {
							// calculate the drag distance into %
							settings.outlets.pan.x -= xDelta * settings.outlets.zoom / settings.outlets.figures[settings.outlets.index].offsetWidth;
							settings.outlets.pan.y -= yDelta * settings.outlets.zoom / settings.outlets.figures[settings.outlets.index].offsetHeight;
							// reset the distance
							uvfm.x = x;
							uvfm.y = y;
							// order a redraw
							viewer.update(settings);
						// else there was a spin gesture
						} else if (
							(Math.abs(xDelta) > uvfm.treshold && settings.spin === 'rotation') ||
							Math.abs(xDelta) > uvfm.flick
						) {
							// increase the spin
							settings.outlets.index += (xDelta > 0) ? 1 : -1;
							// if in spin mode
							if (settings.spin === 'rotation') {
								// loop the value if needed
								if (settings.outlets.index >= settings.outlets.figures.length) {
									settings.outlets.index = 1;
								}
								// loop the value if needed
								if (settings.outlets.index <= 0) {
									settings.outlets.index = settings.outlets.figures.length - 1;
								}
							}
							// reset the distance
							uvfm.x = x;
							uvfm.y = y;
							// order a redraw
							viewer.update(settings);
						}
					}
					// cancel the click
					useful.events.cancel(event);
				},
				end : function (event, settings) {
					// get the event properties
					event = event || window.event;
					// shortcut pointer
					var uvfm = viewer.figures.mouse;
					// if there was a motion
					if (uvfm.x !== null) {
						// order a redraw
						viewer.update(settings);
					}
					// clear the positions
					uvfm.x = null;
					uvfm.y = null;
					// cancel the click
					useful.events.cancel(event);
				},
				mirror : function (event, settings) {
					// retrieve the mouse position
					var pos = useful.positions.cursor(event, settings.outlets.cover);
					// measure the exact location of the interaction
					settings.outlets.pos.x = pos.x;
					settings.outlets.pos.y = pos.y;
					// order a redraw
					viewer.update(settings);
					// cancel the scrolling
					useful.events.cancel(event);
				}
			},
			// touch screen controls
			touch : {
				x : null,
				y : null,
				sensitivity : null,
				treshold : null,
				flick : null,
				delay : null,
				start : function (event, settings) {
					// shortcut pointer
					var uvft = viewer.figures.touch;
					// store the touch positions
					uvft.x = [];
					uvft.y = [];
					for (var a = 0, b = event.touches.length; a < b; a += 1) {
						uvft.x.push(event.touches[a].pageX);
						uvft.y.push(event.touches[a].pageY);
					}
					// adjust the sensitivity
					uvft.sensitivity = (settings.magnification - 1) / 5 + 1;
					uvft.treshold = settings.outlets.cover.offsetWidth / 10;
					uvft.flick = settings.outlets.cover.offsetWidth * 0.6;
				},
				move : function (event, settings) {
					// get the event properties
					event = event || window.event;
					var target = event.target || event.srcElement;
					// shortcut pointer
					var uvft = viewer.figures.touch;
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
								settings.outlets.zoom = settings.outlets.zoom / uvft.sensitivity;
							// else
							} else {
								// zoom in
								settings.outlets.zoom = settings.outlets.zoom * uvft.sensitivity;
							}
							// reset the distance
							uvft.x[0] = x[0];
							uvft.y[0] = y[0];
							uvft.x[1] = x[1];
							uvft.y[1] = y[1];
							// temporarily disable streaming for a while to avoid flooding
							settings.outlets.stream = false;
							clearTimeout(uvft.delay);
							uvft.delay = setTimeout(function () {
								settings.outlets.stream = true;
								viewer.update(settings);
							}, 500);
						// else if there was a drag motion
						} else if (settings.outlets.zoom > 1 || settings.spin === 'slideshow') {
							// calculate the drag distance into %
							settings.outlets.pan.x -= xDelta * settings.outlets.zoom / settings.outlets.figures[settings.outlets.index].offsetWidth;
							settings.outlets.pan.y -= yDelta * settings.outlets.zoom / settings.outlets.figures[settings.outlets.index].offsetHeight;
							// reset the distance
							uvft.x[0] = x[0];
							uvft.y[0] = y[0];
						// else there was a spin gesture
						} else if (
							(Math.abs(xDelta) > uvft.treshold && settings.spin === 'rotation') ||
							Math.abs(xDelta) > uvft.flick
						) {
							// increase the spin
							settings.outlets.index += (xDelta > 0) ? 1 : -1;
							// if in spin mode
							if (settings.spin === 'rotation') {
								// loop the value if needed
								if (settings.outlets.index >= settings.outlets.figures.length) {
									settings.outlets.index = 1;
								}
								// loop the value if needed
								if (settings.outlets.index <= 0) {
									settings.outlets.index = settings.outlets.figures.length - 1;
								}
							}
							// reset the distance
							uvft.x[0] = x[0];
							uvft.y[0] = y[0];
							// order a redraw
							viewer.update(settings);
						}
						// order a redraw
						viewer.update(settings);
					}
					// cancel the click
					target.blur();
					useful.events.cancel(event);
				},
				end : function (event, settings) {
					// shortcut pointer
					var uvft = viewer.figures.touch;
					// clear the positions
					uvft.x = null;
					uvft.y = null;
					// order a redraw
					viewer.update(settings);
				},
				mirror : function (event, settings) {
					// retrieve the touch position
					var pos = useful.positions.touch(event, settings.outlets.cover);
					// measure the exact location of the interaction
					settings.outlets.pos.x = pos.x;
					settings.outlets.pos.y = pos.y;
					// order a redraw
					viewer.update(settings);
					// cancel the scrolling
					useful.events.cancel(event);
				}
			}
		},
		// zoom slider
		zoom : {
			setup : function (settings) {
				// create the menu
				settings.outlets.menus = settings.outlets.menus || {};
				settings.outlets.menus.zoomMenu = document.createElement('menu');
				settings.outlets.menus.zoomMenu.className = 'slider zoom';
				settings.outlets.menus.zoomMenu.style.bottom = ((1 - settings.divide) * 100) + '%';
				// add the slider to the menu
				viewer.zoom.build.slider(settings.outlets.menus.zoomMenu, settings);
				// add a touch cover to the menu
				viewer.zoom.build.cover(settings.outlets.menus.zoomMenu, settings);
				// add the increase button
				viewer.zoom.build.increaser(settings.outlets.menus.zoomMenu, settings);
				// add the decrease button
				viewer.zoom.build.decreaser(settings.outlets.menus.zoomMenu, settings);
				// add the menu to the interface
				settings.outlets.parent.appendChild(settings.outlets.menus.zoomMenu);
			},
			build : {
				slider : function (parent, settings) {
					// add the slider to the menu
					settings.outlets.menus.zoomIndicator = (navigator.userAgent.match(/WebKit/) || true) ? document.createElement('div') : document.createElement('meter');
					settings.outlets.menus.zoomIndicator.className = 'meter';
					settings.outlets.menus.zoomIndicator.setAttribute('min', 1);
					settings.outlets.menus.zoomIndicator.setAttribute('max', settings.heights[settings.outlets.index] / settings.outlets.canvas.offsetHeight);
					settings.outlets.menus.zoomIndicator.setAttribute('value', settings.outlets.zoom);
					settings.outlets.menus.zoomSlider = document.createElement('div');
					settings.outlets.menus.zoomSliderIcon = document.createElement('span');
					settings.outlets.menus.zoomSliderIcon.innerHTML = settings.outlets.zoom;
					settings.outlets.menus.zoomSlider.appendChild(settings.outlets.menus.zoomSliderIcon);
					settings.outlets.menus.zoomIndicator.appendChild(settings.outlets.menus.zoomSlider);
					parent.appendChild(settings.outlets.menus.zoomIndicator);
				},
				cover : function (parent, settings) {
					// add a touch cover to the menu
					settings.outlets.menus.zoomCover = document.createElement('div');
					settings.outlets.menus.zoomCover.className = 'cover';
					parent.appendChild(settings.outlets.menus.zoomCover);
					var simz = settings.outlets.menus.zoomCover;
					if (simz.addEventListener) {
						simz.addEventListener('mousewheel', function (event) {
							viewer.zoom.mouse.wheel(event, settings);
						}, false);
					} else {
						simz.attachEvent('onmousewheel', function (event) {
							viewer.zoom.mouse.wheel(event, settings);
						});
					}
					if (simz.addEventListener) {
						simz.addEventListener('DOMMouseScroll', function (event) {
							viewer.zoom.mouse.wheel(event, settings);
						}, false);
					}
					simz.onmousedown = function (event) {
						viewer.zoom.mouse.start(event, settings);
					};
					simz.onmousemove = function (event) {
						viewer.zoom.mouse.move(event, settings);
					};
					simz.onmouseup = function (event) {
						viewer.zoom.mouse.end(event, settings);
					};
					simz.onmouseout = function (event) {
						viewer.zoom.mouse.end(event, settings);
					};
					// add the touch events
					simz.ontouchstart = function (event) {
						viewer.zoom.touch.start(event, settings);
					};
					simz.ontouchmove = function (event) {
						viewer.zoom.touch.move(event, settings);
					};
					simz.ontouchend = function (event) {
						viewer.zoom.touch.end(event, settings);
					};
				},
				increaser : function (parent, settings) {
					// add the increase button
					settings.outlets.menus.zoomIn = document.createElement('button');
					settings.outlets.menus.zoomIn.className = 'increase';
					settings.outlets.menus.zoomInIcon = document.createElement('span');
					settings.outlets.menus.zoomInIcon.innerHTML = 'Zoom in';
					settings.outlets.menus.zoomIn.appendChild(settings.outlets.menus.zoomInIcon);
					parent.appendChild(settings.outlets.menus.zoomIn);
					settings.outlets.menus.zoomIn.onmousedown = function (event) {
						// increase the zoom
						viewer.zoom.increase(event, settings);
						// cancel streaming
						settings.outlets.stream = false;
						// repeat
						settings.outlets.menus.zoomInRepeat = setInterval(function () { viewer.zoom.increase(event, settings); }, 300);
					};
					settings.outlets.menus.zoomIn.onmouseup = function () {
						// stop repeating
						clearInterval(settings.outlets.menus.zoomInRepeat);
						// allow streaming
						settings.outlets.stream = true;
						// redraw
						viewer.update(settings);
					};
					settings.outlets.menus.zoomIn.onclick = function (event) {
						// cancel this event
						useful.events.cancel(event);
					};
				},
				decreaser : function (parent, settings) {
					// add the decrease button
					settings.outlets.menus.zoomOut = document.createElement('button');
					settings.outlets.menus.zoomOut.className = 'decrease';
					settings.outlets.menus.zoomOutIcon = document.createElement('span');
					settings.outlets.menus.zoomOutIcon.innerHTML = 'Zoom out';
					settings.outlets.menus.zoomOut.appendChild(settings.outlets.menus.zoomOutIcon);
					parent.appendChild(settings.outlets.menus.zoomOut);
					settings.outlets.menus.zoomOut.onmousedown = function (event) {
						// increase the zoom
						viewer.zoom.decrease(event, settings);
						// cancel streaming
						settings.outlets.stream = false;
						// repeat
						settings.outlets.menus.zoomOutRepeat = setInterval(function () { viewer.zoom.decrease(event, settings); }, 300);
					};
					settings.outlets.menus.zoomOut.onmouseup = function () {
						// stop repeating
						clearInterval(settings.outlets.menus.zoomOutRepeat);
						// allow streaming
						settings.outlets.stream = true;
						// redraw
						viewer.update(settings);
					};
					settings.outlets.menus.zoomOut.onclick = function (event) {
						// cancel this event
						useful.events.cancel(event);
					};
				}
			},
			update : function (settings) {
				// gather the constants
				var minZoom = 1,
					maxZoom = settings.heights[settings.outlets.index] / settings.outlets.canvas.offsetHeight,
					curZoom = settings.outlets.zoom;
				// update the value
				settings.outlets.menus.zoomIndicator.setAttribute('value', curZoom);
				settings.outlets.menus.zoomSliderIcon.innerHTML = curZoom;
				// reposition the slider
				settings.outlets.menus.zoomSlider.style.top = (100 - (curZoom - minZoom) / (maxZoom - minZoom) * 100) + '%';
			},
			increase : function (event, settings) {
				// increase the zoom factor
				settings.outlets.zoom = settings.outlets.zoom * settings.magnification;
				// order a redraw
				viewer.update(settings);
				// cancel the click
				useful.events.cancel(event);
			},
			decrease : function (event, settings) {
				// decrease the zoom factor
				settings.outlets.zoom = settings.outlets.zoom / settings.magnification;
				// order a redraw
				viewer.update(settings);
				// cancel the click
				useful.events.cancel(event);
			},
			// mouse controls
			mouse : {
				y : null,
				distance : null,
				sensitivity : null,
				fudge : 1.1,
				// mouse wheel controls
				wheel : function (event, settings) {
					// get the reading from the mouse wheel
					var distance = (window.event) ? window.event.wheelDelta / 120 : -event.detail / 3;
					// do not loop around
					if (distance < 0) {
						// increase the zoom factor
						settings.outlets.zoom = settings.outlets.zoom * settings.magnification;
					} else if (distance > 0) {
						// decrease the zoom factor
						settings.outlets.zoom = settings.outlets.zoom / settings.magnification;
					}
					// call for a redraw
					viewer.update(settings);
					// cancel the scrolling
					useful.events.cancel(event);
				},
				// mouse gesture controls
				start : function (event, settings) {
					// get the event properties
					event = event || window.event;
					// shortcut pointer
					var uvzm = viewer.zoom.mouse;
					// store the touch positions
					uvzm.y = event.pageY || event.y;
					uvzm.distance = settings.outlets.menus.zoomCover.offsetHeight - settings.outlets.menus.zoomIn.offsetHeight - settings.outlets.menus.zoomOut.offsetHeight;
					uvzm.sensitivity = settings.heights[settings.outlets.index] / settings.outlets.canvas.offsetHeight - 1;
					// cancel the click
					useful.events.cancel(event);
				},
				move : function (event, settings) {
					// get the event properties
					event = event || window.event;
					// shortcut pointer
					var uvzm = viewer.zoom.mouse;
					// if there is a touch in progress
					if (uvzm.y !== null) {
						// store the touch positions
						var y = event.pageY || event.y;
						// calculate the drag distance into %
						settings.outlets.zoom += (uvzm.y - y) / uvzm.distance * uvzm.sensitivity * uvzm.fudge;
						// reset the distance
						uvzm.y = y;
						// disable streaming new images
						settings.outlets.stream = false;
						// order a redraw
						viewer.update(settings);
					}
					// cancel the click
					useful.events.cancel(event);
				},
				end : function (event, settings) {
					// get the event properties
					event = event || window.event;
					// shortcut pointer
					var uvzm = viewer.zoom.mouse;
					// clear the positions
					uvzm.y = null;
					// enable streaming new images
					settings.outlets.stream = true;
					// order a redraw
					viewer.update(settings);
					// cancel the click
					useful.events.cancel(event);
				}
			},
			// touch screen controls
			touch : {
				y : null,
				distance : null,
				sensitivity : null,
				fudge : 1.1,
				start : function (event, settings) {
					// shortcut pointer
					var uvzt = viewer.zoom.touch;
					// store the touch positions
					uvzt.y = [];
					for (var a = 0, b = event.touches.length; a < b; a += 1) {
						uvzt.y.push(event.touches[a].pageY);
					}
					// calculate the sensitivity
					uvzt.distance = settings.outlets.menus.zoomCover.offsetHeight - settings.outlets.menus.zoomIn.offsetHeight - settings.outlets.menus.zoomOut.offsetHeight;
					uvzt.sensitivity = settings.heights[settings.outlets.index] / settings.outlets.canvas.offsetHeight - 1;
				},
				move : function (event, settings) {
					// get the event properties
					event = event || window.event;
					var target = event.target || event.srcElement;
					// shortcut pointer
					var uvzt = viewer.zoom.touch;
					// if there is a touch in progress
					if (uvzt.y !== null) {
						// store the touch positions
						var y;
						y = [];
						for (var a = 0, b = event.touches.length; a < b; a += 1) {
							y.push(event.touches[a].pageY);
						}
						// calculate the drag distance into %
						settings.outlets.zoom += (uvzt.y[0] - y[0]) / uvzt.distance * uvzt.sensitivity * uvzt.fudge;
						// reset the distance
						uvzt.y[0] = y[0];
						// disable streaming new images
						settings.outlets.stream = false;
						// order a redraw
						viewer.update(settings);
					}
					// cancel the click
					target.blur();
					useful.events.cancel(event);
				},
				end : function (event, settings) {
					// shortcut pointer
					var uvzt = viewer.zoom.touch;
					// clear the positions
					uvzt.y = null;
					// enable streaming new images
					settings.outlets.stream = true;
					// order a redraw
					viewer.update(settings);
				}
			}
		},
		// spin slider
		spin : {
			setup : function (settings) {
				// create the menu
				settings.outlets.menus = settings.outlets.menus || {};
				settings.outlets.menus.spinMenu = document.createElement('menu');
				settings.outlets.menus.spinMenu.className = 'slider spin';
				settings.outlets.menus.spinMenu.style.bottom = ((1 - settings.divide) * 100) + '%';
				// add the slider to the menu
				viewer.spin.build.slider(settings.outlets.menus.spinMenu, settings);
				// add a touch cover to the menu
				viewer.spin.build.cover(settings.outlets.menus.spinMenu, settings);
				// add the increase button
				viewer.spin.build.increaser(settings.outlets.menus.spinMenu, settings);
				// add the decrease button
				viewer.spin.build.decreaser(settings.outlets.menus.spinMenu, settings);
				// add the menu to the interface
				settings.outlets.parent.appendChild(settings.outlets.menus.spinMenu);
			},
			build : {
				slider : function (parent, settings) {
					// add the slider to the menu
					settings.outlets.menus.spinIndicator = (navigator.userAgent.match(/WebKit/) || true) ? document.createElement('div') : document.createElement('meter');
					settings.outlets.menus.spinIndicator.className = 'meter';
					settings.outlets.menus.spinIndicator.setAttribute('min', 1);
					settings.outlets.menus.spinIndicator.setAttribute('max', settings.figures.length);
					settings.outlets.menus.spinIndicator.setAttribute('value', settings.outlets.index);
					settings.outlets.menus.spinSlider = document.createElement('div');
					settings.outlets.menus.spinSliderIcon = document.createElement('span');
					settings.outlets.menus.spinSliderIcon.innerHTML = settings.outlets.index;
					settings.outlets.menus.spinSlider.appendChild(settings.outlets.menus.spinSliderIcon);
					settings.outlets.menus.spinIndicator.appendChild(settings.outlets.menus.spinSlider);
					parent.appendChild(settings.outlets.menus.spinIndicator);
				},
				cover : function (parent, settings) {
					// add a touch cover to the menu
					settings.outlets.menus.spinCover = document.createElement('div');
					settings.outlets.menus.spinCover.className = 'cover';
					parent.appendChild(settings.outlets.menus.spinCover);
					var sims = settings.outlets.menus.spinCover;
					if (sims.addEventListener) {
						sims.addEventListener('mousewheel', function (event) {
							viewer.spin.mouse.wheel(event, settings);
						}, false);
					} else {
						sims.attachEvent('onmousewheel', function (event) {
							viewer.spin.mouse.wheel(event, settings);
						});
					}
					if (sims.addEventListener) {
						sims.addEventListener('DOMMouseScroll', function (event) {
							viewer.spin.mouse.wheel(event, settings);
						}, false);
					}
					sims.onmousedown = function (event) {
						viewer.spin.mouse.start(event, settings);
					};
					sims.onmousemove = function (event) {
						viewer.spin.mouse.move(event, settings);
					};
					sims.onmouseup = function (event) {
						viewer.spin.mouse.end(event, settings);
					};
					sims.onmouseout = function (event) {
						viewer.spin.mouse.end(event, settings);
					};
					// add the touch events
					sims.ontouchstart = function (event) {
						viewer.spin.touch.start(event, settings);
					};
					sims.ontouchmove = function (event) {
						viewer.spin.touch.move(event, settings);
					};
					sims.ontouchend = function (event) {
						viewer.spin.touch.end(event, settings);
					};
				},
				increaser : function (parent, settings) {
					// add the increase button
					settings.outlets.menus.spinIn = document.createElement('button');
					settings.outlets.menus.spinIn.className = 'increase';
					settings.outlets.menus.spinInIcon = document.createElement('span');
					settings.outlets.menus.spinInIcon.innerHTML = 'Spin left';
					settings.outlets.menus.spinIn.appendChild(settings.outlets.menus.spinInIcon);
					parent.appendChild(settings.outlets.menus.spinIn);
					settings.outlets.menus.spinIn.onmousedown = function (event) {
						// increase the zoom
						viewer.spin.increase(event, settings);
						// cancel streaming
						settings.outlets.stream = false;
						// repeat
						settings.outlets.menus.spinInRepeat = setInterval(function () { viewer.spin.increase(event, settings); }, 300);
					};
					settings.outlets.menus.spinIn.onmouseup = function () {
						// stop repeating
						clearInterval(settings.outlets.menus.spinInRepeat);
						// allow streaming
						settings.outlets.stream = true;
						// redraw
						viewer.update(settings);
					};
				},
				decreaser : function (parent, settings) {
					// add the decrease button
					settings.outlets.menus.spinOut = document.createElement('button');
					settings.outlets.menus.spinOut.className = 'decrease';
					settings.outlets.menus.spinOutIcon = document.createElement('span');
					settings.outlets.menus.spinOutIcon.innerHTML = 'Spin right';
					settings.outlets.menus.spinOut.appendChild(settings.outlets.menus.spinOutIcon);
					parent.appendChild(settings.outlets.menus.spinOut);
					settings.outlets.menus.spinOut.onmousedown = function (event) {
						// increase the zoom
						viewer.spin.decrease(event, settings);
						// cancel streaming
						settings.outlets.stream = false;
						// repeat
						settings.outlets.menus.spinOutRepeat = setInterval(function () { viewer.spin.decrease(event, settings); }, 300);
					};
					settings.outlets.menus.spinOut.onmouseup = function () {
						// stop repeating
						clearInterval(settings.outlets.menus.spinOutRepeat);
						// allow streaming
						settings.outlets.stream = true;
						// redraw
						viewer.update(settings);
					};
				}
			},
			update : function (settings) {
				// reposition the slider
				settings.outlets.menus.spinSlider.style.left = ((settings.outlets.index - 1) / (settings.outlets.figures.length - 2) * 100) + '%';
				// update the value
				settings.outlets.menus.spinIndicator.setAttribute('value', settings.outlets.index);
				settings.outlets.menus.spinSliderIcon.innerHTML = settings.outlets.index;
			},
			increase : function (event, settings) {
				// decrease the spin index
				settings.outlets.index -= 1;
				// loop the value if needed
				if (settings.outlets.index <= 0) {
					settings.outlets.index = settings.outlets.figures.length - 1;
				}
				// order a redraw
				viewer.update(settings);
				// cancel the click
				useful.events.cancel(event);
			},
			decrease : function (event, settings) {
				// increase the spin index
				settings.outlets.index += 1;
				// loop the value if needed
				if (settings.outlets.index >= settings.outlets.figures.length) {
					settings.outlets.index = 1;
				}
				// order a redraw
				viewer.update(settings);
				// cancel the click
				useful.events.cancel(event);
			},
			// mouse wheel controls
			mouse : {
				x : null,
				sensitivity : null,
				fudge : 0.7,
				// mouse wheel controls
				wheel : function (event, settings) {
					// shortcut pointer
					var uvs = viewer.spin;
					// get the reading from the mouse wheel
					var distance = (window.event) ? window.event.wheelDelta / 120 : -event.detail / 3;
					// do not loop around
					if (distance < 0) {
						// increase the spin index
						uvs.increase(event, settings);
					} else if (distance > 0) {
						// decrease the spin index
						uvs.decrease(event, settings);
					}
				},
				// mouse gesture controls
				start : function (event, settings) {
					// get the event properties
					event = event || window.event;
					// shortcut pointer
					var uvsm = viewer.spin.mouse;
					// store the touch positions
					uvsm.x = event.pageX || event.x;
					// calculate the sensitivity
					uvsm.sensitivity = (settings.outlets.menus.spinCover.offsetWidth - settings.outlets.menus.spinIn.offsetWidth - settings.outlets.menus.spinOut.offsetWidth) / settings.outlets.figures.length * uvsm.fudge;
					// cancel the click
					useful.events.cancel(event);
				},
				move : function (event, settings) {
					// get the event properties
					event = event || window.event;
					// shortcut pointer
					var uvsm = viewer.spin.mouse;
					// if there is a touch in progress
					if (uvsm.x !== null) {
						// store the touch positions
						var x = event.pageX || event.x;
						var distance = uvsm.x - x;
						// if the draw was to the left
						if (distance < -uvsm.sensitivity) {
							// increase the spin index
							settings.outlets.index += 1;
							// reset the distance
							uvsm.x = x;
							// order a redraw
							viewer.update(settings);
						// else if the drag was to the right
						} else if (distance > uvsm.sensitivity) {
							// decrease the spin index
							settings.outlets.index -= 1;
							// reset the distance
							uvsm.x = x;
							// order a redraw
							viewer.update(settings);
						}
					}
					// cancel the click
					useful.events.cancel(event);
				},
				end : function (event) {
					// get the event properties
					event = event || window.event;
					// shortcut pointer
					var uvsm = viewer.spin.mouse;
					// clear the positions
					uvsm.x = null;
					// cancel the click
					useful.events.cancel(event);
				}
			},
			// touch screen controls
			touch : {
				x : null,
				sensitivity : null,
				// mouse gesture controls
				start : function (event, settings) {
					// get the event properties
					event = event || window.event;
					// shortcut pointer
					var uvst = viewer.spin.touch;
					// store the touch positions
					uvst.x = [];
					for (var a = 0, b = event.touches.length; a < b; a += 1) {
						uvst.x.push(event.touches[a].pageX);
					}
					// calculate the sensitivity
					uvst.sensitivity = (settings.outlets.menus.spinCover.offsetWidth - settings.outlets.menus.spinIn.offsetWidth - settings.outlets.menus.spinOut.offsetWidth) / settings.outlets.figures.length;
					// cancel the click
					useful.events.cancel(event);
				},
				move : function (event, settings) {
					// get the event properties
					event = event || window.event;
					// shortcut pointer
					var uvst = viewer.spin.touch;
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
							settings.outlets.index += 1;
							// loop the value if needed
							if (settings.outlets.index >= settings.outlets.figures.length) {
								settings.outlets.index = 1;
							}
							// reset the distance
							uvst.x[0] = x[0];
							// order a redraw
							viewer.update(settings);
						// else if the drag was to the right
						} else if (distance > uvst.sensitivity) {
							// decrease the spin index
							settings.outlets.index -= 1;
							// loop the value if needed
							if (settings.outlets.index <= 0) {
								settings.outlets.index = settings.outlets.figures.length - 1;
							}
							// reset the distance
							uvst.x[0] = x[0];
							// order a redraw
							viewer.update(settings);
						}
					}
				},
				end : function (event) {
					// get the event properties
					event = event || window.event;
					// shortcut pointer
					var uvst = viewer.spin.touch;
					// clear the positions
					uvst.x = null;
					// cancel the click
					useful.events.cancel(event);
				}
			}
		},
		// manages the thumbnails
		thumbnails : {
			// build the thumbnail list
			setup : function (settings) {
				// create the navigation bar
				settings.outlets.slideNav = document.createElement('nav');
				settings.outlets.slideNav.className = 'thumbnails';
				settings.outlets.slideDiv = document.createElement('div');
				settings.outlets.slideUl = document.createElement('ul');
				// force the height of the nav if desired
				if (settings.divide) {
					settings.outlets.slideNav.style.height = (100 - (settings.divide * 100) - parseInt(settings.margin, 10)) + '%';
				}
				if (settings.margin) {
					settings.pixelMargin = parseInt(settings.outlets.parent.offsetWidth * parseInt(settings.margin, 10) / 100, 10);
				}
				// for all thumbnails in the settings
				settings.outlets.thumbnails = [0];
				for (var a = 1; a < settings.thumbnails.length; a += 1) {
					// create a new thumbnail
					var newLi = document.createElement('li');
					var newA = document.createElement('a');
					newA.className = (a === 1) ? settings.navigation + '_active' : settings.navigation + '_passive';
					var newImage = document.createElement('img');
					newImage.style.marginRight = settings.pixelMargin + 'px';
					newImage.alt = '';
					newImage.src = settings.thumbnails[a];
					newImage.style.borderColor = settings.highlight;
					newA.appendChild(newImage);
					newA.style.borderColor = settings.highlight;
					newLi.appendChild(newA);
					// insert the new nodes
					settings.outlets.slideUl.appendChild(newLi);
					// store the dom pointers to the images
					settings.outlets.thumbnails[a] = newA;
				}
				// insert the navigation bar
				settings.outlets.slideDiv.appendChild(settings.outlets.slideUl);
				settings.outlets.slideNav.appendChild(settings.outlets.slideDiv);
				settings.outlets.parent.appendChild(settings.outlets.slideNav);
				// for all thumbnails in the settings
				for (a = 1; a < settings.thumbnails.length; a += 1) {
					// assign the event handler
					viewer.thumbnails.events.thumbnailClick(settings.outlets.thumbnails[a], settings);
				}
				// start the menu
				viewer.thumbnails.menu.setup(settings);
			},
			// event handlers
			events : {
				thumbnailClick : function (element, settings) {
					element.onclick = function (event) {
						viewer.thumbnails.set(event, element, settings);
					};
				}
			},
			// redraw/recentre the thumbnails according to the settings
			update : function (settings) {
				// update the thumbnails menu
				viewer.thumbnails.menu.update(settings);
				// highlight the active slide
				for (var a = 1; a < settings.thumbnails.length; a += 1) {
					settings.outlets.thumbnails[a].className = (settings.outlets.index === a) ? settings.navigation + '_active' : settings.navigation + '_passive';
					settings.outlets.thumbnails[a].style.backgroundColor = (settings.outlets.index === a) ? settings.highlight : 'Transparent';
				}
				// scroll the slider enough to center the active slide
				var activeThumbnail = settings.outlets.thumbnails[settings.outlets.index].getElementsByTagName('img')[0];
				var activePosition = activeThumbnail.offsetLeft;
				var activeWidth = activeThumbnail.offsetWidth;
				var scrollDistance = settings.outlets.slideDiv.offsetWidth;
				var centeredPosition = -1 * activePosition + scrollDistance / 2 - activeWidth / 2;
				centeredPosition = (centeredPosition > 0) ? 0 : centeredPosition;
				centeredPosition = (centeredPosition < settings.scrollMax && settings.scrollMax < 0) ? settings.scrollMax : centeredPosition;
				// transition to the new position
				if (settings.navigation === 'thumbnails') {
					useful.css.setRules(settings.outlets.slideUl, {'marginLeft' : centeredPosition + 'px'});
				}
			},
			// activate a corresponding figure
			set : function (event, node, settings) {
				// get the event properties
				event = event || window.event;
				// count which thumbnail this is
				for (var a = 1; a < settings.outlets.thumbnails.length; a += 1) {
					if (settings.outlets.thumbnails[a] === node) {
						// change the index to this slide
						settings.outlets.index = a;
						// reset the zoom
						settings.outlets.zoom = (settings.zoom !== 'static') ? 999 : 1;
						// redraw all
						viewer.update(settings);
					}
				}
				// cancel the click
				useful.events.cancel(event);
			},
			// manages the thumbnail controls
			menu : {
				// build the menu options
				setup : function (settings) {
					// create the thumbnail controls
					settings.outlets.pageMenu = document.createElement('menu');
					settings.outlets.pageMenu.className = 'scroller';
					settings.outlets.nextPage = document.createElement('button');
					settings.outlets.nextPage.className = 'next';
					settings.outlets.nextPageIcon = document.createElement('span');
					settings.outlets.nextPageIcon.innerHTML = '&gt';
					settings.outlets.prevPage = document.createElement('button');
					settings.outlets.prevPage.className = 'previous';
					settings.outlets.prevPageIcon = document.createElement('span');
					settings.outlets.prevPageIcon.innerHTML = '&lt';
					settings.outlets.nextPage.appendChild(settings.outlets.nextPageIcon);
					settings.outlets.pageMenu.appendChild(settings.outlets.nextPage);
					settings.outlets.prevPage.appendChild(settings.outlets.prevPageIcon);
					settings.outlets.pageMenu.appendChild(settings.outlets.prevPage);
					settings.outlets.slideNav.appendChild(settings.outlets.pageMenu);
					// apply clicks to the thumbnail controls
					settings.outlets.nextPage.onclick = function (event) {
						viewer.thumbnails.menu.next(event, settings.outlets.nextSlide, settings);
					};
					settings.outlets.prevPage.onclick = function (event) {
						viewer.thumbnails.menu.prev(event, settings.outlets.prevSlide, settings);
					};
				},
				// show or hide the previous and next buttons
				update : function (settings) {
					// calculate the current position
					settings.scrollPosition = (settings.outlets.slideUl.style.marginLeft) ? parseInt(settings.outlets.slideUl.style.marginLeft, 10) : 0;
					settings.scrollDistance = settings.outlets.slideDiv.offsetWidth;
					// calculate the minimum position
					settings.scrollMin = 0;
					// calculate the maximum position
					var lastThumbnail = settings.outlets.thumbnails[settings.outlets.thumbnails.length - 1].getElementsByTagName('img')[0];
					settings.scrollStep = lastThumbnail.offsetWidth;
					settings.scrollMax = -1 * (lastThumbnail.offsetLeft + lastThumbnail.offsetWidth) + settings.scrollDistance;
					// show or hide the prev button
					settings.outlets.prevPage.className = settings.outlets.prevPage.className.replace(/ disabled/gi, '');
					settings.outlets.prevPage.className += (settings.scrollPosition >= settings.scrollMin) ? ' disabled' : '';
					// show or hide the next button
					settings.outlets.nextPage.className = settings.outlets.nextPage.className.replace(/ disabled/gi, '');
					settings.outlets.nextPage.className += (settings.scrollPosition <= settings.scrollMax && settings.scrollMax < 0) ? ' disabled' : '';
				},
				// show the next page of thumbnails
				next : function (event, node, settings) {
					// get the event properties
					event = event || window.event;
					var target = event.target || event.srcElement;
					// if the button is not disabled
					if (!target.className.match(/disabled/)) {
						// scroll one page's width of thumbnails
						var newPosition = settings.scrollPosition - settings.scrollDistance + settings.scrollStep;
						// limit the scroll distance
						if (newPosition < settings.scrollMax) {
							newPosition = settings.scrollMax;
						}
						// transition to the new position
						useful.css.setRules(settings.outlets.slideUl, {'marginLeft' : newPosition + 'px'});
						// redraw the menu buttons
						viewer.thumbnails.menu.update(settings);
					}
					// cancel the click
					target.blur();
					useful.events.cancel(event);
				},
				// show the previous page of thumbnails
				prev : function (event, node, settings) {
					// get the event properties
					event = event || window.event;
					var target = event.target || event.srcElement;
					// if the button is not disabled
					if (!target.className.match(/disabled/)) {
						// scroll one page's width of thumbnails
						var newPosition = settings.scrollPosition + settings.scrollDistance - settings.scrollStep;
						// limit the scroll distance
						if (newPosition > 0) {
							newPosition = 0;
						}
						// transition to the new position
						if (settings.navigation === 'thumbnails') {
							useful.css.setRules(settings.outlets.slideUl, {'marginLeft' : newPosition + 'px'});
						}
						// redraw the menu buttons
						viewer.thumbnails.menu.update(settings);
					}
					// cancel the click
					target.blur();
					useful.events.cancel(event);
				}
			}
		},
		leaf : {
			// build the leafing toolbar
			setup : function (settings) {
				// create the menu
				settings.outlets.menus = settings.outlets.menus || {};
				settings.outlets.menus.leafMenu = document.createElement('menu');
				settings.outlets.menus.leafMenu.className = 'slider leaf';
				settings.outlets.menus.leafMenu.style.bottom = ((1 - settings.divide) * 100) + '%';
				// create the page indicator
				viewer.leaf.build.indicator(settings.outlets.menus.leafMenu, settings);
				// create the reset button
				viewer.leaf.build.resetter(settings.outlets.menus.leafMenu, settings);
				// create the next button
				viewer.leaf.build.increaser(settings.outlets.menus.leafMenu, settings);
				// create the previous button
				viewer.leaf.build.decreaser(settings.outlets.menus.leafMenu, settings);
				// add the menu to the interface
				settings.outlets.parent.appendChild(settings.outlets.menus.leafMenu);
			},
			build : {
				indicator : function (parent, settings) {
					// create the page indicator
					settings.outlets.menus.leafPage = document.createElement('form');
					settings.outlets.menus.leafPageInput = document.createElement('input');
					settings.outlets.menus.leafPageInput.setAttribute('type', 'text');
					settings.outlets.menus.leafPageCount = document.createElement('span');
					settings.outlets.menus.leafPageCount.className = 'count';
					settings.outlets.menus.leafPageSubmit = document.createElement('button');
					settings.outlets.menus.leafPageSubmit.setAttribute('type', 'submit');
					settings.outlets.menus.leafPageSubmit.style.position = 'absolute';
					settings.outlets.menus.leafPageSubmit.style.left = '-999em';
					settings.outlets.menus.leafPage.appendChild(settings.outlets.menus.leafPageInput);
					settings.outlets.menus.leafPage.appendChild(settings.outlets.menus.leafPageCount);
					parent.appendChild(settings.outlets.menus.leafPage);
					settings.outlets.menus.leafPageInput.onchange = function (event) {
						viewer.leaf.typed(event, settings);
					};
					settings.outlets.menus.leafPage.onsubmit = function (event) {
						viewer.leaf.typed(event, settings);
						useful.events.cancel(event);
					};
				},
				resetter : function (parent, settings) {
					// create the reset button
					settings.outlets.menus.leafReset = document.createElement('button');
					settings.outlets.menus.leafReset.className = 'reset';
					settings.outlets.menus.leafResetIcon = document.createElement('span');
					settings.outlets.menus.leafResetIcon.innerHTML = 'Reset view';
					settings.outlets.menus.leafReset.appendChild(settings.outlets.menus.leafResetIcon);
					parent.appendChild(settings.outlets.menus.leafReset);
					settings.outlets.menus.leafReset.onclick = function (event) {
						viewer.leaf.reset(event, settings);
					};
				},
				increaser : function (parent, settings) {
					// create the next button
					settings.outlets.menus.leafIn = document.createElement('button');
					settings.outlets.menus.leafIn.className = 'increase';
					settings.outlets.menus.leafInIcon = document.createElement('span');
					settings.outlets.menus.leafInIcon.innerHTML = 'Leaf forward';
					settings.outlets.menus.leafIn.appendChild(settings.outlets.menus.leafInIcon);
					parent.appendChild(settings.outlets.menus.leafIn);
					settings.outlets.menus.leafIn.onclick = function (event) {
						viewer.leaf.increase(event, settings);
					};
				},
				decreaser : function (parent, settings) {
					// create the previous button
					settings.outlets.menus.leafOut = document.createElement('button');
					settings.outlets.menus.leafOut.className = 'decrease';
					settings.outlets.menus.leafOutIcon = document.createElement('span');
					settings.outlets.menus.leafOutIcon.innerHTML = 'Leaf back';
					settings.outlets.menus.leafOut.appendChild(settings.outlets.menus.leafOutIcon);
					parent.appendChild(settings.outlets.menus.leafOut);
					settings.outlets.menus.leafOut.onclick = function (event) {
						viewer.leaf.decrease(event, settings);
					};
				}
			},
			// updates the leafing toolbar
			update : function (settings) {
				// fill in the current page
				settings.outlets.menus.leafPageInput.value = settings.outlets.index;
				// fill in the page total
				settings.outlets.menus.leafPageCount.innerHTML = 'of ' +	(settings.outlets.figures.length - 1);
			},
			increase : function (event, settings) {
				// decrease the spin index
				settings.outlets.index += 1;
				// look if needed
				if (settings.toolbars === 'buttons') {
					// loop the value if needed
					if (settings.outlets.index >= settings.outlets.figures.length) {
						settings.outlets.index = 1;
					}
					// loop the value if needed
					if (settings.outlets.index <= 0) {
						settings.outlets.index = settings.outlets.figures.length - 1;
					}
				}
				// redraw
				viewer.update(settings);
				// cancel the click
				useful.events.cancel(event);
			},
			decrease : function (event, settings) {
				// decrease the spin index
				settings.outlets.index -= 1;
				// redraw
				viewer.update(settings);
				// cancel the click
				useful.events.cancel(event);
			},
			typed : function (event, settings) {
				// get the typed number
				var number = parseInt(settings.outlets.menus.leafPageInput.value, 10);
				// if the typed number is acceptable
				if (!isNaN(number)) {
					// accept the value
					settings.outlets.index = number;
				}
				// update the interface
				viewer.update(settings);
			},
			reset : function (event, settings) {
				// reset the zoom level
				settings.outlets.zoom = (settings.zoom !== 'static') ? 999 : 1;
				// redraw
				viewer.update(settings);
				// cancel the click
				useful.events.cancel(event);
			}
		},
		// minimal superset of controls
		toolbar : {
			setup : function (settings) {
				// create the menu
				settings.outlets.menus = settings.outlets.menus || {};
				settings.outlets.menus.toolbarNav = document.createElement('nav');
				settings.outlets.menus.toolbarNav.className = settings.toolbars + ' ' + settings.spin;
				settings.outlets.menus.toolbarNav.style.bottom = ((1 - settings.divide) * 100) + '%';
				// add the zoom buttons
				settings.outlets.menus.toolbarZoom = document.createElement('menu');
				settings.outlets.menus.toolbarZoom.className = 'zoom';
				viewer.zoom.build.increaser(settings.outlets.menus.toolbarZoom, settings);
				viewer.zoom.build.decreaser(settings.outlets.menus.toolbarZoom, settings);
				settings.outlets.menus.toolbarNav.appendChild(settings.outlets.menus.toolbarZoom);
				// setup the right toolbar
				switch (settings.spin) {
				case 'rotation' :
					// create the menu
					settings.outlets.menus.toolbarSpin = document.createElement('menu');
					settings.outlets.menus.toolbarSpin.className = 'spin';
					// add the spin buttons
					viewer.spin.build.decreaser(settings.outlets.menus.toolbarSpin, settings);
					viewer.spin.build.increaser(settings.outlets.menus.toolbarSpin, settings);
					// add the menu to the toolbar
					settings.outlets.menus.toolbarNav.appendChild(settings.outlets.menus.toolbarSpin);
					break;
				case 'slideshow' :
					// create the menu
					settings.outlets.menus.toolbarLeaf = document.createElement('menu');
					settings.outlets.menus.toolbarLeaf.className = 'leaf';
					// add the previous button
					viewer.leaf.build.decreaser(settings.outlets.menus.toolbarLeaf, settings);
					// add the next button
					viewer.leaf.build.increaser(settings.outlets.menus.toolbarLeaf, settings);
					// add the menu to the toolbar
					settings.outlets.menus.toolbarNav.appendChild(settings.outlets.menus.toolbarLeaf);
					break;
				case 'catalogue' :
					// create the menu
					settings.outlets.menus.toolbarLeaf = document.createElement('menu');
					settings.outlets.menus.toolbarLeaf.className = 'leaf';
					// add the reset button
					viewer.leaf.build.resetter(settings.outlets.menus.toolbarLeaf, settings);
					// add the indicator display
					viewer.leaf.build.indicator(settings.outlets.menus.toolbarLeaf, settings);
					// add the previous button
					viewer.leaf.build.decreaser(settings.outlets.menus.toolbarLeaf, settings);
					// add the next button
					viewer.leaf.build.increaser(settings.outlets.menus.toolbarLeaf, settings);
					// add the reset button
					//viewer.leaf.build.resetter(settings.outlets.menus.toolbarLeaf, settings);
					// add the menu to the toolbar
					settings.outlets.menus.toolbarNav.appendChild(settings.outlets.menus.toolbarLeaf);
					break;
				}
				// add the menu to the interface
				settings.outlets.parent.appendChild(settings.outlets.menus.toolbarNav);
			},
			update : function (settings) {
				// hide/show the zoom out button
				settings.outlets.menus.zoomIn.className = settings.outlets.menus.zoomIn.className.replace(/ disabled/gi, '');
				settings.outlets.menus.zoomIn.className += (settings.outlets.atMaxZoom) ? ' disabled' : '';
				// hide/show the zoom in button
				settings.outlets.menus.zoomOut.className = settings.outlets.menus.zoomOut.className.replace(/ disabled/gi, '');
				settings.outlets.menus.zoomOut.className += (settings.outlets.atMinZoom) ? ' disabled' : '';
				// update the right toolbar
				switch (settings.spin) {
				case 'rotation' :
					break;
				case 'slideshow' :
					// hide/show the previous button
					settings.outlets.menus.leafIn.className = settings.outlets.menus.leafIn.className.replace(/ disabled/gi, '');
					settings.outlets.menus.leafIn.className += (settings.outlets.atMaxLeaf) ? ' disabled' : '';
					// hide/show the next button
					settings.outlets.menus.leafOut.className = settings.outlets.menus.leafOut.className.replace(/ disabled/gi, '');
					settings.outlets.menus.leafOut.className += (settings.outlets.atMinLeaf) ? ' disabled' : '';
					break;
				case 'catalogue' :
					// fill in the current page
					settings.outlets.menus.leafPageInput.value = settings.outlets.index;
					// fill in the page total
					settings.outlets.menus.leafPageCount.innerHTML = 'of ' +	(settings.outlets.figures.length - 1);
					break;
				}
			}
		}
	};

	// public functions
	useful.events = useful.events || {};
	useful.events.add = function (element, eventName, eventHandler) {
		// exceptions
		eventName = (navigator.userAgent.match(/Firefox/i) && eventName.match(/mousewheel/i)) ? 'DOMMouseScroll' : eventName;
		// prefered method
		if ('addEventListener' in element) {
			element.addEventListener(eventName, eventHandler, false);
		}
		// alternative method
		else if ('attachEvent' in element) {
			element.attachEvent('on' + eventName, function (event) { eventHandler(event); });
		}
		// desperate method
		else {
			element['on' + eventName] = eventHandler;
		}
	};
	useful.events.cancel = function (event) {
		if (event) {
			if (event.preventDefault) { event.preventDefault(); }
			else if (event.preventManipulation) { event.preventManipulation(); }
			else { event.returnValue = false; }
		}
	};

	useful.models = useful.models || {};
	useful.models.clone = function (model) {
		var clonedModel, ClonedModel;
		// if the method exists
		if (typeof(Object.create) !== 'undefined') {
			clonedModel = Object.create(model);
		}
		// else use a fall back
		else {
			ClonedModel = function () {};
			ClonedModel.prototype = model;
			clonedModel = new ClonedModel();
		}
		// return the clone
		return clonedModel;
	};

	useful.css = useful.css || {};
	useful.css.select = function (input, parent) {
		var a, b, elements;
		// validate the input
		parent = parent || document;
		input = (typeof input === 'string') ? {'rule' : input, 'parent' : parent} : input;
		input.parent = input.parent || document;
		input.data = input.data || {};
		// use querySelectorAll to select elements, or defer to jQuery
		elements = (typeof(document.querySelectorAll) !== 'undefined') ?
			input.parent.querySelectorAll(input.rule) :
			(typeof(jQuery) !== 'undefined') ? jQuery(input.parent).find(input.rule).get() : [];
		// if there was a handler
		if (typeof(input.handler) !== 'undefined') {
			// for each element
			for (a = 0 , b = elements.length; a < b; a += 1) {
				// run the handler and pass a unique copy of the data (in case it's a model)
				input.handler(elements[a], useful.models.clone(input.data));
			}
		// else assume the function was called for a list of elements
		} else {
			// return the selected elements
			return elements;
		}
	};
	useful.css.compatibility = function () {
		var eventName, newDiv, empty;
		// create a test div
		newDiv = document.createElement('div');
		// use various tests for transition support
		if (typeof(newDiv.style.MozTransition) !== 'undefined') { eventName = 'transitionend'; }
		try { document.createEvent('OTransitionEvent'); eventName = 'oTransitionEnd'; } catch (e) { empty = null; }
		try { document.createEvent('WebKitTransitionEvent'); eventName = 'webkitTransitionEnd'; } catch (e) { empty = null; }
		try { document.createEvent('transitionEvent'); eventName = 'transitionend'; } catch (e) { empty = null; }
		// remove the test div
		newDiv = empty;
		// pass back working event name
		return eventName;
	};
	useful.css.prefix = function (property) {
		// pick the prefix that goes with the browser
		return (navigator.userAgent.match(/webkit/gi)) ? 'webkit' + property.substr(0, 1).toUpperCase() + property.substr(1):
			(navigator.userAgent.match(/firefox/gi)) ? 'Moz' + property.substr(0, 1).toUpperCase() + property.substr(1):
			(navigator.userAgent.match(/microsoft/gi)) ? 'ms' + property.substr(0, 1).toUpperCase() + property.substr(1):
			(navigator.userAgent.match(/opera/gi)) ? 'O' + property.substr(0, 1).toUpperCase() + property.substr(1):
			property;
	};
	useful.css.setRules = function (element, rules, endEventHandler) {
		var rule, endEventName, endEventFunction;
		// validate the input
		rules.transitionProperty = rules.transitionProperty || 'all';
		rules.transitionDuration = rules.transitionDuration || '300ms';
		rules.transitionTimingFunction = rules.transitionTimingFunction || 'ease';
		endEventHandler = endEventHandler || function () {};
		endEventName = useful.css.compatibility();
		// if CSS3 transitions are available
		if (typeof endEventName !== 'undefined') {
			// set the onComplete handler and immediately remove it afterwards
			element.addEventListener(endEventName, endEventFunction = function () {
				endEventHandler();
				element.removeEventListener(endEventName, endEventFunction, true);
			}, true);
			// for all rules
			for (rule in rules) {
				if (rules.hasOwnProperty(rule)) {
					// implement the prefixed value
					element.style[useful.css.compatibility(rule)] = rules[rule];
					// implement the value
					element.style[rule] = rules[rule];
				}
			}
		// else if jQuery is available
		} else if (typeof jQuery !== 'undefined') {
			var jQueryEasing, jQueryDuration;
			// pick the equivalent jQuery animation function
			jQueryEasing = (rules.transitionTimingFunction.match(/ease/gi)) ? 'swing' : 'linear';
			jQueryDuration = parseInt(rules.transitionDuration.replace(/s/g, '000').replace(/ms/g, ''), 10);
			// remove rules that will make Internet Explorer complain
			delete rules.transitionProperty;
			delete rules.transitionDuration;
			delete rules.transitionTimingFunction;
			// use animate from jQuery
			jQuery(element).animate(
				rules,
				jQueryDuration,
				jQueryEasing,
				endEventHandler
			);
		// else
		} else {
			// for all rules
			for (rule in rules) {
				if (rules.hasOwnProperty(rule)) {
					// implement the prefixed value
					element.style[useful.css.compatibility(rule)] = rules[rule];
					// implement the value
					element.style[rule] = rules[rule];
				}
			}
			// call the onComplete handler
			endEventHandler();
		}
	};

	useful.positions = useful.positions || {};
	useful.positions.object = function (node) {
		// define a position object
		var position = {x : 0, y : 0};
		// if offsetparent exists
		if (node.offsetParent) {
			// add every parent's offset
			while (node.offsetParent) {
				position.x += node.offsetLeft;
				position.y += node.offsetTop;
				node = node.offsetParent;
			}
		}
		// return the object
		return position;
	};
	useful.positions.cursor = function (event, parent) {
		// get the event properties
		event = event || window.event;
		// define a position object
		var position = {x : 0, y : 0};
		// find the current position on the document
		position.x = event.pageX || event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
		position.y = event.pageY || event.clientY + document.body.scrollTop + document.documentElement.scrollTop;
		// if a parent was given
		if (parent) {
			// retrieve the position of the parent
			var offsets = useful.positions.object(parent);
			// adjust the coordinates to fit the parent
			position.x -= offsets.x;
			position.y -= offsets.y;
		}
		// return the object
		return position;
	};

	useful.viewer = {};
	useful.viewer.start = viewer.start;

}(window.useful = window.useful || {}));
